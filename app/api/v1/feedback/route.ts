/**
 * POST /api/v1/feedback — the caller says whether one of its own Ekbasis calls was right.
 *
 *   Authorization: Bearer <the same API key>
 *   {"request_id": "req_…", "verdict": "correct" | "wrong" | "prevented_harm" | "false_alarm", "note"?: "≤500 chars"}
 *
 * Free (never metered, works at zero balance), at most 200 per user per UTC day. Only the caller's own request ids
 * are accepted; anyone else's gets the same 404 as an unknown id. This static route takes precedence over the
 * gateway's catch-all, so feedback never reaches the model server or the request telemetry.
 */
import { getHexclaveServerApp } from "@/hexclave/server"
import { submitFeedback } from "@/lib/feedback"
import { redisConfigured } from "@/lib/crypto-pay/redis"

export const dynamic = "force-dynamic"

function json(obj: unknown, status: number) {
  return Response.json(obj, { status, headers: { "Cache-Control": "private, no-store" } })
}

// The same error shape as the gateway (app/api/v1/[...path]/route.ts): message, stable code, retryable.
const CODE_BY_STATUS: Record<number, string> = { 400: "invalid_request", 404: "unknown_request_id", 409: "feedback_exists", 413: "body_too_large", 429: "rate_limited" }
function fail(status: number, code: string, message: string) {
  return json({ error: message, code, retryable: code === "rate_limited" || code === "feedback_unavailable" }, status)
}

export async function POST(request: Request) {
  const apiKey = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim()
  if (!apiKey) return fail(401, "missing_api_key", "unauthorized: send the Authorization: Bearer header")
  const user = await getHexclaveServerApp().getUser({ apiKey })
  if (!user) return fail(401, "invalid_api_key", "unauthorized: invalid or revoked API key")
  if (user.isRestricted) return fail(403, "account_suspended", "forbidden: this account is suspended")
  if (!redisConfigured()) return fail(503, "feedback_unavailable", "feedback is not available right now")

  const text = await request.text()
  if (text.length > 4096) return fail(413, "body_too_large", "body too large")
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return fail(400, "invalid_request", "body must be JSON")
  }

  try {
    const r = await submitFeedback(user.id, body)
    if (!r.ok) return fail(r.status, CODE_BY_STATUS[r.status] ?? "invalid_request", r.error)
    return json({ ok: true, request_id: r.entry.rid, verdict: r.entry.verdict }, 200)
  } catch (e) {
    console.warn("[ekbasis feedback] store failed:", e)
    return fail(503, "feedback_unavailable", "feedback is not available right now")
  }
}

export async function GET() {
  return json({ error: "use POST" }, 405)
}
