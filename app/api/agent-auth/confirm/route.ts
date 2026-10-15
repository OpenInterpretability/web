/**
 * The /claim page's form posts here: the signed-in user types the agent's 6-digit code. Checks the session, that the
 * account is the email the agent registered (verified), the attempt window and the try limit; then redirects back to
 * /claim with the outcome. Same-origin only (CSRF).
 */
import { audit, clientIp, confirmCode, regByAttemptToken } from "@/lib/agent-auth"
import { getHexclaveServerApp } from "@/hexclave/server"

export const dynamic = "force-dynamic"

const back = (req: Request, params: Record<string, string>) =>
  Response.redirect(new URL(`/claim?${new URLSearchParams(params)}`, req.url), 303)

export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  if (origin && new URL(origin).host !== new URL(req.url).host) return new Response("forbidden", { status: 403 })
  const form = await req.formData().catch(() => null)
  const attemptToken = String(form?.get("claim_attempt_token") ?? "")
  const code = String(form?.get("user_code") ?? "")
  if (!attemptToken) return back(req, { e: "missing" })
  const user = await getHexclaveServerApp().getUser().catch(() => null)
  if (!user) return back(req, { claim_attempt_token: attemptToken })
  const reg = await regByAttemptToken(attemptToken)
  if (!reg) return back(req, { e: "invalid" })
  const result = await confirmCode(reg, code, { id: user.id, email: user.primaryEmail, verified: user.primaryEmailVerified })
  await audit(result === "ok" ? "claim.confirmed" : "claim.failed", { reg: reg.id, uid: user.id, result, ip: clientIp(req) })
  if (result === "ok") return back(req, { done: "1" })
  if (result === "wrong") return back(req, { claim_attempt_token: attemptToken, e: "wrong" })
  return back(req, { e: result })
}
