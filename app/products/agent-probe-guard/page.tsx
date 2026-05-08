import Link from 'next/link'
import {
  ArrowRight,
  Check,
  X,
  Github,
  Package,
  Zap,
  ShieldCheck,
  GitBranch,
  Activity,
  Layers,
  ExternalLink,
  Cpu,
  FlaskConical,
  Eye,
  AlertTriangle,
  Trophy,
  Gauge,
  Forward,
  Ban,
  CircuitBoard,
} from 'lucide-react'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'agent-probe-guard — Mid-reasoning detection for code agents · OpenInterp',
  description:
    'Two-probe activation gate for LLM-based code agents. Predict trace success before tools fire. AUROC 0.85 capability + 0.85 thinking-intent at K=10/K=5. Apache-2.0. pip install openinterp.',
}

const HF_DATASET = 'https://huggingface.co/datasets/caiovicentino1/agent-probe-guard-qwen36-27b'
const PYPI_URL = 'https://pypi.org/project/openinterp/'
const GITHUB_RELEASE = 'https://github.com/OpenInterpretability/cli/releases/tag/v0.3.0'
const GITHUB_REPO = 'https://github.com/OpenInterpretability/cli'
const SWEBENCH_REPO = 'https://github.com/OpenInterpretability/openinterp-swebench-harness'
const PAPER_DRAFT = 'https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/two_forms_epiphenomenal_probes_neurips_mi_2026.md'
const EVAL_V6 = 'https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/preflight_probe_eval_v6_phase8_template_lock.md'

const installCmd = 'pip install --upgrade "openinterp[full]"'

// -----------------------------------------------------------------------------
// Numbers — see paper/preflight_probe_eval_v6 (2026-05-08)
// -----------------------------------------------------------------------------
const probeMetrics = [
  {
    name: 'L43 pre_tool — capability',
    auroc: 0.83,
    randomBaseline: 0.66,
    gap: '+0.17',
    n: 54,
    capacity: 'K=10',
    method: 'PCA-10 + LR',
    note: 'Phase 6c methodology sweep',
    status: 'live',
  },
  {
    name: 'L55 pre_response — suppressed CoT intent',
    auroc: 0.848,
    randomBaseline: 0.701,
    gap: '+0.147',
    n: 240,
    capacity: 'K=5',
    method: 'top-K diff-of-means',
    note: 'Phase 8 redux random-K-matched',
    status: 'live',
  },
] as const

const modes = [
  {
    icon: Ban,
    label: 'skip',
    color: 'red',
    threshold: 'capability < 0.20',
    desc: 'High failure risk. Abort the trace before tools fire. Reformulate the query or surface to user.',
  },
  {
    icon: Forward,
    label: 'escalate',
    color: 'amber',
    threshold: '0.20 ≤ capability < 0.50',
    desc: 'Moderate risk. Route to a stronger model (Claude Sonnet, GPT-5) or human review. Save the cheap call.',
  },
  {
    icon: Check,
    label: 'proceed',
    color: 'green',
    threshold: 'capability ≥ 0.50',
    desc: 'Run the agent normally. ~0 overhead beyond the single forward pass that captured the residual.',
  },
] as const

const competitors = [
  { name: 'LangSmith Eval',         scope: 'post-hoc traces',     latency: '—',         open: false, mid: false, license: 'closed' },
  { name: 'Helicone Watcher',       scope: 'cost monitoring',     latency: '—',         open: true,  mid: false, license: 'Apache-2.0' },
  { name: 'OpenAI Logprobs API',    scope: 'self-confidence',     latency: 'free',      open: false, mid: true,  license: 'closed weights' },
  { name: 'Anthropic Probes (paper)', scope: 'safety-relevant',   latency: 'unknown',   open: false, mid: true,  license: 'research-only' },
  {
    name: 'OpenInterp agent-probe-guard', scope: 'mid-reasoning capability + CoT intent',
    latency: '~50 ms', open: true, mid: true, license: 'Apache-2.0', us: true,
  },
] as const

const sanityChecks = [
  {
    icon: FlaskConical,
    title: 'Random-feature baseline + capacity sweep',
    body:
      'Mandatory check at N<100. Phase 5d AUROC=1.000 at K=50 N=17 was over-parameterization caught ' +
      'by random-K-matched comparison. Phase 6c at K=10 found the real signal at +0.17 gap.',
    paper: 'eval v2/v3',
  },
  {
    icon: Layers,
    title: 'Control-token normalization for steering',
    body:
      'Always report Δrel = Δ(target) − mean(Δ(controls)). Phase 7 naive output reported Δlog-prob(finish) ' +
      '= +0.479 at α=+2, looked causal. Subtracting controls revealed Δrel = -0.046 — uniform softmax shift.',
    paper: 'eval v5',
  },
  {
    icon: Gauge,
    title: 'Structural-rigidity α-sweep diagnostic',
    body:
      'When initial steering at α∈{±2,±5} shows zero change, sweep up to α=200 (>‖residual‖) with both ' +
      'probe and random directions. Phase 8 redux: 12 generations identical even at α=+200, structural ' +
      'lock confirmed (decision is in input tokens, not residual).',
    paper: 'eval v6 §D.5',
  },
] as const

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function AurocBar({ value, color }: { value: number; color: 'green' | 'amber' | 'red' }) {
  const pct = value * 100
  const tone =
    color === 'green' ? 'from-emerald-500 to-green-500' :
    color === 'amber' ? 'from-amber-500 to-orange-500' :
                        'from-rose-500 to-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums font-medium text-ink-900 dark:text-ink-50 w-12 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight gradient-text">{value}</div>
      {sub ? <div className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60">{sub}</div> : null}
    </div>
  )
}

// =============================================================================
// PAGE
// =============================================================================

export default function AgentProbeGuardPage() {
  return (
    <div className="relative">
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-32 -z-10 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
          aria-hidden="true"
        />
        <div className="absolute right-10 top-20 -z-10 h-[260px] w-[260px] rounded-full bg-amber-500/15 blur-[80px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            v0.3.0 live · Apache-2.0 · detect-only by design
          </div>

          <h1 className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight text-ink-900 dark:text-white text-balance">
            Stop wasting agent budget on{' '}
            <span className="gradient-text">traces that won&apos;t ship.</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg sm:text-xl text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
            <strong>Mid-reasoning activation gate</strong> for LLM-based code agents on{' '}
            <span className="font-mono text-base bg-brand-500/10 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">Qwen3.6-27B</span>.{' '}
            Two probes (L43 capability + L55 thinking-intent),{' '}
            <span className="font-mono text-base bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">~50 ms</span>{' '}
            scoring, three modes ({' '}
            <span className="font-mono text-sm">skip · escalate · proceed</span>
            ).{' '}
            <span className="text-ink-900/60 dark:text-ink-50/60">
              No black-box LLM-judge tax. Detect-only — we did the steering experiments so you don&apos;t have to.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={PYPI_URL}
              target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
            >
              <Package className="h-4 w-4" /> Install from PyPI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={PAPER_DRAFT}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
            >
              <FlaskConical className="h-4 w-4" /> Read the paper
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </div>

          {/* Install pill */}
          <div className="mt-10 max-w-xl">
            <div className="font-mono text-sm card px-5 py-3.5 flex items-center gap-3 shadow-md">
              <span className="text-brand-500 select-none">$</span>
              <code className="flex-1 text-ink-900 dark:text-ink-50 truncate">{installCmd}</code>
              <CopyButton text={installCmd} />
            </div>
            <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
              {' '}requires Python ≥ 3.10 · adds torch + transformers + scikit-learn for `[full]` extras
            </p>
          </div>

          {/* hero stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Capability AUROC" value="0.83" sub="L43 pre_tool · K=10 · N=54" />
            <Stat label="Thinking AUROC" value="0.848" sub="L55 last-pos · K=5 · N=240" />
            <Stat label="Sanity checks" value="3" sub="random-K · control-token · α-sweep" />
            <Stat label="Causal experiments" value="3" sub="all confirm detect-only" />
          </div>
        </div>
      </section>

      {/* ============================================================ ONE-LINER */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="card p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <CircuitBoard className="h-7 w-7 text-brand-500 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                The five-line integration
              </h2>
              <p className="mt-2 text-base text-ink-900/70 dark:text-ink-50/70">
                Wrap your agent rollout. Get a routing decision before the first tool call burns budget.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 bg-ink-950/95 text-emerald-200 p-5 text-sm leading-relaxed">
{`from openinterp import AgentProbeGuard

guard = AgentProbeGuard.from_pretrained("Qwen/Qwen3.6-27B")
guard.attach(model, tok)

decision = guard.assess(messages, partial_response=current_thought)
# decision.action ∈ {"skip", "escalate", "proceed"}
# decision.scores = {"capability": 0.18, "thinking": 0.74}
# decision.thresholds = {"skip_below": 0.20, "escalate_below": 0.50}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ THREE MODES */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Three modes, no fights with the model.</h2>
        <p className="mt-3 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          The guard exposes a routing decision; your application decides what to do with it.
          Default thresholds were calibrated on SWE-bench Pro N=54 traces. Override per-deploy.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {modes.map((m) => {
            const Icon = m.icon
            const tone =
              m.color === 'red'
                ? 'border-rose-500/30 bg-rose-500/5'
                : m.color === 'amber'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-emerald-500/30 bg-emerald-500/5'
            const iconTone =
              m.color === 'red'
                ? 'text-rose-500'
                : m.color === 'amber'
                ? 'text-amber-500'
                : 'text-emerald-500'
            return (
              <div key={m.label} className={`card p-6 border ${tone}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${iconTone}`} />
                  <span className="font-mono text-lg font-semibold">{m.label}</span>
                </div>
                <div className="mt-3 font-mono text-xs text-ink-900/60 dark:text-ink-50/60">{m.threshold}</div>
                <p className="mt-3 text-sm text-ink-900/80 dark:text-ink-50/80 leading-relaxed">{m.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================================================ PROBE METRICS */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Two probes, two signals.</h2>
        <p className="mt-3 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          Both numbers reported as <strong>top-K diff-of-means with random-K-matched baseline</strong>{' '}
          to surface real signal vs over-parameterization. Paper-grade gap is ≥ +0.10 above random.
        </p>

        <div className="mt-8 card p-6">
          <table className="w-full">
            <thead className="border-b border-black/10 dark:border-white/10">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                <th className="pb-3 pr-3">probe</th>
                <th className="pb-3 px-3">capacity</th>
                <th className="pb-3 px-3">N</th>
                <th className="pb-3 px-3">AUROC</th>
                <th className="pb-3 px-3">random K-matched</th>
                <th className="pb-3 px-3">gap</th>
                <th className="pb-3 pl-3">source</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {probeMetrics.map((p) => (
                <tr key={p.name} className="border-b border-black/5 dark:border-white/5 last:border-0">
                  <td className="py-4 pr-3 font-mono text-xs">{p.name}</td>
                  <td className="py-4 px-3 font-mono text-xs">{p.capacity}</td>
                  <td className="py-4 px-3 font-mono text-xs">{p.n}</td>
                  <td className="py-4 px-3"><AurocBar value={p.auroc} color="green" /></td>
                  <td className="py-4 px-3"><AurocBar value={p.randomBaseline} color="amber" /></td>
                  <td className="py-4 px-3 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.gap}</td>
                  <td className="py-4 pl-3 text-xs text-ink-900/60 dark:text-ink-50/60">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ DETECT-ONLY STANCE */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card p-8 sm:p-10 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-7 w-7 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                We tested causality. The probes don&apos;t lever — they detect.
              </h2>
              <p className="mt-3 text-base text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
                Three intervention experiments converged on the same verdict: linear probe directions
                at L43 and L55 are <strong>epiphenomenal</strong>. They correlate with the outcome but
                do not participate in the causal pathway that produces it. agent-probe-guard ships
                without a &ldquo;boost&rdquo; mode because we have evidence that boosting wouldn&apos;t work
                — and we&apos;d rather be honest than ship a feature that fails silently.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                  <div className="font-semibold mb-1">Phase 7 (L43 pre_tool)</div>
                  <div className="text-ink-900/70 dark:text-ink-50/70 text-xs leading-relaxed">
                    Log-prob proxy with control-token normalization: Δrel ≈ 0. Single-shot α=+5 behavioral:
                    4/4 fails select identical tool. Continuous α=+5: 3/4 keep tool, 1 degenerates without redirecting.
                  </div>
                </div>
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                  <div className="font-semibold mb-1">Phase 8 (L55 thinking)</div>
                  <div className="text-ink-900/70 dark:text-ink-50/70 text-xs leading-relaxed">
                    Bidirectional steering α∈±5: zero behavioral change. Amplitude diagnostic up to α=+200
                    (perturbation 86% above residual norm): 12 generations identical char-by-char.
                  </div>
                </div>
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                  <div className="font-semibold mb-1">Phase 8 redux (top-5 retest)</div>
                  <div className="text-ink-900/70 dark:text-ink-50/70 text-xs leading-relaxed">
                    Concentrated direction on the 5 paper-grade signal dims at α=+200: still no token flip.
                    Rules out direction-dilution. Decision is in input tokens (chat template), not residual.
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <a
                  href={EVAL_V6}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Read eval v6 (template-lock verdict)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ METHODOLOGY */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Three sanity checks. Each one caught a confident-but-wrong claim.
        </h2>
        <p className="mt-3 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          The methodology is half the contribution. These belong in any future probe-causality paper.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {sanityChecks.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.title} className="card p-6">
                <Icon className="h-6 w-6 text-brand-500" />
                <div className="mt-3 font-semibold text-base">{s.title}</div>
                <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{s.body}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-mono text-brand-700 dark:text-brand-300">
                  paper §{s.paper}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================================================ COMPARISON */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Where we sit.</h2>
        <p className="mt-3 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          Most agent observability is post-hoc (logs &amp; cost dashboards). agent-probe-guard reads the
          model&apos;s own residual stream <em>before</em> the next tool call.
        </p>

        <div className="mt-8 card p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 dark:border-white/10">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                <th className="pb-3 pr-3">tool</th>
                <th className="pb-3 px-3">scope</th>
                <th className="pb-3 px-3">latency</th>
                <th className="pb-3 px-3">mid-reasoning?</th>
                <th className="pb-3 px-3">open</th>
                <th className="pb-3 pl-3">license</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr
                  key={c.name}
                  className={`border-b border-black/5 dark:border-white/5 last:border-0 ${
                    'us' in c && c.us ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <td className="py-4 pr-3 font-mono text-xs">{c.name}</td>
                  <td className="py-4 px-3 text-xs">{c.scope}</td>
                  <td className="py-4 px-3 font-mono text-xs">{c.latency}</td>
                  <td className="py-4 px-3">{c.mid ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}</td>
                  <td className="py-4 px-3">{c.open ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}</td>
                  <td className="py-4 pl-3 font-mono text-xs">{c.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ WHEN NOT TO USE */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">When not to use it.</h2>
        <ul className="mt-6 space-y-3 text-base text-ink-900/80 dark:text-ink-50/80">
          <li className="flex items-start gap-3">
            <X className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <strong>Closed-weights agents.</strong> The probe needs a forward hook on the residual stream.
              If you only have an API endpoint, this won&apos;t work. Use logprobs-based heuristics instead.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <X className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <strong>Non-Qwen3.6 base.</strong> Probe weights were trained on Qwen3.6-27B residuals.
              Cross-model transfer is paper-2 work in progress; for now use the matching model.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <X className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <strong>Sub-5-turn agents.</strong> Single-shot Q&amp;A doesn&apos;t have enough budget at risk
              to justify a 50ms gate. Below ~5 tool calls, post-hoc LLM-judge eval is fine.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <X className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <strong>You want behavior modification.</strong> The probes don&apos;t lever (we proved it three
              ways). If you need to <em>steer</em> the agent, this isn&apos;t the tool. Detection-only is the
              honest claim.
            </div>
          </li>
        </ul>
      </section>

      {/* ============================================================ CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Ship agents that <span className="gradient-text">know when to stop</span>.
          </h2>
          <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70">
            Apache-2.0. PyPI. HF dataset. ~50 ms gate. Five lines of integration.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PYPI_URL}
              target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all"
            >
              <Package className="h-4 w-4" /> Install from PyPI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={HF_DATASET}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Probe weights on HF
            </a>
            <a
              href={SWEBENCH_REPO}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-5 py-3.5 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              <Github className="h-4 w-4" /> Reproducible harness
            </a>
          </div>
          <p className="mt-8 text-xs text-ink-900/40 dark:text-ink-50/40">
            <Link href="/manifesto" className="hover:underline">Manifesto</Link>{' '}·{' '}
            <Link href="/research" className="hover:underline">Research</Link>{' '}·{' '}
            <Link href="/built-on" className="hover:underline">Built on</Link>{' '}·{' '}
            <Link href="/products/fabricationguard" className="hover:underline">FabricationGuard</Link>{' '}·{' '}
            <Link href="/probebench" className="hover:underline">ProbeBench</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
