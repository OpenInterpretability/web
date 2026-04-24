import Link from 'next/link'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import type { Pillar, PillarStatus } from '@/lib/pillars'
import { site } from '@/lib/constants'

const statusLabel: Record<PillarStatus, string> = {
  live: 'LIVE · Q1 2026',
  q2: 'Q2 2026',
  q3: 'Q3 2026',
  q4: 'Q4 2026',
}

export interface ComingSoonProps {
  pillar: Pillar
  title: string
  blurb: string
  status: PillarStatus
  /** Sections of design-preview content */
  sections: { heading: string; body: string }[]
  /** "What it looks like today" alternative */
  todayLink?: { label: string; href: string }
}

export function ComingSoon({ pillar, title, blurb, status, sections, todayLink }: ComingSoonProps) {
  const Icon = pillar.icon
  const emailSubject = encodeURIComponent(`OpenInterp · early access · ${title}`)
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <Link
        href={pillar.slug}
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {pillar.name}
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 text-brand-600 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </div>
        <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
          {statusLabel[status]}
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
        {blurb}
      </p>

      <div className="mt-10 grid gap-5">
        {sections.map((s, i) => (
          <article key={i} className="card p-6">
            <h3 className="font-semibold tracking-tight">{s.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
              {s.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <h3 className="text-xl font-semibold tracking-tight">Request early access</h3>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-xl">
          We prioritize researchers, educators, and safety teams who will use it publicly. Tell us
          what you want to build; we'll reach out when the beta opens.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.contact}?subject=${emailSubject}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Mail className="h-4 w-4" /> Email {site.contact}
          </a>
          {todayLink && (
            <Link
              href={todayLink.href}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {todayLink.label} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
