import Link from 'next/link'
import { ArrowLeft, GitBranch, Sigma, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react'
import { crossModelTransfers, probes, models, probeBy, modelBy } from '@/lib/probebench-data'
import { scoreColor } from '@/lib/probebench-scoring'

export const metadata = {
  title: 'Cross-Model Transfer Matrix — ProbeBench',
  description:
    "Pearson_CE: how much of a probe's causal direction actually transfers across model architectures. Beyond decoder cosine.",
}

// -----------------------------------------------------------------------------
// Helpers (server-side, pure)
// -----------------------------------------------------------------------------

/** All transfer rows for a (source, target) pair. */
function pairTransfers(sourceId: string, targetId: string) {
  return crossModelTransfers.filter(
    (t) => t.sourceModel === sourceId && t.targetModel === targetId,
  )
}

/** Mean Pearson_CE across all probes for a given (source, target) pair, or null if no data. */
function meanCEForPair(sourceId: string, targetId: string): number | null {
  const rows = pairTransfers(sourceId, targetId)
  if (rows.length === 0) return null
  return rows.reduce((s, r) => s + r.pearson_ce, 0) / rows.length
}

/** Color the heatmap cell: identity → brand-500, ≥0.7 emerald, 0.4–0.7 amber, <0.4 rose. */
function cellStyles(value: number | null, isIdentity: boolean) {
  if (value === null) {
    return {
      bg: 'bg-black/[0.02] dark:bg-white/[0.02]',
      ring: 'ring-black/5 dark:ring-white/10',
      text: 'text-ink-900/30 dark:text-ink-50/30',
      label: 'no data',
    }
  }
  if (isIdentity) {
    return {
      bg: 'bg-brand-500/25',
      ring: 'ring-brand-500/40',
      text: 'text-brand-700 dark:text-brand-200',
      label: 'identity',
    }
  }
  if (value >= 0.7) {
    return {
      bg: 'bg-emerald-500/25',
      ring: 'ring-emerald-500/40',
      text: 'text-emerald-700 dark:text-emerald-200',
      label: 'strong',
    }
  }
  if (value >= 0.4) {
    return {
      bg: 'bg-amber-500/25',
      ring: 'ring-amber-500/40',
      text: 'text-amber-700 dark:text-amber-200',
      label: 'partial',
    }
  }
  return {
    bg: 'bg-rose-500/25',
    ring: 'ring-rose-500/40',
    text: 'text-rose-700 dark:text-rose-200',
    label: 'weak',
  }
}

/** Style for a per-probe transfer chip. */
function chipStyles(value: number) {
  if (value >= 1.0) return 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30'
  if (value >= 0.7) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30'
  if (value >= 0.4) return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
  return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
}

// Inline math styling — no KaTeX dependency.
const mathCls =
  'font-mono text-[13px] px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded'

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function CrossModelTransferMatrixPage() {
  // Distinct probes that actually have transfer data (preserves seed order)
  const probeIds = Array.from(new Set(crossModelTransfers.map((t) => t.probeId)))
  const probeRows = probeIds
    .map((id) => probeBy(id))
    .filter((p): p is NonNullable<ReturnType<typeof probeBy>> => Boolean(p))

  // Build the matrix (rows = sourceModel, cols = targetModel)
  const matrix = models.map((src) =>
    models.map((tgt) => ({
      src,
      tgt,
      mean: meanCEForPair(src.id, tgt.id),
      isIdentity: src.id === tgt.id,
      contributing: pairTransfers(src.id, tgt.id),
    })),
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Breadcrumb */}
      <Link
        href="/probebench"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to ProbeBench
      </Link>

      {/* Header */}
      <div className="mb-12">
        <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
          Methodology · Pearson_CE
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance inline-flex items-center gap-3">
          <GitBranch className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          Cross-Model Probe Transfer
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Decoder cosine looks high. Causal effects look low. The gap is real.{' '}
          <strong>Pearson_CE</strong> measures the Pearson correlation between paired
          ablation effects on source vs target models — the honest transfer signal. Naive
          cosine alignment overestimates by 38% on cross-model crosscoders (Lindsey 2024
          setup). We require it for every cross-model claim on the leaderboard.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-ink-900/55 dark:text-ink-50/55 leading-relaxed italic">
          Methodology after Lindsey et al. 2024 (Anthropic Crosscoders) and our paper-1
          numbers on Gemma-2-2B base/IT — median cosine{' '}
          <code className={mathCls}>0.965</code> vs median Pearson_CE{' '}
          <code className={mathCls}>0.616</code>, a 38% overstatement.
        </p>
      </div>

      {/* Methodology — 3-step cards */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">How Pearson_CE works</h2>
      <div className="grid gap-4 md:grid-cols-3 mb-14">
        {[
          {
            step: 1,
            icon: <BookOpen className="h-5 w-5" />,
            title: 'Pair the inputs',
            body: (
              <>
                For each test prompt, get residual activation{' '}
                <code className={mathCls}>h_s</code> from the source model and{' '}
                <code className={mathCls}>h_t</code> from the target model at a matched
                semantic checkpoint (same token position, same prompt template).
              </>
            ),
          },
          {
            step: 2,
            icon: <Sigma className="h-5 w-5" />,
            title: 'Compute paired causal effect',
            body: (
              <>
                Ablate the probe's direction in each model; measure{' '}
                <code className={mathCls}>Δlogit_s</code> and{' '}
                <code className={mathCls}>Δlogit_t</code> on the held-out positive class.
                One pair per prompt.
              </>
            ),
          },
          {
            step: 3,
            icon: <GitBranch className="h-5 w-5" />,
            title: 'Pearson over the pairs',
            body: (
              <>
                <code className={mathCls}>ρ_CE = Pearson(Δlogit_s, Δlogit_t)</code> over{' '}
                <code className={mathCls}>N ≥ 200</code> prompts. Bootstrap CIs over 1000
                resamples. Report point estimate + 95% CI.
              </>
            ),
          },
        ].map((s) => (
          <article key={s.step} className="card p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30">
                {s.icon}
              </div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-900/40 dark:text-ink-50/40">
                Step {s.step}
              </div>
            </div>
            <h3 className="font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              {s.body}
            </p>
          </article>
        ))}
      </div>

      {/* Heatmap legend */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Transfer matrix · mean Pearson_CE per pair
        </h2>
        <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
          {crossModelTransfers.length} entries · {models.length}×{models.length} grid
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <LegendSwatch className="bg-brand-500/25 ring-brand-500/40" label="1.00 identity" />
        <LegendSwatch
          className="bg-emerald-500/25 ring-emerald-500/40"
          label="≥ 0.70 strong"
        />
        <LegendSwatch
          className="bg-amber-500/25 ring-amber-500/40"
          label="0.40 – 0.70 partial"
        />
        <LegendSwatch className="bg-rose-500/25 ring-rose-500/40" label="< 0.40 weak" />
        <LegendSwatch
          className="bg-black/[0.04] dark:bg-white/[0.04] ring-black/10 dark:ring-white/10"
          label="— no data"
        />
      </div>

      {/* Heatmap */}
      <div className="card p-5 mb-6 overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `minmax(160px, 220px) repeat(${models.length}, minmax(120px, 1fr))`,
            }}
          >
            {/* corner */}
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-900/40 dark:text-ink-50/40 flex items-end justify-end pr-3 pb-2">
              source ↓ / target →
            </div>
            {/* column headers */}
            {models.map((m) => (
              <div
                key={`col-${m.id}`}
                className="text-xs font-semibold text-ink-900/70 dark:text-ink-50/70 px-2 pb-2 text-center leading-tight"
              >
                <div className="truncate">{m.shortName}</div>
                <div className="font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40 mt-0.5">
                  {m.architecture.split(' ').slice(0, 3).join(' ')}
                </div>
              </div>
            ))}

            {/* rows */}
            {matrix.map((row, i) => (
              <RowFragment key={`row-${models[i].id}`} src={models[i]} cells={row} />
            ))}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <p className="mb-12 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed max-w-3xl">
        The diagonal is always{' '}
        <code className={mathCls}>ρ_CE = 1.00</code> by construction — a probe transfers
        perfectly to itself. Off-diagonal cells reveal architecture distance: same-family
        targets (e.g. Qwen → Qwen) generally exceed cross-family targets (Qwen → Llama,
        Qwen → Gemma). Cells with{' '}
        <code className={mathCls}>ρ_CE &lt; 0.4</code> indicate the probe direction is
        not the same causal mechanism in the target model — high decoder cosine on those
        pairs is a confound, not portability.
      </p>

      {/* Per-probe rows */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">
        Per-probe transfer profiles
      </h2>
      <div className="space-y-3 mb-14">
        {probeRows.map((probe) => {
          const rows = crossModelTransfers.filter((t) => t.probeId === probe.id)
          const offDiag = rows.filter((r) => r.sourceModel !== r.targetModel)
          const meanOffDiag =
            offDiag.length > 0
              ? offDiag.reduce((s, r) => s + r.pearson_ce, 0) / offDiag.length
              : null
          const best = offDiag.length > 0
            ? offDiag.reduce((a, b) => (b.pearson_ce > a.pearson_ce ? b : a))
            : null
          const meanSC = meanOffDiag !== null ? scoreColor(meanOffDiag) : null
          return (
            <article key={probe.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <Link
                    href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
                    className="font-semibold tracking-tight text-base hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    {probe.name}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                  <div className="mt-1 font-mono text-[11px] text-ink-900/50 dark:text-ink-50/50 truncate">
                    {probe.id}
                  </div>
                </div>
                {meanOffDiag !== null && meanSC && (
                  <div
                    className={`rounded-lg px-3 py-1.5 ring-1 ring-inset ${meanSC.bg} ${meanSC.ring}`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 font-semibold">
                      mean ρ_CE (off-diagonal)
                    </div>
                    <div className={`font-mono font-bold text-base ${meanSC.text}`}>
                      {meanOffDiag.toFixed(3)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {rows.map((r, i) => {
                  const src = modelBy(r.sourceModel)
                  const tgt = modelBy(r.targetModel)
                  const isSelf = r.sourceModel === r.targetModel
                  return (
                    <span
                      key={`${probe.id}-${i}`}
                      title={
                        r.notes
                          ? `${r.notes}${r.transfer_auroc != null ? ` · transfer AUROC ${r.transfer_auroc.toFixed(3)}` : ''}`
                          : r.transfer_auroc != null
                            ? `transfer AUROC ${r.transfer_auroc.toFixed(3)}`
                            : undefined
                      }
                      className={`chip ring-inset font-mono ${chipStyles(r.pearson_ce)}`}
                    >
                      <span className="font-semibold">
                        {src?.shortName ?? r.sourceModel}
                      </span>
                      <span className="mx-1.5 opacity-60">→</span>
                      <span className="font-semibold">
                        {tgt?.shortName ?? r.targetModel}
                      </span>
                      <span className="ml-2 opacity-80">
                        ρ_CE={r.pearson_ce.toFixed(2)}
                        {isSelf ? ' · self' : ''}
                      </span>
                    </span>
                  )
                })}
              </div>

              {best && (
                <p className="text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                  Highest off-diagonal transfer:{' '}
                  <span className="font-medium text-ink-900/80 dark:text-ink-50/80">
                    {modelBy(best.sourceModel)?.shortName ?? best.sourceModel}
                  </span>{' '}
                  →{' '}
                  <span className="font-medium text-ink-900/80 dark:text-ink-50/80">
                    {modelBy(best.targetModel)?.shortName ?? best.targetModel}
                  </span>{' '}
                  with <code className={mathCls}>ρ_CE = {best.pearson_ce.toFixed(3)}</code>
                  {best.transfer_auroc != null ? (
                    <>
                      {' '}
                      (transfer AUROC{' '}
                      <code className={mathCls}>
                        {best.transfer_auroc.toFixed(3)}
                      </code>
                      )
                    </>
                  ) : null}
                  .
                </p>
              )}
            </article>
          )
        })}
      </div>

      {/* Anti-Goodhart */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">
        What Pearson_CE buys you (and what it doesn't)
      </h2>
      <div className="grid gap-4 md:grid-cols-2 mb-14">
        <div className="card p-5 border-amber-500/30 dark:border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold tracking-tight">
              Why we don't reward high transfer naively
            </h3>
          </div>
          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Naive Pearson on uncalibrated logits is gameable — large but parallel logit
            shifts inflate <code className={mathCls}>ρ_CE</code> without reflecting shared
            mechanism. We require <strong>token-margin normalization</strong>, a{' '}
            <strong>held-out test set</strong> (no overlap with probe training prompts),
            and <strong>≥ 3 source models</strong> before transfer can count toward
            ProbeScore. Single-pair transfers are reported but not scored.
          </p>
        </div>
        <div className="card p-5 border-rose-500/30 dark:border-rose-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-semibold tracking-tight">
              What Pearson_CE doesn't tell you
            </h3>
          </div>
          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            High <code className={mathCls}>ρ_CE</code> means equal causal effect on the
            measured downstream behavior — not necessarily on other downstream behaviors.
            Same direction, different semantics is possible: a probe that ablates
            "deception" in source and "refusal" in target can still register{' '}
            <code className={mathCls}>ρ_CE &gt; 0.7</code> if both happen to suppress the
            same logits. Probe transfer ≠ probe portability for arbitrary interventions.
          </p>
        </div>
      </div>

      {/* Citations */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">Citations</h2>
      <div className="card p-6 mb-10 space-y-4">
        <CitationRow
          authors="Lindsey, Templeton, Marcus, et al."
          year="Anthropic, 2024"
          title="Sparse Crosscoders for Cross-Layer Features and Model Diffing"
          venue="Transformer Circuits"
          href="https://transformer-circuits.pub/2024/crosscoders/index.html"
          note="Original crosscoder formulation; introduces the cosine-based decoder alignment that Pearson_CE is meant to validate causally."
        />
        <CitationRow
          authors="Vicentino"
          year="2026"
          title="Decoder Cosine vs Causal Equivalence in Cross-Model Crosscoders"
          venue="Paper-1 — notebooks 17b / 17c"
          href="https://github.com/OpenInterpretability/notebooks/tree/main/notebooks"
          note="Reproducible numbers: median cosine 0.965 vs Pearson_CE 0.616 on Gemma-2-2B base/IT BatchTopK L13. 38% overstatement of feature equivalence by cosine alone."
        />
        <CitationRow
          authors="Goldowsky-Dill, Chughtai, Heimersheim, Hobbhahn"
          year="Apollo Research, 2025"
          title="Detecting Strategic Deception Using Linear Probes"
          venue="arXiv:2502.03407"
          href="https://arxiv.org/abs/2502.03407"
          note="Cross-model deception probe transfer; one of the few public datasets with paired causal-effect evaluations."
        />
      </div>

      {/* Footer CTA */}
      <div className="card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <div className="flex items-start gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400 mt-1 shrink-0" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Submit a transfer evaluation
            </h2>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
              Run the cross-model harness on your probe → emit a YAML entry → open a PR
              against <code className={mathCls}>lib/probebench-data.ts</code>.
              Required fields:{' '}
              <code className={mathCls}>probeId</code>,{' '}
              <code className={mathCls}>sourceModel</code>,{' '}
              <code className={mathCls}>targetModel</code>,{' '}
              <code className={mathCls}>pearson_ce</code>; optional:{' '}
              <code className={mathCls}>transfer_auroc</code>,{' '}
              <code className={mathCls}>notes</code>.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/probebench/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <BookOpen className="h-4 w-4" /> Open submission spec
          </Link>
          <Link
            href="/probebench"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to ProbeBench overview
          </Link>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-3.5 w-3.5 rounded ring-1 ring-inset ${className}`}
      />
      <span className="text-ink-900/65 dark:text-ink-50/65 font-mono">{label}</span>
    </span>
  )
}

function RowFragment({
  src,
  cells,
}: {
  src: (typeof models)[number]
  cells: Array<{
    src: (typeof models)[number]
    tgt: (typeof models)[number]
    mean: number | null
    isIdentity: boolean
    contributing: typeof crossModelTransfers
  }>
}) {
  return (
    <>
      {/* row label */}
      <div className="flex flex-col justify-center pr-3 py-2 border-r border-black/5 dark:border-white/10">
        <div className="font-semibold text-sm text-ink-900/85 dark:text-ink-50/85 truncate">
          {src.shortName}
        </div>
        <div className="font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40 mt-0.5 truncate">
          {src.family} · {src.layers}L · {src.paramCount}
        </div>
      </div>

      {/* row cells */}
      {cells.map((c) => {
        const styles = cellStyles(c.mean, c.isIdentity)
        const titleLines: string[] = [`${src.shortName} → ${c.tgt.shortName}`]
        if (c.mean === null) {
          titleLines.push('No transfer evaluations on file.')
        } else {
          titleLines.push(
            `mean Pearson_CE = ${c.mean.toFixed(3)} over ${c.contributing.length} probe${
              c.contributing.length === 1 ? '' : 's'
            }`,
          )
          for (const t of c.contributing) {
            const probe = probeBy(t.probeId)
            titleLines.push(
              `  · ${probe?.shortName ?? t.probeId}: ρ_CE=${t.pearson_ce.toFixed(3)}${
                t.transfer_auroc != null ? `, AUROC=${t.transfer_auroc.toFixed(3)}` : ''
              }`,
            )
          }
        }
        return (
          <div
            key={`${src.id}->${c.tgt.id}`}
            title={titleLines.join('\n')}
            className={`relative aspect-[3/2] rounded-lg ring-1 ring-inset ${styles.bg} ${styles.ring} flex flex-col items-center justify-center text-center px-2 py-1.5 transition-transform hover:scale-[1.02]`}
          >
            <div className={`font-mono font-bold text-lg leading-none ${styles.text}`}>
              {c.mean === null ? '—' : c.mean.toFixed(2)}
            </div>
            <div
              className={`mt-1 text-[10px] uppercase tracking-wider font-semibold ${styles.text} opacity-80`}
            >
              {styles.label}
            </div>
            {c.contributing.length > 0 && (
              <div className="mt-0.5 text-[10px] font-mono text-ink-900/50 dark:text-ink-50/50">
                n={c.contributing.length}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function CitationRow({
  authors,
  year,
  title,
  venue,
  href,
  note,
}: {
  authors: string
  year: string
  title: string
  venue: string
  href: string
  note: string
}) {
  return (
    <div className="border-b border-black/5 dark:border-white/10 last:border-b-0 pb-4 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-sm font-semibold text-ink-900/85 dark:text-ink-50/85">
          {authors}
        </span>
        <span className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
          {year}
        </span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-baseline gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
      >
        {title}
        <ExternalLink className="h-3 w-3 self-center" />
      </a>
      <div className="mt-0.5 text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
        {venue}
      </div>
      <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
        {note}
      </p>
    </div>
  )
}
