"use client"

import { useState, type ReactNode } from "react"

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch(path, {
    method: opts.method ?? "GET",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((d as { error?: string }).error || `HTTP ${r.status}`)
  return d as T
}

export const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString("en-US"))
export const fmtTok = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—"
  const a = Math.abs(n)
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return String(n)
}
export const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const when = (t: number | null | undefined) => (t ? new Date(t).toLocaleString() : "—")
export const ago = (t: number | null | undefined) => {
  if (!t) return "—"
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export function Card({ title, children, right }: { title?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
      <p className="text-xs text-ink-900/55 dark:text-ink-50/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-900/50 dark:text-ink-50/50">{sub}</p>}
    </div>
  )
}

export function Btn({ children, onClick, kind = "default", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; kind?: "default" | "primary" | "danger"; disabled?: boolean; type?: "button" | "submit" }) {
  const cls =
    kind === "primary"
      ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900"
      : kind === "danger"
        ? "bg-red-600 text-white"
        : "ring-1 ring-black/10 hover:bg-black/[0.04] dark:ring-white/15 dark:hover:bg-white/[0.06]"
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${cls}`}>
      {children}
    </button>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`rounded-lg bg-transparent px-3 py-1.5 text-sm ring-1 ring-black/10 focus:outline-none focus:ring-brand-500/60 dark:ring-white/15 ${props.className ?? ""}`} />
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const t = {
    neutral: "bg-black/[0.05] text-ink-900/70 dark:bg-white/[0.08] dark:text-ink-50/70",
    good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bad: "bg-red-500/10 text-red-700 dark:text-red-300",
  }[tone]
  return <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>
}

/** Bar chart in plain SVG (no chart library). */
export function Bars({ data, height = 120, color = "#4f46e5", label }: { data: { x: string; y: number }[]; height?: number; color?: string; label?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.y))
  const w = 100 / Math.max(1, data.length)
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-32 w-full" onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => {
          const h = (d.y / max) * (height - 4)
          return (
            <rect key={i} x={i * w + w * 0.1} y={height - h} width={w * 0.8} height={Math.max(h, d.y > 0 ? 1 : 0)} fill={color} opacity={hover === null || hover === i ? 0.9 : 0.4} onMouseEnter={() => setHover(i)} />
          )
        })}
      </svg>
      <p className="mt-1 h-4 text-xs tabular-nums text-ink-900/60 dark:text-ink-50/60">
        {hover !== null && data[hover] ? `${data[hover].x}: ${label ? label(data[hover].y) : fmt(data[hover].y)}` : " "}
      </p>
    </div>
  )
}

export function ErrorLine({ error }: { error: string | null }) {
  return error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null
}
