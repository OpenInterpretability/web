/**
 * POST: create a USDC/USDT order for a credit pack.  GET ?id= (or the caller's latest): status, scanning
 * the chain for the payment and crediting the buyer's input tokens once it confirms.
 */
import { getHexclaveServerApp } from "@/hexclave/server"
import { NETWORKS, PACKS, type NetworkId, type PackId, type TokenId } from "@/lib/crypto-pay/config"
import { createOrder, getOrder, lastOrderId, publicOrder, refresh } from "@/lib/crypto-pay/orders"
import { creditFor } from "@/lib/crypto-pay/credit"
import { redisConfigured, underLimit } from "@/lib/crypto-pay/redis"

export const dynamic = "force-dynamic"

const H = { "Cache-Control": "private, no-store" }
const json = (obj: unknown, status = 200) => Response.json(obj, { status, headers: H })

async function signedIn() {
  return getHexclaveServerApp().getUser()
}

export async function POST(request: Request) {
  if (!redisConfigured()) return json({ error: "payments are not configured yet" }, 503)
  const user = await signedIn()
  if (!user) return json({ error: "sign in first" }, 401)
  if (!(await underLimit(`cp:rl:order:${user.id}`, 10, 3600))) return json({ error: "too many orders in the last hour" }, 429)

  let body: { packId?: string; network?: string; token?: string } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const { packId, network, token } = body
  if (!packId || !(packId in PACKS)) return json({ error: "unknown pack" }, 400)
  if (!network || !(network in NETWORKS)) return json({ error: "unknown network" }, 400)
  if (token !== "USDC" && token !== "USDT") return json({ error: "token must be USDC or USDT" }, 400)
  if (!NETWORKS[network as NetworkId].tokens[token as TokenId]) return json({ error: `${token} is not accepted on ${NETWORKS[network as NetworkId].name}` }, 400)

  try {
    const order = await createOrder(user.id, packId as PackId, network as NetworkId, token as TokenId)
    return json({ order: publicOrder(order) })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 503)
  }
}

export async function GET(request: Request) {
  if (!redisConfigured()) return json({ order: null })
  const user = await signedIn()
  if (!user) return json({ error: "sign in first" }, 401)
  const id = new URL(request.url).searchParams.get("id") ?? (await lastOrderId(user.id))
  if (!id) return json({ order: null })
  const order = await getOrder(id)
  if (!order || order.userId !== user.id) return json({ order: null })
  try {
    const updated = await refresh(order, creditFor(user))
    return json({ order: publicOrder(updated) })
  } catch (e) {
    // RPC hiccup: report the stored state, the next poll scans again.
    return json({ order: publicOrder(order), warning: e instanceof Error ? e.message : String(e) })
  }
}
