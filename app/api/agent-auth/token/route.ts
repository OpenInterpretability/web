/**
 * POST /oauth2/token (rewritten here) — auth.md Steps 4c and 5.
 *   claim grant (urn:workos:agent-auth:grant-type:claim): poll until the user confirms the code; then, once, an
 *     access_token (a 24 h Ekbasis API key) and a service-signed identity_assertion. The claim_token is single-use.
 *   JWT-bearer grant (RFC 7523): re-exchange the identity_assertion for a fresh key until it expires, unless the user
 *     revoked any of this agent's keys in the console (the kill switch) or a newer assertion superseded it. The new key
 *     replaces the previous one (rotation), so a registration has at most one live key.
 */
import {
  CLAIM_GRANT, INTERVAL, JWT_BEARER_GRANT, SCOPES, audit, clientIp, configured, getReg, issueKey, keyRevokedByUser,
  now, oauthJson, putReg, regByClaimToken, revokeOwnKey, signAssertion, verifyAssertion, withRegLock,
} from "@/lib/agent-auth"
import { redis, setNX } from "@/lib/crypto-pay/redis"

export const dynamic = "force-dynamic"

const oerr = (error: string, description: string, status = 400) => oauthJson({ error, error_description: description }, status)

async function readBody(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? ""
  try {
    if (ct.includes("application/json")) {
      const j = (await req.json()) as Record<string, unknown>
      return Object.fromEntries(Object.entries(j).map(([k, v]) => [k, String(v ?? "")]))
    }
    return Object.fromEntries(new URLSearchParams(await req.text()))
  } catch {
    return {}
  }
}

export async function POST(req: Request) {
  if (!configured()) return oerr("temporarily_unavailable", "Agent registration is not configured on this server.", 503)
  const body = await readBody(req)
  if (body.grant_type === CLAIM_GRANT) return claimGrant(req, body)
  if (body.grant_type === JWT_BEARER_GRANT) return jwtBearerGrant(req, body)
  return oerr("unsupported_grant_type", body.grant_type ? `Unsupported grant_type: ${body.grant_type}.` : "Missing grant_type.")
}

async function claimGrant(req: Request, body: Record<string, string>) {
  if (!body.claim_token) return oerr("invalid_request", "claim_token is required.")
  const reg = await regByClaimToken(body.claim_token)
  if (!reg) return oerr("expired_token", "Unknown or expired claim_token. Restart at Step 3.")
  if (reg.status === "issued" || reg.status === "revoked")
    return oerr("invalid_grant", "This claim_token was already exchanged. Use the identity_assertion (Step 5).")
  if (now() > reg.expiresAt) return oerr("expired_token", "The claim window has closed. Restart at Step 3.")
  if (reg.status === "pending") {
    const last = reg.lastPollAt ?? 0
    reg.lastPollAt = now()
    await putReg(reg)
    if (now() - last < (INTERVAL - 1) * 1000) return oerr("slow_down", `Polling too fast. Wait at least ${INTERVAL} s between polls.`)
    if (!reg.attempt || now() > reg.attempt.codeExpiresAt)
      return oerr("expired_token", "The user_code window has closed. Re-initiate at the claim_endpoint with the same claim_token and email.")
    return oerr("authorization_pending", "The user has not completed the ceremony yet.")
  }
  // claimed: issue once (an atomic lock, so two concurrent polls cannot both mint a key)
  if (!(await setNX(`aa:issue:${reg.id}`, "1", 3600))) return oerr("authorization_pending", "Issuing; poll again.")
  let key: { token: string; expiresIn: number }
  let a: ReturnType<typeof signAssertion>
  try {
    key = await issueKey(reg)
    a = signAssertion(reg, reg.email)
    reg.status = "issued"
    reg.jti = a.jti
    await putReg(reg)
  } catch (e) {
    console.warn("[agent-auth] issuing failed:", e)
    await redis("DEL", `aa:issue:${reg.id}`)
    return oerr("server_error", "Could not issue the key right now; poll again in a few seconds.", 500)
  }
  await audit("token.issued", { reg: reg.id, uid: reg.userId, grant: "claim", ip: clientIp(req) })
  return oauthJson({
    access_token: key.token,
    token_type: "Bearer",
    expires_in: key.expiresIn,
    scope: SCOPES.join(" "),
    identity_assertion: a.jwt,
    assertion_expires: a.expiresAt.toISOString(),
  })
}

async function jwtBearerGrant(req: Request, body: Record<string, string>) {
  if (!body.assertion) return oerr("invalid_request", "assertion is required.")
  const v = verifyAssertion(body.assertion)
  if (!v.ok) return oerr("invalid_grant", `The identity_assertion failed verification: ${v.reason}. Restart at Step 3.`)
  const reg = await getReg(v.sub)
  if (!reg || reg.status !== "issued") return oerr("invalid_grant", "The registration is gone or revoked. Restart at Step 3.")
  if (reg.jti !== v.jti) return oerr("invalid_grant", "This identity_assertion was superseded. Restart at Step 3.")
  const r = await withRegLock(reg.id, () => renew(req, reg.id))
  return r ?? oerr("server_error", "Another operation on this registration is in progress; retry in a few seconds.", 500)
}

async function renew(req: Request, regId: string) {
  const reg = await getReg(regId) // re-read under the lock
  if (!reg || reg.status !== "issued") return oerr("invalid_grant", "The registration is gone or revoked. Restart at Step 3.")
  if (await keyRevokedByUser(reg)) {
    reg.status = "revoked"
    await putReg(reg)
    await audit("registration.revoked_by_user", { reg: reg.id, uid: reg.userId })
    return oerr("invalid_grant", "The user revoked this agent's access. Restart at Step 3.")
  }
  const previous = reg.keyId
  const key = await issueKey(reg)
  await putReg(reg)
  if (previous) {
    try {
      await revokeOwnKey(reg, previous)
    } catch (e) {
      console.warn("[agent-auth] rotation: revoking the previous key failed:", e)
    }
  }
  await audit("token.issued", { reg: reg.id, uid: reg.userId, grant: "jwt-bearer", ip: clientIp(req), rotated: previous ? 1 : 0 })
  return oauthJson({ access_token: key.token, token_type: "Bearer", expires_in: key.expiresIn, scope: SCOPES.join(" ") })
}
