/** Read-only JSON-RPC against public EVM nodes, with fallback across the network's RPC list. */
import type { Network } from "./config"

export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

export function topicAddress(addr: string): string {
  return "0x" + addr.toLowerCase().replace(/^0x/, "").padStart(64, "0")
}

async function call<T>(net: Network, method: string, params: unknown[]): Promise<T> {
  let lastErr: unknown = null
  for (const url of net.rpcs) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "openinterp-console/1.0" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = (await r.json()) as { result?: T; error?: { message?: string } }
      if (d.error) throw new Error(d.error.message ?? "rpc error")
      return d.result as T
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`${net.name} RPC unavailable: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`)
}

export async function blockNumber(net: Network): Promise<number> {
  return parseInt(await call<string>(net, "eth_blockNumber", []), 16)
}

export type TransferLog = { txHash: string; logIndex: number; blockNumber: number; value: bigint; token: string }

function parseLog(l: { transactionHash: string; logIndex: string; blockNumber: string; data: string; address: string }): TransferLog {
  return {
    txHash: l.transactionHash.toLowerCase(),
    logIndex: parseInt(l.logIndex, 16),
    blockNumber: parseInt(l.blockNumber, 16),
    value: BigInt(l.data === "0x" ? "0" : l.data),
    token: l.address.toLowerCase(),
  }
}

/** Transfers of `token` into `to` within [from, to] blocks. */
export async function transfersTo(net: Network, token: string, to: string, fromBlock: number, toBlock: number): Promise<TransferLog[]> {
  const logs = await call<{ transactionHash: string; logIndex: string; blockNumber: string; data: string; address: string }[]>(
    net,
    "eth_getLogs",
    [{ address: token, topics: [TRANSFER_TOPIC, null, topicAddress(to)], fromBlock: "0x" + fromBlock.toString(16), toBlock: "0x" + toBlock.toString(16) }],
  )
  return logs.map(parseLog)
}

/** Transfers of `token` into `to` inside one successful transaction, with its block number. */
export async function transfersInTx(net: Network, txHash: string, token: string, to: string): Promise<{ status: "ok" | "failed" | "pending"; logs: TransferLog[] }> {
  const rc = await call<null | { status: string; blockNumber: string; logs: { transactionHash: string; logIndex: string; blockNumber: string; data: string; address: string; topics: string[] }[] }>(
    net,
    "eth_getTransactionReceipt",
    [txHash],
  )
  if (!rc) return { status: "pending", logs: [] }
  if (rc.status !== "0x1") return { status: "failed", logs: [] }
  const toTopic = topicAddress(to)
  const logs = rc.logs
    .filter((l) => l.address.toLowerCase() === token && l.topics[0]?.toLowerCase() === TRANSFER_TOPIC && l.topics[2]?.toLowerCase() === toTopic)
    .map(parseLog)
  return { status: "ok", logs }
}
