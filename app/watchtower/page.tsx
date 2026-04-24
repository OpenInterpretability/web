import { pillars } from '@/lib/pillars'
import { PillarLanding } from '@/components/pillar-landing'
import { site } from '@/lib/constants'
import { Shield, Mail, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Watchtower — OpenInterp · Enterprise',
  description:
    'Feature-level observability for LLMs in production. The SaaS tier that funds the OSS platform. Q4 2026.',
}

export default function WatchtowerPage() {
  const pillar = pillars.find((p) => p.id === 'watchtower')!
  return (
    <PillarLanding pillar={pillar}>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <Shield className="h-6 w-6 text-cyan-500 mb-3" />
          <h3 className="font-semibold">What it does</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            You pipe production LLM traffic through our SAEs. We emit per-token feature activations
            to your dashboard. Dangerous features trigger alerts. Everything logged immutably for
            SOC2 / EU AI Act / NIST AI RMF compliance.
          </p>
        </div>
        <div className="card p-6">
          <Zap className="h-6 w-6 text-emerald-500 mb-3" />
          <h3 className="font-semibold">Why it matters</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Deploying an LLM today is a black box. "We monitor outputs" is 2024 thinking. Watchtower
            is the first observability layer that reports <em>why</em> the model said what it said,
            at feature-level granularity, in real time.
          </p>
        </div>
        <div className="card p-6">
          <FileText className="h-6 w-6 text-brand-500 mb-3" />
          <h3 className="font-semibold">How we charge</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            <code className="font-mono text-brand-600 dark:text-brand-400">$2 / 1M tokens</code>{' '}
            monitored. Free tier (10M tokens/mo) for researchers. Enterprise tiers with SLAs, custom
            SAEs, on-prem deploy. Revenue funds the OSS platform indefinitely.
          </p>
        </div>
      </div>

      <div className="mt-10 card p-8 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5">
        <h2 className="text-2xl font-semibold tracking-tight">Request Watchtower early access</h2>
        <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
          We're taking 3 design partners for the Q4 2026 beta. Priority: safety teams at frontier
          labs, healthcare AI vendors, and AI-Act-regulated deployments. Tell us your model stack,
          your compliance target, and the one feature you'd most want monitored.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.contact}?subject=${encodeURIComponent('Watchtower design partner')}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Mail className="h-4 w-4" /> Apply as design partner
          </a>
          <Link
            href="/manifesto"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Read the full manifesto
          </Link>
        </div>
      </div>
    </PillarLanding>
  )
}
