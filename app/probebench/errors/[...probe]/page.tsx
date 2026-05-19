import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  FileCode,
  GitPullRequest,
} from 'lucide-react'
import { probes, probeBy, taskBy, evalsFor } from '@/lib/probebench-data'
import { scoreColor, fmtAuroc } from '@/lib/probebench-scoring'
import { ScoreGauge } from '@/components/probebench/score-bar'
import type { EvalEntry, ProbeCategory } from '@/lib/probebench-types'

// -----------------------------------------------------------------------------
// Static params + metadata
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  return probes.map((p) => ({ probe: p.id.split('/') }))
}

export async function generateMetadata({ params }: { params: Promise<{ probe: string[] }> }) {
  const { probe: probeSegs } = await params
  const probe = probeBy(probeSegs.join('/'))
  if (!probe) return { title: 'Probe not found · ProbeBench' }
  return {
    title: `Error Analysis — ${probe.name} · ProbeBench`,
    description: `Failure-mode catalog for ${probe.name}: per-task FPR/TPR decomposition, calibration breakdown, distribution-shift and eval-awareness deltas.`,
  }
}

// -----------------------------------------------------------------------------
// Local helpers (server-only)
// -----------------------------------------------------------------------------

function fprBucket(fpr: number) {
  if (fpr < 0.10) {
    return {
      label: 'robust',
      dot: '\u{1F7E2}',
      row: 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]',
      cell: 'text-emerald-700 dark:text-emerald-300',
      pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    }
  }
  if (fpr <= 0.30) {
    return {
      label: 'stress',
      dot: '\u{1F7E0}',
      row: 'bg-amber-500/[0.05] hover:bg-amber-500/[0.10]',
      cell: 'text-amber-700 dark:text-amber-300',
      pill: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    }
  }
  return {
    label: 'broken',
    dot: '\u{1F534}',
    row: 'bg-rose-500/[0.06] hover:bg-rose-500/[0.12]',
    cell: 'text-rose-700 dark:text-rose-300',
    pill: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30',
  }
}

function eceBucket(ece: number) {
  // 5 buckets: <0.05 / 0.05-0.10 / 0.10-0.15 / 0.15-0.20 / >=0.20
  if (ece < 0.05) return { idx: 0, label: 'sharp', tone: 'bg-emerald-500' }
  if (ece < 0.10) return { idx: 1, label: 'good', tone: 'bg-brand-500' }
  if (ece < 0.15) return { idx: 2, label: 'wobbly', tone: 'bg-amber-500' }
  if (ece < 0.20) return { idx: 3, label: 'biased', tone: 'bg-orange-500' }
  return { idx: 4, label: 'broken', tone: 'bg-rose-500' }
}

function fmtPct(x: number, digits = 1) {
  return `${(x * 100).toFixed(digits)}%`
}

function fmtNum(x: number | undefined, digits = 3) {
  if (x == null || isNaN(x)) return '—'
  return x.toFixed(digits)
}

function signedDelta(a: number, b: number) {
  const d = b - a
  const sign = d >= 0 ? '+' : '−'
  return `${sign}${Math.abs(d).toFixed(3)}`
}

function arxivHref(id?: string) {
  if (!id) return undefined
  const stripped = id.replace(/^arXiv:/i, '').trim()
  return `https://arxiv.org/abs/${stripped}`
}

// Adversarial probe inputs, by category.
function adversarialFor(category: ProbeCategory): string[] {
  switch (category) {
    case 'hallucination':
      return [
        'Domain-specific factoids the model has weak coverage on (obscure entity names, dates from low-resource languages).',
        'Counterfactual prompts that look plausible but invert a real fact ("Marie Curie won the 1903 Peace Prize for...").',
        'Numerical claims at the edge of memorization (statistical figures with subtle digit perturbations).',
        'Questions whose ground truth changed after the training cutoff (e.g. post-2024 election results).',
        'Long-context retrieval where the answer is buried 32k+ tokens deep — hallucination rate spikes.',
      ]
    case 'reasoning':
      return [
        'Memorized chains-of-thought — the model produces the correct answer via pattern-match without internal reasoning.',
        'Arithmetic problems where the model arrives at the right answer but states an incorrect intermediate step.',
        'Multi-hop logic where the CoT skips a step the model actually computed silently in the residual.',
        'Persuasive-but-wrong CoT prompted by adversarial framing ("a smart person would say...").',
        'Reasoning about itself / its own training — high hypocrisy gap baseline.',
      ]
    case 'deception':
      return [
        'Honest reasoning that resembles deceptive surface form (persuasive arguments, debate-style framing).',
        'Roleplay scenarios where the model is honest about playing a deceptive character.',
        'Truthful denials of capabilities the model genuinely lacks (looks like sandbagging, isn\'t).',
        'Apollo insider-trading prompts paraphrased outside the original 6-template distribution.',
        'Cross-architecture transfer — probe trained on Llama, evaluated on Qwen/Gemma collapses.',
      ]
    case 'sandbagging':
      return [
        'Capability genuinely absent (probe should fire negative; many fire false positive on hard tasks).',
        'Model uses a slower / less efficient method on purpose for pedagogical reasons — not sandbagging.',
        'Eval-vs-deploy stratified prompts — sandbagging probes are confounded with eval-awareness.',
        'Tasks where the "easy" answer is the wrong answer (probe inverts).',
      ]
    case 'eval_awareness':
      return [
        'Real-world deployment prompts that happen to look benchmark-shaped (multiple-choice support tickets).',
        'Eval prompts with deployment-style preambles (e.g. system message claiming production).',
        'Synthetic eval data crafted by another model — distribution differs from human-authored evals.',
        'Models that have been trained on the eval distribution itself — collapses to chance.',
      ]
    case 'reward_hacking':
      return [
        'Benign optimization that resembles reward hacking (early stopping, conservative answers).',
        'Reward hacking on out-of-distribution rewards the probe was not trained on.',
        'Models post-trained with KL-regularized RLHF — reward-hacking signal is suppressed in residual.',
        'Reward hacking expressed via tool-use sequences rather than text (probe sees text only).',
        'Cooperative deception — model and reward model jointly fail in a way that looks correct.',
      ]
    case 'manipulation':
      return [
        'Honest persuasive writing (op-eds, academic argumentation) flagged as manipulative.',
        'Subliminal manipulation expressed in tone/cadence rather than lexical content.',
        'Manipulation conditioned on user vulnerability — requires prompt context the probe ignores.',
        'Cross-cultural framing where rhetorical norms differ from the training distribution.',
      ]
    case 'refusal':
      return [
        'Soft refusals that look like compliance ("I\'ll help with the educational version of...").',
        'Over-refusals on benign requests with surface-level policy keywords.',
        'Jailbreak prompts that elicit compliance without flipping the refusal direction.',
        'Compliance under role-play that the user never explicitly negotiated.',
      ]
    default:
      return [
        'Inputs outside the training distribution.',
        'Inputs the probe was never validated on.',
        'Inputs known to confound the underlying signal.',
      ]
  }
}

// -----------------------------------------------------------------------------
// UI atoms
// -----------------------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow?: string
  title: string
  blurb?: string
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 sm:text-3xl">
        {title}
      </h2>
      {blurb && (
        <p className="mt-2 max-w-3xl text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
          {blurb}
        </p>
      )}
    </div>
  )
}

function FailureModeCard({
  Icon,
  title,
  status,
  children,
  reference,
}: {
  Icon: typeof AlertTriangle
  title: string
  status: 'observed' | 'partial' | 'na'
  children: React.ReactNode
  reference?: { label: string; href: string }
}) {
  const statusTone =
    status === 'observed'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
      : status === 'partial'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
      : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/20'
  const statusLabel =
    status === 'observed' ? 'observed' : status === 'partial' ? 'partial signal' : 'not measured'

  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 ring-1 ring-inset ring-rose-500/20 text-rose-600 dark:text-rose-400">
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${statusTone}`}
        >
          {statusLabel}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        {title}
      </h3>
      <div className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed space-y-2">
        {children}
      </div>
      {reference && (
        <a
          href={reference.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {reference.label}
        </a>
      )}
    </article>
  )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: { params: Promise<{ probe: string[] }> }) {
  const { probe: probeSegs } = await params
  const probeId = probeSegs.join('/')
  const probe = probeBy(probeId)
  if (!probe) notFound()

  const evals: EvalEntry[] = evalsFor(probe.id)

  // Derive worst / best tasks for failure-mode narrative
  const sortedByFpr = [...evals].sort((a, b) => b.metrics.fpr_at_99tpr - a.metrics.fpr_at_99tpr)
  const worstFprEval = sortedByFpr[0]
  const bestEval = [...evals].sort((a, b) => b.metrics.auroc - a.metrics.auroc)[0]
  const worstAurocEval = [...evals].sort((a, b) => a.metrics.auroc - b.metrics.auroc)[0]

  const worstTask = worstFprEval ? taskBy(worstFprEval.taskId) : undefined
  const bestTask = bestEval ? taskBy(bestEval.taskId) : undefined

  // Distribution shift delta (best eval as headline)
  const distshiftDelta =
    bestEval?.metrics.auroc != null && bestEval?.metrics.auroc_distshift != null
      ? bestEval.metrics.auroc - bestEval.metrics.auroc_distshift
      : undefined

  const evalAwareDelta =
    bestEval?.metrics.auroc != null && bestEval?.metrics.auroc_evalaware_corrected != null
      ? bestEval.metrics.auroc - bestEval.metrics.auroc_evalaware_corrected
      : undefined

  // Cross-task transfer: if best and worst are different tasks
  const crossTaskGap =
    bestEval && worstAurocEval && bestEval.taskId !== worstAurocEval.taskId
      ? bestEval.metrics.auroc - worstAurocEval.metrics.auroc
      : undefined

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-900/55 dark:text-ink-50/55">
        <Link
          href="/probebench"
          className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          ProbeBench
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
          className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {probe.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink-900/85 dark:text-ink-50/85">Error Analysis</span>
      </nav>

      <div className="mt-3">
        <Link
          href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-900/60 dark:text-ink-50/60 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to probe DNA
        </Link>
      </div>

      {/* Header */}
      <header className="mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
          Error Analysis
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          {probe.name} <span className="text-ink-900/50 dark:text-ink-50/50">— failure modes</span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          Where this probe breaks. Per-task FPR/TPR decomposition, calibration curves, and the kinds
          of inputs we have not yet validated. Numbers below are pulled directly from the registry
          — no smoothing, no charity.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-700 dark:text-brand-300 uppercase">
            {probe.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-500/10 ring-1 ring-inset ring-slate-500/20 px-3 py-1 text-[11px] font-medium tracking-wide text-ink-900/70 dark:text-ink-50/70">
            {probe.probeType} · layer {probe.layer} · {probe.position}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-500/10 ring-1 ring-inset ring-slate-500/20 px-3 py-1 text-[11px] font-medium tracking-wide text-ink-900/70 dark:text-ink-50/70">
            {evals.length} task{evals.length === 1 ? '' : 's'} evaluated
          </span>
          {bestEval && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-white/[0.04] ring-1 ring-inset ring-black/5 dark:ring-white/10 px-3 py-1 text-[11px] font-medium text-ink-900/70 dark:text-ink-50/70">
              best AUROC{' '}
              <span className="tabular-nums font-semibold text-ink-900 dark:text-ink-50">
                {fmtNum(bestEval.metrics.auroc)}
              </span>
              <span className="text-ink-900/50 dark:text-ink-50/50">
                on {bestTask?.name ?? bestEval.taskId}
              </span>
            </span>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* Per-task error table                                          */}
      {/* ============================================================ */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Per-task breakdown"
          title="Where it works · Where it breaks"
          blurb="Each row is one held-out task. FPR@99TPR is the operationally honest metric: at the threshold that catches 99% of true positives, what fraction of negatives also fire? Above 0.30, the probe is broken at that operating point."
        />

        {evals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 bg-white/40 dark:bg-white/[0.02] p-8 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
            No evaluations recorded for this probe yet. The error analysis populates as
            reproducer notebooks land.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                  <th className="px-4 py-3 text-left">Task</th>
                  <th className="px-3 py-3 text-right">n</th>
                  <th className="px-3 py-3 text-right">AUROC [CI]</th>
                  <th className="px-3 py-3 text-right">FPR@99TPR</th>
                  <th className="px-3 py-3 text-right">ECE</th>
                  <th className="px-3 py-3 text-right">Brier</th>
                  <th className="px-3 py-3 text-right">Latency</th>
                  <th className="px-3 py-3 text-center">Failure?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {evals.map((ev) => {
                  const t = taskBy(ev.taskId)
                  const fb = fprBucket(ev.metrics.fpr_at_99tpr)
                  return (
                    <tr
                      key={ev.taskId}
                      className={`${fb.row} transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={`#calib-${ev.taskId}`}
                          className="font-medium text-ink-900 dark:text-ink-50 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {t?.name ?? ev.taskId}
                        </a>
                        {t?.category && (
                          <div className="text-[10px] uppercase tracking-wider text-ink-900/45 dark:text-ink-50/45">
                            {t.category.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-900/70 dark:text-ink-50/70">
                        {ev.metrics.n_test}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmtAuroc(
                          ev.metrics.auroc,
                          ev.metrics.auroc_lo,
                          ev.metrics.auroc_hi,
                        )}
                      </td>
                      <td className={`px-3 py-3 text-right tabular-nums font-semibold ${fb.cell}`}>
                        {fmtNum(ev.metrics.fpr_at_99tpr)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-900/70 dark:text-ink-50/70">
                        {fmtNum(ev.metrics.ece)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-900/70 dark:text-ink-50/70">
                        {fmtNum(ev.metrics.brier)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-900/70 dark:text-ink-50/70">
                        {ev.metrics.latency_ms.toFixed(1)} ms
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${fb.pill}`}
                        >
                          <span aria-hidden>{fb.dot}</span>
                          {fb.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-[12px] text-ink-900/55 dark:text-ink-50/55 leading-relaxed">
          Color key: <span className="text-emerald-700 dark:text-emerald-300">emerald</span>{' '}
          FPR@99TPR &lt; 0.10 (robust) ·{' '}
          <span className="text-amber-700 dark:text-amber-300">amber</span> 0.10–0.30 (stress)
          · <span className="text-rose-700 dark:text-rose-300">rose</span> &gt; 0.30 (broken at
          this operating point).
        </p>
      </section>

      {/* ============================================================ */}
      {/* Calibration breakdown                                         */}
      {/* ============================================================ */}
      <section className="mt-16">
        <SectionHeader
          eyebrow="Calibration"
          title="ECE / Brier per task"
          blurb="Lower ECE/Brier = better calibration. Above 0.10 ECE means the probe's confidence does not match its accuracy — a 0.9 score is not necessarily 90% likely to be a positive."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evals.map((ev) => {
            const t = taskBy(ev.taskId)
            const eb = eceBucket(ev.metrics.ece)
            return (
              <div
                key={ev.taskId}
                id={`calib-${ev.taskId}`}
                className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                    {t?.name ?? ev.taskId}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                    {eb.label}
                  </span>
                </div>

                {/* 5-bucket bar */}
                <div className="mt-4 grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const filled = i <= eb.idx
                    const tone =
                      i === 0
                        ? 'bg-emerald-500'
                        : i === 1
                        ? 'bg-brand-500'
                        : i === 2
                        ? 'bg-amber-500'
                        : i === 3
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    return (
                      <div
                        key={i}
                        className={`h-2 rounded-sm ${
                          filled ? tone : 'bg-black/5 dark:bg-white/5'
                        }`}
                      />
                    )
                  })}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-ink-900/45 dark:text-ink-50/45">
                  <span>0.00</span>
                  <span>0.05</span>
                  <span>0.10</span>
                  <span>0.15</span>
                  <span>0.20+</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-lg bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2">
                    <div className="font-medium uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                      ECE
                    </div>
                    <div className="mt-0.5 tabular-nums text-base font-semibold text-ink-900 dark:text-ink-50">
                      {fmtNum(ev.metrics.ece)}
                    </div>
                    <div className="mt-0.5 text-ink-900/50 dark:text-ink-50/50">
                      bias of confidence
                    </div>
                  </div>
                  <div className="rounded-lg bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2">
                    <div className="font-medium uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                      Brier
                    </div>
                    <div className="mt-0.5 tabular-nums text-base font-semibold text-ink-900 dark:text-ink-50">
                      {fmtNum(ev.metrics.brier)}
                    </div>
                    <div className="mt-0.5 text-ink-900/50 dark:text-ink-50/50">
                      sharpness + bias
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-[12px] text-ink-900/55 dark:text-ink-50/55 leading-relaxed max-w-3xl">
          Brier captures sharpness (how far probabilities are from {`{0,1}`}) and ECE captures bias
          (whether confidence matches frequency). A probe can have low Brier and high ECE if it is
          consistently overconfident in one direction — worth checking before deploying any
          threshold rule.
        </p>
      </section>

      {/* ============================================================ */}
      {/* The 4 archetypal failure modes                                */}
      {/* ============================================================ */}
      <section className="mt-16">
        <SectionHeader
          eyebrow="Archetypal failure modes"
          title="Four ways activation probes break"
          blurb="Each card maps to a known failure mode in the literature. We populate the cells where data exists; cards marked “not measured” signal where this probe still needs adversarial validation."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 1. Distribution shift */}
          <FailureModeCard
            Icon={AlertTriangle}
            title="Distribution shift"
            status={distshiftDelta != null ? (distshiftDelta > 0.05 ? 'observed' : 'partial') : 'na'}
            reference={{ label: 'DeepMind · arXiv:2601.11516', href: 'https://arxiv.org/abs/2601.11516' }}
          >
            {distshiftDelta != null && bestEval && bestTask ? (
              <>
                <p>
                  AUROC drops from{' '}
                  <span className="tabular-nums font-semibold text-ink-900 dark:text-ink-50">
                    {fmtNum(bestEval.metrics.auroc)}
                  </span>{' '}
                  to{' '}
                  <span className="tabular-nums font-semibold text-rose-700 dark:text-rose-300">
                    {fmtNum(bestEval.metrics.auroc_distshift)}
                  </span>{' '}
                  under long-context / OOD evaluation on {bestTask.name} — a signed delta of{' '}
                  <span className="tabular-nums font-semibold">
                    {signedDelta(bestEval.metrics.auroc, bestEval.metrics.auroc_distshift!)}
                  </span>
                  .
                </p>
                <p className="text-ink-900/55 dark:text-ink-50/55">
                  In-distribution AUROC overstates production performance whenever the deployment
                  context length, prompt format, or domain differs from the training set.
                </p>
              </>
            ) : (
              <p>
                Distribution-shift AUROC has not been measured for this probe. Recommended:
                re-evaluate at ≥8k context length and on at least one domain unseen at
                training time.
              </p>
            )}
          </FailureModeCard>

          {/* 2. Eval-awareness */}
          <FailureModeCard
            Icon={AlertCircle}
            title="Eval-awareness confound"
            status={evalAwareDelta != null ? (evalAwareDelta > 0.04 ? 'observed' : 'partial') : 'na'}
            reference={{ label: 'arXiv:2509.13333', href: 'https://arxiv.org/abs/2509.13333' }}
          >
            {evalAwareDelta != null && bestEval && bestTask ? (
              <>
                <p>
                  AUROC drops from{' '}
                  <span className="tabular-nums font-semibold text-ink-900 dark:text-ink-50">
                    {fmtNum(bestEval.metrics.auroc)}
                  </span>{' '}
                  to{' '}
                  <span className="tabular-nums font-semibold text-amber-700 dark:text-amber-300">
                    {fmtNum(bestEval.metrics.auroc_evalaware_corrected)}
                  </span>{' '}
                  when stratified by eval-awareness quartile (delta{' '}
                  <span className="tabular-nums font-semibold">
                    {signedDelta(
                      bestEval.metrics.auroc,
                      bestEval.metrics.auroc_evalaware_corrected!,
                    )}
                  </span>
                  ).
                </p>
                <p className="text-ink-900/55 dark:text-ink-50/55">
                  Apollo (2509.13333) shows AUROC scales with the model’s belief that it is
                  being evaluated. Always quote the corrected number for safety-relevant claims.
                </p>
              </>
            ) : (
              <p>
                No eval-awareness-corrected AUROC on file. To diagnose: stratify the test set by an
                EvalAwarenessGuard score and report AUROC in the bottom quartile.
              </p>
            )}
          </FailureModeCard>

          {/* 3. High false-positive rate */}
          <FailureModeCard
            Icon={AlertTriangle}
            title="High false-positive rate"
            status={
              worstFprEval && worstFprEval.metrics.fpr_at_99tpr > 0.30
                ? 'observed'
                : worstFprEval && worstFprEval.metrics.fpr_at_99tpr > 0.10
                ? 'partial'
                : 'na'
            }
          >
            {worstFprEval && worstTask ? (
              <>
                <p>
                  FPR@99TPR ={' '}
                  <span className="tabular-nums font-semibold text-rose-700 dark:text-rose-300">
                    {fmtNum(worstFprEval.metrics.fpr_at_99tpr)}
                  </span>{' '}
                  on{' '}
                  <span className="font-semibold text-ink-900 dark:text-ink-50">
                    {worstTask.name}
                  </span>
                  . At the threshold that catches 99% of true positives,{' '}
                  <span className="tabular-nums font-semibold">
                    {fmtPct(worstFprEval.metrics.fpr_at_99tpr, 0)}
                  </span>{' '}
                  of negatives also trip the alarm.
                </p>
                <p className="text-ink-900/55 dark:text-ink-50/55">
                  Practical implication: at production volumes, near-perfect recall comes with a
                  flood of false positives. Either drop the operating threshold and accept lower
                  recall, or treat this task as out-of-scope.
                </p>
              </>
            ) : (
              <p>FPR@99TPR not yet computed.</p>
            )}
          </FailureModeCard>

          {/* 4. Cross-task transfer */}
          <FailureModeCard
            Icon={AlertCircle}
            title="Cross-task transfer"
            status={
              crossTaskGap != null
                ? crossTaskGap > 0.20
                  ? 'observed'
                  : crossTaskGap > 0.10
                  ? 'partial'
                  : 'na'
                : 'na'
            }
          >
            {crossTaskGap != null && bestEval && worstAurocEval && bestTask ? (
              <>
                <p>
                  Probe trained / strongest on{' '}
                  <span className="font-semibold text-ink-900 dark:text-ink-50">
                    {bestTask.name}
                  </span>{' '}
                  (AUROC {fmtNum(bestEval.metrics.auroc)}) drops to{' '}
                  <span className="tabular-nums font-semibold text-rose-700 dark:text-rose-300">
                    {fmtNum(worstAurocEval.metrics.auroc)}
                  </span>{' '}
                  on{' '}
                  <span className="font-semibold">
                    {taskBy(worstAurocEval.taskId)?.name ?? worstAurocEval.taskId}
                  </span>{' '}
                  — difference{' '}
                  <span className="tabular-nums font-semibold">
                    {signedDelta(bestEval.metrics.auroc, worstAurocEval.metrics.auroc)}
                  </span>
                  .
                </p>
                <p className="text-ink-900/55 dark:text-ink-50/55">
                  Cross-task generalization is not free. Probes labeled “hallucination”
                  often transfer poorly between QA, multiple-choice misconception, and
                  knowledge-recall settings.
                </p>
                {probe.description && (
                  <p className="text-ink-900/45 dark:text-ink-50/45 italic">
                    Training note: {probe.description}
                  </p>
                )}
              </>
            ) : (
              <p>
                Only one task on file — cross-task transfer cannot be measured yet. Add a
                second held-out task in the same category to populate this card.
              </p>
            )}
          </FailureModeCard>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Recommended adversarial probes                                */}
      {/* ============================================================ */}
      <section className="mt-16">
        <SectionHeader
          eyebrow="Adversarial wishlist"
          title="Inputs that should break this probe"
          blurb={`Category-specific stress tests. If you are evaluating ${probe.name} for production, these are the prompts most likely to expose hidden failures.`}
        />

        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
            Category: {probe.category.replace('_', ' ')}
          </div>
          <ul className="mt-4 space-y-3">
            {adversarialFor(probe.category).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-rose-500/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
            These are hypotheses, not measurements. Each item should ideally graduate to a row in
            the table above, with its own n / AUROC / FPR.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Submit a failure case                                         */}
      {/* ============================================================ */}
      <section className="mt-16">
        <SectionHeader
          eyebrow="Contribute"
          title="Submit a failure case"
          blurb="Found a case where this probe fails? PR a YAML file to the registry. The schema is intentionally minimal — a prompt, the expected label, the observed probe score, and a reproducer link."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-ink-900 dark:bg-black/40 p-5 text-[12.5px] leading-6 font-mono text-ink-50 overflow-x-auto">
            <div className="text-[10px] uppercase tracking-wider text-ink-50/50 mb-2">
              probebench/failures/{probe.id.replace(/[^a-z0-9]+/gi, '-')}.yaml
            </div>
<pre className="whitespace-pre">{`probe_id: ${probe.id}
failure_case:
  prompt: "Your adversarial prompt"
  expected_label: positive
  probe_score: 0.12
  expected_score: ">0.7"
  category: distribution_shift
  reproducer: link.to.notebook`}</pre>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
              <FileCode className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              How submission works
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed list-decimal pl-5">
              <li>Reproduce the failure in a Colab or local notebook.</li>
              <li>
                Add a YAML file under <code className="font-mono text-[11px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">probebench/failures/</code> with the schema on the left.
              </li>
              <li>
                Open a PR. CI re-runs the reproducer against the artifact at{' '}
                <code className="font-mono text-[11px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">
                  {probe.artifactSha256.slice(0, 12)}…
                </code>
                .
              </li>
              <li>If reproduced, the failure case appears on this page in the next release.</li>
            </ol>
            <Link
              href="/probebench/submit"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              <GitPullRequest className="h-4 w-4" />
              Open a failure-case PR
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Footer cross-link                                             */}
      {/* ============================================================ */}
      <footer className="mt-20 border-t border-black/5 dark:border-white/10 pt-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {probe.name} probe DNA
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-900/50 dark:text-ink-50/50">
          <span>artifact sha256 {probe.artifactSha256.slice(0, 12)}…</span>
          <span aria-hidden>·</span>
          <span>license {probe.license}</span>
          <span aria-hidden>·</span>
          <span>release {probe.release}</span>
          {probe.paper && (
            <>
              <span aria-hidden>·</span>
              <a
                href={arxivHref(probe.paper)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 dark:hover:text-brand-400"
              >
                {probe.paper}
              </a>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
