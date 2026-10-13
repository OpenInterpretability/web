/**
 * Operator summary of the gateway log, for checking the effect of a change on real users without the admin web
 * session: GET ?hours=N (max 72). Authenticated by OPS_READ_SECRET (Bearer). No IP, no key and no full email leave
 * here: external accounts appear as a short hash, so a pattern per account is visible but not who it is.
 */
import { createHash, timingSafeEqual } from "crypto"
import { redis } from "@/lib/crypto-pay/redis"
import type { TelemetryEvent } from "@/lib/telemetry"

export const dynamic = "force-dynamic"

function authorized(request: Request): boolean {
  const want = process.env.OPS_READ_SECRET ?? ""
  const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim()
  if (want.length < 32 || got.length !== want.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(want))
}

const who = (e: TelemetryEvent) => (e.uid ? createHash("sha256").update(e.uid).digest("hex").slice(0, 8) : "anon")

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 })
  const hours = Math.min(72, Math.max(1, Number(new URL(request.url).searchParams.get("hours")) || 6))
  const start = Date.now() - hours * 3600_000
  type Raw = [string, string[]][]
  const raw = (await redis<Raw>("XRANGE", "tel:stream", String(start), "+", "COUNT", 20000)) ?? []
  const groups = new Map<string, { n: number; first: number; last: number }>()
  const external: { t: string; acct: string; status: number; err?: string; path: string; client?: string; ms: number; tok: number }[] = []
  for (const [, fields] of raw) {
    const e = JSON.parse(fields[fields.indexOf("j") + 1]) as TelemetryEvent
    if (e.path === "/health" || e.path === "/v1/health") continue
    const k = [e.int === 1 ? "internal" : "external", e.path, e.status, e.err ?? ""].join(" | ")
    const g = groups.get(k) ?? { n: 0, first: e.t, last: e.t }
    g.n++
    g.last = e.t
    groups.set(k, g)
    if (e.int !== 1)
      external.push({ t: new Date(e.t).toISOString(), acct: who(e), status: e.status, err: e.err, path: e.path, client: e.cl, ms: e.ms, tok: e.tok })
  }
  return Response.json(
    {
      hours,
      groups: [...groups].map(([k, g]) => ({ k, n: g.n, first: new Date(g.first).toISOString(), last: new Date(g.last).toISOString() })).sort((a, b) => b.n - a.n),
      external: external.slice(-300),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
