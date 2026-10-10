import { changeQuantity } from "@/lib/credit-chunks"
/** POST {code}: redeem a coupon on the signed-in account (10 attempts per hour against guessing). */
import { getHexclaveServerApp } from "@/hexclave/server"
import { redeem } from "@/lib/coupons"
import { redisConfigured, underLimit } from "@/lib/crypto-pay/redis"
import { invalidateBalance } from "@/lib/gateway-cache"

export const dynamic = "force-dynamic"
const json = (obj: unknown, status = 200) => Response.json(obj, { status, headers: { "Cache-Control": "private, no-store" } })

export async function POST(request: Request) {
  if (!redisConfigured()) return json({ error: "coupons are not available yet" }, 503)
  const user = await getHexclaveServerApp().getUser()
  if (!user) return json({ error: "sign in first" }, 401)
  if (user.isRestricted) return json({ error: "this account is suspended" }, 403)
  if (!(await underLimit(`cpn:rl:${user.id}`, 10, 3600))) return json({ error: "too many attempts, try again in an hour" }, 429)
  let code = ""
  try {
    code = String(((await request.json()) as { code?: unknown }).code ?? "")
  } catch {
    code = ""
  }
  const r = await redeem(code, user, async (tokens) => {
    const item = await user.getItem("tokens")
    await changeQuantity(item, tokens)
    await invalidateBalance(user.id)
  })
  return r.ok ? json({ ok: true, tokens: r.tokens }) : json({ error: r.error }, 400)
}
