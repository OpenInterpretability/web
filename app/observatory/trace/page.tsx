import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { TraceTheater } from '@/components/trace-theater'
import { traceData } from '@/lib/trace-data'

export const metadata = {
  title: 'Trace Theater — OpenInterp Observatory',
  description:
    'Watch Qwen3.6-27B reason through a clinical triage prompt. Tokens emerge. Features fire. Intervention slider shows live counterfactuals. The flagship Observatory experience.',
}

export default function TracePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/observatory"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Observatory
      </Link>

      <div className="mb-10 max-w-3xl">
        <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30 ring-inset">
          LIVE · Observatory · Q1 2026
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
          Trace Theater
        </h1>
        <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Watch Qwen3.6-27B reason through a clinical triage prompt. Tokens emerge. Features fire.
          Click any feature, adjust its strength, see the counterfactual. No feature page is static
          here — this is the story of the model's thought.
        </p>
      </div>

      <TraceTheater />

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">What you're seeing</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            A pre-computed demo on a 23-token clinical-triage generation from Qwen3.6-27B. The
            heatmap is real per-token activations extracted from the{' '}
            <a
              href={`https://huggingface.co/${traceData.sae_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-0.5"
            >
              {traceData.sae_repo}
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            SAE at {traceData.layer}. The 10 features shown are the highest-AUROC interpretable
            features discovered in that run.
          </p>
        </article>
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">Why scripted, not live</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Live Qwen3.6-27B forward passes require GPU-grade hardware per request — incompatible
            with a zero-login public site. Trace Theater v1 ships precomputed demos across 50+
            prompts. Q2 2026 adds on-demand trace generation via the API using your own compute.
          </p>
        </article>
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">What ships next</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Circuit Canvas (click a token, see the attribution graph backward to input).
            Comparison Mode (run the same prompt on two models, diff features). Atlas search
            (find "overconfidence" across model families). All Q2 2026.
          </p>
        </article>
      </div>

      <div className="mt-14 card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Build your own trace on your own SAE.
        </h2>
        <p className="mt-3 text-base text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
          The Python SDK will ship a one-liner: point it at any HuggingFace SAE + a prompt, get
          back a shareable Trace URL. Q2 2026.
        </p>
        <div className="mt-5 font-mono text-sm card px-5 py-3.5 inline-flex items-center gap-3 bg-black/[0.03] dark:bg-white/[0.03]">
          <span className="text-brand-500">$</span>
          <code className="text-ink-900 dark:text-ink-50">pip install openinterp</code>
          <span className="chip bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30 ring-inset">
            coming Q2
          </span>
        </div>
      </div>
    </div>
  )
}
