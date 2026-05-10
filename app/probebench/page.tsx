import Link from 'next/link'
import {
  ArrowRight,
  Award,
  ShieldCheck,
  GitBranch,
  Telescope,
  FileCode,
  Microscope,
  ShieldAlert,
  ScrollText,
  Sparkles,
  Terminal,
} from 'lucide-react'
import {
  rankedProbes,
  tasks,
  probes,
  models,
  categoryOrder,
} from '@/lib/probebench-data'
import { PROBESCORE_WEIGHTS } from '@/lib/probebench-scoring'
import { LeaderboardTable } from '@/components/probebench/leaderboard-table'

export const metadata = {
  title: 'ProbeBench v0.0.1 — Activation Probe Leaderboard · OpenInterp',
  description:
    'Categorical standardization for hallucination, deception, sandbagging, eval-awareness, reward-hacking probes. Cross-model Pearson_CE transfer. Eval-awareness corrected AUROC. Apache-2.0 reproducers.',
}

const PROBESCORE_VERSION = 'v0.0.1'

// Component-axis labels mirroring score-bar.tsx ordering
const AXIS_LABELS: Array<{
  key: keyof typeof PROBESCORE_WEIGHTS
  label: string
  blurb: string
  dot: string
}> = [
  { key: 'auroc',                label: 'AUROC',           blurb: 'headline detection accuracy',       dot: 'bg-brand-500' },
  { key: 'auroc_evalaware',      label: 'Eval-aware',      blurb: 'confound-corrected AUROC',          dot: 'bg-accent-500' },
  { key: 'distshift_robustness', label: 'Dist-shift',      blurb: 'long-context / OOD generalization', dot: 'bg-violet-500' },
  { key: 'ece_calibration',      label: 'Calibration',     blurb: 'expected calibration error',        dot: 'bg-emerald-500' },
  { key: 'cross_model_transfer', label: 'Transfer',        blurb: 'Pearson_CE across models',          dot: 'bg-amber-500' },
  { key: 'inference_efficiency', label: 'Latency',         blurb: '1 / log(latency_ms)',               dot: 'bg-rose-500' },
  { key: 'license_score',        label: 'License',         blurb: 'openness · commercial-friendliness', dot: 'bg-slate-500' },
]

function StatCard({ value, label, hint }: { value: number | string; label: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums gradient-text">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
        {label}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  )
}

function WhyCard({
  Icon, title, body,
}: { Icon: typeof ShieldAlert; title: string; body: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
        {body}
      </p>
    </article>
  )
}

function MethodologyChip({
  axis,
}: { axis: typeof AXIS_LABELS[number] }) {
  const weight = PROBESCORE_WEIGHTS[axis.key]
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-sm ${axis.dot}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/70 dark:text-ink-50/70">
          {axis.label}
        </span>
        <span className="ml-auto text-sm font-semibold tabular-nums text-brand-600 dark:text-brand-400">
          {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-1 text-[11px] text-ink-900/50 dark:text-ink-50/50 leading-relaxed">
        {axis.blurb}
      </div>
    </div>
  )
}

export default function ProbeBenchPage() {
  const ranked = rankedProbes()
  const totalProbes = probes.length
  const totalCategories = categoryOrder.length
  const totalTasks = tasks.length
  const totalModels = models.length
  const totalEvals = ranked.reduce((s, r) => s + r.evals.length, 0)

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.06] via-transparent to-accent-500/[0.06]"
        />
        <div
          aria-hidden
          className="absolute -top-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
              ProbeBench {PROBESCORE_VERSION} · Open Standard
            </span>
            <span className="chip bg-accent-500/10 text-accent-700 dark:text-accent-300 ring-accent-500/30">
              Apache-2.0 reproducers
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
            The first categorical leaderboard for{' '}
            <span className="gradient-text">activation probes</span>.
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            Eight alignment-relevant categories. Seven axes weighted into a single ProbeScore.
            Every entry ships with a Colab reproducer, an SHA-256-hashed test set, and Pearson_CE
            cross-model transfer numbers. We are publishing the slot we want our own probes to compete in.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
            <Terminal className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            New: every probe here is now <Link href="/mcp" className="font-medium text-brand-600 dark:text-brand-400 underline-offset-2 hover:underline">agent-callable via openinterp-mcp</Link> — any Claude Code / Cursor / Cline session can score or audit a probe against your own Colab compute.
          </p>

          {/* Stat cards */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard value={totalProbes} label="Probes registered" hint="seed entries · open to community PRs" />
            <StatCard value={totalCategories} label="Categories" hint="hallucination → reward-hacking" />
            <StatCard value={totalTasks} label="Tasks evaluated" hint="hashed test sets · anti-contamination" />
            <StatCard value={totalEvals} label="Eval cells" hint={`across ${totalModels} base models`} />
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/probebench/submit"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Submit a probe <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/probebench/about"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ScrollText className="h-4 w-4" /> Methodology
            </Link>
            <span className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
              ProbeScore weights are versioned · PR a different set, we mint v0.0.2
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Why this exists                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Why this exists</h2>
          <p className="mt-2 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Probing the residual stream is one of the most reproducible interpretability primitives
            we have — and one of the easiest to mis-report. ProbeScore composes the three corrections
            most likely to surface the difference between a real probe and a confound.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <WhyCard
            Icon={ShieldAlert}
            title="Single AUROC is not enough"
            body={
              <>
                Published probes hit 0.96+ on Apollo deception suites, but break under long-context
                distribution shift (DeepMind 2601.11516) and inflate when test prompts trigger
                eval-awareness (arXiv 2509.13333). ProbeScore composites both corrections so the
                headline number is harder to oversell.
              </>
            }
          />
          <WhyCard
            Icon={GitBranch}
            title="Probes don't transfer for free"
            body={
              <>
                Naive cosine alignment misses 38% of causal direction across crosscoders. Pearson_CE,
                the paired-ablation correlation between source and target models, is the honest
                transfer metric. Every cross-model entry on this page ships one.
              </>
            }
          />
          <WhyCard
            Icon={ShieldCheck}
            title="Anti-Goodhart by construction"
            body={
              <>
                No axis weighted above 30%. License score capped for closed-weight probes.
                Eval-awareness component dampens when calibration is missing. Hard to game by
                optimizing one number, easy to PR if you disagree with the weights.
              </>
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Global leaderboard                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Global Leaderboard
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Sorted by ProbeScore across all {totalCategories} categories. Click any row for the
              full Probe DNA card — eval table, Pearson_CE matrix, license, artifact hash.
            </p>
          </div>
          <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
            {ranked.length} entries · ProbeScore {PROBESCORE_VERSION}
          </div>
        </div>

        <LeaderboardTable rows={ranked} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Per-category leaderboards                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Telescope className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">By category</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Each alignment-relevant slot has its own table, its own held-out test set, and its own
            empty rows for probes that haven't been submitted yet.
          </p>
        </div>

        <div className="space-y-12">
          {categoryOrder.map(({ category, label, description }) => {
            const rows = ranked.filter(r => r.probe.category === category)
            const taskCount = tasks.filter(t => t.category === category).length
            return (
              <div key={category}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                      {label}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-accent-500/10 text-accent-700 dark:text-accent-300 ring-accent-500/30">
                      {taskCount} task{taskCount === 1 ? '' : 's'}
                    </span>
                    <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
                      {rows.length} probe{rows.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {rows.length > 0 ? (
                  <LeaderboardTable rows={rows} showCategory={false} />
                ) : (
                  <Link
                    href="/probebench/submit"
                    className="group block rounded-2xl border border-dashed border-black/15 dark:border-white/15 px-8 py-10 text-center transition-colors hover:border-brand-500/50 hover:bg-brand-500/[0.04]"
                  >
                    <div className="text-2xl">🌱</div>
                    <div className="mt-2 text-sm font-semibold text-ink-900 dark:text-ink-50">
                      Slot open · be the first to submit
                    </div>
                    <div className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60">
                      No probe registered for{' '}
                      <span className="font-mono">{label.toLowerCase()}</span> yet. PR an artifact
                      + reproducer notebook to claim row 1.
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
                      Open the submission template <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Methodology strip                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-accent-500/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-xl font-semibold tracking-tight">ProbeScore axes</h2>
            </div>
            <div className="text-[11px] font-mono text-ink-900/50 dark:text-ink-50/50">
              Weights {PROBESCORE_VERSION} · subject to community revision
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Seven axes, each in [0, 1], weighted to sum to 1.0. We report every component alongside
            the headline score so you can re-aggregate with your own weights.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {AXIS_LABELS.map(axis => (
              <MethodologyChip key={axis.key} axis={axis} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/probebench/about"
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
            >
              Read the full methodology <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-ink-900/40 dark:text-ink-50/40">·</span>
            <span className="text-ink-900/60 dark:text-ink-50/60 font-mono">
              No axis &gt; 30% weight · license bounded · eval-awareness dampening
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Applications                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/20">
                Vertical · CZI Biohub $500M (Apr 29)
              </span>
              <h2 className="text-xl font-semibold tracking-tight">Applications</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Where these probes apply in practice. CZI Biohub committed $500M to AI-biology on Apr 29 2026 — medical AI is the most urgent vertical for fabrication detection.
          </p>
          <div className="mt-5">
            <Link
              href="/probebench/applications/medical-ai"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
            >
              ProbeBench × Medical AI <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer CTA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Submit a probe */}
          <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Submit your probe</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Two paths — pick whichever fits your workflow. Both end in the same place:
              a sklearn-compatible artifact + hashed test set + Colab reproducer registered on the
              leaderboard.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-ink-900/60 dark:text-ink-50/60">
              <li>· <strong>GitHub PR</strong> — open a PR with the artifact + spec_version <code className="font-mono">{PROBESCORE_VERSION.replace('v', '')}</code></li>
              <li>· <strong>Agent-callable</strong> — <code className="font-mono">openinterp-mcp</code> &gt; <code className="font-mono">publish_probe()</code> auto-opens the PR + mints a Zenodo DOI + creates an HF dataset</li>
              <li>· <code className="font-mono">predict_proba(X) -&gt; (n, 2)</code> + <code className="font-mono">StandardScaler</code> + metadata block</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/probebench/submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Open submission template <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-2 text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <Terminal className="h-3.5 w-3.5" /> Submit via your agent
              </Link>
              <Link
                href="/probebench/about"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Artifact spec
              </Link>
            </div>
          </article>

          {/* Run the SDK */}
          <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 ring-1 ring-inset ring-accent-500/20 text-accent-700 dark:text-accent-300">
              <FileCode className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Score a probe</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Two ways to score: the Python SDK (deterministic, no GPU needed for evaluation
              metadata) or the MCP server (agent runs the full eval suite against your own Colab
              compute, returns a ProbeScore card identical to the leaderboard).
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                  Python SDK
                </div>
                <pre className="rounded-lg bg-ink-950 text-ink-50 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`pip install -U openinterp

from openinterp import probebench
probe = probebench.load("openinterp/fabricationguard-qwen36-27b-l31-v2")
print(probebench.score(probe))`}
                </pre>
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Via your agent — openinterp-mcp
                </div>
                <pre className="rounded-lg bg-ink-950 text-emerald-200 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`# in Claude Code / Cursor / Cline session:
/colab-attach https://abc123.ngrok-free.app
> score probebench:openinterp/fabricationguard-qwen36-27b-l31-v2
  on tasks: haluval-qa, simpleqa`}
                </pre>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/mcp"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <Terminal className="h-3.5 w-3.5" /> MCP architecture <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                SDK reference
              </Link>
              <a
                href="https://pypi.org/project/openinterp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                PyPI
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
