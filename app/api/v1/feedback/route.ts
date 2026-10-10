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

export async function POST(request: Request) {
  const apiKey = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim()
  if (!apiKey) return json({ error: "unauthorized: send the Authorization: Bearer header" }, 401)
  const user = await getHexclaveServerApp().getUser({ apiKey })
  if (!user) return json({ error: "unauthorized: invalid or revoked API key" }, 401)
  if (user.isRestricted) return json({ error: "forbidden: this account is suspended" }, 403)
  if (!redisConfigured()) return json({ error: "feedback is not available right now" }, 503)

  const text = await request.text()
  if (text.length > 4096) return json({ error: "body too large" }, 413)
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: "body must be JSON" }, 400)
  }

  try {
    const r = await submitFeedback(user.id, body)
    if (!r.ok) return json({ error: r.error }, r.status)
    return json({ ok: true, request_id: r.entry.rid, verdict: r.entry.verdict }, 200)
  } catch (e) {
    console.warn("[ekbasis feedback] store failed:", e)
    return json({ error: "feedback is not available right now" }, 503)
  }
}

export async function GET() {
  return json({ error: "use POST" }, 405)
}
