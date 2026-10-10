/** GET: all coupons with redemption counts.  POST {tokens, count?, code?, maxRedemptions?, expiresAt?, note?}: create. */
import { requireAdmin, ajson, audit, readJson } from "@/lib/admin"
import { createCoupon, listCoupons, normalizeCode, randomCode, CODE_RE, type Coupon } from "@/lib/coupons"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  return ajson({ coupons: await listCoupons() })
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const b = await readJson<{ tokens: number; count: number; code: string; maxRedemptions: number; expiresAt: number | null; note: string; prefix: string }>(request)
  const tokens = Math.floor(Number(b.tokens))
  if (!Number.isFinite(tokens) || tokens <= 0 || tokens > 1e12) return ajson({ error: "tokens must be a positive whole number" }, 400)
  const count = Math.min(Math.max(Math.floor(Number(b.count ?? 1)) || 1, 1), 500)
  const maxRedemptions = Math.max(0, Math.floor(Number(b.maxRedemptions ?? 1)) || 0)
  const expiresAt = b.expiresAt ? Number(b.expiresAt) : null
  if (expiresAt !== null && (!Number.isFinite(expiresAt) || expiresAt < Date.now())) return ajson({ error: "expiry must be in the future" }, 400)
  const custom = b.code ? normalizeCode(String(b.code)) : null
  if (custom && (!CODE_RE.test(custom) || count > 1)) return ajson({ error: "a custom code is 4-32 of A-Z, 0-9 and -, one at a time" }, 400)
  const prefix = b.prefix ? normalizeCode(String(b.prefix)).replace(/[^A-Z0-9]/g, "").slice(0, 8) || "EKB" : "EKB"
  const created: string[] = []
  for (let i = 0; i < count; i++) {
    const c: Coupon = {
      code: custom ?? randomCode(prefix),
      tokens,
      maxRedemptions,
      expiresAt,
      active: true,
      note: String(b.note ?? "").slice(0, 300),
      createdAt: Date.now(),
      createdBy: admin.primaryEmail ?? "?",
    }
    if (await createCoupon(c)) created.push(c.code)
    else if (custom) return ajson({ error: "this code already exists" }, 409)
  }
  await audit(admin, "coupon.create", created.length === 1 ? created[0] : `${created.length} codes`, { tokens, maxRedemptions, expiresAt, codes: created })
  return ajson({ codes: created })
}
