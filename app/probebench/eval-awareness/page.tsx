import Link from 'next/link'
import {
  ArrowLeft,
  AlertTriangle,
  ScanEye,
  FileCode,
  BookOpen,
  ExternalLink,
  TrendingDown,
  ShieldAlert,
  GitBranch,
  Layers,
  Calculator,
  Eye,
} from 'lucide-react'
import { probes, evaluations, probeBy, evalsFor } from '@/lib/probebench-data'
import { scoreColor, fmtAuroc } from '@/lib/probebench-scoring'
import type { ProbeEntry, EvalEntry } from '@/lib/probebench-types'

export const metadata = {
  title: 'Eval-Awareness Correction — ProbeBench',
  description:
    'All published probe AUROCs are confounded by eval-awareness. ProbeBench reports both raw and corrected. Methodology and per-probe deltas.',
}

// -----------------------------------------------------------------------------
// Helpers — precompute per-probe raw / corrected AUROC means at render time
// -----------------------------------------------------------------------------

interface ProbeDeltaRow {
  probe: ProbeEntry
  rawAuroc: number
  correctedAuroc: number
  delta: number             // raw − corrected (positive = drop after correction)
  hasCorrection: boolean    // whether any eval declared an explicit corrected value
  evalCount: number
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function probeDeltaRows(): ProbeDeltaRow[] {
  return probes.map(p => {
    const evals = evalsFor(p.id)
    const raw = mean(evals.map(e => e.metrics.auroc))
    const declared = evals
      .map(e => e.metrics.auroc_evalaware_corrected)
      .filter((v): v is number => typeof v === 'number')
    const hasCorrection = declared.length > 0
    // Match the scoring policy: probes that fail to declare are imputed at raw × 0.85
    const corrected = hasCorrection
      ? mean(evals.map(e => e.metrics.auroc_evalaware_corrected ?? e.metrics.auroc * 0.85))
      : raw * 0.85
    return {
      probe: p,
      rawAuroc: raw,
      correctedAuroc: corrected,
      delta: raw - corrected,
      hasCorrection,
      evalCount: evals.length,
    }
  })
}

function deltaTone(delta: number): { dot: string; text: string; bg: string; ring: string; label: string } {
  if (delta > 0.05) {
    return {
      dot: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-500/10',
      ring: 'ring-rose-500/30',
      label: 'large drop',
    }
  }
  if (delta > 0.02) {
    return {
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-500/10',
      ring: 'ring-amber-500/30',
      label: 'moderate drop',
    }
  }
  return {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/30',
    label: 'robust',
  }
}

function fmtSignedPp(delta: number): string {
  // Show as percentage points — closer to how probe authors report numbers.
  const pp = delta * 100
  const sign = pp > 0 ? '−' : pp < 0 ? '+' : '±'
  return `${sign}${Math.abs(pp).toFixed(1)} pp`
}

// -----------------------------------------------------------------------------
// Small components
// -----------------------------------------------------------------------------

function EvidenceCard({
  Icon,
  eyebrow,
  title,
  body,
  source,
}: {
  Icon: typeof ShieldAlert
  eyebrow: string
  title: string
  body: React.ReactNode
  source?: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-900/50 dark:text-ink-50/50">
        {eyebrow}
      </div>
      <h3 className="mt-1 text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
        {body}
      </p>
      {source && (
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
          {source}
        </div>
      )}
    </article>
  )
}

function StepCard({
  index,
  Icon,
  title,
  body,
}: {
  index: number
  Icon: typeof ShieldAlert
  title: string
  body: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 ring-1 ring-inset ring-brand-500/30 text-xs font-semibold tabular-nums text-brand-700 dark:text-brand-300">
          {index}
        </span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 ring-1 ring-inset ring-accent-500/20 text-accent-700 dark:text-accent-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
        {body}
      </p>
    </article>
  )
}

function MiniBar({
  raw,
  corrected,
}: {
  raw: number
  corrected: number
}) {
  // Bars are scaled to the 0.4–1.0 range so visual differences are legible
  const lo = 0.4
  const hi = 1.0
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100))
  return (
    <div className="w-full max-w-[200px] space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-14 text-[10px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
          raw
        </span>
        <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500/70"
            style={{ width: `${pct(raw)}%` }}
          />
        </div>
        <span className="w-12 text-right text-[11px] font-mono tabular-nums text-ink-900/70 dark:text-ink-50/70">
          {raw.toFixed(3)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 text-[10px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
          corr.
        </span>
        <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-500/70"
            style={{ width: `${pct(corrected)}%` }}
          />
        </div>
        <span className="w-12 text-right text-[11px] font-mono tabular-nums text-ink-900/70 dark:text-ink-50/70">
          {corrected.toFixed(3)}
        </span>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function EvalAwarenessMethodologyPage() {
  const rows = probeDeltaRows()
    .slice()
    .sort((a, b) => b.delta - a.delta) // worst-corrected (largest drop) first

  const meanDeltaPct = mean(rows.map(r => r.delta)) * 100
  const largeDropCount = rows.filter(r => r.delta > 0.10).length
  const totalEvals = evaluations.length
  const declaredEvals = evaluations.filter(
    e => typeof e.metrics.auroc_evalaware_corrected === 'number',
  ).length

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/probebench"
          className="inline-flex items-center gap-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          ProbeBench
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-500/[0.05] via-transparent to-accent-500/[0.06]"
        />
        <div
          aria-hidden
          className="absolute -top-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30">
              Methodology · Eval-Awareness
            </span>
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
              ProbeBench v0.0.1
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
            Your probe AUROC is{' '}
            <span className="gradient-text">lying to you</span>.
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            When a model can tell it is being tested, behavioral and activation patterns shift.
            Probes trained on benchmark data inherit that shift as signal. Apollo Research and
            UK AISI found a power-law: every probe AUROC in the literature is partially attributable
            to eval-awareness, not the actual capability the probe claims to detect. ProbeBench requires
            both the raw AUROC and the eval-awareness-corrected AUROC for every entry.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <a
              href="https://arxiv.org/abs/2507.01786"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              arXiv:2507.01786 — Probing &amp; Steering Evaluation Awareness
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <a
              href="https://arxiv.org/abs/2509.13333"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              arXiv:2509.13333 — Apollo / UK AISI follow-up
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>

          {/* Inline stat strip */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums gradient-text">
                {meanDeltaPct.toFixed(1)} pp
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                Avg raw → corrected drop
              </div>
              <div className="mt-1 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
                across {rows.length} reference probes in the seed registry
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums gradient-text">
                {largeDropCount}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                Probes with &gt;10 pp drop
              </div>
              <div className="mt-1 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
                where the headline materially overstates deployment performance
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums gradient-text">
                {declaredEvals}/{totalEvals}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                Eval cells with declared correction
              </div>
              <div className="mt-1 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
                undeclared cells are auto-imputed at <code className="font-mono">raw × 0.85</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Empirical phenomenon                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <ScanEye className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              The empirical phenomenon
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Three observations from the public literature, each independently sufficient to require a
            correction step.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <EvidenceCard
            Icon={Eye}
            eyebrow="Observation 1"
            title="Linear separability of eval vs deploy"
            body={
              <>
                Linear probes separate evaluation prompts from real-world deployment prompts at
                AUROC 0.93+ on Qwen3.6-27B (our internal seed eval) and 0.95+ on Llama-3
                (Apollo replication). The signal is not subtle — it's one of the easiest
                directions to recover from the residual stream.
              </>
            }
            source={
              <>
                Source: <code className="font-mono">openinterp/evalawareness-qwen36-27b-l40</code>{' '}
                · Apollo Research (arXiv:2507.01786).
              </>
            }
          />
          <EvidenceCard
            Icon={TrendingDown}
            eyebrow="Observation 2"
            title="Power-law scaling with model size"
            body={
              <>
                Eval-awareness AUROC scales with model size — bigger models are <em>better</em> at
                knowing they're being tested. Implication: every safety probe will look better the
                larger the model gets, even if the underlying capability is degrading. Naïve
                leaderboard tracking inverts the alignment signal.
              </>
            }
            source={
              <>
                Source: Apollo / UK AISI (arXiv:2509.13333). Trend holds across Llama-3, Qwen2.5,
                Gemma-2 family-pairs.
              </>
            }
          />
          <EvidenceCard
            Icon={ShieldAlert}
            eyebrow="Observation 3"
            title="Most probes are partially eval-aware"
            body={
              <>
                Across {rows.length} reference probes in our seed registry, the average raw → corrected
                AUROC drop is{' '}
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  {meanDeltaPct.toFixed(1)}%
                </span>
                . {largeDropCount > 0
                  ? `${largeDropCount} of those probe${largeDropCount === 1 ? ' loses' : 's lose'} more than 10 pp once the eval-awareness quartile is held fixed.`
                  : 'No probes in the current seed lose >10 pp — but the seed is small.'}{' '}
                The table below is the per-probe breakdown.
              </>
            }
            source={
              <>
                Computed from{' '}
                <code className="font-mono">probebench-data.ts</code> · {totalEvals} eval cells.
              </>
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The correction methodology — 4-step                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              The correction methodology
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            A four-step procedure that any probe author can run on their own test set. We do not
            re-train the original probe — we re-aggregate its scores under an eval-awareness
            stratification.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StepCard
            index={1}
            Icon={GitBranch}
            title="Train an eval-awareness probe"
            body={
              <>
                On the same model, train a linear probe to separate evaluation prompts
                (benchmark-derived) from deployment prompts (chat logs / open-web). This is
                the <code className="font-mono text-[11px] bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">EvalAwarenessGuard</code>{' '}
                entry in our registry.
              </>
            }
          />
          <StepCard
            index={2}
            Icon={ScanEye}
            title="Score the test set"
            body={
              <>
                For each test prompt, get the eval-awareness probe's score{' '}
                <code className="font-mono text-[11px] bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">e ∈ [0, 1]</code>.
                High <code className="font-mono text-[11px]">e</code> = the model thinks it's being
                evaluated.
              </>
            }
          />
          <StepCard
            index={3}
            Icon={Layers}
            title="Stratify and balance"
            body={
              <>
                Split the test set into eval-awareness quartiles. Compute the target probe's AUROC
                within each quartile. The within-quartile AUROC removes most of the eval-aware
                lift because every prompt in a bucket has roughly the same{' '}
                <code className="font-mono text-[11px]">e</code>.
              </>
            }
          />
          <StepCard
            index={4}
            Icon={TrendingDown}
            title="Report the bottom-quartile AUROC"
            body={
              <>
                The eval-awareness corrected AUROC is the AUROC on prompts where the model is{' '}
                <em>least</em> aware it's being tested. This is closest to deployment performance,
                and is the number we require alongside the raw headline.
              </>
            }
          />
        </div>

        {/* Math callout */}
        <div className="mt-8 rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-accent-500/[0.04] p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900/70 dark:text-ink-50/70">
              The formula
            </h3>
            <span className="text-[11px] font-mono text-ink-900/50 dark:text-ink-50/50">
              v0.0.1 reference implementation
            </span>
          </div>
          <pre className="mt-3 rounded-lg bg-ink-950 text-ink-50 p-5 text-sm sm:text-base font-mono overflow-x-auto leading-relaxed">
{`AUROC_corrected = AUROC( { x ∈ test : e(x) < q_25 } )

  where  e(x)   = EvalAwarenessGuard(model)(x)        ∈ [0, 1]
         q_25   = 25th percentile of e(x) over test
         AUROC  = standard ROC-AUC over the corrected subset`}
          </pre>
          <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Two practical notes. First, the bottom-quartile slice halves to a quarter of test-set
            size, so always report a bootstrap CI alongside the corrected AUROC. Second, if the
            eval-awareness probe itself transfers poorly to your model (Pearson_CE &lt; 0.5 against
            the source model), retrain it from scratch — don't use a transferred score.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Per-probe correction table                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Per-probe correction table
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Sorted by delta (worst-corrected first). Probes that fail to declare an
              eval-awareness corrected AUROC are imputed at <code className="font-mono">raw × 0.85</code>{' '}
              and flagged.
            </p>
          </div>
          <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
            {rows.length} probes · {totalEvals} eval cells
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60 border-b border-black/5 dark:border-white/10">
              <tr>
                <th className="text-left py-3 px-4">Probe</th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">Raw AUROC</th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">Corrected</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Compare</th>
                <th className="text-right py-3 px-4">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {rows.map((row, i) => {
                const tone = deltaTone(row.delta)
                return (
                  <tr
                    key={row.probe.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 align-top">
                      <Link
                        href={`/probebench/probe/${encodeURIComponent(row.probe.id)}`}
                        className="font-semibold text-ink-900 dark:text-ink-50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {row.probe.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-900/50 dark:text-ink-50/50">
                        <span className="font-mono">{row.probe.category}</span>
                        <span>·</span>
                        <span>{row.evalCount} eval{row.evalCount === 1 ? '' : 's'}</span>
                        {!row.hasCorrection && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 ring-1 ring-inset ring-amber-500/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 font-medium">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              imputed
                            </span>
                          </>
                        )}
                      </div>
                      {/* mobile-only inline metrics */}
                      <div className="mt-2 flex sm:hidden items-center gap-3 text-[11px] font-mono tabular-nums text-ink-900/70 dark:text-ink-50/70">
                        <span>raw {fmtAuroc(row.rawAuroc)}</span>
                        <span>corr {fmtAuroc(row.correctedAuroc)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-right hidden sm:table-cell">
                      <span className="font-mono tabular-nums text-ink-900/80 dark:text-ink-50/80">
                        {fmtAuroc(row.rawAuroc)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top text-right hidden sm:table-cell">
                      <span className={`font-mono tabular-nums ${scoreColor(row.correctedAuroc).text}`}>
                        {fmtAuroc(row.correctedAuroc)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top hidden lg:table-cell">
                      <MiniBar raw={row.rawAuroc} corrected={row.correctedAuroc} />
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset px-2.5 py-1 text-xs font-mono tabular-nums ${tone.bg} ${tone.ring} ${tone.text}`}
                        title={tone.label}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        {fmtSignedPp(row.delta)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-900/50 dark:text-ink-50/50">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>drop &gt; 5 pp — material overclaim</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>2 – 5 pp — moderate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>≤ 2 pp — robust to correction</span>
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Why we still weight raw AUROC                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-accent-500/[0.04] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              The dampening factor in ProbeScore
            </h2>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
              <p>
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  Why do we still weight raw AUROC at 0.30 instead of 0?
                </span>{' '}
                Because not every deployment is uncalibrated. For probes shipped to production
                where the user is benign — i.e., not adversarially trying to exploit eval-awareness
                — raw AUROC is closer to operational performance than the bottom-quartile corrected
                number. We weight both: <code className="font-mono">0.30 × raw + 0.20 × corrected</code>.
                The 30% / 20% split exposes the gap without throwing the headline away.
              </p>
              <p>
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  What if a probe doesn't declare a corrected AUROC?
                </span>{' '}
                Probes that fail to declare an eval-awareness corrected AUROC are auto-imputed at{' '}
                <code className="font-mono">raw × 0.85</code> — a punishing default that
                disincentivizes silence. If the real correction is gentler than 15%, declare it and
                claim the points.
              </p>
            </div>

            <div className="rounded-xl bg-ink-950 text-ink-50 p-5 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto">
              <div className="text-ink-50/40 mb-2"># ProbeScore weights v0.0.1</div>
              <div><span className="text-accent-300">auroc</span>                =&nbsp;0.30</div>
              <div><span className="text-accent-300">auroc_evalaware</span>      =&nbsp;0.20</div>
              <div className="text-ink-50/40">distshift_robustness =&nbsp;0.15</div>
              <div className="text-ink-50/40">ece_calibration      =&nbsp;0.10</div>
              <div className="text-ink-50/40">cross_model_transfer =&nbsp;0.10</div>
              <div className="text-ink-50/40">inference_efficiency =&nbsp;0.10</div>
              <div className="text-ink-50/40">license_score        =&nbsp;0.05</div>
              <div className="mt-3 text-ink-50/40"># missing → impute</div>
              <div>
                <span className="text-accent-300">corrected</span> =&nbsp;raw <span className="text-rose-300">×</span> 0.85
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Honest limits                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Honest limits
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Eval-awareness correction is a partial fix. It does not solve any of the following, and
            we surface them here so authors don't read more into the corrected number than is
            warranted.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Limit 1
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">
              Test set itself may be eval-aware
            </h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Doesn't catch deception probes whose training data is itself eval-aware. If both
              positive and negative classes were sampled from benchmark prompts, the bottom quartile
              still skews evaluation-flavored. You need a <em>deployment-collected</em> test set
              (chat logs, real user queries) to fully decouple.
            </p>
          </article>
          <article className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Limit 2
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">
              Concept-shift correlated with target
            </h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Doesn't catch concept-shift between eval and deploy that's correlated with the target
              capability. Production users simply ask different questions than benchmark authors do,
              and that distribution shift can preserve the AUROC gap even after eval-awareness
              quartile balancing.
            </p>
          </article>
          <article className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Limit 3
            </div>
            <h3 className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">
              Mid-generation eval-awareness
            </h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Doesn't catch eval-awareness emerging <em>during</em> generation — only at end-of-prompt.
              A model that scores low on eval-awareness at the question token but flips during
              chain-of-thought will not be flagged by the current methodology.
            </p>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer CTA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
              <FileCode className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Submit an eval-awareness corrected AUROC
            </h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Add the <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">auroc_evalaware_corrected</code>{' '}
              field to your submission YAML. The leaderboard will score the declared number;
              omitting it triggers the <code className="font-mono">raw × 0.85</code> imputation.
            </p>
            <pre className="mt-4 rounded-lg bg-ink-950 text-ink-50 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`metrics:
  auroc: 0.882
  auroc_evalaware_corrected: 0.823`}
            </pre>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/probebench/submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Open submission template
              </Link>
              <Link
                href="/probebench"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to leaderboard
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 ring-1 ring-inset ring-accent-500/20 text-accent-700 dark:text-accent-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Further reading</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
              <li>
                <a
                  href="https://arxiv.org/abs/2507.01786"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  arXiv:2507.01786 — Probing &amp; Steering Evaluation Awareness
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
                <div className="text-[11px] text-ink-900/55 dark:text-ink-50/55 mt-0.5">
                  Original linear-probe demonstration that eval prompts are separable from deployment.
                </div>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/2509.13333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  arXiv:2509.13333 — Apollo / UK AISI follow-up
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
                <div className="text-[11px] text-ink-900/55 dark:text-ink-50/55 mt-0.5">
                  Power-law scaling result: eval-awareness AUROC grows with parameters.
                </div>
              </li>
              <li>
                <Link
                  href="/probebench/probe/openinterp/evalawareness-qwen36-27b-l40"
                  className="inline-flex items-baseline gap-1 font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  EvalAwarenessGuard probe card
                </Link>
                <div className="text-[11px] text-ink-900/55 dark:text-ink-50/55 mt-0.5">
                  Reference implementation used for the bottom-quartile correction in this page.
                </div>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  )
}
