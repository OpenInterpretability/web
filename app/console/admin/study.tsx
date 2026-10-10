"use client"

import { useCallback, useEffect, useState } from "react"
import { api, Badge, Bars, Btn, Card, ErrorLine, Stat, ago, fmt, fmtTok, when } from "./ui"

type Verdicts = { correct: number; wrong: number; prevented_harm: number; false_alarm: number }
type Funnel = {
  entered: number; key: number; call: number; active3: number; excluded: number
  retention: { d1: [number, number]; d7: [number, number]; d30: [number, number] }
  adopted14: [number, number]
  feedback: Verdicts; feedbackUsers: number
}
type Row = {
  uid: string; email: string | null; anchorAt: number; excluded: null | "internal" | "admin" | "deleted"
  keys: number; firstKeyAt: number | null; calls: number; attempts: number; tokens: number; errors: number
  activeDays: number; firstOkAt: number | null; lastAt: number | null
  d1: boolean | null; d7: boolean | null; d30: boolean | null; feedback: Verdicts
}
type Fb = { t: number; rid: string; uid: string; verdict: keyof Verdicts; note: string | null; path: string; status: number; email: string | null; group: string }
type Study = {
  generatedAt: number
  coupon: { code: string; createdAt: number | null; redemptions: number; maxRedemptions: number | null }
  cohort: { funnel: Funnel; rows: Row[] }
  comparison: { funnel: Funnel; rows: Row[]; since: number | null }
  feedback: { total: Verdicts; days: ({ day: string } & Verdicts)[]; latest: Fb[] }
}

const VERDICT_TONE: Record<keyof Verdicts, "good" | "bad" | "warn" | "neutral"> = { correct: "good", wrong: "bad", prevented_harm: "good", false_alarm: "warn" }
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(0)}%` : "—")
const ret = ([a, b]: [number, number]) => (b ? `${a}/${b} · ${pct(a, b)}` : "— (window open)")
const mark = (v: boolean | null) => (v === null ? <span className="text-ink-900/40 dark:text-ink-50/40">·</span> : v ? "✓" : "✗")

function FunnelView({ f, entered }: { f: Funnel; entered: string }) {
  const stages = [
    { label: entered, n: f.entered },
    { label: "Created a key", n: f.key },
    { label: "≥1 call (2xx)", n: f.call },
    { label: "Active on ≥3 days", n: f.active3 },
  ]
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.label}>
          <div className="flex justify-between text-sm">
            <span>{s.label}</span>
            <span className="tabular-nums">{fmt(s.n)} <span className="text-xs text-ink-900/50 dark:text-ink-50/50">{i > 0 ? `${pct(s.n, f.entered)} of entered · ${pct(s.n, stages[i - 1].n)} of previous` : ""}</span></span>
          </div>
          <div className="mt-1 h-2 rounded bg-black/[0.05] dark:bg-white/[0.08]">
            <div className="h-2 rounded bg-brand-600" style={{ width: f.entered ? `${(s.n / f.entered) * 100}%` : "0%" }} />
          </div>
        </div>
      ))}
      <p className="pt-2 text-xs text-ink-900/60 dark:text-ink-50/60">
        Adoption (first call ≤ 14 days) {ret(f.adopted14)} · Retention among users with ≥1 call — D1 {ret(f.retention.d1)} · D7 {ret(f.retention.d7)} · D30 {ret(f.retention.d30)}
        {f.excluded > 0 && ` · ${f.excluded} excluded (internal, admin or deleted)`}
      </p>
    </div>
  )
}

export function Study() {
  const [d, setD] = useState<Study | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showExcluded, setShowExcluded] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setD(await api<Study>("/api/admin/study")); setError(null) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  if (!d) return <div className="space-y-2"><ErrorLine error={error} />{!error && <p className="text-sm text-ink-900/50 dark:text-ink-50/50">Loading the study…</p>}</div>
  const c = d.cohort.funnel
  const fbTotal = d.feedback.total
  // M5: correct + prevented_harm over every rated call (a false alarm is a wrong prediction).
  const rated = fbTotal.correct + fbTotal.wrong + fbTotal.prevented_harm + fbTotal.false_alarm
  const right = fbTotal.correct + fbTotal.prevented_harm
  const rows = d.cohort.rows.filter((r) => showExcluded || !r.excluded)
  return (
    <div className="space-y-6">
      <ErrorLine error={error} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-900/50 dark:text-ink-50/50">
        <span>
          Real-users study · cohort = redeemers of <span className="font-mono">{d.coupon.code}</span>
          {d.coupon.createdAt && ` (coupon created ${when(d.coupon.createdAt)})`} · protocol docs/STUDY_REAL_USERS.md · computed {ago(d.generatedAt)}
        </span>
        <span className="flex gap-2">
          <a href="/api/admin/study/export" className="underline underline-offset-2">Export (pseudonymous JSON)</a>
          <Btn onClick={() => { void load() }} disabled={loading}>{loading ? "Loading…" : "Refresh"}</Btn>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Redeemed" value={fmt(c.entered)} sub={`${d.coupon.redemptions}${d.coupon.maxRedemptions ? ` / ${d.coupon.maxRedemptions}` : ""} redemptions · ${c.excluded} excluded`} />
        <Stat label="Made ≥1 call" value={fmt(c.call)} sub={`${pct(c.call, c.entered)} of the cohort`} />
        <Stat label="Feedback" value={fmt(rated)} sub={`all users · ${c.feedbackUsers} cohort users gave any`} />
        <Stat label="Reported correct (M5)" value={pct(right, rated)} sub={`warning precision ${pct(fbTotal.prevented_harm, fbTotal.prevented_harm + fbTotal.false_alarm)} (all users)`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={`Cohort funnel — ${d.coupon.code}`}><FunnelView f={c} entered="Redeemed" /></Card>
        <Card title={`Comparison — signed up since the coupon, did not redeem (n=${d.comparison.funnel.entered})`}>
          {d.comparison.since === null ? <p className="text-sm text-ink-900/50 dark:text-ink-50/50">The coupon does not exist, so there is no comparison window.</p> : <FunnelView f={d.comparison.funnel} entered="Signed up" />}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Feedback by verdict (all users)">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(fbTotal) as (keyof Verdicts)[]).map((v) => <Badge key={v} tone={VERDICT_TONE[v]}>{v.replace("_", " ")}: {fmt(fbTotal[v])}</Badge>)}
          </div>
          <p className="mt-3 text-xs text-ink-900/60 dark:text-ink-50/60">
            Cohort only: {(Object.keys(c.feedback) as (keyof Verdicts)[]).map((v) => `${v.replace("_", " ")} ${c.feedback[v]}`).join(" · ")}
          </p>
          <div className="mt-3"><Bars data={d.feedback.days.map((x) => ({ x: x.day, y: x.correct + x.wrong + x.prevented_harm + x.false_alarm }))} color="#10b981" /></div>
          <p className="text-xs text-ink-900/50 dark:text-ink-50/50">Feedback per day, last 30 days</p>
        </Card>
        <Card title="Latest feedback">
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {d.feedback.latest.map((f) => (
              <div key={f.rid} className="border-t border-black/5 pt-2 text-sm dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone={VERDICT_TONE[f.verdict]}>{f.verdict.replace("_", " ")}</Badge>
                  <span>{f.email ?? f.uid}</span>
                  <Badge>{f.group}</Badge>
                  <span className="font-mono text-ink-900/50 dark:text-ink-50/50">{f.path}</span>
                  <span className="text-ink-900/50 dark:text-ink-50/50">{ago(f.t)}</span>
                </div>
                {f.note && <p className="mt-1 whitespace-pre-wrap break-words">{f.note}</p>}
              </div>
            ))}
            {d.feedback.latest.length === 0 && <p className="text-sm text-ink-900/50 dark:text-ink-50/50">No feedback yet.</p>}
          </div>
        </Card>
      </div>

      <Card title={`Cohort members (${rows.length})`} right={<label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={showExcluded} onChange={(e) => setShowExcluded(e.target.checked)} /> show excluded</label>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="text-left text-xs text-ink-900/60 dark:text-ink-50/60">
              <tr>
                <th className="py-1.5">Email</th><th>Redeemed</th><th className="text-right">Keys</th><th className="text-right">Calls</th><th className="text-right">Errors</th>
                <th className="text-right">Tokens</th><th className="text-right">Active days</th><th>First call</th><th>Last request</th>
                <th className="text-center">D1</th><th className="text-center">D7</th><th className="text-center">D30</th><th>Feedback (✓/✗/stop/false)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid} className={`border-t border-black/5 dark:border-white/10 ${r.excluded ? "opacity-50" : ""}`}>
                  <td className="py-1.5">{r.email ?? <span className="font-mono text-xs">{r.uid}</span>}{r.excluded && <span className="ml-1"><Badge tone="warn">{r.excluded}</Badge></span>}</td>
                  <td className="text-xs">{when(r.anchorAt)}</td>
                  <td className="text-right tabular-nums">{r.keys}</td>
                  <td className="text-right tabular-nums">{fmt(r.calls)}</td>
                  <td className="text-right tabular-nums">{fmt(r.errors)}</td>
                  <td className="text-right tabular-nums">{fmtTok(r.tokens)}</td>
                  <td className="text-right tabular-nums">{r.activeDays}</td>
                  <td className="text-xs">{r.firstOkAt ? ago(r.firstOkAt) : "—"}</td>
                  <td className="text-xs">{ago(r.lastAt)}</td>
                  <td className="text-center">{mark(r.d1)}</td><td className="text-center">{mark(r.d7)}</td><td className="text-center">{mark(r.d30)}</td>
                  <td className="text-xs tabular-nums">{r.feedback.correct}/{r.feedback.wrong}/{r.feedback.prevented_harm}/{r.feedback.false_alarm}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={13} className="py-6 text-center text-ink-900/50 dark:text-ink-50/50">Nobody has redeemed {d.coupon.code} yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50">
          Call = request answered 2xx. Active day = UTC day with ≥1 call. D1/D7/D30 = active on day 1 / days 7–13 / days 30–36 after redemption; · = window still open.
        </p>
      </Card>
    </div>
  )
}
