/**
 * POST /agent/identity (rewritten here) — auth.md Step 3. Phase 1 accepts only `service_auth`: the agent sends the
 * user's email and gets the claim ceremony (user_code + verification_uri) in the same response.
 */
import { BASE, PATHS, SCOPES, audit, ceremonyBlock, clientIp, configured, createRegistration, limited, normEmail } from "@/lib/agent-auth"

export const dynamic = "force-dynamic"

const err = (status: number, error: string, description: string, extra: Record<string, string> = {}) =>
  Response.json({ error, error_description: description }, { status, headers: { "Cache-Control": "no-store", ...extra } })

export async function POST(req: Request) {
  if (!configured()) return err(503, "temporarily_unavailable", "Agent registration is not configured on this server.")
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return err(400, "invalid_request", "Send a JSON body: { \"type\": \"service_auth\", \"login_hint\": \"<the user's email>\" }.")
  }
  const type = body?.type
  if (type === "anonymous")
    return err(400, "anonymous_not_enabled", "Anonymous registration is not enabled here. Use service_auth with the user's email.")
  if (type === "identity_assertion")
    return err(400, "issuer_not_enabled", "No ID-JAG issuer is trusted here yet. Use service_auth with the user's email.")
  if (type !== "service_auth") return err(400, "invalid_request", "type must be service_auth.")
  const email = normEmail(body?.login_hint)
  if (!email) return err(400, "invalid_login_hint", "login_hint must be the user's email address.")

  const ip = clientIp(req)
  const retry = { "Retry-After": "3600" }
  if (await limited(`reg:all:${new Date().toISOString().slice(0, 13)}`, 300, 3600))
    return err(429, "rate_limited", "Too many registrations right now. Retry later.", retry)
  if (ip && (await limited(`reg:ip:${ip}`, 10, 3600))) return err(429, "rate_limited", "Too many registrations from this address. Retry in an hour.", retry)
  if (await limited(`reg:email:${email}`, 5, 3600)) return err(429, "rate_limited", "Too many registrations for this email. Retry in an hour.", retry)

  const { reg, claimToken, attemptToken, userCode } = await createRegistration(email, ip, req.headers.get("user-agent"))
  await audit("registration", { reg: reg.id, email, ip, ua: reg.ua })
  return Response.json(
    {
      registration_id: reg.id,
      registration_type: "service_auth",
      claim_url: `${BASE}${PATHS.claim}`,
      claim_token: claimToken,
      claim_token_expires: new Date(reg.expiresAt).toISOString(),
      post_claim_scopes: SCOPES,
      claim: ceremonyBlock(reg, attemptToken, userCode),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
