import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { roadmap } from '@/lib/pillars'

export const metadata = {
  title: 'Roadmap — OpenInterp',
  description:
    '12-month path. Quarter by quarter. Every milestone ships a demo someone uses. No vaporware.',
}

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        12-MONTH ROADMAP
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        Built in public, quarter by quarter.
      </h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        Each milestone ships something shippable. No vaporware, no roadmap promises without a
        prototype. Every quarter ends with a demo that someone uses.
      </p>

      <div className="mt-12 space-y-6">
        {roadmap.map((r, i) => (
          <article
            key={r.quarter}
            className={`card p-8 relative overflow-hidden ${
              r.active ? 'border-brand-500/40 bg-gradient-to-br from-brand-500/5 to-accent-500/5' : ''
            }`}
          >
            {r.active && (
              <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-md">
                {r.label}
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-900/50 dark:text-ink-50/50">
                  {r.quarter}
                  {!r.active && <span className="ml-2 text-brand-600 dark:text-brand-400">{r.label}</span>}
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{r.theme}</h2>
              </div>
              <div className="font-mono text-xs text-ink-900/40 dark:text-ink-50/40">
                QUARTER {i + 1} / 4
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {r.items.map((item, j) => (
                <li
                  key={j}
                  className="flex gap-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed"
                >
                  <span className="mt-1.5 shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-14 card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <h2 className="text-2xl font-semibold tracking-tight">Help shape the next milestone.</h2>
        <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
          Roadmap priorities shift based on what the community uses and what Watchtower partners
          need. Open a GitHub issue, comment on the manifesto, or email us — loud feedback moves
          items forward.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/manifesto"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Read the manifesto
          </Link>
          <a
            href="https://github.com/caiovicentino/mechreward/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Open a GitHub issue
          </a>
        </div>
      </div>
    </div>
  )
}
