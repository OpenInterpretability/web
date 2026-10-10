/** POST {action: "recheck" | "credit" | "expire", txHash?}: resolve an order by hand. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson, audit, readJson, notFound } from "@/lib/admin"
import { adminExpire, adminMarkPaid, claimByHash, getOrder, refresh } from "@/lib/crypto-pay/orders"
import { creditFor } from "@/lib/crypto-pay/credit"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const order = await getOrder(id)
  if (!order) return notFound()
  const user = await getHexclaveServerApp().getUser(order.userId)
  if (!user) return ajson({ error: "the buyer's account no longer exists" }, 409)
  const b = await readJson<{ action: string; txHash: string }>(request)
  const credit = creditFor(user)
  if (b.action === "recheck") {
    // Same verification the buyer gets: on-chain, exact amount, confirmations.
    const r = b.txHash ? await claimByHash(order, b.txHash, credit) : { order: await refresh(order, credit, 8, 8000) }
    await audit(admin, "order.recheck", id, { txHash: b.txHash ?? null, status: r.order.status })
    return ajson({ status: r.order.status, message: "message" in r ? r.message ?? null : null })
  }
  if (b.action === "credit") {
    const r = await adminMarkPaid(order, credit, b.txHash ? String(b.txHash).trim() : null)
    if (typeof r === "string") return ajson({ error: r }, 409)
    await audit(admin, "order.credit", id, { email: user.primaryEmail, tokens: order.tokens, txHash: b.txHash ?? null })
    return ajson({ status: r.status })
  }
  if (b.action === "expire") {
    if (order.status === "paid") return ajson({ error: "already paid" }, 409)
    await adminExpire(order)
    await audit(admin, "order.expire", id, { email: user.primaryEmail })
    return ajson({ status: "expired" })
  }
  return ajson({ error: "unknown action" }, 400)
}
