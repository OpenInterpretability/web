/** GET: a coupon and who redeemed it.  PATCH {active?, maxRedemptions?, expiresAt?, note?, tokens?}.  DELETE. */
import { requireAdmin, ajson, audit, readJson, notFound } from "@/lib/admin"
import { couponLog, deleteCoupon, getCoupon, saveCoupon } from "@/lib/coupons"

export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ code: string }> }

export async function GET(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const c = await getCoupon(decodeURIComponent((await params).code))
  if (!c) return notFound()
  return ajson({ coupon: c, redemptions: await couponLog(c.code) })
}

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const c = await getCoupon(decodeURIComponent((await params).code))
  if (!c) return notFound()
  const b = await readJson<{ active: boolean; maxRedemptions: number; expiresAt: number | null; note: string; tokens: number }>(request)
  if (typeof b.active === "boolean") c.active = b.active
  if (b.maxRedemptions !== undefined) c.maxRedemptions = Math.max(0, Math.floor(Number(b.maxRedemptions)) || 0)
  if (b.expiresAt !== undefined) c.expiresAt = b.expiresAt ? Number(b.expiresAt) : null
  if (typeof b.note === "string") c.note = b.note.slice(0, 300)
  if (b.tokens !== undefined) {
    const t = Math.floor(Number(b.tokens))
    if (!Number.isFinite(t) || t <= 0) return ajson({ error: "tokens must be positive" }, 400)
    c.tokens = t
  }
  await saveCoupon(c)
  await audit(admin, "coupon.update", c.code, b)
  return ajson({ coupon: c })
}

export async function DELETE(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const code = decodeURIComponent((await params).code)
  const c = await getCoupon(code)
  if (!c) return notFound()
  await deleteCoupon(c.code)
  await audit(admin, "coupon.delete", c.code, { tokens: c.tokens })
  return ajson({ ok: true })
}
