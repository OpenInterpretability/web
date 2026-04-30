/**
 * ProbeScore visualization — radial gauge + component breakdown bar.
 * Used on leaderboard rows + probe DNA pages.
 */
import { scoreColor } from '@/lib/probebench-scoring'
import type { ProbeScoreBreakdown } from '@/lib/probebench-types'

const COMPONENT_LABELS: Record<keyof ProbeScoreBreakdown['components'], string> = {
  auroc: 'AUROC',
  auroc_evalaware: 'Eval-aware',
  distshift_robustness: 'Dist-shift',
  ece_calibration: 'Calibration',
  cross_model_transfer: 'Transfer',
  goodhart_resistance: 'Goodhart-resistance',
  inference_efficiency: 'Latency',
  license_score: 'License',
}

const COMPONENT_COLORS: Record<keyof ProbeScoreBreakdown['components'], string> = {
  auroc:                'bg-brand-500',
  auroc_evalaware:      'bg-accent-500',
  distshift_robustness: 'bg-violet-500',
  ece_calibration:      'bg-emerald-500',
  cross_model_transfer: 'bg-amber-500',
  goodhart_resistance:  'bg-fuchsia-500',
  inference_efficiency: 'bg-rose-500',
  license_score:        'bg-slate-500',
}

export function ScoreGauge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const c = scoreColor(score)
  const sizes = {
    sm: { ring: 'h-12 w-12 ring-2', text: 'text-sm font-semibold' },
    md: { ring: 'h-16 w-16 ring-2', text: 'text-base font-semibold' },
    lg: { ring: 'h-20 w-20 ring-2', text: 'text-lg font-bold' },
  }[size]
  return (
    <div className={`inline-flex items-center justify-center rounded-full ${c.bg} ${c.ring} ring-inset ${sizes.ring}`}>
      <span className={`${sizes.text} ${c.text} tabular-nums`}>{score.toFixed(3)}</span>
    </div>
  )
}

export function ScoreBreakdownBar({ score }: { score: ProbeScoreBreakdown }) {
  const total = score.total
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
          ProbeScore breakdown
        </span>
        <span className="text-sm font-semibold tabular-nums">{total.toFixed(3)}</span>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        {(Object.keys(score.components) as Array<keyof ProbeScoreBreakdown['components']>).map((key) => {
          const c = score.components[key]
          const widthPct = (c.contribution / Math.max(total, 0.001)) * 100
          return (
            <div
              key={key}
              className={`h-full ${COMPONENT_COLORS[key]}`}
              style={{ width: `${widthPct}%` }}
              title={`${COMPONENT_LABELS[key]}: ${c.contribution.toFixed(3)} (value ${c.value.toFixed(2)} × weight ${c.weight})`}
            />
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {(Object.keys(score.components) as Array<keyof ProbeScoreBreakdown['components']>).map((key) => {
          const c = score.components[key]
          return (
            <div key={key} className="flex items-center gap-1.5 text-[11px]">
              <span className={`h-2 w-2 rounded-sm ${COMPONENT_COLORS[key]}`} />
              <span className="text-ink-900/60 dark:text-ink-50/60">{COMPONENT_LABELS[key]}</span>
              <span className="ml-auto tabular-nums text-ink-900/80 dark:text-ink-50/80">
                {c.contribution.toFixed(3)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ComponentChip({
  label, value, weight,
}: { label: string; value: number; weight: number }) {
  const contribution = value * weight
  const c = scoreColor(value)
  return (
    <div className={`rounded-xl border border-black/5 dark:border-white/10 ${c.bg} px-3 py-2.5`}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${c.text}`}>
        {value.toFixed(3)}
      </div>
      <div className="text-[10px] text-ink-900/50 dark:text-ink-50/50 tabular-nums">
        × {weight.toFixed(2)} = {contribution.toFixed(3)}
      </div>
    </div>
  )
}
