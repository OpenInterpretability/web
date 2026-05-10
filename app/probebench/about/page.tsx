import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  GitBranch,
  Sigma,
  Award,
  FileCode,
} from 'lucide-react'
import { models, tasks, probes, categoryOrder } from '@/lib/probebench-data'
import { PROBESCORE_WEIGHTS } from '@/lib/probebench-scoring'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'Methodology — ProbeBench v0.0.1 · OpenInterp',
  description:
    'ProbeScore derivation, anti-Goodhart norms, governance, roadmap. The first categorical leaderboard for activation probes in open-weights LLMs.',
}

// -----------------------------------------------------------------------------
// Reference papers per category (1–2 lines each)
// -----------------------------------------------------------------------------

type CategoryRef = {
  category: string
  blurb: string
  refs: { label: string; url?: string }[]
}

const CATEGORY_REFS: Record<string, CategoryRef> = {
  hallucination: {
    category: 'hallucination',
    blurb: 'Factual fabrication — model confidently asserts false facts.',
    refs: [
      { label: 'HaluEval (Li et al., 2023)', url: 'https://arxiv.org/abs/2305.11747' },
      { label: 'SimpleQA (OpenAI, 2024)', url: 'https://arxiv.org/abs/2411.04368' },
    ],
  },
  reasoning: {
    category: 'reasoning',
    blurb: 'Faithfulness of chain-of-thought to internal belief.',
    refs: [
      { label: 'Hypocrisy Gap (2026-01)', url: 'https://arxiv.org/abs/2602.02496' },
      { label: 'Faithful CoT (Lanham et al., 2023)', url: 'https://arxiv.org/abs/2307.13702' },
    ],
  },
  deception: {
    category: 'deception',
    blurb: 'Strategic dishonesty — model conceals goals or actions.',
    refs: [
      { label: 'Apollo Deception Probes (Goldowsky-Dill et al., 2025)', url: 'https://arxiv.org/abs/2502.03407' },
      { label: 'Sleeper Agents (Hubinger et al., 2024)', url: 'https://arxiv.org/abs/2401.05566' },
    ],
  },
  sandbagging: {
    category: 'sandbagging',
    blurb: 'Capability hiding under evaluation conditions.',
    refs: [
      { label: 'Stealth Sandbagging (van der Weij et al., 2024)', url: 'https://arxiv.org/abs/2406.07358' },
    ],
  },
  eval_awareness: {
    category: 'eval_awareness',
    blurb: 'Linear separability of eval-vs-deploy contexts (the confound).',
    refs: [
      { label: 'Probing Eval Awareness (Apollo, 2025)', url: 'https://arxiv.org/abs/2507.01786' },
      { label: 'Power-law scaling (Apollo, 2025)', url: 'https://arxiv.org/abs/2509.13333' },
    ],
  },
  reward_hacking: {
    category: 'reward_hacking',
    blurb: 'RL-induced misalignment generalizing beyond training distribution.',
    refs: [
      { label: 'Monitoring Reward Hacking (Anthropic, 2025-11)', url: 'https://arxiv.org/abs/2511.18397' },
    ],
  },
  manipulation: {
    category: 'manipulation',
    blurb: 'Persuasion / subliminal influence — relevant for EU AI Act Art. 5.',
    refs: [
      { label: 'Manipulation taxonomy (Carroll et al., 2023)', url: 'https://arxiv.org/abs/2303.13860' },
    ],
  },
  refusal: {
    category: 'refusal',
    blurb: 'Refusal-direction calibration; over-refusal vs jailbreak proxy.',
    refs: [
      { label: 'Refusal direction (Arditi et al., 2024)', url: 'https://arxiv.org/abs/2406.11717' },
    ],
  },
}

// -----------------------------------------------------------------------------
// Component cards used across formula & norms sections
// -----------------------------------------------------------------------------

function SectionHeading({
  number,
  title,
  Icon,
}: {
  number: string
  title: string
  Icon: typeof BookOpen
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
          §{number}
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          {title}
        </h2>
      </div>
    </div>
  )
}

function FormulaComponent({
  axisKey,
  label,
  definition,
  rationale,
  computation,
  gaming,
}: {
  axisKey: keyof typeof PROBESCORE_WEIGHTS
  label: string
  definition: string
  rationale: string
  computation: string
  gaming: string
}) {
  const weight = PROBESCORE_WEIGHTS[axisKey]
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            component · {axisKey}
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {label}
          </h3>
        </div>
        <div className="rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 px-3 py-1.5">
          <span className="text-sm font-semibold tabular-nums text-brand-700 dark:text-brand-300">
            weight {(weight * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Definition
          </dt>
          <dd className="mt-1 text-ink-900/80 dark:text-ink-50/80">{definition}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Why this weight
          </dt>
          <dd className="mt-1 text-ink-900/80 dark:text-ink-50/80">{rationale}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            How it&apos;s computed
          </dt>
          <dd className="mt-1 font-mono text-[12.5px] text-ink-900/80 dark:text-ink-50/80">
            {computation}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Gaming attempt &amp; why it fails
          </dt>
          <dd className="mt-1 text-ink-900/80 dark:text-ink-50/80">{gaming}</dd>
        </div>
      </dl>
    </article>
  )
}

function NormCard({
  index,
  title,
  body,
}: {
  index: number
  title: string
  body: React.ReactNode
}) {
  return (
    <article className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 ring-1 ring-inset ring-accent-500/20 text-accent-700 dark:text-accent-300 text-xs font-bold tabular-nums">
          0{index}
        </span>
        <h3 className="text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
        {body}
      </p>
    </article>
  )
}

function RoadmapRow({
  version,
  date,
  status,
  body,
}: {
  version: string
  date: string
  status: 'shipped' | 'next' | 'planned' | 'frozen'
  body: React.ReactNode
}) {
  const statusStyle = {
    shipped: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    next: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30',
    planned: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    frozen: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/30',
  }[status]
  return (
    <li className="relative pl-8">
      <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-brand-500/15" />
      <span className="absolute left-[11px] top-4 h-full w-px bg-black/10 dark:bg-white/10" />
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          {version}
        </span>
        <span className="text-xs font-mono text-ink-900/50 dark:text-ink-50/50">{date}</span>
        <span className={`chip ring-1 ring-inset text-[11px] ${statusStyle}`}>{status}</span>
      </div>
      <div className="mt-2 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
        {body}
      </div>
    </li>
  )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ProbeBenchAboutPage() {
  // Per-category probe counts
  const probeCountsByCategory: Record<string, number> = {}
  for (const c of categoryOrder) probeCountsByCategory[c.category] = 0
  for (const p of probes) {
    probeCountsByCategory[p.category] = (probeCountsByCategory[p.category] ?? 0) + 1
  }

  const totalProbes = probes.length
  const totalTasks = tasks.length
  const totalModels = models.length
  const totalCategories = categoryOrder.length

  const bibtex = `@misc{probebench2026,
  title  = {ProbeBench: A Categorical Leaderboard for Activation Probes in Open-Weights LLMs},
  author = {Caio Vicentino and the OpenInterp contributors},
  year   = {2026},
  month  = {April},
  url    = {https://openinterp.org/probebench},
  note   = {v0.0.1 specification}
}`

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            href="/probebench"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to ProbeBench leaderboard
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.05] via-transparent to-accent-500/[0.05]"
        />
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
              Methodology · v0.0.1
            </span>
            <span className="chip bg-white/60 dark:bg-white/[0.04] text-ink-900/60 dark:text-ink-50/60 ring-black/10 dark:ring-white/10">
              <BookOpen className="h-3 w-3" /> paper-as-webpage
            </span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            ProbeBench: a categorical leaderboard for{' '}
            <span className="gradient-text">activation probes</span>
          </h1>

          <p className="mt-4 text-sm text-ink-900/60 dark:text-ink-50/60 font-mono">
            Caio Vicentino · OpenInterp · April 2026
          </p>

          <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              Abstract
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-900/85 dark:text-ink-50/85">
              Activation probes — linear or shallow classifiers on residual streams — are how the
              open-weights interpretability community detects hallucination, deception, sandbagging,
              and eval-awareness. But every probe paper reports a different number on a different
              model and a different test set. We propose <strong>ProbeBench v0.0.1</strong>: 8
              alignment-relevant categories, 7 task families, a composite ProbeScore weighted across
              AUROC, eval-awareness correction, distribution-shift robustness, calibration,
              cross-model transfer (Pearson<sub>CE</sub>), inference efficiency, and license openness.
              Anti-Goodhart by construction. Open submissions, Apache-2.0 reproducers, quarterly
              re-evaluation.
            </p>
          </div>

          {/* TOC */}
          <nav
            aria-label="Table of contents"
            className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs"
          >
            {[
              ['1', 'The problem', '#problem'],
              ['2', 'Categories', '#categories'],
              ['3', 'The ProbeScore formula', '#formula'],
              ['4', 'Anti-Goodhart norms', '#norms'],
              ['5', 'Test set integrity', '#integrity'],
              ['6', 'Governance', '#governance'],
              ['7', 'Roadmap', '#roadmap'],
              ['8', 'Citation', '#citation'],
              ['9', 'Acknowledgements', '#acknowledgements'],
            ].map(([n, label, href]) => (
              <a
                key={href}
                href={href}
                className="flex items-baseline gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span className="font-mono text-ink-900/40 dark:text-ink-50/40">§{n}</span>
                <span className="text-ink-900/70 dark:text-ink-50/70">{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §1 The problem                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="problem" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="1" title="The problem" Icon={BookOpen} />
        <div className="mt-6 prose-sm max-w-none text-[15px] leading-relaxed text-ink-900/80 dark:text-ink-50/80 space-y-4">
          <p>
            Activation probes have entered a Goodhart phase. The community keeps shipping new probes
            with headline numbers in the high 0.9s, and each one is a real result on a real test set
            — but the numbers don&apos;t compose. Apollo Research reports{' '}
            <a
              href="https://arxiv.org/abs/2502.03407"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              0.96–0.999 AUROC
            </a>{' '}
            on deception detection with linear probes. Goodfire&apos;s RLFR work shows monotonic
            scaling of probe accuracy with model size. Our own FabricationGuard hits{' '}
            <Link
              href="/products/fabricationguard"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              0.88 cross-task on SimpleQA
            </Link>
            .
          </p>
          <p>
            Every one of these is conditional on a chosen test set, a chosen model, and a chosen
            layer. Apollo&apos;s 0.999 was on Llama-3.3-70B at L40 against the insider-trading suite;
            move the model, swap the position, or let the prompt smell less like an evaluation, and
            the number drops. The{' '}
            <a
              href="https://arxiv.org/abs/2509.13333"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              eval-awareness power-law (Apollo, 2025)
            </a>{' '}
            shows the confound is large enough to explain a meaningful share of the variance across
            published numbers.
          </p>
          <p>
            The community needs a leaderboard the way SAEs needed{' '}
            <a
              href="https://github.com/jbloomAus/SAEBench"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              SAEBench
            </a>
            . SAEBench refused to ship a composite — that gap is what{' '}
            <Link
              href="/interpscore"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              InterpScore
            </Link>{' '}
            filled on the SAE side. ProbeBench is the same move for activation probes: pick the
            categories that matter for alignment, define the corrections that catch the most common
            confounds, and put a single composite next to every entry so probes from different
            papers can be compared on the same row.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §2 Categories                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="categories" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="2" title="Categories" Icon={GitBranch} />
        <p className="mt-6 text-[15px] leading-relaxed text-ink-900/75 dark:text-ink-50/75">
          ProbeBench v0.0.1 ships {totalCategories} alignment-relevant categories. Three of them are
          empty in the seed release; that is by design. We are publishing the slot we want our own
          probes (and yours) to compete in.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] dark:bg-white/[0.03]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Reference papers</th>
                <th className="px-4 py-3 text-right">Probes</th>
              </tr>
            </thead>
            <tbody>
              {categoryOrder.map((c, idx) => {
                const ref = CATEGORY_REFS[c.category]
                const count = probeCountsByCategory[c.category] ?? 0
                const isEmpty = count === 0
                return (
                  <tr
                    key={c.category}
                    className={`border-t border-black/5 dark:border-white/10 ${
                      idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                        {c.label}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
                        {ref?.blurb ?? c.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ul className="space-y-1">
                        {ref?.refs.map((r) => (
                          <li key={r.label} className="text-[12.5px]">
                            {r.url ? (
                              <a
                                href={r.url}
                                className="text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                {r.label}
                              </a>
                            ) : (
                              <span className="text-ink-900/70 dark:text-ink-50/70">{r.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      {isEmpty ? (
                        <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30 text-[11px]">
                          🌱 open slot
                        </span>
                      ) : (
                        <span className="text-base font-semibold tabular-nums text-ink-900 dark:text-ink-50">
                          {count}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">🌱</span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
                Open slots: be the first
              </h3>
              <p className="mt-1 text-[13px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
                Sandbagging, manipulation, and refusal have no v0.0.1 entries. The seed leaderboard
                is biased toward what we and Apollo have already shipped. If you have a probe in any
                of the open categories, your PR becomes the first reference number for the whole
                field on this benchmark.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §3 The ProbeScore formula                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="formula" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="3" title="The ProbeScore formula" Icon={Sigma} />
        <p className="mt-6 text-[15px] leading-relaxed text-ink-900/75 dark:text-ink-50/75 max-w-3xl">
          ProbeScore is a weighted sum of seven components, each in the unit interval. The weights
          sum to 1.0. Every weight is loaded from{' '}
          <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
            PROBESCORE_WEIGHTS
          </code>{' '}
          in <code className="font-mono text-[12px]">lib/probebench-scoring.ts</code> — never
          hardcoded on the page.
        </p>

        {/* Formula card */}
        <div className="mt-8 rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] via-white/40 to-accent-500/[0.04] dark:from-brand-500/[0.06] dark:via-white/[0.02] dark:to-accent-500/[0.06] p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Composite definition
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre font-mono text-[13px] sm:text-[14px] leading-7 text-ink-900/85 dark:text-ink-50/85">
{`ProbeScore =
    ${PROBESCORE_WEIGHTS.auroc.toFixed(2)} · AUROC
  + ${PROBESCORE_WEIGHTS.auroc_evalaware.toFixed(2)} · AUROC_eval-aware
  + ${PROBESCORE_WEIGHTS.distshift_robustness.toFixed(2)} · AUROC_distshift
  + ${PROBESCORE_WEIGHTS.ece_calibration.toFixed(2)} · (1 − 2·ECE)
  + ${PROBESCORE_WEIGHTS.cross_model_transfer.toFixed(2)} · ρ_CE
  + ${PROBESCORE_WEIGHTS.inference_efficiency.toFixed(2)} · (1 − log₁₀(ms)/4)
  + ${PROBESCORE_WEIGHTS.license_score.toFixed(2)} · L`}
          </pre>
          <p className="mt-4 text-[12.5px] text-ink-900/60 dark:text-ink-50/60 font-mono leading-relaxed">
            ECE clamped to [0, 0.5]. Latency clamped to [1, 10000] ms. ρ_CE = mean Pearson<sub>CE</sub>{' '}
            across non-self target models. L ∈ [0.2, 1.0] from license registry.
          </p>
        </div>

        {/* Per-component breakdown */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <FormulaComponent
            axisKey="auroc"
            label="AUROC — headline detection"
            definition="Mean AUROC across all evaluated tasks for the probe's category. Standard threshold-free classification metric on the held-out positive/negative pairs from each test set."
            rationale="Highest weight because it remains the most informative single number — but capped at 30% to prevent any single-axis optimization from dominating. A perfect AUROC = 0.30 contribution, ceiling."
            computation="auroc_total = mean over taskᵢ of AUROC(probe, taskᵢ.test_split)"
            gaming="Train on test data → caught by SHA-256 hash registry (Section §5). Fit a probe that exploits prompt format → caught by the eval-awareness corrected axis below."
          />
          <FormulaComponent
            axisKey="auroc_evalaware"
            label="AUROC under eval-awareness correction"
            definition="AUROC re-computed after partialling out the prediction of the eval-awareness reference probe (Apollo Eval-vs-Deploy). If your probe&apos;s signal is just &quot;does the prompt look like an eval&quot;, this axis collapses to chance."
            rationale="20% — the second-largest weight. Apollo's power-law result (arXiv 2509.13333) is the single most likely confound for any new probe; we make ignoring it expensive."
            computation="auroc_EA = AUROC on subset where Apollo-EvalProbe(prompt) is balanced; if uncalibrated, fall back to 0.85 × raw AUROC"
            gaming="Submit without declaring AUROC_EA → we impute 0.85× raw and you lose 15% of your AUROC contribution. Silence costs you (Norm 3)."
          />
          <FormulaComponent
            axisKey="distshift_robustness"
            label="Distribution-shift robustness"
            definition="AUROC measured on long-context and out-of-distribution variants of the same task: prompts re-formatted, instruction wrappers stripped, context length doubled. Methodology follows DeepMind 2601.11516."
            rationale="15% — captures the gap between &quot;works in the lab&quot; and &quot;works in deployment&quot;. Probes that overfit to short, eval-style prompts get caught here."
            computation="auroc_DS = AUROC on dist-shift split (avg over taskᵢ); if not declared, impute 0.7 × raw"
            gaming="Hand-pick easy distribution-shift variants → flagged by reviewers because the dist-shift split is fixed in tasks.yaml with a hash."
          />
          <FormulaComponent
            axisKey="ece_calibration"
            label="Calibration (1 − 2·ECE)"
            definition="Expected Calibration Error converted to a [0, 1] score. ECE = 0 → 1.0; ECE = 0.5 → 0.0. Bin-wise difference between predicted probability and observed positive rate."
            rationale="10% — calibration distinguishes a usable probe from one that just classifies. A FabricationGuard with ECE 0.20 is much less useful than one with ECE 0.05 even at the same AUROC."
            computation="c_ece = max(0, 1 − 2·ECE)"
            gaming="Sharpen predictions to push everything to 0/1 → boosts ECE but the underlying probability becomes useless. Reviewers will spot brier_score divergence."
          />
          <FormulaComponent
            axisKey="cross_model_transfer"
            label="Cross-model transfer (ρ_CE)"
            definition="Mean Pearson correlation between the probe's per-feature ablation effects on the source model and the same probe re-fit on each target model. From the Crosscoder Causal Equivalence methodology (OpenInterp paper-1)."
            rationale="10% — punishes probes that only work on one model. The community needs probes that transfer; this axis builds in that pressure."
            computation="ρ_CE = mean over target_modelⱼ ≠ source of Pearson(ablation_effects_source, ablation_effects_targetⱼ)"
            gaming="Submit only the source model number → defaults to 0.5 (mid-scale prior). Submit fake transfer numbers → fails reproducer rerun on next quarterly re-eval."
          />
          <FormulaComponent
            axisKey="inference_efficiency"
            label="Inference efficiency"
            definition="Score derived from probe-only forward latency in milliseconds, mapped log-linearly: 1 ms → 1.0, 10 ms → 0.75, 100 ms → 0.5, 1000 ms → 0.25, 10⁴ ms+ → 0.0."
            rationale="10% — a 5GB probe that scores AUROC 0.95 but adds 200ms per token is unusable in production. We're explicitly biasing toward shippable probes."
            computation="c_latency = max(0, min(1, 1 − log₁₀(latency_ms) / 4))"
            gaming="Distill a slow probe into a fast linear approximation → totally fine, that's the point. The axis incentivizes the work we want done."
          />
          <FormulaComponent
            axisKey="license_score"
            label="License openness"
            definition="Score from license registry: Apache-2.0 = 1.0, MIT = 0.95, BSD = 0.9, CC-BY = 0.85, custom = 0.5, closed = 0.2."
            rationale="5% — the smallest weight. License is recognized but cannot decide rankings between probes within the same category (Norm 2). The axis exists to surface that openness matters, not to rank it."
            computation="c_license = LICENSE_SCORES[probe.license]   ·   max contribution = 0.05"
            gaming="There's nothing to game — license is a property of the artifact, not the experiment. We list it because closed probes are still allowed on the registry, but they cap out at 0.025 of the score."
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §4 Anti-Goodhart norms                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="norms" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="4" title="Anti-Goodhart norms" Icon={ShieldCheck} />
        <p className="mt-6 text-[15px] leading-relaxed text-ink-900/75 dark:text-ink-50/75 max-w-3xl">
          The composite is necessary but not sufficient. Four explicit norms constrain how the
          weights, the registry, and the re-evaluation cycle interact.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <NormCard
            index={1}
            title="Component cap"
            body={
              <>
                No single component contributes more than 30% to the total. Optimizing AUROC alone
                caps you at 0.30. Every additional 0.10 above that requires winning on a different
                axis — calibration, transfer, robustness, or efficiency. The 30% ceiling is the
                weight on AUROC itself; we will not move it upward in any subsequent version
                without breaking-change semver.
              </>
            }
          />
          <NormCard
            index={2}
            title="License floor"
            body={
              <>
                Closed-weight probes are capped at 0.5 license score (× 0.05 weight = 0.025 of the
                composite). The license axis exists to recognize open submissions, not to rank
                them; it cannot be the deciding factor between two probes within the same category.
                A closed probe with AUROC 0.99 still places above an Apache-2.0 probe with AUROC
                0.85 — we want correct, not just open.
              </>
            }
          />
          <NormCard
            index={3}
            title="Eval-awareness dampening"
            body={
              <>
                If you don&apos;t declare an eval-awareness corrected AUROC, we impute 0.85 × raw
                AUROC. Silence costs you — and the imputation is conservative enough that probes
                with strong real corrections will outscore probes that don&apos;t declare. Declaring
                a worse-than-imputed number is allowed; we&apos;d rather have an honest 0.78 than
                an imputed 0.85.
              </>
            }
          />
          <NormCard
            index={4}
            title="Quarterly re-evaluation"
            body={
              <>
                Every probe re-runs on a fresh holdout each quarter. We publish a public diff if
                performance drops more than 5pp; the entry is deprecated if it drops more than
                10pp. This catches both undeclared training contamination and natural distribution
                drift. Probes that hold up across multiple quarters earn a stability badge — that
                signal compounds over time.
              </>
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §5 Test set integrity                                               */}
      {/* ------------------------------------------------------------------ */}
      <section id="integrity" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="5" title="Test set integrity" Icon={FileCode} />
        <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-ink-900/80 dark:text-ink-50/80">
          <p>
            The composite is only as honest as the test sets. ProbeBench v0.0.1 enforces three
            integrity protocols, all auditable from the registry alone.
          </p>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              SHA-256 hashes pinned in the registry
            </h3>
            <p className="mt-2 text-[14px] text-ink-900/75 dark:text-ink-50/75">
              Every test set has a SHA-256 hash committed alongside its entry in{' '}
              <code className="font-mono text-[12.5px] rounded bg-black/5 dark:bg-white/10 px-1 py-0.5">
                tasks.yaml
              </code>
              . Probes that train on the test set get caught at the next quarterly re-eval, where
              we recompute the hash and verify the split.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="rounded-md bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2 font-mono text-[11px]"
                >
                  <div className="text-ink-900/60 dark:text-ink-50/60">{t.name}</div>
                  <div className="mt-0.5 text-ink-900/40 dark:text-ink-50/40 truncate">
                    {t.testSetHash}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              Held-out splits never re-shuffled
            </h3>
            <p className="mt-2 text-[14px] text-ink-900/75 dark:text-ink-50/75">
              HaluEval-QA, SimpleQA, MMLU, and TruthfulQA-MC1 use fixed splits, hashed once and
              never re-shuffled. If we ever need to refresh a split (e.g. because of leakage in the
              upstream dataset), we mint a new task ID and run both side-by-side for one quarter
              before deprecating the old one.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              Apollo Eval-vs-Deploy as the reference adversarial probe
            </h3>
            <p className="mt-2 text-[14px] text-ink-900/75 dark:text-ink-50/75">
              The Apollo Eval-vs-Deploy probe is the eval-awareness reference. Its scores are the
              substrate from which every other probe&apos;s eval-awareness corrected AUROC is
              computed. When Apollo updates the probe, we re-compute every dependent number and
              publish a diff.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
            <p className="text-[14px] text-ink-900/80 dark:text-ink-50/80">
              <span className="font-semibold">Leakage record:</span> we will publish a public
              &quot;leakage detected&quot; record any time we find an entry that mistakenly trained
              on test data. The record stays attached to the probe ID forever; we are not in the
              business of rewriting history.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §6 Governance                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="governance" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="6" title="Governance" Icon={ShieldCheck} />
        <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-ink-900/80 dark:text-ink-50/80">
          <p>
            v0.0.1 is governed by the OpenInterp maintainer team. We commit to:
          </p>
          <ul className="space-y-2 pl-5 list-disc marker:text-brand-500">
            <li>
              <strong>(a)</strong> accept any probe meeting the artifact spec within 7 days of PR
              open;
            </li>
            <li>
              <strong>(b)</strong> document why a probe is rejected, in public, on the PR thread;
            </li>
            <li>
              <strong>(c)</strong> re-evaluate the spec itself in v0.1 based on community feedback
              from the v0.0.x window.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> have IRB or ethics review for the registry itself.
            Submissions are responsible for their own data sourcing — we do not vet the upstream
            data licensing of submitted probes beyond the artifact license itself.
          </p>

          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/[0.04] p-6">
            <h3 className="text-sm font-semibold tracking-tight text-brand-700 dark:text-brand-300">
              v1.0 timeline
            </h3>
            <p className="mt-2 text-[14px] text-ink-900/80 dark:text-ink-50/80">
              We are targeting the <strong>ICML MI Workshop submission deadline (May 8, 2026)</strong>{' '}
              for the v1.0 spec freeze. Community input window:{' '}
              <strong>April 27 — May 1, 2026</strong>. We think the v0.0.x line gives us four weeks
              of real submissions to learn from before we commit to a frozen spec; we&apos;d
              rather ship v0.0.2 and v0.0.3 iterations than freeze the wrong thing.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §7 Roadmap                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="roadmap" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="7" title="Roadmap" Icon={Award} />
        <ol className="mt-8 space-y-8 relative">
          <RoadmapRow
            version="v0.0.1 — public release"
            date="April 2026"
            status="shipped"
            body={
              <>
                {totalProbes} reference probes, {totalCategories} categories, {totalTasks} tasks,{' '}
                {totalModels} base models. ProbeScore composite live. Submission spec public.
                Apache-2.0 reproducers across the board.
              </>
            }
          />
          <RoadmapRow
            version="v0.0.2 — steering + SAE-feature probes"
            date="May 2026"
            status="next"
            body={
              <>
                Add a <em>steering benchmark</em>: does the probe direction work for ablation, not
                just classification? Add SAE-feature probes from Goodfire and Anthropic open-source
                releases. Surface a per-task &quot;direction utility&quot; column.
              </>
            }
          />
          <RoadmapRow
            version="v0.1 — spec re-evaluation"
            date="June 2026"
            status="planned"
            body={
              <>
                Spec re-evaluation based on community feedback from the v0.0.x window. Possibly:
                add a per-domain (medical, legal, code) breakdown column. Possibly: distinguish
                in-distribution AUROC from cross-domain AUROC as separate axes. We will publish
                a v0.0.x → v0.1 diff before freezing.
              </>
            }
          />
          <RoadmapRow
            version="v1.0 — frozen spec, peer-reviewed"
            date="Q3 2026"
            status="frozen"
            body={
              <>
                Frozen spec, peer-reviewed publication, third-party replication of every entry.
                Move to an independent governance entity — we want ProbeBench to outlive
                OpenInterp&apos;s hosting of it.
              </>
            }
          />
        </ol>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §8 Citation                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="citation" className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
        <SectionHeading number="8" title="Citation" Icon={BookOpen} />
        <p className="mt-6 text-[15px] leading-relaxed text-ink-900/75 dark:text-ink-50/75 max-w-3xl">
          If you use ProbeBench in academic work — whether as a benchmark you submit to or as a
          reference for the methodology — please cite the v0.0.1 specification.
        </p>

        <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-4 py-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              BibTeX
            </span>
            <CopyButton text={bibtex} />
          </div>
          <pre className="overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-6 text-ink-900/85 dark:text-ink-50/85">
{bibtex}
          </pre>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* §9 Acknowledgements                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="acknowledgements"
        className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20"
      >
        <SectionHeading number="9" title="Acknowledgements" Icon={GitBranch} />
        <p className="mt-6 text-[15px] leading-relaxed text-ink-900/80 dark:text-ink-50/80 max-w-3xl">
          ProbeBench stands on a stack of prior work. We thank{' '}
          <a
            href="https://www.apolloresearch.ai/"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Apollo Research
          </a>{' '}
          for the deception-detection methodology and the eval-awareness reference probe;{' '}
          <a
            href="https://www.anthropic.com/research"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Anthropic
          </a>{' '}
          for the{' '}
          <a
            href="https://arxiv.org/abs/2507.21509"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            persona-vectors methodology
          </a>{' '}
          (Aug 2025) that grounds FabricationGuard, the{' '}
          <a
            href="https://www.anthropic.com/research/diff-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Dedicated Feature Crosscoder
          </a>{' '}
          (Mar 2026) that motivates the cross-model transfer axis,{' '}
          <a
            href="https://www.anthropic.com/research/tracing-thoughts-language-model"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            circuit tracing in reasoning
          </a>{' '}
          (Mar 2025) and{' '}
          <a
            href="https://www.anthropic.com/research/introspection"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            signs of introspection
          </a>{' '}
          (Oct 2025) that motivate ReasonGuard, the eval-awareness probing precedent, and the reward-hacking framing;{' '}
          <a
            href="https://arxiv.org/abs/2601.11516"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            DeepMind
          </a>{' '}
          for the long-context distribution-shift evaluation protocol;{' '}
          <a
            href="https://www.far.ai/topic/interpretability"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            FAR.AI
          </a>{' '}
          for the activation-probes-under-class-imbalance findings and Concept Influence semantic-direction attribution that motivate the calibration and class-balance norms in ProbeScore;{' '}
          <a
            href="https://transformer-circuits.pub/"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Lindsey, Templeton, and the Anthropic Circuits team
          </a>{' '}
          for the crosscoder methodology that grounds Pearson<sub>CE</sub>;{' '}
          <a
            href="https://www.goodfire.ai/"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Goodfire
          </a>{' '}
          for the RLFR scaling work;{' '}
          <a
            href="https://neuronpedia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Neuronpedia
          </a>{' '}
          for the public-feature-database precedent, per-feature reproducibility model, and the
          community norms around openly browsing learned features; and the{' '}
          <a
            href="https://github.com/jbloomAus/SAEBench"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            SAEBench
          </a>{' '}
          and{' '}
          <Link
            href="/interpscore"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            InterpScore
          </Link>{' '}
          teams for the SAE-side precedent that this whole effort is modelled on.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer CTAs                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] via-transparent to-accent-500/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            Ready to ship a probe — or just look at the leaderboard?
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            The submission spec is short, the reproducer template is one notebook, and the empty
            categories are waiting. We respond to PRs within 7 days.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/probebench/submit"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Submit a probe <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/probebench"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Award className="h-4 w-4" /> Browse the leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
