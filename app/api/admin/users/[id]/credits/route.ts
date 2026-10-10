/** POST {delta, reason}: add (delta > 0) or remove (delta < 0) input tokens. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson, audit, readJson, notFound } from "@/lib/admin"
import { changeQuantity } from "@/lib/credit-chunks"
import { invalidateBalance } from "@/lib/gateway-cache"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const user = await getHexclaveServerApp().getUser(id)
  if (!user) return notFound()
  const b = await readJson<{ delta: number; reason: string }>(request)
  const delta = Math.trunc(Number(b.delta))
  if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 1e12) return ajson({ error: "delta must be a non-zero whole number of tokens" }, 400)
  const reason = String(b.reason ?? "").trim().slice(0, 300)
  if (!reason) return ajson({ error: "a reason is required (it goes to the audit log)" }, 400)
  const item = await user.getItem("tokens")
  const before = item.quantity
  await changeQuantity(item, delta)
  await invalidateBalance(id)
  const after = (await user.getItem("tokens")).quantity
  await audit(admin, "credits.adjust", id, { email: user.primaryEmail, delta, reason, before, after })
  return ajson({ ok: true, before, after })
}
