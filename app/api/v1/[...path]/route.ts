/**
 * The Ekbasis API gateway: validates the caller's API key with Hexclave, checks the prepaid
 * token balance, proxies the decision request to the Ekbasis backend, then debits the exact
 * input tokens reported by the model server.
 *
 * Fail-closed: no valid key -> 401; no balance -> 402; backend down -> 503. The ekbasis client
 * maps every one of these to "cannot judge" (exit 3), which every tool treats as risky — so an
 * unpaid or broken state can never let a destructive action through silently.
 */
import { getHexclaveServerApp } from "@/hexclave/server"

export const dynamic = "force-dynamic"

const BACKEND = process.env.EKBASIS_BACKEND_URL
const BACKEND_KEY = process.env.EKBASIS_BACKEND_KEY
const PRICE_PER_1M = 0.04 // USD per 1M input tokens (informational; the balance is in tokens)

function json(obj: unknown, status: number) {
  return Response.json(obj, { status, headers: { "Cache-Control": "private, no-store" } })
}

async function handler(request: Request) {
  if (!BACKEND) return json({ error: "backend not configured yet" }, 503)

  const auth = request.headers.get("authorization") ?? ""
  const apiKey = auth.replace(/^Bearer\s+/i, "").trim()
  if (!apiKey) return json({ error: "unauthorized: send the Authorization: Bearer header" }, 401)

  const user = await getHexclaveServerApp().getUser({ apiKey })
  if (!user) return json({ error: "unauthorized: invalid or revoked API key" }, 401)

  const tokens = await user.getItem("tokens")
  const balance = tokens?.quantity ?? 0
  if (balance <= 0) return json({ error: "payment required: buy a credit pack at /console" }, 402)

  const path = new URL(request.url).pathname.replace(/^\/api\/v1/, "")
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

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
    return json({ error: "the model server is unreachable" }, 503)
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
  if (inputTokens > 0 && tokens) {
    try {
      const ok = await tokens.tryDecreaseQuantity(inputTokens)
      if (!ok) {
        // The balance ran out mid-request: the answer still went through (one free check),
        // but the next requests will hit the 402 above. Log honestly.
        console.warn(`[ekbasis gateway] overdraft for user ${user.id}: -${inputTokens} tokens`)
      }
    } catch (e) {
      console.warn(`[ekbasis gateway] debit failed for user ${user.id}:`, e)
    }
  }

  return new Response(respText, {
    status: backendResp.status,
    headers: {
      "Content-Type": backendResp.headers.get("content-type") ?? "application/json",
      "Cache-Control": "private, no-store",
      "X-Ekbasis-Metered-Tokens": String(inputTokens),
    },
  })
}

export const GET = handler
export const POST = handler
