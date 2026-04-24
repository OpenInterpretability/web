import { pillars } from '@/lib/pillars'
import { PillarLanding } from '@/components/pillar-landing'
import { saes } from '@/lib/constants'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Observatory — OpenInterp',
  description:
    'See the model thinking, feature by feature, token by token. Trace Theater, Circuit Canvas, Atlas, Compare.',
}

export default function ObservatoryPage() {
  const pillar = pillars.find((p) => p.id === 'observatory')!
  return (
    <PillarLanding pillar={pillar}>
      <div className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Backing SAEs</h2>
        <p className="text-sm text-ink-900/60 dark:text-ink-50/60 mb-6">
          Every trace, circuit, and atlas entry is grounded in a publicly-trained sparse autoencoder.
          All artifacts on HuggingFace, all training recipes reproducible.
        </p>
        <div className="grid gap-3">
          {saes.map((s) => (
            <div
              key={s.model}
              className="card p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="font-mono text-sm font-medium">{s.model}</div>
                <div className="mt-0.5 text-xs text-ink-900/60 dark:text-ink-50/60">
                  {s.architecture} · d_sae {s.dSae.toLocaleString()} · var_exp {s.varExp.toFixed(3)}
                </div>
              </div>
              <Link
                href={`https://huggingface.co/${s.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
              >
                HF <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PillarLanding>
  )
}
