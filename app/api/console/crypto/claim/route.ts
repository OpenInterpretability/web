/** POST {orderId, txHash}: pay an order from a pasted transaction hash. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { claimByHash, getOrder, publicOrder } from "@/lib/crypto-pay/orders"
import { redisConfigured, underLimit } from "@/lib/crypto-pay/redis"
import { creditFor } from "@/lib/crypto-pay/credit"

export const dynamic = "force-dynamic"

const H = { "Cache-Control": "private, no-store" }
const json = (obj: unknown, status = 200) => Response.json(obj, { status, headers: H })

export async function POST(request: Request) {
  if (!redisConfigured()) return json({ error: "payments are not configured yet" }, 503)
  const user = await getHexclaveServerApp().getUser()
  if (!user) return json({ error: "sign in first" }, 401)
  if (!(await underLimit(`cp:rl:claim:${user.id}`, 30, 3600))) return json({ error: "too many attempts in the last hour" }, 429)

  let body: { orderId?: string; txHash?: string } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  if (!body.orderId || !body.txHash) return json({ error: "orderId and txHash are required" }, 400)
  const order = await getOrder(body.orderId)
  if (!order || order.userId !== user.id) return json({ error: "order not found" }, 404)
  try {
    const { order: updated, message } = await claimByHash(order, body.txHash.trim(), creditFor(user))
    return json({ order: publicOrder(updated), message: message ?? null })
  } catch (e) {
    return json({ order: publicOrder(order), message: e instanceof Error ? e.message : String(e) }, 503)
  }
}
