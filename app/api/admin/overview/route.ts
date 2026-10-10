/** Headline numbers for the admin overview. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson } from "@/lib/admin"
import { readCounters, dayKey } from "@/lib/telemetry"
import { pipeline, redis } from "@/lib/crypto-pay/redis"
import { listOrders } from "@/lib/crypto-pay/orders"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const now = Date.now()
  const days = Array.from({ length: 30 }, (_, i) => dayKey(now - i * 86400_000))
  const [dayCounters, revRaw, users, orders, couponCount, backend] = await Promise.all([
    readCounters(days.map((d) => `tel:d:${d}`)),
    pipeline([["HGETALL", "rev:total"], ["HGETALL", `rev:d:${days[0]}`]]),
    getHexclaveServerApp().listUsers({ limit: 1000 }),
    listOrders({ limit: 200 }),
    redis<number>("SCARD", "cpn:index"),
    (async () => {
      const t = Date.now()
      try {
        const r = await fetch(`${process.env.EKBASIS_BACKEND_URL}/health`, {
          headers: { Authorization: `Bearer ${process.env.EKBASIS_BACKEND_KEY ?? ""}` },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        })
        return { ok: r.ok, ms: Date.now() - t }
      } catch {
        return { ok: false, ms: Date.now() - t }
      }
    })(),
  ])
  const flat = (x: unknown) => {
    const o: Record<string, number> = {}
    if (Array.isArray(x)) for (let i = 0; i < x.length; i += 2) o[String(x[i])] = Number(x[i + 1])
    return o
  }
  const total = flat(revRaw[0])
  const today = flat(revRaw[1])
  const sum = (k: "req" | "tok" | "err", n: number) => dayCounters.slice(0, n).reduce((a, c) => a + (c[k] ?? 0), 0)
  const dayAgo = now - 86400_000
  return ajson({
    users: { total: users.length, new24h: users.filter((u) => u.signedUpAt.getTime() > dayAgo).length, active24h: users.filter((u) => u.lastActiveAt.getTime() > dayAgo).length, restricted: users.filter((u) => u.isRestricted).length },
    requests: { today: sum("req", 1), d7: sum("req", 7), d30: sum("req", 30), errorsToday: sum("err", 1) },
    tokens: { today: sum("tok", 1), d7: sum("tok", 7), d30: sum("tok", 30) },
    latencyMsToday: dayCounters[0].req ? Math.round((dayCounters[0].ms ?? 0) / dayCounters[0].req) : null,
    revenue: { totalUsd: (total.units ?? 0) / 1e6, totalOrders: total.orders ?? 0, todayUsd: (today.units ?? 0) / 1e6, todayOrders: today.orders ?? 0 },
    orders: { pending: orders.filter((o) => o.status === "pending").length, review: orders.filter((o) => o.status === "review").length },
    coupons: couponCount ?? 0,
    backend,
  })
}
