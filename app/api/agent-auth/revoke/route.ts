/**
 * POST /oauth2/revoke (rewritten here) — RFC 7009: revokes one access_token (an agent-issued Ekbasis API key).
 * Always 200, idempotent; unknown tokens are not an error. The identity_assertion stays valid.
 */
import { audit, clientIp, oauthJson, revokeAccessToken } from "@/lib/agent-auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let token = ""
  try {
    const ct = req.headers.get("content-type") ?? ""
    token = ct.includes("application/json")
      ? String(((await req.json()) as Record<string, unknown>).token ?? "")
      : new URLSearchParams(await req.text()).get("token") ?? ""
  } catch {}
  if (!token) return oauthJson({ error: "invalid_request", error_description: "token is required." }, 400)
  try {
    if (await revokeAccessToken(token)) await audit("token.revoked", { ip: clientIp(req) })
  } catch (e) {
    console.warn("[agent-auth] revoke failed:", e)
  }
  return oauthJson({})
}
