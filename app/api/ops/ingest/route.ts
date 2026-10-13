/**
 * Receives status measurements from the ekbasis-ops repository (lib/status-store). Authenticated by a shared secret
 * (OPS_INGEST_SECRET, also a secret of that repository). Body: {"kind": "probe" | "score", "records": [...]}.
 */
import { timingSafeEqual } from "crypto"
import { revalidatePath } from "next/cache"
import { ingest } from "@/lib/status-store"

export const dynamic = "force-dynamic"

function authorized(request: Request): boolean {
  const want = process.env.OPS_INGEST_SECRET ?? ""
  const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim()
  if (want.length < 32 || got.length !== want.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(want))
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 })
  const text = await request.text()
  if (text.length > 2_000_000) return Response.json({ error: "body too large" }, { status: 413 })
  let body: { kind?: string; records?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return Response.json({ error: "body must be JSON" }, { status: 400 })
  }
  if ((body.kind !== "probe" && body.kind !== "score") || !Array.isArray(body.records))
    return Response.json({ error: 'expected {"kind": "probe" | "score", "records": [...]}' }, { status: 400 })
  const added = await ingest(body.kind, body.records as Record<string, unknown>[])
  if (added) revalidatePath("/ekbasis/status")
  return Response.json({ ok: true, added })
}
