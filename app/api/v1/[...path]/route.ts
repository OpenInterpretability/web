/**
 * The Ekbasis API gateway: validates the caller's API key with Hexclave, checks the prepaid
 * token balance, proxies the decision request to the Ekbasis backend, then debits the exact
 * input tokens reported by the model server.
 *
 * Fail-closed: no valid key -> 401; restricted account -> 403; no balance -> 402; backend down -> 503.
 * The ekbasis client maps every one of these to "cannot foresee" (exit 3), which every tool treats as
 * risky — so an unpaid or broken state can never let a destructive action through silently.
 *
 * Every request is recorded for the admin console after the response is sent (lib/telemetry).
 * Every call that reaches the model gets a request id, returned in X-Ekbasis-Request-Id and recorded with the
 * event, so the caller can attach feedback to it later (POST /api/v1/feedback).
 */
import { after } from "next/server"
import { getHexclaveServerApp } from "@/hexclave/server"
import { newRequestId, recordEvent, type TelemetryEvent } from "@/lib/telemetry"

export const dynamic = "force-dynamic"

const BACKEND = process.env.EKBASIS_BACKEND_URL
const BACKEND_KEY = process.env.EKBASIS_BACKEND_KEY

function json(obj: unknown, status: number) {
  return Response.json(obj, { status, headers: { "Cache-Control": "private, no-store" } })
}

/** The backend reports its model directory; customers only need the model name. */
function publicModel(text: string): string {
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    if (typeof o.model === "string" && o.model.includes("/")) o.model = o.model.split("/").filter(Boolean).pop()
    return JSON.stringify(o)
  } catch {
    return text
  }
}

const SURFACE_RE = /^[a-z0-9][a-z0-9_.-]{0,31}$/

async function handler(request: Request) {
  const t0 = Date.now()
  const path = new URL(request.url).pathname.replace(/^\/api\/v1/, "") || "/"
  const ev: TelemetryEvent = {
    t: t0, uid: null, email: null, key: null, path, status: 0, tok: 0, ms: 0,
    ip: (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
    country: request.headers.get("x-vercel-ip-country"),
  }
  const ua = request.headers.get("user-agent")
  if (ua) ev.cl = ua.slice(0, 80)
  const surface = (request.headers.get("x-ekbasis-surface") ?? "").trim().toLowerCase()
  if (SURFACE_RE.test(surface)) ev.sf = surface
  const done = (resp: Response, err?: string) => {
    if (ev.rid) resp.headers.set("X-Ekbasis-Request-Id", ev.rid)
    ev.status = resp.status
    ev.ms = Date.now() - t0
    if (err) ev.err = err
    if (path !== "/health" && path !== "/v1/health") {
      after(async () => {
        try {
          await recordEvent(ev)
        } catch (e) {
          console.warn("[ekbasis gateway] telemetry failed:", e)
        }
      })
    }
    return resp
  }

  if (!BACKEND) return done(json({ error: "backend not configured yet" }, 503), "no backend")

  // `ekbasis health` (GET /health) is a setup check: answered without a key or credits, never metered.
  if (request.method === "GET") {
    if (path !== "/health" && path !== "/v1/health") return json({ error: "not found" }, 404)
    try {
      const r = await fetch(`${BACKEND}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        headers: BACKEND_KEY ? { Authorization: `Bearer ${BACKEND_KEY}` } : {},
      })
      return new Response(publicModel(await r.text()), { status: r.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } })
    } catch {
      return json({ error: "the model server is unreachable" }, 503)
    }
  }

  // Sessions keep the state in the model server's memory and cannot be deleted through this gateway, which would break
  // the promise that request contents are never stored. Hosted calls send the full state each time (/v1/systemone);
  // sessions remain available on self-hosted servers.
  if (path.startsWith("/v1/sessions")) {
    return done(
      json({ error: "sessions are not available on the hosted API: send the full state to /v1/systemone (read_once for several questions); self-hosted servers support sessions" }, 404),
      "sessions blocked",
    )
  }

  const auth = request.headers.get("authorization") ?? ""
  const apiKey = auth.replace(/^Bearer\s+/i, "").trim()
  if (!apiKey) return done(json({ error: "unauthorized: send the Authorization: Bearer header" }, 401), "no key")
  ev.key = apiKey.slice(-4)

  const user = await getHexclaveServerApp().getUser({ apiKey })
  if (!user) return done(json({ error: "unauthorized: invalid or revoked API key" }, 401), "invalid key")
  ev.uid = user.id
  ev.email = user.primaryEmail
  if (user.isRestricted) return done(json({ error: "forbidden: this account is suspended" }, 403), "restricted")

  const tokens = await user.getItem("tokens")
  const balance = tokens?.quantity ?? 0
  if (balance <= 0) return done(json({ error: "payment required: buy a credit pack at /console" }, 402), "no balance")

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  ev.rid = newRequestId()
  let backendResp: Response
  try {
    backendResp = await fetch(`${BACKEND}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BACKEND_KEY ? { Authorization: `Bearer ${BACKEND_KEY}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch {
    return done(json({ error: "the model server is unreachable" }, 503), "backend unreachable")
  }

  const respText = await backendResp.text()
  let respObj: Record<string, unknown> = {}
  try {
    respObj = JSON.parse(respText) as Record<string, unknown>
  } catch {
    respObj = {}
  }

  // Meter: the backend reports the input tokens it consumed for this decision.
  const usage = respObj.usage as { input_tokens?: number; output_tokens?: number } | undefined
  const inputTokens = Math.max(0, Math.round(usage?.input_tokens ?? 0))
  ev.tok = inputTokens
  if (inputTokens > 0 && tokens) {
    try {
      const ok = await tokens.tryDecreaseQuantity(inputTokens)
      if (!ok) {
        // The balance ran out mid-request: the answer already went through, so debit it anyway
        // (the balance goes negative and the next request gets the 402 above).
        await tokens.decreaseQuantity(inputTokens)
      }
    } catch (e) {
      console.warn(`[ekbasis gateway] debit failed for user ${user.id}:`, e)
      ev.err = "debit failed"
    }
  }

  return done(
    new Response(publicModel(respText), {
      status: backendResp.status,
      headers: {
        "Content-Type": backendResp.headers.get("content-type") ?? "application/json",
        "Cache-Control": "private, no-store",
        "X-Ekbasis-Metered-Tokens": String(inputTokens),
      },
    }),
    backendResp.ok ? undefined : typeof respObj.error === "string" ? respObj.error.slice(0, 200) : `backend ${backendResp.status}`,
  )
}

export const GET = handler
export const POST = handler
