/** GET: everything about one user.  PATCH {name?, restricted?, reason?, note?}.  DELETE: remove the account. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson, audit, readJson, notFound } from "@/lib/admin"
import { userRows } from "@/lib/admin-users"
import { listOrders } from "@/lib/crypto-pay/orders"
import { redis } from "@/lib/crypto-pay/redis"

export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const user = await getHexclaveServerApp().getUser(id)
  if (!user) return notFound()
  const [row] = await userRows([user])
  const [keys, orders, events, coupons] = await Promise.all([
    user.listApiKeys(),
    listOrders({ userId: id, limit: 50 }),
    redis<string[]>("LRANGE", `tel:ulog:${id}`, 0, 99),
    redis<string[]>("LRANGE", `cpn:user:${id}`, 0, 49),
  ])
  return ajson({
    user: row,
    keys: keys.map((k) => ({
      id: k.id,
      description: k.description ?? null,
      lastFour: k.value?.lastFour ?? "",
      createdAt: k.createdAt instanceof Date ? k.createdAt.getTime() : k.createdAt,
      expiresAt: k.expiresAt instanceof Date ? k.expiresAt.getTime() : null,
      revokedAt: k.manuallyRevokedAt instanceof Date ? k.manuallyRevokedAt.getTime() : null,
      valid: k.isValid(),
    })),
    orders: orders.map((o) => ({ id: o.id, packId: o.packId, tokens: o.tokens, network: o.network, token: o.token, usd: Number(o.units) / 1e6, status: o.status, createdAt: o.createdAt, txHash: o.txHash ?? null })),
    events: (events ?? []).map((e) => JSON.parse(e)),
    coupons: (coupons ?? []).map((c) => JSON.parse(c)),
  })
}

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const user = await getHexclaveServerApp().getUser(id)
  if (!user) return notFound()
  const b = await readJson<{ name: string; restricted: boolean; reason: string; note: string }>(request)
  if (b.restricted === true && id === admin.id) return ajson({ error: "you cannot suspend your own admin account" }, 400)
  const update: Record<string, unknown> = {}
  if (typeof b.name === "string") update.displayName = b.name.slice(0, 100)
  if (typeof b.restricted === "boolean") {
    update.restrictedByAdmin = b.restricted
    update.restrictedByAdminReason = b.restricted ? String(b.reason ?? "suspended by admin").slice(0, 200) : null
  }
  if (typeof b.note === "string") update.serverMetadata = { ...((user.serverMetadata ?? {}) as object), adminNote: b.note.slice(0, 2000) }
  await user.update(update)
  await audit(admin, "user.update", id, { email: user.primaryEmail, ...b })
  return ajson({ ok: true })
}

export async function DELETE(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  if (id === admin.id) return ajson({ error: "you cannot delete your own admin account" }, 400)
  const user = await getHexclaveServerApp().getUser(id)
  if (!user) return notFound()
  const email = user.primaryEmail
  await user.delete()
  await audit(admin, "user.delete", id, { email })
  return ajson({ ok: true })
}
