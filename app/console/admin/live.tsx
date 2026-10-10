"use client"

import { useEffect, useRef, useState } from "react"
import { api, Bars, Card, ErrorLine, Badge, fmtTok } from "./ui"

type Ev = { t: number; uid: string | null; email: string | null; key: string | null; path: string; status: number; tok: number; ms: number; ip: string | null; country: string | null; err?: string }
type LiveResp = { events: { id: string; e: Ev }[]; minutes: { t: number; req: number; tok: number; err: number }[] }

export function Live() {
  const [events, setEvents] = useState<{ id: string; e: Ev }[]>([])
  const [minutes, setMinutes] = useState<LiveResp["minutes"]>([])
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (paused) return
    let alive = true
    const tick = async () => {
      try {
        const d = await api<LiveResp>(`/api/admin/live${last.current ? `?since=${encodeURIComponent(last.current)}` : ""}`)
        if (!alive) return
        if (d.events.length) {
          last.current = d.events[d.events.length - 1].id
          setEvents((prev) => [...d.events.reverse(), ...prev].slice(0, 500))
        }
        setMinutes(d.minutes)
        setError(null)
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      }
    }
    void tick()
    const t = setInterval(() => { void tick() }, 2000)
    return () => { alive = false; clearInterval(t) }
  }, [paused])

  const shown = filter ? events.filter(({ e }) => [e.email, e.path, String(e.status), e.ip, e.key].some((x) => x?.toLowerCase().includes(filter.toLowerCase()))) : events
  const lastMin = minutes[minutes.length - 1]
  const reqPerMin = minutes.slice(-5).reduce((a, m) => a + m.req, 0) / 5

  return (
    <div className="space-y-4">
      <ErrorLine error={error} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Requests per minute (last hour)">
          <Bars data={minutes.map((m) => ({ x: new Date(m.t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }), y: m.req }))} height={80} />
        </Card>
        <Card title="Right now">
          <p className="text-3xl font-semibold tabular-nums">{reqPerMin.toFixed(1)}</p>
          <p className="text-xs text-ink-900/55 dark:text-ink-50/55">requests/min (5-min average)</p>
          <p className="mt-3 text-sm tabular-nums">{lastMin ? `${lastMin.req} req · ${fmtTok(lastMin.tok)} tokens · ${lastMin.err} errors` : "—"} <span className="text-xs text-ink-900/50 dark:text-ink-50/50">this minute</span></p>
        </Card>
        <Card title="Feed">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPaused((p) => !p)} className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15">
              {paused ? "▶ Resume" : "❚❚ Pause"}
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-900/60 dark:text-ink-50/60">
              <span className={`h-2 w-2 rounded-full ${paused ? "bg-ink-900/30" : "animate-pulse bg-emerald-500"}`} /> {paused ? "paused" : "live · every 2 s"}
            </span>
          </div>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter: email, path, status, IP, key" className="mt-3 w-full rounded-lg bg-transparent px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15" />
        </Card>
      </div>
      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-3 py-2">Time</th><th className="px-3 py-2">User</th><th className="px-3 py-2">Key</th><th className="px-3 py-2">Path</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Tokens</th><th className="px-3 py-2 text-right">Latency</th><th className="px-3 py-2">Origin</th><th className="px-3 py-2">Note</th></tr>
          </thead>
          <tbody>
            {shown.map(({ id, e }) => (
              <tr key={id} className="border-t border-black/5 font-mono text-xs dark:border-white/10">
                <td className="px-3 py-1.5 whitespace-nowrap">{new Date(e.t).toLocaleTimeString()}</td>
                <td className="px-3 py-1.5">{e.email ?? <span className="text-ink-900/40 dark:text-ink-50/40">anonymous</span>}</td>
                <td className="px-3 py-1.5">{e.key ? `…${e.key}` : "—"}</td>
                <td className="px-3 py-1.5">{e.path}</td>
                <td className="px-3 py-1.5"><Badge tone={e.status < 300 ? "good" : e.status < 500 ? "warn" : "bad"}>{e.status}</Badge></td>
                <td className="px-3 py-1.5 text-right tabular-nums">{e.tok ? e.tok.toLocaleString() : "—"}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{e.ms} ms</td>
                <td className="px-3 py-1.5">{[e.country, e.ip].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-3 py-1.5 text-ink-900/60 dark:text-ink-50/60">{e.err ?? ""}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-ink-900/50 dark:text-ink-50/50">Waiting for requests…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
