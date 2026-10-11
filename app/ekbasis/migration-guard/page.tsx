import Link from 'next/link'
import type { ReactNode } from 'react'
import localFont from 'next/font/local'

const serif = localFont({ src: '../../fonts/source-serif-4-latin-wght-normal.woff2', weight: '200 900', display: 'swap' })

export const metadata = {
  title: 'Ekbasis migration guard',
  description:
    'A GitHub Action that foresees, before a pull request is merged, whether its PostgreSQL migrations fail or lose data. Pre-registered on 184 migrations it had never seen: verdict right 87.5% of the time, against 69.6% for linter-style rules.',
}

const DOCS = 'https://github.com/OpenInterpretability/ekbasis/blob/v0.1.12/docs/MIGRATION_GUARD.md'
const STUDY = 'https://github.com/OpenInterpretability/ekbasis-cookbook/tree/main/studies/migrations'

const WORKFLOW = `# .github/workflows/migration-guard.yml
name: migration guard
on:
  pull_request:                 # never pull_request_target
    paths: ["**/migrations/**", "**/*.sql"]
permissions:
  contents: read
  pull-requests: write          # the comment
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # the base branch's migrations build the schema
      - uses: OpenInterpretability/ekbasis/actions/migration-guard@v0.1.12
        with:
          api-key: \${{ secrets.EKBASIS_API_KEY }}
          # db-stats-url: \${{ secrets.READ_REPLICA_URL }}   # optional: planner statistics only`

function H2({ children }: { children: ReactNode }) {
  return <h2 className={`mt-14 ${serif.className} text-[28px] font-normal leading-tight tracking-tight`}>{children}</h2>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[17px] leading-[1.75] text-ink-900/80 dark:text-ink-50/80">{children}</p>
}

const ROWS: [string, string, string][] = [
  ['Verdict right (risky or safe)', '87.5% [82.6, 92.4]', '69.6%'],
  ['Risky migrations flagged', '94.6% (53 of 56)', '98.2%'],
  ['False alarms on safe migrations', '15.6% (20 of 128)', '43.0%'],
  ['Reason right when flagged', '92.5% (49 of 53)', '83.6%'],
]

export default function MigrationGuard() {
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-24 pt-16 sm:pt-24">
      <p className="text-sm text-ink-900/55 dark:text-ink-50/55">
        <Link href="/ekbasis" className="hover:underline">Ekbasis</Link> · client 0.1.12 · October 2026
      </p>
      <h1 className={`mt-5 ${serif.className} text-[44px] font-normal leading-[1.08] tracking-tight sm:text-[52px]`}>
        Migration guard
      </h1>
      <p className="mt-6 text-xl leading-relaxed text-ink-900/70 dark:text-ink-50/70">
        Before a pull request is merged, it says whether its PostgreSQL migrations will fail or lose data.
      </p>

      <figure className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-black/10 dark:bg-ink-900 dark:ring-white/15">
        <p className="text-[15px] font-semibold">Ekbasis migration guard</p>
        <p className="mt-2 text-[14px]"><b>Risky:</b> at least one migration may lose data or fail on the existing database.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-ink-900/55 dark:text-ink-50/55">
              <tr><th className="py-1 pr-3 font-medium">Migration</th><th className="py-1 pr-3 font-medium">Verdict</th><th className="py-1 font-medium">Why</th></tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-t border-black/5 dark:border-white/10">
                <td className="py-2 pr-3 font-mono text-[12px]">…/05_add_visit_id/migration.sql</td><td className="py-2 pr-3 font-semibold">risky</td>
                <td className="py-2">may fail on existing data (96%); nothing in the file would be applied</td>
              </tr>
              <tr className="border-t border-black/5 dark:border-white/10">
                <td className="py-2 pr-3 font-mono text-[12px]">…/19_add_session_replay/migration.sql</td><td className="py-2 pr-3 font-semibold">risky</td>
                <td className="py-2">may lose existing data (98%)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <figcaption className="mt-4 text-xs text-ink-900/45 dark:text-ink-50/45">
          Comments it left on a test repository, on migrations taken from an open-source project.
        </figcaption>
      </figure>

      <H2>How it works</H2>
      <P>
        The action builds the database schema by applying the base branch&apos;s migrations to a scratch PostgreSQL in
        the runner. If you give it a read-only replica, it also reads planner statistics — row estimates and the share of
        NULLs per column — never data values. Ekbasis then forecasts, for each new migration file, whether it fails and
        whether it loses data; the verdict and its reason are decided in code from those two answers. It leaves one comment
        on the pull request, updated on each push, and can fail the check.
      </P>
      <P>
        The SQL of the pull request runs as a throwaway role without superuser rights, in a container with no network.
        A migration that needs more than that is not run: the guard says it cannot foresee it and asks for a review by hand.
      </P>
      <pre className="mt-6 overflow-x-auto rounded-xl bg-ink-950 p-5 text-[12.5px] leading-relaxed text-ink-50/90 ring-1 ring-white/10">
        <code>{WORKFLOW}</code>
      </pre>
      <p className="mt-3 text-sm text-ink-900/60 dark:text-ink-50/60">
        Supports PostgreSQL SQL migrations from Prisma, Diesel, golang-migrate and plain <code>*.sql</code> folders.{' '}
        <a href={DOCS} className="underline underline-offset-2">Documentation</a>. An API key is free to create at{' '}
        <Link href="/console" className="underline underline-offset-2">/console</Link>.
      </p>

      <H2>What we measured</H2>
      <P>
        On 184 PostgreSQL migrations it had never seen, each run on a database seeded with synthetic rows, its verdict
        was right 87.5% of the time, against 69.6% for linter-style rules. It flagged 94.6% of the migrations that fail or
        lose data, and raised a false alarm on 15.6% of the safe ones, against 43% for the rules. When it flags a
        migration, the reason it gives — it fails, or it loses data — was right in 92.5% of cases. The plan was
        pre-registered and hashed before any call.
      </P>
      <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-4 py-2 font-medium">184 new migrations</th><th className="px-4 py-2 font-medium">Ekbasis</th><th className="px-4 py-2 font-medium">Rules</th></tr>
          </thead>
          <tbody>
            {ROWS.map(([k, a, b]) => (
              <tr key={k} className="border-t border-black/5 dark:border-white/10">
                <td className="px-4 py-2">{k}</td><td className="px-4 py-2 font-semibold tabular-nums">{a}</td><td className="px-4 py-2 tabular-nums">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        Not everything worked. An earlier version that only told the model about transactions did not cut false loss
        alarms on migrations that fail, and its loss probabilities were not calibrated; the verdict is now decided in
        code. On the migrations that look destructive, accuracy was 78.6% against 67.9% for the rules. The tables held
        synthetic rows, so results on real databases may differ.{' '}
        <a href={STUDY} className="underline underline-offset-2">Every result, the plans and the scripts</a>.
      </P>

      <H2>Cost</H2>
      <P>
        A migration takes about 4,000 input tokens and a second or two of model time. The guard is a warning layer that
        can be wrong, not a replacement for review or backups.
      </P>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/console" className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-900/85 dark:bg-white dark:text-ink-900">
          Get an API key
        </Link>
        <a href={DOCS} className="rounded-lg px-5 py-2.5 text-sm font-semibold ring-1 ring-black/15 hover:bg-black/[0.04] dark:ring-white/20 dark:hover:bg-white/[0.06]">
          Read the docs
        </a>
      </div>
    </main>
  )
}
