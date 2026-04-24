import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { CircuitCanvas } from '@/components/circuit-canvas'
import { demoCircuit } from '@/lib/circuit-data'

export const metadata = {
  title: 'Circuit Canvas — OpenInterp Observatory',
  description:
    'Figma-style attribution graphs for SAE features. Click a token, trace the circuit. AtP* (Kramár 2024) + Sparse Feature Circuits (Marks 2024) pipeline.',
}

export default function CircuitsPage() {
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
          Circuit Canvas
        </h1>
        <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Figma-style attribution graphs for SAE features. Nodes = features. Edges = feature-to-feature attribution, scored by AtP* (Kramár et al. 2024). Click any node to drill in. Export the circuit as JSON, share the URL, cite the method.
        </p>
      </div>

      <CircuitCanvas data={demoCircuit} />

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">What you&apos;re seeing</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            A precomputed attribution graph on a Qwen3.6-27B clinical-triage prompt. Upstream = L11 residual features, downstream = L31. Triangle nodes are SAE reconstruction-error terms (Marks et al. 2024). Edge thickness = |attribution|; orange = positive, cyan = negative.
          </p>
        </article>
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">How to build your own</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Run <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">14_attribution_patching.ipynb</code> for node scores or <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">15_sparse_feature_circuits.ipynb</code> for full node+edge DAGs. Both emit <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">circuit.json</code> in the schema this viewer consumes.
          </p>
        </article>
        <article className="card p-6">
          <h3 className="font-semibold tracking-tight">Cite</h3>
          <ul className="mt-2 space-y-2 text-xs text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            <li>
              <a
                href="https://arxiv.org/abs/2403.00745"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Kramár et al. 2024 (AtP*) <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a
                href="https://arxiv.org/abs/2403.19647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Marks et al. 2024 (Sparse Feature Circuits) <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a
                href="https://arxiv.org/abs/2310.10348"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Syed et al. 2024 (AtP &gt; ACDC) <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </article>
      </div>

      <div className="mt-10 card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              Notebooks that emit this schema
            </h2>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
              Four ways to compute attribution graphs, fastest → slowest. All output the same{' '}
              <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">circuit.json</code> format this viewer renders.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            {
              id: 14,
              name: 'Attribution Patching',
              blurb: 'AtP* with QK fix + GradDrop (Kramár 2024). Node attribution only. Fastest — 2-3 forwards + 1 backward per prompt.',
              speed: '~15 min · T4',
            },
            {
              id: 15,
              name: 'Sparse Feature Circuits',
              blurb: 'Marks et al. 2024 replication. Node + edge attribution via AtP + IG-10 early-layer fallback. Emits full DAG.',
              speed: '~20 min · A100',
            },
            {
              id: 16,
              name: 'ACDC (slow-mode)',
              blurb: 'AutoCircuit library. Original NeurIPS 2023 algorithm. Independent verification. Slower than AtP but peer-reviewed.',
              speed: '~1-2 h · T4',
            },
            {
              id: 17,
              name: 'Crosscoder training',
              blurb: 'Lindsey et al. 2024. Train a shared-dictionary SAE across L11/L31/L55. Ties multi-layer features into one feature index.',
              speed: '~30 min-4h',
            },
          ].map((nb) => (
            <Link
              key={nb.id}
              href={`https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/${nb.id}_${nb.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, '')}.ipynb`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                <span className="font-mono text-[10px] text-ink-900/50 dark:text-ink-50/50">{nb.id}</span>
                <span className="font-semibold text-sm">{nb.name}</span>
              </div>
              <p className="text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                {nb.blurb}
              </p>
              <div className="mt-2 font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40">{nb.speed}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
