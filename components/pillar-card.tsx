import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Pillar, PillarStatus } from '@/lib/pillars'

const statusStyles: Record<PillarStatus, { badge: string; label: string }> = {
  live: { badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30', label: 'LIVE · Q1' },
  q2: { badge: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 ring-pink-500/30', label: 'Q2 2026' },
  q3: { badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30', label: 'Q3 2026' },
  q4: { badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30', label: 'Q4 2026 · ENTERPRISE' },
}

export function PillarCard({ pillar }: { pillar: Pillar }) {
  const Icon = pillar.icon
  const style = statusStyles[pillar.status]
  return (
    <Link
      href={pillar.slug}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-7 transition-all hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/20 hover:shadow-lg"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4 mb-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 text-brand-600 dark:text-brand-400">
          <Icon className="h-6 w-6" />
        </div>
        <span className={`chip ring-inset whitespace-nowrap ${style.badge}`}>{style.label}</span>
      </div>
      <h3 className="relative text-xl font-semibold tracking-tight">{pillar.name}</h3>
      <p className="relative mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
        {pillar.tagline}
      </p>
      <ul className="relative mt-5 space-y-2">
        {pillar.tools.map((t) => (
          <li key={t.slug} className="flex items-start gap-2 text-sm text-ink-900/60 dark:text-ink-50/60 leading-snug">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
            <span>
              <strong className="text-ink-900 dark:text-ink-50 font-medium">{t.name}</strong>
              {' — '}
              {t.blurb.split('.')[0]}.
            </span>
          </li>
        ))}
      </ul>
      <div className="relative mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
        Enter {pillar.name}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

export function MiniPillarCard({ pillar }: { pillar: Pillar }) {
  const Icon = pillar.icon
  const style = statusStyles[pillar.status]
  return (
    <Link
      href={pillar.slug}
      className="group flex items-center gap-3 rounded-lg border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-3 hover:border-brand-500/30 transition-colors"
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{pillar.name}</span>
          <span className={`chip ring-inset text-[10px] ${style.badge}`}>{style.label}</span>
        </div>
        <div className="mt-0.5 text-xs text-ink-900/60 dark:text-ink-50/60 truncate">
          {pillar.tagline}
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-ink-900/40 dark:text-ink-50/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors shrink-0" />
    </Link>
  )
}
