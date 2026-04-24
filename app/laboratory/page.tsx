import { pillars } from '@/lib/pillars'
import { PillarLanding } from '@/components/pillar-landing'
import { site } from '@/lib/constants'
import { Mail, Github } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Laboratory — OpenInterp',
  description:
    'Edit the model. Compose interventions. Export steered checkpoints. The Lab ships Q2 2026.',
}

export default function LaboratoryPage() {
  const pillar = pillars.find((p) => p.id === 'laboratory')!
  return (
    <PillarLanding pillar={pillar}>
      <div className="mt-16 card p-8 bg-gradient-to-br from-pink-500/5 to-orange-500/5">
        <h2 className="text-2xl font-semibold tracking-tight">Be an early Lab partner</h2>
        <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-xl leading-relaxed">
          Labs, safety teams, and individual researchers using SAE interventions in their workflow
          get priority access to Sandbox beta, free credits, and direct influence on the Recipe
          Store schema. We want your hardest use case.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.contact}?subject=${encodeURIComponent('Lab early access')}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Mail className="h-4 w-4" /> Email {site.contact}
          </a>
          <Link
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Github className="h-4 w-4" /> Follow development
          </Link>
        </div>
      </div>
    </PillarLanding>
  )
}
