import Link from 'next/link'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import type { Pillar, PillarStatus } from '@/lib/pillars'

const statusMini: Record<PillarStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30' },
  q2: { label: 'Q2', className: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 ring-pink-500/30' },
  q3: { label: 'Q3', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30' },
  q4: { label: 'Q4', className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30' },
}

export function PillarLanding({ pillar, children }: { pillar: Pillar; children?: React.ReactNode }) {
  const Icon = pillar.icon
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className={`absolute left-1/2 top-10 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br ${pillar.gradient} blur-[120px]`}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 text-brand-600 dark:text-brand-400 shadow-sm">
              <Icon className="h-7 w-7" />
            </div>
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
              {pillar.quarter}
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
            {pillar.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            {pillar.tagline}
          </p>
          <p className="mt-3 max-w-2xl text-base text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
            {pillar.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillar.tools.map((t) => {
            const s = statusMini[t.status]
            const Indicator = t.status === 'live' ? CheckCircle2 : Clock
            return (
              <Link
                key={t.slug}
                href={t.slug}
                className="group card p-6 hover:border-brand-500/30 transition-colors relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold tracking-tight">{t.name}</h3>
                  <span className={`chip ring-inset ${s.className}`}>
                    <Indicator className="h-3 w-3 mr-1 -ml-0.5" />
                    {s.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">{t.blurb}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                  {t.status === 'live' ? 'Open' : 'Preview'}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>

        {children}
      </section>
    </>
  )
}
