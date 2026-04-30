/**
 * /probebench/dimensions
 *
 * Visual comparison of all registered probes across the 8 ProbeScore axes.
 * One radar chart per probe + one combined overlay chart at the top.
 */
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { probes, evaluations, models } from '@/lib/probebench-data'
import { computeProbeScore, PROBESCORE_WEIGHTS, scoreColor } from '@/lib/probebench-scoring'
import { ProbeRadar, RADAR_SERIES_COLORS } from '@/components/probebench/radar-chart'
import { ScoreGauge } from '@/components/probebench/score-bar'

export const metadata = {
  title: 'Probe dimensions — ProbeBench',
  description:
    'Visual comparison of all registered probes across 8 ProbeScore axes. v0.0.2 added Goodhart-resistance — see which probes survive the optimization-escape failure mode.',
}

interface ScoredProbe {
  probe: typeof probes[number]
  score: ReturnType<typeof computeProbeScore>
}

export default function DimensionsPage() {
  // Compute scores for all probes (default cross-model 0.5 for v0.0.2)
  const scored: ScoredProbe[] = probes.map(probe => {
    const probeEvals = evaluations.filter(e => e.probeId === probe.id)
    return { probe, score: computeProbeScore(probe, probeEvals, 0.5) }
  })

  // Sort by total score, descending
  scored.sort((a, b) => b.score.total - a.score.total)

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/probebench"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to leaderboard
      </Link>

      <div className="max-w-3xl">
        <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
          ProbeBench v0.0.2 · 8-axis radar
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          What shape does each probe make?
        </h1>
        <p className="mt-5 text-base sm:text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Each probe occupies a distinct shape in the 8-axis ProbeScore space.
          A round, large polygon = balanced excellence. Spiky = single-axis
          optimization. Small triangle = limited domain. Look for which axis
          each probe sacrifices.
        </p>
        <p className="mt-3 text-sm text-ink-900/55 dark:text-ink-50/55 leading-relaxed">
          v0.0.2 introduced <span className="font-mono">goodhart_resistance</span>{' '}
          (lower-right axis): does the probe survive being used as DPO/GRPO training
          reward, or does it Goodhart-fail? FabricationGuard and ReasonGuard score
          low here based on our nb41 v2 finding — we register the truth.
        </p>
      </div>

      {/* ============================================================ Combined overlay */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">All probes overlaid</h2>
        <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 max-w-3xl">
          All registered probes stacked on the same axes. Reveals the structural
          gap on Goodhart-resistance for our probes (lower-right) — that axis is
          where the field needs more validation work.
        </p>
        <div className="mt-8 card p-6 sm:p-10 flex justify-center">
          <ProbeRadar
            series={scored.slice(0, 5).map((s, i) => ({
              name: s.probe.shortName,
              score: s.score,
              colorClass: RADAR_SERIES_COLORS[i % RADAR_SERIES_COLORS.length],
            }))}
            size={520}
          />
        </div>
      </section>

      {/* ============================================================ Per-probe grid */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Per-probe shape</h2>
        <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 max-w-3xl">
          Each probe rendered alone with its 8-axis values labeled. Scroll for
          full inventory.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scored.map((s, idx) => {
            const model = models.find(m => m.id === s.probe.modelId)
            const c = scoreColor(s.score.total)
            const colorClass = RADAR_SERIES_COLORS[idx % RADAR_SERIES_COLORS.length]

            return (
              <Link
                key={s.probe.id}
                href={`/probebench/probe/${encodeURIComponent(s.probe.id)}`}
                className="card p-5 group hover:scale-[1.005] transition-transform"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold tracking-tight">{s.probe.shortName}</h3>
                    <div className="text-xs text-ink-900/55 dark:text-ink-50/55 font-mono mt-0.5">
                      {model?.shortName ?? s.probe.modelId} · L{s.probe.layer}
                    </div>
                  </div>
                  <ScoreGauge score={s.score.total} size="sm" />
                </div>

                <div className={`flex justify-center my-2 ${colorClass}`}>
                  <ProbeRadar
                    series={[
                      { name: s.probe.shortName, score: s.score, colorClass },
                    ]}
                    size={260}
                  />
                </div>

                <div className="text-xs text-ink-900/55 dark:text-ink-50/55 leading-relaxed">
                  <span className={`chip ${c.bg} ${c.text} ${c.ring} ring-inset mr-2`}>
                    {s.probe.category}
                  </span>
                  rank #{idx + 1}
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300 group-hover:gap-2 transition-all">
                  See breakdown <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============================================================ Axis legend */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">What each axis measures</h2>
        <div className="mt-6 card p-6 sm:p-8">
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold">AUROC ({(PROBESCORE_WEIGHTS.auroc * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                Headline detection accuracy averaged across registered tasks.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Eval-aware AUROC ({(PROBESCORE_WEIGHTS.auroc_evalaware * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                Confound-corrected AUROC (model knows it's being tested).
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Distribution-shift ({(PROBESCORE_WEIGHTS.distshift_robustness * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                AUROC under long-context / OOD shift. Tests fragility.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Calibration ({(PROBESCORE_WEIGHTS.ece_calibration * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                Expected calibration error. Lower ECE = better-calibrated probability outputs.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Cross-model transfer ({(PROBESCORE_WEIGHTS.cross_model_transfer * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                Pearson_CE — does the probe survive being applied to a different model?
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">
                Goodhart-resistance ({(PROBESCORE_WEIGHTS.goodhart_resistance * 100).toFixed(0)}%)
                <span className="ml-2 chip bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 ring-fuchsia-500/30 ring-inset text-[10px]">NEW v0.0.2</span>
              </dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                When this probe is used as DPO/GRPO training reward, does the model still shift on the probe&apos;s axis post-training, or does optimization escape via orthogonal directions? Score = post-train_AUROC / pre-train_AUROC.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Inference latency ({(PROBESCORE_WEIGHTS.inference_efficiency * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                1ms = 1.0; 100ms = 0.5; 10s+ = 0. Production-readiness signal.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">License ({(PROBESCORE_WEIGHTS.license_score * 100).toFixed(0)}%)</dt>
              <dd className="text-xs text-ink-900/65 dark:text-ink-50/65 mt-1 leading-relaxed">
                Apache-2.0 = 1.0; closed = 0.2. Capped to prevent license-only inflation.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}
