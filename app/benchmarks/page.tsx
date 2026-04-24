import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { benchmarks } from '@/lib/constants'

export const metadata = { title: 'Benchmarks' }

export default function BenchmarksPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">
          Head-to-head
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Every number below has a reproducible notebook, a public adapter, and an eval config.
          No headline results without public artifacts.
        </p>
      </header>

      <section className="mt-10 card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="font-semibold">{benchmarks.qwen35_g3.title}</h3>
            <p className="text-xs text-ink-900/60 dark:text-ink-50/60 mono mt-1">
              per-token mech-reward · LoRA r=32 · LR=3e-6 · λ=0.1
            </p>
          </div>
          <Link
            href="https://huggingface.co/caiovicentino1/Qwen3.5-4B-mechreward-G3-phaseA-step400"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
          >
            Download adapter <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          <BigNumber label="GSM8K baseline" value={`${benchmarks.qwen35_g3.baseline}%`} />
          <BigNumber label="R1 trained" value={`${benchmarks.qwen35_g3.r1}%`} accent />
          <BigNumber label="Δ lift" value={`+${benchmarks.qwen35_g3.deltaPp} pp`} />
          <BigNumber label="Effective steps" value={String(benchmarks.qwen35_g3.stepsEffective)} />
          <BigNumber label="MMLU Δ" value={`+${benchmarks.qwen35_g3.mmluDelta} pp`} />
          <BigNumber
            label="Hack rate Δ"
            value={`+${benchmarks.qwen35_g3.hackRateTrained - benchmarks.qwen35_g3.hackRateBase} pp`}
            subtitle="within 95% CI"
          />
        </div>

        <p className="mt-6 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          {benchmarks.qwen35_g3.notes}
        </p>
      </section>

      <section className="mt-6 card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="font-semibold">{benchmarks.qwen36_g1.title}</h3>
            <p className="text-xs text-ink-900/60 dark:text-ink-50/60 mono mt-1">
              passive correlation test · n=100 held-out · disjoint from probe set
            </p>
          </div>
          <Link
            href="https://github.com/OpenInterpretability/mechreward/blob/main/figures/s4/s4_g1_summary.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
          >
            s4_g1_summary.json <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <BigNumber label="Spearman ρ" value={benchmarks.qwen36_g1.rho.toFixed(3)} accent />
          <BigNumber label="Pearson r" value={benchmarks.qwen36_g1.pearson.toFixed(3)} />
          <BigNumber label="p-value" value={'2.62e-08'} />
          <BigNumber label="Held-out N" value={String(benchmarks.qwen36_g1.nHeldOut)} />
        </div>

        <p className="mt-6 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          {benchmarks.qwen36_g1.notes}
        </p>
      </section>

      <section className="mt-6 card p-6">
        <h3 className="font-semibold">Prior work comparison</h3>
        <p className="text-xs text-ink-900/60 dark:text-ink-50/60 mt-1 mono">
          GSM8K lift across published SAE-based RL methods
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                <th className="py-2">Method</th>
                <th className="py-2">Model</th>
                <th className="py-2">Approach</th>
                <th className="py-2 text-right">GSM8K Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              <tr>
                <td className="py-3 font-medium">CRL (Cho et al. 2026)</td>
                <td className="py-3">Gemma-2-2B</td>
                <td className="py-3 text-ink-900/70 dark:text-ink-50/70">
                  PPO with SAE features as action space
                </td>
                <td className="py-3 text-right mono">+1.03 pp</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">mechreward (ours, G3 Phase A)</td>
                <td className="py-3">Qwen3.5-4B</td>
                <td className="py-3 text-ink-900/70 dark:text-ink-50/70">
                  GRPO with per-token SAE-sparse reward
                </td>
                <td className="py-3 text-right mono gradient-text font-semibold">
                  +19 pp
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-900/60 dark:text-ink-50/60">
          19× larger gain than CRL. Method difference (dense reward vs sparse action selection),
          model difference (Qwen3.5 is stronger math base than Gemma-2), and training scale all
          contribute. Methods are complementary, not competing.
        </p>
      </section>
    </div>
  )
}

function BigNumber({
  label,
  value,
  subtitle,
  accent = false,
}: {
  label: string
  value: string
  subtitle?: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 mono">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${accent ? 'gradient-text' : ''}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-ink-900/50 dark:text-ink-50/50 mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}
