import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { site } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Ekbasis API — limits, data and model versions',
  description:
    'How the hosted Ekbasis API limits traffic, what it keeps about each request (never the request or the answer) and for how long, and how model versions change.',
  alternates: { canonical: '/ekbasis/api-policies' },
}

const kept: { what: string; how: string }[] = [
  {
    what: 'Account id and email, last 4 characters of the key, path, HTTP status, input tokens, time in ms, IP address and country, error message, request id, the first 80 characters of the User-Agent, X-Ekbasis-Surface',
    how: 'A rolling stream of about the last 20,000 requests, all accounts together',
  },
  { what: 'The same without IP address or email, in your account’s call list (the console’s usage view)', how: 'Your last 10,000 calls, up to 400 days' },
  { what: 'Hourly totals', how: '8 days' },
  { what: 'Daily totals', how: '400 days' },
  { what: 'Which account owns each request id (so only you can send feedback on it)', how: '30 days' },
  { what: 'Feedback you send (POST /feedback): the verdict, your note of up to 500 characters, the call’s metadata', how: 'The last 100,000 entries; daily counters 400 days' },
]

const limits: { what: string; value: string }[] = [
  { what: 'Requests in flight at once', value: '10' },
  { what: 'Input tokens per second, on average', value: '≈ 9,000' },
  { what: 'Burst', value: '150,000 input tokens' },
  { what: 'Wait for a free slot before answering 429', value: 'up to 20 s' },
  { what: 'POST /feedback', value: '200 calls per account per UTC day' },
]

const h2 = 'text-2xl font-semibold tracking-tight'
const p = 'mt-3 text-ink-900/75 dark:text-ink-50/75 leading-relaxed'
const code = 'rounded bg-black/[0.05] dark:bg-white/[0.08] px-1.5 py-0.5 text-[0.9em]'

function Table({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
            <th className="px-4 py-3 text-left font-semibold">{head[0]}</th>
            <th className="px-4 py-3 text-left font-semibold">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-t border-black/5 dark:border-white/10 align-top">
              <td className="px-4 py-3">{a}</td>
              <td className="px-4 py-3 tabular-nums whitespace-normal sm:whitespace-nowrap">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ApiPoliciesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/ekbasis"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Ekbasis
      </Link>
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        HOSTED API · LIMITS · DATA · VERSIONS
      </span>
      <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">API policies</h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
        What the hosted API at <code className={code}>openinterp.org/api/v1</code> limits, keeps and changes. Self-hosting
        the open weights involves none of this: nothing leaves your machine.
      </p>

      <section className="mt-14">
        <h2 className={h2}>Rate limits</h2>
        <p className={p}>
          The hosted API runs on shared GPUs, so there is one limit for all callers together, not a quota per key.
        </p>
        <Table head={['Limit', 'Value']} rows={limits.map((l) => [l.what, l.value])} />
        <p className={p}>
          When it is still full after the wait, the API answers <code className={code}>429</code> with{' '}
          <code className={code}>Retry-After: 5</code>. Retry after that many seconds. The Python and TypeScript clients
          raise <code className={code}>CannotJudge</code> on a 429: treat the action as unchecked, never as safe. There
          are no <code className={code}>X-RateLimit-*</code> headers, because a shared limit has no per-key remainder to
          report.
        </p>
      </section>

      <section className="mt-14">
        <h2 className={h2}>What we keep, and for how long</h2>
        <p className={p}>
          <strong>Not kept: what you send and what the model answers.</strong> The state, the questions, images and the
          answers are never written anywhere, by the gateway or by the model server: no database, no log file. The model
          server keeps a prompt&apos;s cache in GPU memory only while it serves. For the same reason the hosted API has no
          sessions.
        </p>
        <p className={p}>Kept: metadata about each request, used for billing, the console&apos;s usage view and running the service.</p>
        <Table head={['What', 'Kept']} rows={kept.map((k) => [k.what, k.how])} />
        <p className={p}>
          Questions, or a request to delete your account&apos;s records:{' '}
          <a className="underline underline-offset-2" href={`mailto:${site.contact}?subject=Ekbasis%20API%20data`}>
            {site.contact}
          </a>
          .
        </p>
      </section>

      <section className="mt-14">
        <h2 className={h2}>Models and versions</h2>
        <ul className="mt-3 space-y-3 text-ink-900/75 dark:text-ink-50/75 leading-relaxed list-disc pl-5">
          <li>
            The hosted API serves <strong>one model at a time</strong>, named by{' '}
            <code className={code}>GET /api/v1/v1/models</code> and by the <code className={code}>X-Ekbasis-Model</code>{' '}
            header on every answer. Today: <code className={code}>ekbasis-27b-int4-v1.3</code> (weights{' '}
            <a className="underline underline-offset-2" href="https://huggingface.co/caiovicentino1/Ekbasis-27B-INT4">
              caiovicentino1/Ekbasis-27B-INT4
            </a>
            ). Record the header next to the decisions you log if you need to know later which model made them.
          </li>
          <li>
            <strong>Before the served model changes</strong>, the new version and its scorecard (accuracy, confident
            errors, calibration, latency and cost on fixed suites) are posted at least <strong>14 days</strong> ahead. The
            change itself goes in the{' '}
            <a className="underline underline-offset-2" href={`${site.github}/ekbasis/blob/main/CHANGELOG.md`}>
              changelog
            </a>{' '}
            with its date. A security fix may ship at once and is listed the same day.
          </li>
          <li>
            The request and response formats of <code className={code}>/v1/systemone</code> follow the client&apos;s
            semantic versioning: a field is never removed or redefined without a new major version. New fields may appear
            at any time, so ignore fields you do not know.
          </li>
        </ul>
      </section>
    </main>
  )
}
