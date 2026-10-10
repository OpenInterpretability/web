/**
 * Orders: a buyer gets a unique amount (pack price + a random micro-suffix) on one network/token.
 * A transfer of exactly that amount into the treasury, after the order was created, pays it.
 *
 * Double-credit guards (all Redis SET NX):
 *   cp:amt:<net>:<token>:<units>    one open order per exact amount (so a payment maps to one buyer)
 *   cp:tx:<net>:<txhash>:<logIndex> a transfer pays at most one order, forever
 *   cp:credit:<orderId>             an order credits at most once
 * If the process dies between claiming a transfer and crediting, the order goes to "review" instead of
 * being credited twice: under-credit is fixable by hand, double-credit is not.
 */
import { randomBytes, randomInt } from "crypto"
import { NETWORKS, PACKS, TREASURY, PAY_WINDOW_MS, SCAN_WINDOW_MS, DECIMALS, type NetworkId, type TokenId, type PackId } from "./config"
import { blockNumber, transfersTo, transfersInTx, type TransferLog } from "./chain"
import { setNX, getJSON, setJSON, redis } from "./redis"

export type OrderStatus = "pending" | "paid" | "expired" | "review"

export type Order = {
  id: string
  userId: string
  packId: PackId
  tokens: number
  network: NetworkId
  token: TokenId
  tokenAddress: string
  units: string // exact amount in token base units (6 decimals)
  treasury: string
  createdAt: number
  payBy: number
  scanUntil: number
  startBlock: number
  scannedTo: number
  status: OrderStatus
  txHash?: string
  logIndex?: number
  creditedAt?: number
}

const ORDER_TTL = 7 * 24 * 3600
const orderKey = (id: string) => `cp:order:${id}`
const lastKey = (userId: string) => `cp:last:${userId}`

export async function createOrder(userId: string, packId: PackId, network: NetworkId, token: TokenId): Promise<Order> {
  const net = NETWORKS[network]
  const tok = net.tokens[token]
  if (!tok) throw new Error(`${token} is not accepted on ${net.name}`)
  const pack = PACKS[packId]
  const base = BigInt(pack.usd) * BigInt(10 ** DECIMALS)
  const id = randomBytes(12).toString("hex")

  // Reserve a unique exact amount for this network/token (suffix below $0.10).
  let units = ""
  for (let i = 0; i < 20 && !units; i++) {
    const candidate = (base + BigInt(randomInt(1, 100_000))).toString()
    if (await setNX(`cp:amt:${network}:${token}:${candidate}`, id, Math.ceil(SCAN_WINDOW_MS / 1000) + 3600)) units = candidate
  }
  if (!units) throw new Error("could not reserve a unique amount, try again")

  const now = Date.now()
  const head = await blockNumber(net)
  const order: Order = {
    id,
    userId,
    packId,
    tokens: pack.tokens,
    network,
    token,
    tokenAddress: tok.address,
    units,
    treasury: TREASURY,
    createdAt: now,
    payBy: now + PAY_WINDOW_MS,
    scanUntil: now + SCAN_WINDOW_MS,
    startBlock: Math.max(0, head - 5),
    scannedTo: Math.max(0, head - 6),
    status: "pending",
  }
  await setJSON(orderKey(id), order, ORDER_TTL)
  await redis("SET", lastKey(userId), id, "EX", ORDER_TTL)
  return order
}

export async function getOrder(id: string): Promise<Order | null> {
  return getJSON<Order>(orderKey(id))
}

export async function lastOrderId(userId: string): Promise<string | null> {
  return redis<string | null>("GET", lastKey(userId))
}

type Credit = (tokens: number, order: Order) => Promise<void>

/** Claim one transfer for the order and credit the buyer exactly once. */
async function settle(order: Order, log: TransferLog, credit: Credit): Promise<Order> {
  const won = await setNX(`cp:tx:${order.network}:${log.txHash}:${log.logIndex}`, order.id)
  if (!won) {
    const fresh = await getOrder(order.id)
    return fresh ?? order
  }
  if (!(await setNX(`cp:credit:${order.id}`, log.txHash))) {
    const fresh = await getOrder(order.id)
    return fresh ?? order
  }
  const claimed: Order = { ...order, status: "review", txHash: log.txHash, logIndex: log.logIndex }
  await setJSON(orderKey(order.id), claimed, ORDER_TTL)
  await credit(order.tokens, claimed)
  const paid: Order = { ...claimed, status: "paid", creditedAt: Date.now() }
  await setJSON(orderKey(order.id), paid, ORDER_TTL)
  return paid
}

function matches(order: Order, log: TransferLog): boolean {
  return log.token === order.tokenAddress && log.value === BigInt(order.units) && log.blockNumber >= order.startBlock
}

/** Scan new confirmed blocks for the order's payment (bounded work per call). */
export async function refresh(order: Order, credit: Credit, maxChunks = 4): Promise<Order> {
  if (order.status !== "pending") return order
  const now = Date.now()
  if (now > order.scanUntil) {
    const expired: Order = { ...order, status: "expired" }
    await setJSON(orderKey(order.id), expired, ORDER_TTL)
    return expired
  }
  const net = NETWORKS[order.network]
  const safeHead = (await blockNumber(net)) - net.confirmations
  let from = order.scannedTo + 1
  let current = order
  for (let i = 0; i < maxChunks && from <= safeHead; i++) {
    const to = Math.min(safeHead, from + net.chunk - 1)
    const logs = await transfersTo(net, order.tokenAddress, TREASURY, from, to)
    const hit = logs.find((l) => matches(order, l))
    if (hit) return settle(current, hit, credit)
    current = { ...current, scannedTo: to }
    from = to + 1
  }
  if (current.scannedTo !== order.scannedTo) {
    const latest = await getOrder(order.id)
    if (latest && latest.status === "pending" && latest.scannedTo < current.scannedTo) {
      await setJSON(orderKey(order.id), { ...latest, scannedTo: current.scannedTo }, ORDER_TTL)
    }
  }
  return current
}

export type ClaimResult = { order: Order; message?: string }

/** Pay an order from a transaction hash the buyer pasted (exchanges, or a faster path than the scan). */
export async function claimByHash(order: Order, txHash: string, credit: Credit): Promise<ClaimResult> {
  if (order.status !== "pending") return { order }
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return { order, message: "that is not a transaction hash" }
  const net = NETWORKS[order.network]
  const { status, logs } = await transfersInTx(net, txHash.toLowerCase(), order.tokenAddress, TREASURY)
  if (status === "pending") return { order, message: `not found on ${net.name} yet: check the network, or wait a minute` }
  if (status === "failed") return { order, message: "this transaction failed on-chain" }
  const hit = logs.find((l) => matches(order, l))
  if (!hit) {
    return { order, message: `no transfer of exactly the order amount in ${order.token} on ${net.name} to the OpenInterp address in this transaction` }
  }
  const safeHead = (await blockNumber(net)) - net.confirmations
  if (hit.blockNumber > safeHead) {
    return { order, message: `found — waiting for ${net.confirmations} confirmations on ${net.name}` }
  }
  return { order: await settle(order, hit, credit) }
}

/** What the browser may see (no user id). */
export function publicOrder(o: Order) {
  const net = NETWORKS[o.network]
  return {
    id: o.id,
    packId: o.packId,
    tokens: o.tokens,
    network: o.network,
    networkName: net.name,
    chainId: net.chainId,
    confirmations: net.confirmations,
    token: o.token,
    tokenLabel: net.tokens[o.token]?.label ?? o.token,
    tokenAddress: o.tokenAddress,
    units: o.units,
    treasury: o.treasury,
    createdAt: o.createdAt,
    payBy: o.payBy,
    scanUntil: o.scanUntil,
    status: o.status,
    txHash: o.txHash ?? null,
    explorerUrl: o.txHash ? `${net.explorer}${o.txHash}` : null,
  }
}
