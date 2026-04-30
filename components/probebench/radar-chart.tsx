/**
 * SVG-only 8-axis radar chart for ProbeScoreBreakdown.components.
 *
 * Pure SVG, no chart-library dependency. Renders inline with the page,
 * accessible by default (each polygon is labeled), CSS-themed.
 */
import type { ProbeScoreBreakdown } from '@/lib/probebench-types'

const AXES: {
  key: keyof ProbeScoreBreakdown['components']
  label: string
  shortLabel: string
}[] = [
  { key: 'auroc',                label: 'AUROC',              shortLabel: 'AUROC' },
  { key: 'auroc_evalaware',      label: 'Eval-aware AUROC',   shortLabel: 'Eval-aware' },
  { key: 'distshift_robustness', label: 'Distribution-shift', shortLabel: 'Dist-shift' },
  { key: 'ece_calibration',      label: 'Calibration (ECE)',  shortLabel: 'Calibration' },
  { key: 'cross_model_transfer', label: 'Cross-model',        shortLabel: 'Transfer' },
  { key: 'goodhart_resistance',  label: 'Goodhart-resistance', shortLabel: 'Goodhart' },
  { key: 'inference_efficiency', label: 'Inference latency',  shortLabel: 'Latency' },
  { key: 'license_score',        label: 'License openness',   shortLabel: 'License' },
]

interface RadarSeries {
  /** human-readable name */
  name: string
  /** ProbeScoreBreakdown to plot */
  score: ProbeScoreBreakdown
  /** stroke + fill color (Tailwind text class — we'll use stroke="currentColor") */
  colorClass: string
}

/**
 * Returns SVG path d-attribute for closed polygon connecting (cos θ, sin θ) * value.
 * Coordinate system: center at (0,0), radius 1.0 = max value.
 */
function polygonPath(values: number[]): string {
  const n = values.length
  const points = values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2 // start at top
    const x = Math.cos(angle) * v
    const y = Math.sin(angle) * v
    return `${x.toFixed(4)},${y.toFixed(4)}`
  })
  return `M ${points.join(' L ')} Z`
}

interface RadarChartProps {
  series: RadarSeries[]
  /** rendered SVG diameter in pixels */
  size?: number
  /** show numeric value labels at each axis tip */
  showValues?: boolean
}

export function ProbeRadar({ series, size = 360, showValues = false }: RadarChartProps) {
  const innerRadius = 0.95     // fraction of viewport for max value 1.0
  const tickValues = [0.25, 0.5, 0.75, 1.0]
  const labelRadius = 1.15

  return (
    <div className="relative inline-block">
      <svg
        viewBox="-1.4 -1.4 2.8 2.8"
        width={size}
        height={size}
        className="overflow-visible"
        role="img"
        aria-label={`Radar chart comparing ${series.map(s => s.name).join(', ')} across 8 ProbeScore axes`}
      >
        {/* Concentric ticks (background grid) */}
        {tickValues.map((tick) => (
          <polygon
            key={tick}
            points={AXES.map((_, i) => {
              const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
              return `${(Math.cos(angle) * tick * innerRadius).toFixed(4)},${(Math.sin(angle) * tick * innerRadius).toFixed(4)}`
            }).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={tick === 1.0 ? 0.012 : 0.005}
            className="text-ink-900 dark:text-ink-50"
          />
        ))}

        {/* Radial spokes */}
        {AXES.map((_, i) => {
          const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
          const x = Math.cos(angle) * innerRadius
          const y = Math.sin(angle) * innerRadius
          return (
            <line
              key={i}
              x1={0} y1={0}
              x2={x} y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={0.005}
              className="text-ink-900 dark:text-ink-50"
            />
          )
        })}

        {/* Series polygons (drawn back to front) */}
        {series.map((s, idx) => {
          const values = AXES.map(ax => s.score.components[ax.key].value * innerRadius)
          return (
            <g key={s.name} className={s.colorClass}>
              <path
                d={polygonPath(values)}
                fill="currentColor"
                fillOpacity={series.length > 1 ? 0.15 : 0.25}
                stroke="currentColor"
                strokeWidth={0.018}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Vertex points */}
              {values.map((v, i) => {
                const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
                const x = Math.cos(angle) * v
                const y = Math.sin(angle) * v
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={0.025}
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={0.008}
                    className="dark:[stroke:#0a0a0a]"
                  />
                )
              })}
            </g>
          )
        })}

        {/* Axis labels around the perimeter */}
        {AXES.map((ax, i) => {
          const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
          const x = Math.cos(angle) * labelRadius
          const y = Math.sin(angle) * labelRadius
          const anchor =
            Math.abs(x) < 0.05 ? 'middle' : x > 0 ? 'start' : 'end'
          return (
            <g key={ax.key}>
              <text
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={0.10}
                className="fill-ink-900/85 dark:fill-ink-50/85 font-semibold"
                style={{ fontFamily: 'inherit' }}
              >
                {ax.shortLabel}
              </text>
              {showValues && series.length === 1 && (
                <text
                  x={x}
                  y={y + 0.13}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize={0.07}
                  className="fill-ink-900/55 dark:fill-ink-50/55 font-mono"
                  style={{ fontFamily: 'monospace' }}
                >
                  {series[0].score.components[ax.key].value.toFixed(2)}
                </text>
              )}
            </g>
          )
        })}

        {/* Center dot */}
        <circle cx={0} cy={0} r={0.015} fill="currentColor" className="text-ink-900/30 dark:text-ink-50/30" />
      </svg>

      {/* Legend (only shown if multiple series) */}
      {series.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3 justify-center">
          {series.map((s) => (
            <div key={s.name} className="inline-flex items-center gap-1.5 text-xs">
              <span className={`h-2.5 w-2.5 rounded-sm ${s.colorClass}`} style={{ backgroundColor: 'currentColor' }} />
              <span className="font-medium">{s.name}</span>
              <span className="text-ink-900/50 dark:text-ink-50/50 tabular-nums">
                · {s.score.total.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Helper: assign distinct colors to series automatically */
export const RADAR_SERIES_COLORS = [
  'text-brand-500',
  'text-amber-500',
  'text-emerald-500',
  'text-fuchsia-500',
  'text-cyan-500',
  'text-rose-500',
  'text-violet-500',
] as const
