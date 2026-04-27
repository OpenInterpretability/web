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
} from 'lucide-react'
import { site } from '@/lib/constants'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'FabricationGuard — Open-source hallucination detection · OpenInterp',
  description:
    'Activation-probe fabrication detection for open-weights LLMs. AUROC 0.88 cross-task on SimpleQA, -88% confident-wrong reduction, ~1ms latency. Apache-2.0. pip install openinterp.',
}

const HF_SPACE_URL = 'https://caiovicentino1-fabricationguard-demo.hf.space'
const HF_DATASET = 'https://huggingface.co/datasets/caiovicentino1/FabricationGuard-linearprobe-qwen36-27b'
const PYPI_URL = 'https://pypi.org/project/openinterp/'
const GITHUB_RELEASE = 'https://github.com/OpenInterpretability/cli/releases/tag/v0.2.0'
const GITHUB_REPO = 'https://github.com/OpenInterpretability/cli'
const NOTEBOOKS_REPO = 'https://github.com/OpenInterpretability/notebooks'

// -----------------------------------------------------------------------------
// Numbers from notebook 31 (held-out, 2026-04-27)
// -----------------------------------------------------------------------------
const auroc = [
  { name: 'TruthfulQA', within: 0.536, cross: 0.599, single: 0.556, ok: false, kind: 'misconception' },
  { name: 'HaluEval', within: 0.903, cross: 0.619, single: 0.500, ok: true, kind: 'fabrication' },
  { name: 'SimpleQA', within: 0.706, cross: 0.882, single: 0.494, ok: true, kind: 'entity-fabrication' },
  { name: 'MMLU', within: 0.631, cross: 0.444, single: 0.544, ok: false, kind: 'knowledge MC' },
]

const mitigation = [
  { name: 'TruthfulQA', baseline: 65, guard: 32.5, abstain: 47.5, reduction: 50 },
  { name: 'HaluEval',   baseline: 57.5, guard: 27.5, abstain: 37.5, reduction: 52 },
  { name: 'SimpleQA',   baseline: 85, guard: 10,   abstain: 80,    reduction: 88 },
]

const competitors = [
  { name: 'Patronus Lynx-70B', auroc: '0.87 (HaluBench)', latency: '~100 ms', open: true,  multi: false, license: 'Apache-2.0' },
  { name: 'Vectara HHEM-2.1',   auroc: '~0.85',           latency: '600 ms',  open: true,  multi: true,  license: 'Apache-2.0' },
  { name: 'Galileo Luna-2',     auroc: 'proprietary',     latency: '152 ms',  open: false, multi: true,  license: 'closed' },
  { name: 'Goodfire Ember',     auroc: 'proprietary',     latency: 'unknown', open: false, multi: false, license: 'enterprise-only since Feb 2026' },
  { name: 'OpenInterp FabricationGuard', auroc: '0.88 cross / 0.90 within', latency: '~1 ms', open: true,  multi: true,  license: 'Apache-2.0', us: true },
]

const roadmap = [
  { v: 'v0.2.0', when: 'Apr 2026', items: ['Qwen3.6-27B probe', 'PyPI ship', 'CLI', '3 modes'], shipped: true },
  { v: 'v0.3.0', when: 'May 2026', items: ['Llama-3.3 probe', 'Gemma-2 probe', 'Pearson_CE cross-model transfer', 'Multi-model API'] },
  { v: 'v0.4.0', when: 'Jun 2026', items: ['vLLM plugin', 'SGLang plugin', 'LangChain middleware', 'OpenTelemetry GenAI'] },
  { v: 'v0.5.0', when: 'Q3 2026',  items: ['Hosted Pro tier ($0.02/1M tok)', 'Slack/PagerDuty/Datadog', 'Audit reports', 'Custom probe training'] },
]

const installCmd = 'pip install --upgrade "openinterp[full]"'

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ScoreBar({ pct, color = 'brand' }: { pct: number; color?: 'brand' | 'red' | 'amber' | 'green' }) {
  const tone =
    color === 'red'   ? 'from-rose-500 to-red-500' :
    color === 'amber' ? 'from-amber-500 to-orange-500' :
    color === 'green' ? 'from-emerald-500 to-green-500' :
                        'from-brand-500 to-accent-500'
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tone} transition-[width] duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  )
}

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

export default function FabricationGuardPage() {
  return (
    <div className="relative">
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div className="absolute left-1/2 top-32 -z-10 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" aria-hidden="true" />
        <div className="absolute right-10 top-20 -z-10 h-[260px] w-[260px] rounded-full bg-pink-500/15 blur-[80px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            v0.2.0 live · Apache-2.0
          </div>

          <h1 className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight text-ink-900 dark:text-white text-balance">
            Stop hallucinations <br /> <span className="gradient-text">before they ship.</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg sm:text-xl text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
            <strong>Activation-probe fabrication detection</strong> for open-weights LLMs.{' '}
            <span className="font-mono text-base bg-brand-500/10 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">~1 ms</span>{' '}
            scoring latency,{' '}
            <span className="font-mono text-base bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">AUROC 0.88</span>{' '}
            cross-task, <strong>−88% confident-wrong</strong> rate on factual QA.{' '}
            <span className="text-ink-900/60 dark:text-ink-50/60">No LLM-judge tax. Open weights. Reproducible.</span>
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
              href="#live-demo"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
            >
              <Activity className="h-4 w-4" /> Try the live demo
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
            <Stat label="Cross-task AUROC" value="0.88" sub="held-out SimpleQA" />
            <Stat label="Within-bench AUROC" value="0.90" sub="HaluEval-QA" />
            <Stat label="Confident-wrong drop" value="−88%" sub="SimpleQA mitigation" />
            <Stat label="Latency / score call" value="~1 ms" sub="single matrix mul" />
          </div>
        </div>
      </section>

      {/* ============================================================ LIVE DEMO */}
      <section id="live-demo" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" /> live · real Qwen3.6-27B
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Type any prompt. <span className="gradient-text">Watch it score.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Real activation-probe inference on Qwen3.6-27B running on HF ZeroGPU.
              No mocks, no pre-computed answers. Every prompt is a fresh forward pass.
              Cold start is ~3–5 min if the Space was idle; subsequent requests run in seconds.
            </p>
          </div>
          <a
            href={`https://huggingface.co/spaces/caiovicentino1/FabricationGuard-demo`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Open in HF <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-8 card overflow-hidden shadow-xl">
          <iframe
            src={HF_SPACE_URL}
            className="block w-full"
            style={{ height: 760, border: 0 }}
            allow="clipboard-write"
            title="FabricationGuard live demo"
            loading="lazy"
          />
        </div>

        <p className="mt-4 text-xs text-ink-900/50 dark:text-ink-50/50">
          Powered by <a href="https://huggingface.co/docs/hub/spaces-zerogpu" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-900 dark:hover:text-ink-50">HF ZeroGPU</a>
          {' · '}H200 partitioned · free for community use.
        </p>
      </section>

      {/* ============================================================ NUMBERS */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Detection that <span className="gradient-text">actually generalizes.</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          A linear probe on the residual stream at layer 31 of Qwen3.6-27B. Trained on
          three benchmark train splits. Held out the fourth. Generalizes strongly to
          fabrication-style hallucination, fails honestly on unrelated cognitive tasks.
        </p>

        {/* AUROC table */}
        <div className="mt-10 card overflow-hidden">
          <div className="px-5 py-3 border-b border-black/5 dark:border-white/10 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
              Detection AUROC across 4 public benchmarks
            </h3>
            <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
              probe layer 31 · train/test split 80/20
            </div>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/10">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              <div className="col-span-3">Benchmark</div>
              <div className="col-span-2">Single SAE feat</div>
              <div className="col-span-3">LR within-bench</div>
              <div className="col-span-3">LR cross-bench (held-out)</div>
              <div className="col-span-1 text-right">Pass</div>
            </div>
            {auroc.map((row) => {
              const colorWithin: 'green' | 'amber' | 'red' =
                row.within >= 0.7 ? 'green' : row.within >= 0.6 ? 'amber' : 'red'
              const colorCross: 'green' | 'amber' | 'red' =
                row.cross >= 0.7 ? 'green' : row.cross >= 0.6 ? 'amber' : 'red'
              return (
                <div key={row.name} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
                  <div className="col-span-3">
                    <div className="font-semibold text-ink-900 dark:text-ink-50">{row.name}</div>
                    <div className="text-xs text-ink-900/50 dark:text-ink-50/50">{row.kind}</div>
                  </div>
                  <div className="col-span-2 font-mono text-xs tabular-nums text-ink-900/60 dark:text-ink-50/60">
                    {row.single.toFixed(3)}
                  </div>
                  <div className="col-span-3"><AurocBar value={row.within} color={colorWithin} /></div>
                  <div className="col-span-3"><AurocBar value={row.cross} color={colorCross} /></div>
                  <div className="col-span-1 flex justify-end">
                    {row.ok
                      ? <Check className="h-4 w-4 text-emerald-500" />
                      : <X className="h-4 w-4 text-ink-900/30 dark:text-ink-50/30" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mitigation chart */}
        <div className="mt-10 card overflow-hidden">
          <div className="px-5 py-3 border-b border-black/5 dark:border-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
              Mitigation impact — abstain mode @ threshold 0.684
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {mitigation.map((row) => (
              <div key={row.name}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-sm font-semibold">{row.name}</div>
                  <div className="text-sm">
                    <span className="font-mono text-rose-500/80 dark:text-rose-300/80">{row.baseline}%</span>
                    <span className="mx-2 text-ink-900/30 dark:text-ink-50/30">→</span>
                    <span className="font-mono text-amber-500/90 dark:text-amber-300">{row.guard}%</span>
                    <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">−{row.reduction}% wrong</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5 flex">
                  <div className="h-full bg-rose-500/85" style={{ width: `${row.guard}%` }} title="Confidently wrong with guard" />
                  <div className="h-full bg-emerald-500/55" style={{ width: `${row.abstain}%` }} title="Abstained honestly" />
                </div>
                <div className="mt-1.5 text-xs text-ink-900/50 dark:text-ink-50/50">
                  <span className="inline-block w-3 h-3 rounded-sm align-middle mr-1.5 bg-rose-500/85" /> still wrong
                  <span className="inline-block w-3 h-3 rounded-sm align-middle mr-1.5 ml-4 bg-emerald-500/55" /> abstained
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ HONEST SCOPE */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          We tell you <span className="gradient-text">what it can&apos;t do.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          The probe linearly encodes a fabrication-vs-grounded signal. It does <em>not</em>{' '}
          encode &ldquo;is this a popular misconception?&rdquo; or &ldquo;do I know which of 4
          MC options is right?&rdquo; — those are different cognitive tasks. We tested all four
          honestly and report the results.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="card p-6 border-emerald-500/20 bg-emerald-500/[0.04]">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Works for</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-ink-900/80 dark:text-ink-50/80">
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Generation-fabrication in open QA (HaluEval-style)</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Entity recall failures (SimpleQA-style obscure facts)</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Customer-support fact lookups (company policy, refund rules)</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Medical / legal / internal-docs Q&amp;A grounding</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Sales DB lookups (customer names, account facts)</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Code-assistant API hallucination detection</li>
            </ul>
          </div>

          <div className="card p-6 border-rose-500/15 bg-rose-500/[0.03]">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Out of scope</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-ink-900/80 dark:text-ink-50/80">
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Misconception resistance (TruthfulQA-style multiple choice)</li>
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Knowledge-gap MC selection (MMLU-style 4-way pickers)</li>
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Subjective / opinion questions</li>
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Multi-step reasoning failures (math, logic chains)</li>
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Toxic content / prompt injection (use Lakera, Bedrock Guardrails)</li>
              <li className="flex gap-2"><X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /> Closed-API models (GPT, Claude, Gemini)</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink-900/50 dark:text-ink-50/50">
          Honest scoping is procurement-friendly. Compliance teams and EU AI Act risk registers
          accept &ldquo;tested and excluded&rdquo; far more readily than &ldquo;works for everything.&rdquo;
        </p>
      </section>

      {/* ============================================================ HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          One forward pass. <span className="gradient-text">One scalar. One decision.</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          No second judge model. No retraining. No fine-tune. The guard rides on top of
          your existing inference pipeline — captures the residual at layer 31, multiplies
          by the probe, applies a calibrated threshold.
        </p>

        <div className="mt-10 grid md:grid-cols-5 gap-4">
          {[
            { i: 1, title: 'Prompt arrives',  body: 'User query enters your model the normal way.', icon: Activity },
            { i: 2, title: 'Forward pass',    body: 'Single forward through Qwen3.6-27B. Hook captures residual at L31, last token.', icon: Cpu },
            { i: 3, title: 'Probe applied',   body: 'StandardScaler + L2 LogisticRegression. Single matmul, ~1 ms on CPU.', icon: ShieldCheck },
            { i: 4, title: 'Score in [0,1]',  body: 'Higher = higher fabrication risk. Threshold calibrated cross-bench (0.684).', icon: GitBranch },
            { i: 5, title: 'Decision',         body: 'detect / warn / abstain — ship the response or replace with uncertainty.', icon: Zap },
          ].map((step) => (
            <div key={step.i} className="card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono text-brand-600 dark:text-brand-400">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 font-semibold">
                  {step.i}
                </span>
                <step.icon className="h-3.5 w-3.5" />
              </div>
              <div className="mt-3 font-semibold tracking-tight">{step.title}</div>
              <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">{step.body}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-6 font-mono text-sm leading-relaxed">
          <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 mb-3 font-sans">
            5-line integration
          </div>
          <pre className="whitespace-pre-wrap text-ink-900/90 dark:text-ink-50/90 text-[13px] leading-6">
{`from openinterp import FabricationGuard
from transformers import AutoModelForImageTextToText, AutoTokenizer

model = AutoModelForImageTextToText.from_pretrained("Qwen/Qwen3.6-27B", ...)
tok   = AutoTokenizer.from_pretrained("Qwen/Qwen3.6-27B")

guard = FabricationGuard.from_pretrained("Qwen/Qwen3.6-27B").attach(model, tok)
out   = guard.generate("Who is Bambale Osby?", mode="abstain")`}
          </pre>
        </div>
      </section>

      {/* ============================================================ COMPARE */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Versus the <span className="gradient-text">competition.</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          LLM-judge tools and proprietary platforms run an entire second model to score
          each output. We capture an activation that the model already computed and run
          a 1-ms matrix multiplication. Different cost structure entirely.
        </p>

        <div className="mt-10 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                  <th className="px-5 py-3 text-left font-medium">Tool</th>
                  <th className="px-5 py-3 text-left font-medium">AUROC</th>
                  <th className="px-5 py-3 text-left font-medium">Latency</th>
                  <th className="px-5 py-3 text-left font-medium">Open weights</th>
                  <th className="px-5 py-3 text-left font-medium">Multi-model</th>
                  <th className="px-5 py-3 text-left font-medium">License</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr
                    key={c.name}
                    className={`border-b border-black/5 dark:border-white/5 last:border-0 ${
                      c.us ? 'bg-gradient-to-r from-brand-500/[0.06] to-accent-500/[0.06]' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold">
                      <div className="flex items-center gap-2">
                        {c.us
                          ? <span className="inline-flex items-center gap-1 chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30">us</span>
                          : null}
                        {c.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{c.auroc}</td>
                    <td className="px-5 py-4 font-mono text-xs">{c.latency}</td>
                    <td className="px-5 py-4">{c.open ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500/60" />}</td>
                    <td className="px-5 py-4">{c.multi ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500/60" />}</td>
                    <td className="px-5 py-4 text-xs text-ink-900/70 dark:text-ink-50/70">{c.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-ink-900/50 dark:text-ink-50/50">
          <span className="font-mono">¹ Patronus Lynx benchmark on HaluBench</span>
          <span className="font-mono">² Vectara HHEM-2.1 measured on RTX 3090</span>
          <span className="font-mono">³ Goodfire Ember pivoted to enterprise-only Feb 2026</span>
        </div>
      </section>

      {/* ============================================================ REPRODUCE */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Don&apos;t trust us. <span className="gradient-text">Reproduce it.</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          Every number on this page came from a single notebook on a single Colab session.
          Click below, run it yourself in ~50 minutes for ~R$10 in credits. The probe artifact
          and the reproducer are both Apache-2.0.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <a
            href={NOTEBOOKS_REPO}
            target="_blank" rel="noopener noreferrer"
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <FlaskConical className="h-6 w-6 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">Notebook 30 + 31</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              Single-feature attempt → linear-probe pivot. Public benchmarks, held-out splits, ROC analysis.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              github.com/OpenInterpretability/notebooks <ExternalLink className="h-3 w-3" />
            </div>
          </a>

          <a
            href={HF_DATASET}
            target="_blank" rel="noopener noreferrer"
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <Layers className="h-6 w-6 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">Probe artifact</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              probe.joblib + meta.json + verdict.json + headline figure. 1.4 MB total. Apache-2.0.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              huggingface.co · datasets · FabricationGuard <ExternalLink className="h-3 w-3" />
            </div>
          </a>

          <a
            href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade"
            target="_blank" rel="noopener noreferrer"
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <Eye className="h-6 w-6 text-brand-500 mb-3" />
            <div className="text-sm font-semibold">Source SAE</div>
            <div className="mt-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
              Qwen3.6-27B paper-grade SAE at L11 / L31 / L55. The only public set on hybrid GDN architecture.
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-brand-600 dark:text-brand-400">
              huggingface.co · qwen36-27b-sae-papergrade <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        </div>
      </section>

      {/* ============================================================ ROADMAP */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-black/5 dark:border-white/10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Where we&apos;re going.
        </h2>

        <div className="mt-10 relative">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-brand-500/40 via-brand-500/20 to-transparent" />
          <div className="space-y-6">
            {roadmap.map((r) => (
              <div key={r.v} className="relative pl-16">
                <div className={`absolute left-3 top-1.5 h-6 w-6 rounded-full ring-4 ring-background flex items-center justify-center ${
                  r.shipped ? 'bg-emerald-500' : 'bg-brand-500/40'
                }`}>
                  {r.shipped ? <Check className="h-3 w-3 text-white" /> : null}
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-ink-900 dark:text-ink-50">{r.v}</span>
                  <span className="text-xs text-ink-900/50 dark:text-ink-50/50">{r.when}</span>
                  {r.shipped
                    ? <span className="chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30">shipped</span>
                    : <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30">planned</span>}
                </div>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {r.items.map((i) => (
                    <li key={i} className="text-xs text-ink-900/70 dark:text-ink-50/70 px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 border-t border-black/5 dark:border-white/10">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[300px] bg-gradient-to-r from-brand-600/10 via-pink-500/10 to-orange-500/10 blur-[100px] -z-10" aria-hidden="true" />
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
            Stop hallucinations <span className="gradient-text">before they ship.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-ink-900/70 dark:text-ink-50/70">
            Open source. Apache-2.0 with patent grant. No signup. No API key. Just <span className="font-mono">pip install</span>.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <div className="font-mono text-sm card px-5 py-3.5 flex items-center gap-3 shadow-md">
              <span className="text-brand-500 select-none">$</span>
              <code className="flex-1 text-left text-ink-900 dark:text-ink-50 truncate">{installCmd}</code>
              <CopyButton text={installCmd} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={GITHUB_REPO}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
            >
              <Github className="h-4 w-4" /> Star on GitHub
            </a>
            <a
              href={GITHUB_RELEASE}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
            >
              <Package className="h-4 w-4" /> v0.2.0 release notes
            </a>
            <a
              href={`mailto:${site.contact}?subject=${encodeURIComponent('FabricationGuard — pilot interest')}`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 transition-all"
            >
              Talk to us about a pilot
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
