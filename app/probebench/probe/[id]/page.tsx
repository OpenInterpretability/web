/**
 * ProbeBench v0.0.1 — Probe DNA dynamic detail page.
 *
 * Comprehensive per-probe page (think HuggingFace model card, but for activation
 * probes). Server component, fully static. Every value is sourced from
 * lib/probebench-data.ts — no fabricated numbers in this file.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  FileCode,
  ShieldCheck,
  GitBranch,
  Award,
  BookOpen,
} from 'lucide-react'
import {
  probes,
  evaluations,
  crossModelTransfers,
  probeBy,
  taskBy,
  modelBy,
  evalsFor,
  meanPearsonCEFor,
  rankedProbes,
} from '@/lib/probebench-data'
import {
  computeProbeScore,
  scoreColor,
  fmtAuroc,
  PROBESCORE_WEIGHTS,
} from '@/lib/probebench-scoring'
import {
  ScoreGauge,
  ScoreBreakdownBar,
  ComponentChip,
} from '@/components/probebench/score-bar'
import { ProbeRadar } from '@/components/probebench/radar-chart'
import { CopyButton } from '@/components/copy-button'

// -----------------------------------------------------------------------------
// Static params + metadata
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  return probes.map((p) => ({ id: encodeURIComponent(p.id) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const probe = probeBy(decodeURIComponent(id))
  if (!probe) {
    return {
      title: 'Probe not found — ProbeBench',
      description: 'No probe with this ID is registered in ProbeBench v0.0.1.',
    }
  }
  return {
    title: `${probe.name} — ProbeBench`,
    description: probe.tagline,
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const CATEGORY_LABEL: Record<string, string> = {
  hallucination: 'Hallucination',
  reasoning: 'Reasoning',
  deception: 'Deception',
  sandbagging: 'Sandbagging',
  eval_awareness: 'Eval Awareness',
  reward_hacking: 'Reward Hacking',
  manipulation: 'Manipulation',
  refusal: 'Refusal',
}

function truncateHash(hash: string): string {
  if (!hash || hash.length <= 24) return hash
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`
}

function statusChipClasses(status: 'live' | 'pending_review' | 'deprecated') {
  switch (status) {
    case 'live':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30'
    case 'pending_review':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
    case 'deprecated':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
  }
}

function statusLabel(status: 'live' | 'pending_review' | 'deprecated') {
  if (status === 'pending_review') return 'pending review'
  return status
}

function paperUrl(paper?: string): string | undefined {
  if (!paper) return undefined
  if (paper.startsWith('http')) return paper
  if (paper.startsWith('arXiv:')) {
    const id = paper.slice(6).trim()
    if (/X+/.test(id)) return undefined // placeholder ID
    return `https://arxiv.org/abs/${id}`
  }
  return paper
}

function transferRowTone(pearsonCE: number) {
  if (pearsonCE >= 0.7) {
    return 'bg-emerald-500/[0.06]'
  }
  if (pearsonCE >= 0.4) {
    return 'bg-amber-500/[0.05]'
  }
  return 'bg-rose-500/[0.04]'
}

function transferPillTone(pearsonCE: number) {
  if (pearsonCE >= 0.7)
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30'
  if (pearsonCE >= 0.4)
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
  return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
}

function notebookCloneUrl(notebookUrl: string): string {
  // Convert https://github.com/{org}/{repo}/blob/{branch}/... → https://github.com/{org}/{repo}.git
  const m = notebookUrl.match(/^(https:\/\/github\.com\/[^\/]+\/[^\/]+)/)
  return m ? `${m[1]}.git` : notebookUrl
}

function huggingFaceLabel(url: string): string {
  // Trim https://huggingface.co/ prefix for display
  return url.replace(/^https:\/\/huggingface\.co\//, 'huggingface.co/')
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const probe = probeBy(decodeURIComponent(id))
  if (!probe) {
    notFound()
  }

  const evals = evalsFor(probe.id)
  const meanCE = meanPearsonCEFor(probe.id)
  const score = computeProbeScore(probe, evals, meanCE)

  // Fill in real ranks via the global aggregator (rankedProbes pre-computes them).
  const ranked = rankedProbes()
  const myRanked = ranked.find((r) => r.probe.id === probe.id)
  if (myRanked) {
    score.rank = myRanked.score.rank
    score.globalRank = myRanked.score.globalRank
  }

  const transfers = crossModelTransfers.filter((t) => t.probeId === probe.id)
  const model = modelBy(probe.modelId)

  const categoryLabel = CATEGORY_LABEL[probe.category] ?? probe.category

  // Honest-scope numbers (signed deltas)
  const trainedTaskNames = evals
    .map((e) => taskBy(e.taskId)?.name ?? e.taskId)
    .filter((n, i, arr) => arr.indexOf(n) === i)

  const evalAwareDeltas = evals
    .map((e) =>
      e.metrics.auroc_evalaware_corrected != null
        ? e.metrics.auroc - e.metrics.auroc_evalaware_corrected
        : null,
    )
    .filter((v): v is number => v != null)
  const meanEvalAwareDrop =
    evalAwareDeltas.length > 0
      ? evalAwareDeltas.reduce((a, b) => a + b, 0) / evalAwareDeltas.length
      : null

  const distshiftDeltas = evals
    .map((e) =>
      e.metrics.auroc_distshift != null
        ? e.metrics.auroc - e.metrics.auroc_distshift
        : null,
    )
    .filter((v): v is number => v != null)
  const meanDistshiftDrop =
    distshiftDeltas.length > 0
      ? distshiftDeltas.reduce((a, b) => a + b, 0) / distshiftDeltas.length
      : null

  // Code snippets
  const sdkSnippet = `from openinterp import probebench
probe = probebench.load("${probe.id}")
score = probe.score(activations)  # → P(positive_class)`

  const reproduceSnippet = `git clone ${notebookCloneUrl(probe.reproducerNotebook)}
pip install openinterp
openinterp probebench reproduce ${probe.id}`

  const verifyHint = `openinterp probebench verify ${probe.id}`

  const heroScoreColor = scoreColor(score.total)

  return (
    <div className="relative">
      {/* ============================================================ BREADCRUMB */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <Link
          href="/probebench"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to ProbeBench
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50 flex items-center gap-1.5 flex-wrap"
        >
          <Link href="/probebench" className="hover:text-ink-900 dark:hover:text-ink-50">
            ProbeBench
          </Link>
          <span aria-hidden="true">→</span>
          <Link
            href={`/probebench?category=${probe.category}`}
            className="hover:text-ink-900 dark:hover:text-ink-50"
          >
            {categoryLabel}
          </Link>
          <span aria-hidden="true">→</span>
          <span className="text-ink-900/80 dark:text-ink-50/80 font-medium">
            {probe.name}
          </span>
        </nav>
      </section>

      {/* ============================================================ HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — identity + description */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`chip ring-inset ${statusChipClasses(probe.status)}`}
              >
                {probe.status === 'live' ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                ) : null}
                {statusLabel(probe.status)}
              </span>
              <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30">
                {probe.probeType.replace('_', ' ')}
              </span>
              <span className="chip bg-black/5 dark:bg-white/10 text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10">
                {categoryLabel}
              </span>
              <span className="chip bg-black/5 dark:bg-white/10 text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 font-mono">
                {probe.license}
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900 dark:text-white">
                {probe.name}
              </h1>
              <p className="mt-2 text-base text-ink-900/70 dark:text-ink-50/70">
                {probe.tagline}
              </p>
            </div>

            <p className="text-sm text-ink-900/80 dark:text-ink-50/80 leading-relaxed max-w-3xl">
              {probe.description}
            </p>

            <div className="text-xs text-ink-900/60 dark:text-ink-50/60 flex items-center gap-2 flex-wrap">
              <span>by</span>
              {probe.authorUrl ? (
                <a
                  href={probe.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-900/90 dark:text-ink-50/90 hover:underline inline-flex items-center gap-1"
                >
                  {probe.author}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ) : (
                <span className="font-medium text-ink-900/90 dark:text-ink-50/90">
                  {probe.author}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>{probe.org}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{probe.release}</span>
              {paperUrl(probe.paper) ? (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={paperUrl(probe.paper)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-ink-900 dark:hover:text-ink-50"
                  >
                    <BookOpen className="h-3 w-3" />
                    {probe.paper}
                  </a>
                </>
              ) : null}
            </div>
          </div>

          {/* RIGHT — score gauge */}
          <div className="lg:col-span-1">
            <div className="card p-6 flex flex-col items-center">
              <div className="text-[11px] uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                ProbeScore
              </div>
              <div className="mt-3">
                <ScoreGauge score={score.total} size="lg" />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`chip ring-inset ${heroScoreColor.bg} ${heroScoreColor.ring} ${heroScoreColor.text}`}
                >
                  <Award className="h-3 w-3" />
                  {categoryLabel} #{score.rank}
                </span>
                <span className="chip bg-black/5 dark:bg-white/10 text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10">
                  Global #{score.globalRank}
                </span>
              </div>
              <div className="mt-3 text-[11px] text-ink-900/50 dark:text-ink-50/50 text-center max-w-[18rem]">
                7 weighted axes. Subject to revision as more reproducers land.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ QUICKSTART */}
      <section className="mx-auto max-w-6xl px-6 py-10 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">Quickstart</h2>
        <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-2xl">
          Three lines via the <span className="font-mono">openinterp.probebench</span>{' '}
          SDK. Returns the probe&apos;s P(positive_class) for a tensor of activations
          captured at the layer/position below.
        </p>

        <div className="mt-5 card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              python
            </span>
            <CopyButton text={sdkSnippet} />
          </div>
          <pre className="px-4 py-4 text-[13px] leading-6 font-mono text-ink-900/90 dark:text-ink-50/90 overflow-x-auto">
{sdkSnippet}
          </pre>
        </div>
      </section>

      {/* ============================================================ PROBESCORE BREAKDOWN */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              ProbeScore — 7 weighted axes
            </h2>
            <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-2xl">
              Composite metric in [0, 1]. No single axis can dominate; we think
              this discourages single-metric optimization. Numbers update as new
              evaluations land.
            </p>
          </div>
          <Link
            href="/interpscore"
            className="text-xs font-mono text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            scoring formula
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6 card p-6">
          <ScoreBreakdownBar score={score} />
        </div>

        {/* 8-axis radar chart (v0.0.2 visualization) */}
        <div className="mt-6 card p-6 sm:p-8">
          <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              ProbeScore — 8-axis breakdown
            </h3>
            <span className="text-xs font-mono text-ink-900/50 dark:text-ink-50/50">
              ProbeBench v0.0.2 · 8 axes weighted to sum 1.0
            </span>
          </div>
          <p className="text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed mb-4">
            Visual breakdown of where this probe scores high vs low across all 8 axes.
            Polygon area is proportional to total score; shape reveals which axes carry
            it (and which ones it sacrifices).
          </p>
          <div className="flex justify-center text-brand-500">
            <ProbeRadar
              series={[{ name: probe.shortName, score, colorClass: 'text-brand-500' }]}
              size={420}
              showValues={true}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ComponentChip
            label="AUROC"
            value={score.components.auroc.value}
            weight={PROBESCORE_WEIGHTS.auroc}
          />
          <ComponentChip
            label="Eval-aware"
            value={score.components.auroc_evalaware.value}
            weight={PROBESCORE_WEIGHTS.auroc_evalaware}
          />
          <ComponentChip
            label="Dist-shift"
            value={score.components.distshift_robustness.value}
            weight={PROBESCORE_WEIGHTS.distshift_robustness}
          />
          <ComponentChip
            label="Calibration"
            value={score.components.ece_calibration.value}
            weight={PROBESCORE_WEIGHTS.ece_calibration}
          />
          <ComponentChip
            label="Cross-model"
            value={score.components.cross_model_transfer.value}
            weight={PROBESCORE_WEIGHTS.cross_model_transfer}
          />
          <ComponentChip
            label="Goodhart-resistance"
            value={score.components.goodhart_resistance.value}
            weight={PROBESCORE_WEIGHTS.goodhart_resistance}
          />
          <ComponentChip
            label="Latency"
            value={score.components.inference_efficiency.value}
            weight={PROBESCORE_WEIGHTS.inference_efficiency}
          />
          <ComponentChip
            label="License"
            value={score.components.license_score.value}
            weight={PROBESCORE_WEIGHTS.license_score}
          />
        </div>
      </section>

      {/* ============================================================ PER-TASK EVAL TABLE */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">
          Per-task evaluation
        </h2>
        <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-3xl">
          Headline AUROC alongside the eval-awareness-corrected and
          distribution-shift versions for each task. Reproducers run from a
          single notebook on a single Colab session.
        </p>

        {evals.length === 0 ? (
          <div className="mt-8 card p-8 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
            No evaluations recorded yet for this probe. If you have one,{' '}
            <Link
              href="/probebench/submit"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              submit a reproducer
            </Link>
            .
          </div>
        ) : (
          <div className="mt-8 card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-[11px] uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                    <th className="px-4 py-3 text-left font-medium">Task</th>
                    <th className="px-4 py-3 text-right font-medium">n</th>
                    <th className="px-4 py-3 text-left font-medium">
                      AUROC [95% CI]
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Eval-aware corrected
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Dist-shift
                    </th>
                    <th className="px-4 py-3 text-right font-medium">ECE</th>
                    <th className="px-4 py-3 text-right font-medium">
                      FPR@99TPR
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Latency
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Reproducer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evals.map((e) => {
                    const task = taskBy(e.taskId)
                    return (
                      <tr
                        key={`${e.probeId}-${e.taskId}`}
                        className="border-b border-black/5 dark:border-white/5 last:border-0"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink-900 dark:text-ink-50">
                            {task?.name ?? e.taskId}
                          </div>
                          {task ? (
                            <div className="text-[11px] text-ink-900/50 dark:text-ink-50/50">
                              {CATEGORY_LABEL[task.category] ?? task.category} ·{' '}
                              {task.positiveLabel}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-right text-ink-900/70 dark:text-ink-50/70">
                          {e.metrics.n_test}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums">
                          {fmtAuroc(
                            e.metrics.auroc,
                            e.metrics.auroc_lo,
                            e.metrics.auroc_hi,
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-ink-900/70 dark:text-ink-50/70">
                          {e.metrics.auroc_evalaware_corrected != null
                            ? e.metrics.auroc_evalaware_corrected.toFixed(3)
                            : '—'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-ink-900/70 dark:text-ink-50/70">
                          {e.metrics.auroc_distshift != null
                            ? e.metrics.auroc_distshift.toFixed(3)
                            : '—'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-right">
                          {e.metrics.ece.toFixed(3)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-right">
                          {e.metrics.fpr_at_99tpr.toFixed(3)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-right text-ink-900/70 dark:text-ink-50/70">
                          {e.metrics.latency_ms.toFixed(1)} ms
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {e.reproducer ? (
                            <a
                              href={e.reproducer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              open
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-ink-900/30 dark:text-ink-50/30">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ CROSS-MODEL TRANSFER */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">
          Cross-model transfer (Pearson_CE)
        </h2>
        <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-3xl">
          Pearson correlation of paired ablation effects across models. ≥ 0.7
          suggests the probe&apos;s direction is shared; 0.4–0.7 suggests
          partial transfer; &lt; 0.4 suggests retraining per architecture.
        </p>

        {transfers.length === 0 ? (
          <div className="mt-8 card p-8 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
            <GitBranch className="h-5 w-5 mx-auto mb-3 text-ink-900/30 dark:text-ink-50/30" />
            No cross-model transfer measurements yet for this probe. Pearson_CE
            tells you whether a probe&apos;s direction transfers to another
            architecture without retraining.{' '}
            <Link
              href="/probebench/submit"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              Submit a transfer measurement
            </Link>
            .
          </div>
        ) : (
          <div className="mt-8 card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-[11px] uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                    <th className="px-4 py-3 text-left font-medium">Source</th>
                    <th className="px-4 py-3 text-left font-medium">Target</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Pearson_CE
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Transfer AUROC
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t, i) => {
                    const src = modelBy(t.sourceModel)
                    const tgt = modelBy(t.targetModel)
                    return (
                      <tr
                        key={`${t.probeId}-${t.targetModel}-${i}`}
                        className={`border-b border-black/5 dark:border-white/5 last:border-0 ${transferRowTone(t.pearson_ce)}`}
                      >
                        <td className="px-4 py-3.5 text-xs">
                          {src?.shortName ?? t.sourceModel}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium">
                          {tgt?.shortName ?? t.targetModel}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`inline-flex font-mono text-xs tabular-nums px-2 py-0.5 rounded-md ring-1 ring-inset ${transferPillTone(t.pearson_ce)}`}
                          >
                            {t.pearson_ce.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-right">
                          {t.transfer_auroc != null
                            ? t.transfer_auroc.toFixed(3)
                            : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-900/60 dark:text-ink-50/60">
                          {t.notes ?? ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-3 text-[11px] text-ink-900/50 dark:text-ink-50/50">
          Mean Pearson_CE for this probe (excluding self-baseline):{' '}
          <span className="font-mono">{meanCE.toFixed(3)}</span>
        </div>
      </section>

      {/* ============================================================ ARCH + ARTIFACT */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">
          Architecture &amp; artifact
        </h2>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Model card mini */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <FileCode className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                Base model
              </h3>
            </div>

            {model ? (
              <>
                <div className="mt-4 text-lg font-semibold">
                  {model.shortName}
                </div>
                <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
                  {probe.modelId}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <dt className="text-ink-900/50 dark:text-ink-50/50">Family</dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90">
                    {model.family}
                  </dd>

                  <dt className="text-ink-900/50 dark:text-ink-50/50">Params</dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                    {model.paramCount}
                  </dd>

                  <dt className="text-ink-900/50 dark:text-ink-50/50">
                    Architecture
                  </dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90">
                    {model.architecture}
                  </dd>

                  <dt className="text-ink-900/50 dark:text-ink-50/50">Layers</dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                    {model.layers}
                  </dd>

                  <dt className="text-ink-900/50 dark:text-ink-50/50">d_model</dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                    {model.dModel}
                  </dd>

                  <dt className="text-ink-900/50 dark:text-ink-50/50">
                    Weights license
                  </dt>
                  <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                    {model.weightsLicense}
                  </dd>
                </dl>

                <div className="mt-5 rounded-lg bg-brand-500/[0.07] ring-1 ring-inset ring-brand-500/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-brand-700/80 dark:text-brand-300/80">
                    Probe attaches at
                  </div>
                  <div className="mt-1 text-sm font-mono text-brand-700 dark:text-brand-300">
                    Layer {probe.layer} · {probe.position}
                  </div>
                </div>

                <a
                  href={model.hfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {huggingFaceLabel(model.hfUrl)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            ) : (
              <div className="mt-4 text-sm text-ink-900/60 dark:text-ink-50/60">
                Model <span className="font-mono">{probe.modelId}</span> not
                found in registry.
              </div>
            )}
          </div>

          {/* Artifact card */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                Artifact
              </h3>
            </div>

            <div className="mt-4 text-lg font-semibold">
              {probe.shortName} weights
            </div>
            <div className="text-xs text-ink-900/50 dark:text-ink-50/50">
              sklearn-compatible probe + scaler + meta.json
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <dt className="text-ink-900/50 dark:text-ink-50/50">Params</dt>
              <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono tabular-nums">
                {probe.paramCount.toLocaleString()}
              </dd>

              <dt className="text-ink-900/50 dark:text-ink-50/50">Size</dt>
              <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono tabular-nums">
                {probe.sizeMB.toFixed(1)} MB
              </dd>

              <dt className="text-ink-900/50 dark:text-ink-50/50">License</dt>
              <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                {probe.license}
              </dd>

              <dt className="text-ink-900/50 dark:text-ink-50/50">Released</dt>
              <dd className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                {probe.release}
              </dd>

              <dt className="text-ink-900/50 dark:text-ink-50/50 col-span-1">
                sha256
              </dt>
              <dd
                className="text-ink-900/90 dark:text-ink-50/90 font-mono text-[10.5px] break-all"
                title={probe.artifactSha256}
              >
                {truncateHash(probe.artifactSha256)}
              </dd>
            </dl>

            <div className="mt-5 space-y-1.5">
              <a
                href={probe.artifactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {huggingFaceLabel(probe.artifactUrl)}
              </a>
              <a
                href={probe.reproducerNotebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50"
              >
                <Github className="h-3 w-3" />
                source notebook on GitHub
              </a>
              <a
                href={probe.colabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50"
              >
                <ExternalLink className="h-3 w-3" />
                open reproducer in Colab
              </a>
            </div>

            <div className="mt-5 rounded-lg bg-emerald-500/[0.06] ring-1 ring-inset ring-emerald-500/20 px-4 py-3 text-[11px] text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
              Hash matches the artifact at{' '}
              <a
                href={probe.artifactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ink-900 dark:hover:text-ink-50"
              >
                {huggingFaceLabel(probe.artifactUrl)}
              </a>
              . Recompute via{' '}
              <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">
                {verifyHint}
              </code>
              .
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ REPRODUCE */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">Reproduce</h2>
        <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-3xl">
          Three entry points. Pick one. Each path lands at the same numbers.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={probe.colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/40 transition-colors"
          >
            <FileCode className="h-5 w-5 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">Open in Colab</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              One-click. Free T4 works for inference; reproducer needs an A100
              or RTX 6000.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              colab.research.google.com
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>

          <a
            href={probe.reproducerNotebook}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/40 transition-colors"
          >
            <Github className="h-5 w-5 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">View on GitHub</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              Read the notebook source, see commit history, file an issue.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              github.com · OpenInterpretability
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>

          <a
            href={probe.artifactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/40 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">Download from HF</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              Probe weights, scaler, and meta.json. Verified by the sha256
              above.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              huggingface.co · datasets
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        </div>

        <div className="mt-6 card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              shell
            </span>
            <CopyButton text={reproduceSnippet} />
          </div>
          <pre className="px-4 py-4 text-[13px] leading-6 font-mono text-ink-900/90 dark:text-ink-50/90 overflow-x-auto">
{reproduceSnippet}
          </pre>
        </div>
      </section>

      {/* ============================================================ HONEST SCOPE */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">Honest scope</h2>
        <p className="mt-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-3xl">
          Limits derived from the evaluation data above. We think these are the
          honest constraints; revisions land as more reproducers do.
        </p>

        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex gap-3 items-start">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500/70 shrink-0" />
            <div>
              <span className="text-ink-900/60 dark:text-ink-50/60">
                Trained / evaluated on:{' '}
              </span>
              <span className="text-ink-900/90 dark:text-ink-50/90">
                {trainedTaskNames.length > 0
                  ? trainedTaskNames.join(', ')
                  : 'no public evaluations recorded'}
              </span>
              <span className="text-ink-900/50 dark:text-ink-50/50">
                . Performance outside these tasks is unmeasured here.
              </span>
            </div>
          </li>

          <li className="flex gap-3 items-start">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500/70 shrink-0" />
            <div>
              <span className="text-ink-900/60 dark:text-ink-50/60">
                Eval-aware AUROC drop:{' '}
              </span>
              {meanEvalAwareDrop != null ? (
                <span className="text-ink-900/90 dark:text-ink-50/90 font-mono tabular-nums">
                  {meanEvalAwareDrop >= 0 ? '−' : '+'}
                  {Math.abs(meanEvalAwareDrop).toFixed(3)} AUROC
                </span>
              ) : (
                <span className="text-ink-900/60 dark:text-ink-50/60">—</span>
              )}
              <span className="text-ink-900/50 dark:text-ink-50/50">
                {' '}
                averaged across tasks (uncorrected − corrected for
                eval-awareness confound, arXiv:2509.13333).
              </span>
            </div>
          </li>

          <li className="flex gap-3 items-start">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500/70 shrink-0" />
            <div>
              <span className="text-ink-900/60 dark:text-ink-50/60">
                Distribution-shift drop:{' '}
              </span>
              {meanDistshiftDrop != null ? (
                <span className="text-ink-900/90 dark:text-ink-50/90 font-mono tabular-nums">
                  {meanDistshiftDrop >= 0 ? '−' : '+'}
                  {Math.abs(meanDistshiftDrop).toFixed(3)} AUROC
                </span>
              ) : (
                <span className="text-ink-900/60 dark:text-ink-50/60">—</span>
              )}
              <span className="text-ink-900/50 dark:text-ink-50/50">
                {' '}
                averaged across tasks (in-distribution − long-context /
                OOD).
              </span>
            </div>
          </li>

          <li className="flex gap-3 items-start">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500/70 shrink-0" />
            <div>
              <span className="text-ink-900/60 dark:text-ink-50/60">
                Cross-model fit (mean Pearson_CE):{' '}
              </span>
              <span className="text-ink-900/90 dark:text-ink-50/90 font-mono tabular-nums">
                {meanCE.toFixed(3)}
              </span>
              <span className="text-ink-900/50 dark:text-ink-50/50">
                {' '}
                — values below 0.4 suggest retraining per architecture; values
                above 0.7 suggest the direction is shared.
              </span>
            </div>
          </li>

          <li className="flex gap-3 items-start">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500/70 shrink-0" />
            <div>
              <span className="text-ink-900/60 dark:text-ink-50/60">
                Probe attaches at:{' '}
              </span>
              <span className="text-ink-900/90 dark:text-ink-50/90 font-mono">
                L{probe.layer} · {probe.position}
              </span>
              <span className="text-ink-900/50 dark:text-ink-50/50">
                {' '}
                of {model?.shortName ?? probe.modelId}. Other layers /
                positions are out of scope unless re-trained.
              </span>
            </div>
          </li>
        </ul>
      </section>

      {/* ============================================================ CITATIONS / ENDORSEMENTS */}
      {(probe.endorsements && probe.endorsements.length > 0) ||
      (probe.citations && probe.citations > 0) ? (
        <section className="mx-auto max-w-6xl px-6 py-12 border-t border-black/5 dark:border-white/10">
          <h2 className="text-lg font-semibold tracking-tight">
            Citations &amp; endorsements
          </h2>

          {probe.endorsements && probe.endorsements.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {probe.endorsements.map((e) => (
                <span
                  key={e}
                  className="chip bg-accent-500/15 text-accent-700 dark:text-accent-300 ring-accent-500/30"
                >
                  <Award className="h-3 w-3" />
                  {e}
                </span>
              ))}
            </div>
          ) : null}

          {probe.citations && probe.citations > 0 ? (
            <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70">
              Cited by{' '}
              <span className="font-semibold tabular-nums">
                {probe.citations}
              </span>{' '}
              {probe.citations === 1 ? 'work' : 'works'}.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ============================================================ FOOTER */}
      <section className="mx-auto max-w-6xl px-6 py-16 border-t border-black/5 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/probebench?category=${probe.category}`}
            className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {categoryLabel} leaderboard
          </Link>

          <Link
            href="/probebench/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 transition-all"
          >
            <GitBranch className="h-4 w-4" />
            Submit your own probe
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-ink-900/40 dark:text-ink-50/40 max-w-3xl">
          ProbeBench v0.0.1 · {probes.length} probes registered ·{' '}
          {evaluations.length} evaluations · {crossModelTransfers.length}{' '}
          transfer measurements. Schema and weights subject to revision.
        </p>
      </section>
    </div>
  )
}
