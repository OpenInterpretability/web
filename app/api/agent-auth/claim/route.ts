/**
 * POST /agent/identity/claim (rewritten here) — auth.md Step 4a/4c re-initiation. For service_auth the first ceremony
 * comes with the registration; this mints a fresh user_code when that window closed. The email must match.
 */
import { audit, canReattempt, ceremonyBlock, clientIp, newAttempt, normEmail, now, putReg, regByClaimToken } from "@/lib/agent-auth"

export const dynamic = "force-dynamic"

const err = (status: number, error: string, description: string) =>
  Response.json({ error, error_description: description }, { status, headers: { "Cache-Control": "no-store" } })

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return err(400, "invalid_request", "Send a JSON body: { \"claim_token\": \"clm_...\", \"email\": \"<the user's email>\" }.")
  }
  const claimToken = typeof body?.claim_token === "string" ? body.claim_token : ""
  const email = normEmail(body?.email)
  if (!claimToken || !email) return err(400, "invalid_request", "claim_token and email are required.")
  const reg = await regByClaimToken(claimToken)
  if (!reg) return err(401, "invalid_claim_token", "The claim token is invalid. Restart at Step 3.")
  if (now() > reg.expiresAt) return err(410, "claim_expired", "The registration has expired. Restart at Step 3.")
  if (reg.status !== "pending") return err(409, "claimed_or_in_flight", "This registration has already been claimed.")
  if (email !== reg.email) return err(400, "invalid_request", "email must be the login_hint of this registration.")
  if (!canReattempt(reg)) return err(410, "claim_expired", "Too many ceremonies for this registration. Restart at Step 3.")
  const { attemptToken, userCode } = await newAttempt(reg)
  await putReg(reg)
  await audit("claim.reinitiated", { reg: reg.id, ip: clientIp(req) })
  return Response.json(
    {
      registration_id: reg.id,
      claim_attempt_id: reg.attempt!.id,
      status: "initiated",
      expires_at: new Date(reg.attempt!.codeExpiresAt).toISOString(),
      claim_attempt: ceremonyBlock(reg, attemptToken, userCode),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
