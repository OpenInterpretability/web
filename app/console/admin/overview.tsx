"use client"

import { useCallback, useEffect, useState } from "react"
import { api, Bars, Card, ErrorLine, Stat, Badge, fmt, fmtTok, usd, ago } from "./ui"

type OverviewData = {
  users: { total: number; new24h: number; active24h: number; restricted: number }
  requests: { today: number; d7: number; d30: number; errorsToday: number }
  tokens: { today: number; d7: number; d30: number }
  latencyMsToday: number | null
  revenue: { totalUsd: number; totalOrders: number; todayUsd: number; todayOrders: number }
  orders: { pending: number; review: number }
  coupons: number
  backend: { ok: boolean; ms: number }
}
type Usage = {
  days: { t: number; req: number; tok: number; err: number; ms: number; usd: number; orders: number }[]
  hours: { t: number; req: number; tok: number; err: number }[]
  top: { uid: string; email: string; tok: number }[]
  statuses: Record<string, number>
}

export function Overview() {
  const [o, setO] = useState<OverviewData | null>(null)
  const [u, setU] = useState<Usage | null>(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [at, setAt] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api<OverviewData>("/api/admin/overview"), api<Usage>(`/api/admin/usage?days=${days}`)])
      setO(a); setU(b); setAt(Date.now()); setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [days])

  useEffect(() => {
    void load()
    const t = setInterval(() => { void load() }, 30_000)
    return () => clearInterval(t)
  }, [load])

  const day = (t: number) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  const hour = (t: number) => new Date(t).toLocaleString(undefined, { weekday: "short", hour: "2-digit" })

  return (
    <div className="space-y-6">
      <ErrorLine error={error} />
      <div className="flex items-center justify-between text-xs text-ink-900/50 dark:text-ink-50/50">
        <span>Refreshes every 30 s · updated {ago(at)}</span>
        {o && (
          <span>
            Model server: {o.backend.ok ? <Badge tone="good">up · {o.backend.ms} ms</Badge> : <Badge tone="bad">DOWN</Badge>}
          </span>
        )}
      </div>
      {o && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Users" value={fmt(o.users.total)} sub={`${o.users.new24h} new · ${o.users.active24h} active (24 h)${o.users.restricted ? ` · ${o.users.restricted} suspended` : ""}`} />
          <Stat label="Requests today" value={fmt(o.requests.today)} sub={`${fmt(o.requests.d7)} in 7 d · ${fmt(o.requests.d30)} in 30 d`} />
          <Stat label="Tokens metered today" value={fmtTok(o.tokens.today)} sub={`${fmtTok(o.tokens.d7)} 7 d · ${fmtTok(o.tokens.d30)} 30 d`} />
          <Stat label="Revenue" value={usd(o.revenue.totalUsd)} sub={`${o.revenue.totalOrders} orders · today ${usd(o.revenue.todayUsd)}`} />
          <Stat label="Errors today" value={fmt(o.requests.errorsToday)} sub={o.requests.today ? `${((o.requests.errorsToday / o.requests.today) * 100).toFixed(1)}% of requests` : "—"} />
          <Stat label="Avg latency today" value={o.latencyMsToday === null ? "—" : `${o.latencyMsToday} ms`} sub="gateway, end to end" />
          <Stat label="Orders to watch" value={`${o.orders.pending} / ${o.orders.review}`} sub="pending / review" />
          <Stat label="Coupons" value={fmt(o.coupons)} sub="created" />
        </div>
      )}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-lg px-2.5 py-1 text-xs ring-1 ${days === d ? "bg-brand-500/10 ring-brand-500/60" : "ring-black/10 dark:ring-white/15"}`}>
            {d} days
          </button>
        ))}
      </div>
      {u && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Requests per day"><Bars data={u.days.map((d) => ({ x: day(d.t), y: d.req }))} /></Card>
          <Card title="Input tokens per day"><Bars data={u.days.map((d) => ({ x: day(d.t), y: d.tok }))} color="#0ea5e9" label={fmtTok} /></Card>
          <Card title="Revenue per day (USDC/USDT)"><Bars data={u.days.map((d) => ({ x: day(d.t), y: d.usd }))} color="#10b981" label={usd} /></Card>
          <Card title="Errors per day"><Bars data={u.days.map((d) => ({ x: day(d.t), y: d.err }))} color="#ef4444" /></Card>
          <Card title="Requests per hour (48 h)"><Bars data={u.hours.map((h) => ({ x: hour(h.t), y: h.req }))} color="#8b5cf6" /></Card>
          <Card title="Status codes">
            <div className="flex flex-wrap gap-2">
              {Object.entries(u.statuses).sort().map(([s, n]) => (
                <Badge key={s} tone={s.startsWith("2") ? "good" : s === "402" || s === "401" ? "warn" : "bad"}>{s}: {fmt(n)}</Badge>
              ))}
              {Object.keys(u.statuses).length === 0 && <p className="text-sm text-ink-900/50 dark:text-ink-50/50">No requests yet.</p>}
            </div>
          </Card>
          <Card title={`Top users by tokens (${days} d)`}>
            <table className="w-full text-sm">
              <tbody>
                {u.top.map((t) => (
                  <tr key={t.uid} className="border-t border-black/5 dark:border-white/10">
                    <td className="py-1.5">{t.email}</td>
                    <td className="py-1.5 text-right tabular-nums">{fmtTok(t.tok)}</td>
                  </tr>
                ))}
                {u.top.length === 0 && <tr><td className="text-ink-900/50 dark:text-ink-50/50">No usage yet.</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}
