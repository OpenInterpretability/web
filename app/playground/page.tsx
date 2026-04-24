import Link from 'next/link'
import { ArrowRight, Info } from 'lucide-react'

export const metadata = { title: 'Playground' }

const sampleFeatures = [
  { id: 36405, label: 'Step-by-step arithmetic chains', score: 0.89, kind: 'helpful' },
  { id: 27873, label: 'Unit tracking and conversions', score: 0.74, kind: 'helpful' },
  { id: 6998, label: 'Re-checking / verification', score: 0.71, kind: 'helpful' },
  { id: 35842, label: 'Numeric decomposition', score: 0.68, kind: 'helpful' },
  { id: 14912, label: 'Premature conclusion', score: -0.52, kind: 'harmful' },
  { id: 18654, label: 'Topic drift', score: -0.48, kind: 'harmful' },
  { id: 23272, label: 'Hedging without grounding', score: -0.41, kind: 'harmful' },
]

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">
          Interactive
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Playground</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Paste a reasoning trace, pick a validated feature pack, see which SAE features fire
          per token and what mech-reward score the trace would earn.
        </p>
      </header>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="font-medium">Preview mode.</strong> The interactive backend will
          ship after Stage Gate 2 completes on Qwen3.6-35B-A3B. The feature IDs and labels
          below are real and pulled from{' '}
          <Link
            href="https://github.com/OpenInterpretability/mechreward/blob/main/catalogs/qwen3.5-4b/reasoning_pack.json"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-amber-700 dark:text-amber-300"
          >
            qwen3.5-4b/reasoning_pack.json
          </Link>
          . Labels are illustrative; auto-interp via Neuronpedia is pending (72h SLA).
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="card p-6">
          <label className="text-sm font-medium">Prompt</label>
          <textarea
            readOnly
            value={'Q: A store sells apples at $2 each. If you buy 7 apples, how much do you pay?\nA: Let\'s think step by step. The price per apple is $2. Seven apples cost 7 × $2 = $14. So the total is $14.\n#### 14'}
            className="mt-2 w-full h-48 rounded-lg border border-black/10 dark:border-white/10 bg-ink-50 dark:bg-ink-950 p-3 font-mono text-sm leading-relaxed"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <SelectStub label="Model" value="Qwen/Qwen3.5-4B" />
            <SelectStub label="Feature pack" value="qwen3.5-4b/reasoning_pack" />
            <SelectStub label="Layer" value="residual post-L18" />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600/60 px-4 py-2 text-sm font-medium text-white cursor-not-allowed"
            >
              Encode & score <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-ink-900/50 dark:text-ink-50/50 self-center">
              Backend online after G2.
            </span>
          </div>

          <div className="mt-8 border-t border-black/5 dark:border-white/10 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">R_mech per response</div>
              <div className="mono text-sm">
                <span className="gradient-text font-semibold">+1.62</span>
              </div>
            </div>
            <div className="h-3 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-accent-500"
                style={{ width: '72%' }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-900/50 dark:text-ink-50/50 mono">
              <span>-2.0</span>
              <span>0</span>
              <span>+2.0</span>
            </div>
          </div>
        </div>

        <aside className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Top feature activations</h3>
            <span className="mono text-xs text-ink-900/50 dark:text-ink-50/50">
              response tokens · mean-pooled
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {sampleFeatures.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="mono text-xs text-ink-900/50 dark:text-ink-50/50">
                      F{f.id}
                    </span>
                    <span
                      className={`chip ring-inset ${
                        f.kind === 'helpful'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20'
                          : 'bg-red-500/10 text-red-700 dark:text-red-300 ring-red-500/20'
                      }`}
                    >
                      {f.kind}
                    </span>
                  </div>
                  <div className="text-xs text-ink-900/70 dark:text-ink-50/70 mt-0.5 truncate">
                    {f.label}
                  </div>
                </div>
                <div
                  className={`mono text-sm font-semibold ${
                    f.score > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {f.score > 0 ? '+' : ''}
                  {f.score.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-ink-900/50 dark:text-ink-50/50">
            R_mech = Σ helpful − Σ harmful, mean-pooled over response tokens at the SAE layer.
          </div>
        </aside>
      </section>
    </div>
  )
}

function SelectStub({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 mono">
        {label}
      </div>
      <div className="mono text-sm">{value}</div>
    </div>
  )
}
