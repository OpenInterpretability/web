/** GET ?days=30: per-day requests/tokens/errors/revenue, per-hour for the last 48 h, top users. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson } from "@/lib/admin"
import { readCounters, dayKey, hourKey } from "@/lib/telemetry"
import { pipeline } from "@/lib/crypto-pay/redis"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const n = Math.min(Math.max(Number(new URL(request.url).searchParams.get("days") ?? 30) || 30, 1), 365)
  const now = Date.now()
  const dayTs = Array.from({ length: n }, (_, i) => now - (n - 1 - i) * 86400_000)
  const days = dayTs.map(dayKey)
  const hourTs = Array.from({ length: 48 }, (_, i) => now - (47 - i) * 3600_000)
  const [dc, hc, rev, tops] = await Promise.all([
    readCounters(days.map((d) => `tel:d:${d}`)),
    readCounters(hourTs.map((t) => `tel:h:${hourKey(t)}`)),
    readCounters(days.map((d) => `rev:d:${d}`)),
    pipeline(days.map((d) => ["ZREVRANGE", `tel:ud:${d}`, 0, 49, "WITHSCORES"])),
  ])
  const agg = new Map<string, number>()
  for (const t of tops) {
    if (!Array.isArray(t)) continue
    for (let i = 0; i < t.length; i += 2) agg.set(String(t[i]), (agg.get(String(t[i])) ?? 0) + Number(t[i + 1]))
  }
  const top = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  const app = getHexclaveServerApp()
  const named = await Promise.all(
    top.map(async ([uid, tok]) => {
      const u = await app.getUser(uid).catch(() => null)
      return { uid, email: u?.primaryEmail ?? "(deleted)", tok }
    }),
  )
  const statuses: Record<string, number> = {}
  for (const c of dc) for (const [k, v] of Object.entries(c)) if (/^s\d{3}$/.test(k)) statuses[k.slice(1)] = (statuses[k.slice(1)] ?? 0) + (v ?? 0)
  return ajson({
    days: dayTs.map((t, i) => ({ t, req: dc[i].req, tok: dc[i].tok, err: dc[i].err, ms: dc[i].req ? Math.round((dc[i].ms ?? 0) / dc[i].req) : 0, usd: (rev[i].units ?? 0) / 1e6, orders: rev[i].orders ?? 0 })),
    hours: hourTs.map((t, i) => ({ t, req: hc[i].req, tok: hc[i].tok, err: hc[i].err })),
    top: named,
    statuses,
  })
}
