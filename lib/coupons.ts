/**
 * Coupons: an admin-made code that adds input tokens to the redeeming account.
 *
 *   cpn:<CODE>              the coupon (JSON)          cpn:index           all codes (set)
 *   cpn:count:<CODE>        redemptions so far         cpn:red:<CODE>:<uid> one redemption per account (SET NX)
 *   cpn:log:<CODE>          last 500 redemptions
 * Redeeming is atomic: the per-account marker is claimed first, then the global count; if the count
 * overflows the limit, or the credit fails, both are rolled back.
 */
import { randomInt } from "crypto"
import { redis, setNX, getJSON, pipeline } from "@/lib/crypto-pay/redis"

export type Coupon = {
  code: string
  tokens: number
  maxRedemptions: number // 0 = unlimited
  expiresAt: number | null
  active: boolean
  note: string
  createdAt: number
  createdBy: string
}

export type CouponView = Coupon & { redemptions: number }

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I
export const CODE_RE = /^[A-Z0-9-]{4,32}$/

export function normalizeCode(code: string) {
  return code.trim().toUpperCase()
}

export function randomCode(prefix = "EKB") {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")
  return `${prefix}-${part()}-${part()}`
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  return getJSON<Coupon>(`cpn:${normalizeCode(code)}`)
}

export async function saveCoupon(c: Coupon): Promise<void> {
  await pipeline([
    ["SET", `cpn:${c.code}`, JSON.stringify(c)],
    ["SADD", "cpn:index", c.code],
  ])
}

/** Creates a coupon only if the code is new. */
export async function createCoupon(c: Coupon): Promise<boolean> {
  if (!(await setNX(`cpn:${c.code}`, JSON.stringify(c)))) return false
  await redis("SADD", "cpn:index", c.code)
  return true
}

export async function deleteCoupon(code: string): Promise<void> {
  await pipeline([["DEL", `cpn:${code}`], ["SREM", "cpn:index", code]])
}

export async function listCoupons(): Promise<CouponView[]> {
  const codes = (await redis<string[]>("SMEMBERS", "cpn:index")) ?? []
  if (codes.length === 0) return []
  const res = await pipeline(codes.flatMap((c) => [["GET", `cpn:${c}`], ["GET", `cpn:count:${c}`]]))
  const out: CouponView[] = []
  for (let i = 0; i < codes.length; i++) {
    const raw = res[2 * i] as string | null
    if (!raw) continue
    out.push({ ...(JSON.parse(raw) as Coupon), redemptions: Number(res[2 * i + 1] ?? 0) })
  }
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export async function couponLog(code: string, count = 100) {
  const raw = (await redis<string[]>("LRANGE", `cpn:log:${code}`, 0, count - 1)) ?? []
  return raw.map((r) => JSON.parse(r) as { uid: string; email: string | null; t: number; tokens: number })
}

export type RedeemResult = { ok: true; tokens: number } | { ok: false; error: string }

export async function redeem(
  rawCode: string,
  user: { id: string; primaryEmail: string | null },
  credit: (tokens: number) => Promise<void>,
): Promise<RedeemResult> {
  const code = normalizeCode(rawCode)
  if (!CODE_RE.test(code)) return { ok: false, error: "invalid coupon code" }
  const c = await getCoupon(code)
  if (!c || !c.active) return { ok: false, error: "invalid coupon code" }
  if (c.expiresAt && Date.now() > c.expiresAt) return { ok: false, error: "this coupon has expired" }

  const marker = `cpn:red:${code}:${user.id}`
  if (!(await setNX(marker, String(Date.now())))) return { ok: false, error: "you already redeemed this coupon" }
  const n = await redis<number>("INCR", `cpn:count:${code}`)
  if (c.maxRedemptions > 0 && n > c.maxRedemptions) {
    await pipeline([["DECR", `cpn:count:${code}`], ["DEL", marker]])
    return { ok: false, error: "this coupon has been fully redeemed" }
  }
  try {
    await credit(c.tokens)
  } catch (e) {
    await pipeline([["DECR", `cpn:count:${code}`], ["DEL", marker]])
    throw e
  }
  await pipeline([
    ["LPUSH", `cpn:log:${code}`, JSON.stringify({ uid: user.id, email: user.primaryEmail, t: Date.now(), tokens: c.tokens })],
    ["LTRIM", `cpn:log:${code}`, 0, 499],
    ["LPUSH", `cpn:user:${user.id}`, JSON.stringify({ code, t: Date.now(), tokens: c.tokens })],
    ["LTRIM", `cpn:user:${user.id}`, 0, 99],
  ])
  return { ok: true, tokens: c.tokens }
}
