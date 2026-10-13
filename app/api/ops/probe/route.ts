/**
 * Status probe run by a Vercel cron job (vercel.json, every 10 minutes), next to the GitHub Actions probe of
 * ekbasis-ops, whose schedule can run late or not at all. It asks the hosted API the same small question as
 * ekbasis-ops/probe.py, through the public URL (gateway + model, end to end), and stores the result for
 * /ekbasis/status. Authenticated by CRON_SECRET (Vercel sends it as a Bearer header). Records only measurements.
 */
import { timingSafeEqual } from "crypto"
import { revalidatePath } from "next/cache"
import { ingest } from "@/lib/status-store"

export const dynamic = "force-dynamic"
export const maxDuration = 90

const API = "https://openinterp.org/api/v1/v1/systemone"
const BODY = JSON.stringify({
  state: "A lamp is off. Action: press its switch once.",
  questions: { on: { type: "noul", instructions: "Is the lamp on after the action?" } },
})

function authorized(request: Request): boolean {
  const want = process.env.CRON_SECRET ?? ""
  const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim()
  if (want.length < 32 || got.length !== want.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(want))
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 })
  const key = process.env.OPS_PROBE_KEY
  if (!key) return Response.json({ error: "OPS_PROBE_KEY not set" }, { status: 503 })
  const rec: Record<string, unknown> = { t: new Date().toISOString().slice(0, 19) + "Z", src: "vercel" }
  const t0 = Date.now()
  try {
    const r = await fetch(API, {
      method: "POST",
      body: BODY,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "User-Agent": "ekbasis-status-probe/1.0" },
    })
    const ms = Date.now() - t0
    if (!r.ok) {
      Object.assign(rec, { ok: false, status: r.status, ms })
    } else {
      const d = (await r.json()) as { model?: string; answers?: { on?: { probability?: number } } }
      const timing: Record<string, number> = {}
      for (const part of (r.headers.get("server-timing") ?? "").split(",")) {
        const bits = part.split(";").map((b) => b.trim())
        const dur = bits.find((b) => b.startsWith("dur="))
        if (bits[0] && dur) timing[bits[0]] = Number(dur.slice(4))
      }
      Object.assign(rec, { ok: true, status: 200, ms, timing, model: d.model, right: (d.answers?.on?.probability ?? 0) >= 0.5 })
    }
  } catch (e) {
    Object.assign(rec, { ok: false, status: null, ms: Date.now() - t0, error: (e as Error).name })
  }
  const added = await ingest("probe", [rec])
  if (added) revalidatePath("/ekbasis/status")
  return Response.json({ ok: true, rec })
}
