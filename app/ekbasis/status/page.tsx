import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { readStatus, type Probe, type Score } from '@/lib/status-store'

export const metadata: Metadata = {
  title: 'Ekbasis API status — uptime, latency and daily quality',
  description:
    'Measured from outside our infrastructure: whether the hosted Ekbasis API is up, how fast it answers, and a daily scorecard of how often it is right.',
  alternates: { canonical: '/ekbasis/status' },
}

// Re-rendered when a measurement arrives (/api/ops/ingest), and at least every 5 minutes.
export const revalidate = 300

const MODEL = process.env.EKBASIS_PUBLIC_MODEL || 'ekbasis-27b-int4-v1.3'
const OPS_EVERY_MIN = 10
const SCORECARD_URL = 'https://github.com/OpenInterpretability/ekbasis/tree/main/scorecard'

// Written by hand when something happens: date (UTC), what users saw, cause, fix.
const incidents: { date: string; text: string }[] = []

const SUITES: { key: string; name: string; what: string }[] = [
  { key: 'git3_known', name: 'Git, known commands', what: 'real git, command types seen in training' },
  { key: 'git3_held', name: 'Git, unseen commands', what: 'real git, command types never trained' },
  { key: 'guard_held', name: 'Guard, unseen commands', what: 'the larger guard set, held-out command types' },
  { key: 'worlds', name: 'Worlds, unseen families', what: 'world families never trained' },
  { key: 'intent', name: 'Agent intent', what: 'agent steps from the published-attack replay' },
]

const pct = (x: number) => `${x.toFixed(x >= 99.95 || x === 0 ? 0 : 1)}%`
const fmtMs = (x: number | null) => (x === null ? '—' : x >= 1000 ? `${(x / 1000).toFixed(2)} s` : `${Math.round(x)} ms`)
const quant = (xs: number[], q: number) => {
  if (!xs.length) return null
  // Linear interpolation between the closest ranks (the usual definition: the median of two values is their mean).
  const s = [...xs].sort((a, b) => a - b)
  const r = q * (s.length - 1)
  const lo = Math.floor(r)
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (r - lo)
}
const ago = (t: string, now: number) => {
  const m = Math.round((now - Date.parse(t)) / 60000)
  return m < 60 ? `${m} min ago` : m < 48 * 60 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`
}

function windowStats(probes: Probe[], hours: number, now: number) {
  const w = probes.filter((p) => now - Date.parse(p.t) <= hours * 3600_000)
  const ok = w.filter((p) => p.ok)
  return {
    n: w.length,
    up: w.length ? (100 * ok.length) / w.length : null,
    p50: quant(ok.map((p) => p.ms), 0.5),
    p90: quant(ok.map((p) => p.ms), 0.9),
    model: quant(ok.map((p) => p.timing?.model ?? NaN).filter((x) => !Number.isNaN(x)), 0.5),
    auth: quant(ok.map((p) => p.timing?.auth ?? NaN).filter((x) => !Number.isNaN(x)), 0.5),
  }
}

const card = 'rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15'
const h2 = 'text-2xl font-semibold tracking-tight'
const muted = 'text-ink-900/60 dark:text-ink-50/60'
const th = 'px-3 py-2.5 text-left font-semibold whitespace-nowrap'
const td = 'px-3 py-2.5 tabular-nums whitespace-nowrap'

function Strip({ probes, now }: { probes: Probe[]; now: number }) {
  // The last 24 hours in slots of OPS_EVERY_MIN minutes: green = answered, red = failed, grey = no measurement.
  const slots = (24 * 60) / OPS_EVERY_MIN
  const cells = Array.from({ length: slots }, (_, i) => {
    const end = now - (slots - 1 - i) * OPS_EVERY_MIN * 60_000
    const inSlot = probes.filter((p) => {
      const t = Date.parse(p.t)
      return t <= end && t > end - OPS_EVERY_MIN * 60_000
    })
    return inSlot.length ? (inSlot.every((p) => p.ok) ? 'ok' : 'fail') : 'none'
  })
  const color = { ok: 'bg-emerald-500', fail: 'bg-red-500', none: 'bg-black/10 dark:bg-white/15' }
  return (
    <div>
      <div className="flex h-8 gap-px" aria-label="Last 24 hours of probes">
        {cells.map((c, i) => (
          <span key={i} className={`flex-1 rounded-[1px] ${color[c as keyof typeof color]}`} />
        ))}
      </div>
      <div className={`mt-1.5 flex justify-between text-xs ${muted}`}>
        <span>24 h ago</span>
        <span>now</span>
      </div>
    </div>
  )
}

export default async function StatusPage() {
  let probes: Probe[] = []
  let scores: Score[] = []
  let readError = false
  try {
    ;({ probes, scores } = await readStatus())
  } catch {
    readError = true
  }
  const now = Date.now()
  const last = probes[0]
  const fresh = last && now - Date.parse(last.t) < 3 * OPS_EVERY_MIN * 60_000 + 30 * 60_000
  const state = !last || readError ? 'unknown' : !fresh ? 'stale' : last.ok ? 'up' : 'down'
  const stateText = {
    up: 'Answering',
    down: 'Not answering at the last measurement',
    stale: 'No recent measurement',
    unknown: 'No measurements yet',
  }[state]
  const stateColor = { up: 'bg-emerald-500', down: 'bg-red-500', stale: 'bg-amber-500', unknown: 'bg-black/30 dark:bg-white/30' }[state]
  const windows = [
    { label: '24 hours', ...windowStats(probes, 24, now) },
    { label: '7 days', ...windowStats(probes, 24 * 7, now) },
    { label: '30 days', ...windowStats(probes, 24 * 30, now) },
  ]
  const latest = scores[0]
  const first = probes.length ? probes[probes.length - 1].t.slice(0, 10) : null

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/ekbasis" className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Ekbasis
      </Link>
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        HOSTED API · MEASURED FROM OUTSIDE · UPDATED CONTINUOUSLY
      </span>
      <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">API status</h1>
      <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-3xl">
        Whether the hosted Ekbasis API is up, how fast it answers, and how often it is right. Every number comes from
        machines outside our infrastructure calling the real API, and nothing is removed: bad hours and bad days stay.
      </p>

      <div className={`mt-8 ${card} flex flex-wrap items-center gap-x-6 gap-y-2`}>
        <span className="flex items-center gap-2.5 text-lg font-semibold">
          <span className={`h-3 w-3 rounded-full ${stateColor}`} /> {stateText}
        </span>
        {last && (
          <span className={`text-sm ${muted}`}>
            last measured {ago(last.t, now)} · {last.ok ? `answered in ${fmtMs(last.ms)}` : `HTTP ${last.status ?? last.error ?? 'error'}`}
          </span>
        )}
        <span className={`text-sm ${muted}`}>
          model <code className="text-ink-900 dark:text-ink-50">{MODEL}</code>
        </span>
      </div>

      <section className="mt-14">
        <h2 className={h2}>Is it up, and how fast?</h2>
        <p className={`mt-2 text-sm ${muted}`}>
          A probe asks one small yes/no question every {OPS_EVERY_MIN} minutes, through the public URL, from two places outside
          the GPU servers: a Vercel cron job and GitHub Actions (whose schedule can run late or skip). A window may hold fewer
          probes than {Math.round((24 * 60) / OPS_EVERY_MIN)} a day; the count is shown.
          Time is end to end from the caller, including the network.
          {first && ` Measuring since ${first}.`}
        </p>
        <div className="mt-5">
          <Strip probes={probes} now={now} />
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                <th className={th}>Window</th>
                <th className={th}>Answered</th>
                <th className={th}>Probes</th>
                <th className={th}>Median</th>
                <th className={th}>p90</th>
                <th className={th}>Of which, model</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.label} className="border-t border-black/5 dark:border-white/10">
                  <td className={`${td} font-medium`}>{w.label}</td>
                  <td className={td}>{w.up === null ? '—' : pct(w.up)}</td>
                  <td className={td}>{w.n}</td>
                  <td className={td}>{fmtMs(w.p50)}</td>
                  <td className={td}>{fmtMs(w.p90)}</td>
                  <td className={td}>{fmtMs(w.model)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className={h2}>Is it right?</h2>
        <p className={`mt-2 text-sm ${muted}`}>
          Every day the same fixed questions from the published test sets, none of them in the training data, are sent to
          the production API (100 per suite; the first run, made from our own machine before the daily job existed, used 300–400) by the{' '}
          <a className="underline underline-offset-2" href={SCORECARD_URL}>open scorecard</a>, which anyone can run against
          their own endpoint. A confident error is a wrong answer given with 90% confidence or more: the kind a guard
          cannot catch by asking when unsure. ECE is how far the stated confidence is from the observed accuracy (0 is
          perfect).
        </p>
        {!latest ? (
          <p className={`mt-6 ${card} text-sm ${muted}`}>The first daily scorecard has not arrived yet.</p>
        ) : (
          <>
            <p className={`mt-5 text-sm ${muted}`}>
              Latest run: {latest.t.slice(0, 16).replace('T', ' ')} UTC
              {latest.health?.model ? ` · ${latest.health.model}${latest.health.version ? ` v${latest.health.version}` : ''}` : ''}
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                    <th className={th}>Suite</th>
                    <th className={th}>Right</th>
                    <th className={th}>Confident errors / 100</th>
                    <th className={th}>ECE</th>
                    <th className={th}>Median time</th>
                    <th className={th}>Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {SUITES.filter((s) => latest.suites[s.key]).map((s) => {
                    const x = latest.suites[s.key]
                    return (
                      <tr key={s.key} className="border-t border-black/5 dark:border-white/10 align-top">
                        <td className="px-3 py-2.5">
                          <span className="font-medium">{s.name}</span>
                          <span className={`block text-xs ${muted}`}>{s.what}</span>
                        </td>
                        <td className={td}>{pct(x.accuracy)}</td>
                        <td className={td}>{x.confident_errors_per_100.toFixed(1)}</td>
                        <td className={td}>{x.ece.toFixed(3)}</td>
                        <td className={td}>{fmtMs(x.p50_ms)}</td>
                        <td className={td}>{x.answered}{x.failed ? ` (${x.failed} failed)` : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {latest.chains && (
                <div className={card}>
                  <p className={`text-xs ${muted}`}>Chains (forecast, look, correct)</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{latest.chains.exact}/{latest.chains.chains} exact</p>
                  <p className={`mt-1 text-xs ${muted}`}>{latest.chains.looks_per_100_actions} looks per 100 actions · {latest.chains.seconds_per_action.toFixed(2)} s per action</p>
                </div>
              )}
              {latest.total && (
                <div className={card}>
                  <p className={`text-xs ${muted}`}>Cost at the published price</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">${latest.total.usd_per_1000_checks.toFixed(3)} / 1,000 checks</p>
                  <p className={`mt-1 text-xs ${muted}`}>{latest.total.tokens_per_check} input tokens per check, 0 generated</p>
                </div>
              )}
              {latest.total && (
                <div className={card}>
                  <p className={`text-xs ${muted}`}>All {latest.total.checks} checks</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">p50 {fmtMs(latest.total.p50_ms)} · p99 {fmtMs(latest.total.p99_ms)}</p>
                  <p className={`mt-1 text-xs ${muted}`}>{latest.total.failed} failed</p>
                </div>
              )}
            </div>

            {scores.length > 1 && (
              <>
                <h3 className="mt-10 text-lg font-semibold">Every run so far</h3>
                <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                        <th className={th}>Run (UTC)</th>
                        {SUITES.map((s) => (
                          <th key={s.key} className={th}>{s.name}</th>
                        ))}
                        <th className={th}>Median time</th>
                        <th className={th}>$ / 1k checks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((r) => (
                        <tr key={r.t} className="border-t border-black/5 dark:border-white/10">
                          <td className={td}>{r.t.slice(0, 16).replace('T', ' ')}</td>
                          {SUITES.map((s) => {
                            const x = r.suites[s.key]
                            return (
                              <td key={s.key} className={td}>
                                {x ? `${pct(x.accuracy)} · ${x.confident_errors_per_100.toFixed(1)}` : '—'}
                              </td>
                            )
                          })}
                          <td className={td}>{r.total ? fmtMs(r.total.p50_ms) : '—'}</td>
                          <td className={td}>{r.total ? `$${r.total.usd_per_1000_checks.toFixed(3)}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={`mt-2 text-xs ${muted}`}>Each cell: right · confident errors per 100. The questions are the same every day and the model answers them deterministically, so a number moves only when something changed: the model, the server or the gateway. The first run used more questions, so it differs.</p>
              </>
            )}
          </>
        )}
      </section>

      <section className="mt-14">
        <h2 className={h2}>Incidents</h2>
        {incidents.length ? (
          <ul className="mt-4 space-y-3 text-sm">
            {incidents.map((i) => (
              <li key={i.date} className={card}>
                <span className="font-medium">{i.date}</span> — {i.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 text-sm ${muted}`}>None recorded since measuring began.</p>
        )}
        <p className={`mt-6 text-sm ${muted}`}>
          Limits, what we keep and how model versions change:{' '}
          <Link className="underline underline-offset-2" href="/ekbasis/api-policies">API policies</Link>. The API itself:{' '}
          <a className="underline underline-offset-2" href="/api/v1/openapi.json">OpenAPI</a>.
        </p>
      </section>
    </main>
  )
}
