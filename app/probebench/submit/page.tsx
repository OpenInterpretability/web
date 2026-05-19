import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  FileCode,
  GitPullRequest,
  ShieldCheck,
  Github,
  AlertTriangle,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { PROBESCORE_WEIGHTS } from '@/lib/probebench-scoring'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'Submit a Probe — ProbeBench',
  description:
    'Three-step submission: SHA-256-hashed artifact, YAML registry entry, GitHub PR. v0.0.1 spec is open and revisable.',
}

const PROBESCORE_VERSION = 'v0.0.1'
const REGISTRY_URL = 'https://github.com/OpenInterpretability/probebench-registry'
const REGISTRY_NEW_PR = 'https://github.com/OpenInterpretability/probebench-registry/new/main'

// -----------------------------------------------------------------------------
// Snippets (kept as constants so CopyButton can re-use the exact text)
// -----------------------------------------------------------------------------

const DIRECTORY_LAYOUT = `fabricationguard-qwen36-27b/
  probe.joblib              # sklearn LR / MLP / tree
  scaler.joblib             # sklearn StandardScaler
  meta.yaml                 # ProbeArtifactSpec
  README.md
  train.ipynb               # reproducer
  eval.ipynb                # held-out test set`

const META_YAML = `spec_version: "0.0.1"
probe_type: linear   # linear | mlp | sae_feature | sae_combination | tree | ensemble
model: "Qwen/Qwen3.6-27B"
layer: 31
position: end_question  # last_token | end_question | mid_think | end_think | end_answer | token_avg | attention_weighted
training_data: "TruthfulQA + HaluEval + MMLU train splits"
license: "Apache-2.0"
paper: "arXiv:2505.XXXXX"
author: "Your Name"
contact: "you@yourorg.org"
created_at: "2026-04-27T00:00:00Z"`

const VALIDATOR_SH = `pip install openinterp
openinterp probebench validate ./fabricationguard-qwen36-27b/
openinterp probebench submit ./fabricationguard-qwen36-27b/ \\
  --tasks haluval-qa,simpleqa,truthfulqa-mc1`

const REGISTRY_YAML = `id: yourorg/yourprobe-model-layer-version
name: "Your Probe Name"
short_name: "YourProbe"
author: "Your Name"
org: "YourOrg"
category: hallucination       # see lib/probebench-types.ts ProbeCategory
probe_type: linear
model_id: "Qwen/Qwen3.6-27B"
layer: 31
position: end_question
paper: "arXiv:XXXX.XXXXX"
paper_title: "Optional title"
artifact_url: "https://huggingface.co/datasets/yourorg/yourprobe"
artifact_sha256: "abc123..."
reproducer_notebook: "https://github.com/yourorg/.../notebook.ipynb"
colab_url: "https://colab.research.google.com/.../notebook.ipynb"
license: "Apache-2.0"
release: "2026-04-27"
param_count: 312000
size_mb: 1.2
tagline: "One-line pitch"
description: "Longer description..."
status: pending_review`

// -----------------------------------------------------------------------------
// 7-axis methodology rows
// -----------------------------------------------------------------------------

const AXIS_ROWS: Array<{
  key: keyof typeof PROBESCORE_WEIGHTS
  label: string
  measures: string
  computed: string
}> = [
  {
    key: 'auroc',
    label: 'AUROC',
    measures: 'Headline detection accuracy.',
    computed: 'Mean across declared tasks.',
  },
  {
    key: 'auroc_evalaware',
    label: 'Eval-awareness corrected AUROC',
    measures: 'AUROC on prompts the model is least likely to flag as evaluation.',
    computed:
      'Stratified bottom-quartile split using EvalAwarenessGuard scores. If you don’t supply, we impute raw × 0.85.',
  },
  {
    key: 'distshift_robustness',
    label: 'Distribution-shift robustness',
    measures: 'AUROC under long-context shift (DeepMind 2601.11516).',
    computed:
      'Re-evaluated against the apollo-eval-deploy long-context split. If you don’t supply, we impute raw × 0.7.',
  },
  {
    key: 'ece_calibration',
    label: 'Calibration (ECE)',
    measures: 'Lower expected calibration error = better.',
    computed: 'Mapped via 1 − 2·ECE, clamped to [0, 1].',
  },
  {
    key: 'cross_model_transfer',
    label: 'Cross-model transfer',
    measures: 'How well the probe direction holds across base models.',
    computed:
      'Mean Pearson_CE across declared target models. Default 0.5 if no transfers declared.',
  },
  {
    key: 'inference_efficiency',
    label: 'Inference efficiency',
    measures: 'Latency-aware tax on heavy probes.',
    computed: '1 − log10(latency_ms) / 4. 1ms → 1.0, 10000ms → 0.0.',
  },
  {
    key: 'license_score',
    label: 'License openness',
    measures: 'OSI / commercial-friendliness.',
    computed:
      'Apache-2.0=1.0, MIT=0.95, BSD=0.9, CC-BY=0.85, custom=0.5, closed=0.2. Closed-weight contribution capped at 0.01 of total.',
  },
]

// -----------------------------------------------------------------------------
// Reusable presentational pieces
// -----------------------------------------------------------------------------

function StepHeader({
  step,
  Icon,
  title,
  blurb,
}: {
  step: number
  Icon: typeof FileCode
  title: string
  blurb: string
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-inset ring-brand-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
          Step {step}
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          {blurb}
        </p>
      </div>
    </div>
  )
}

function CodeBlock({
  language,
  code,
  caption,
}: {
  language: string
  code: string
  caption?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-ink-900/[0.04] dark:bg-black/40">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
          <span>{language}</span>
          {caption && (
            <>
              <span className="text-ink-900/30 dark:text-ink-50/30">·</span>
              <span className="text-ink-900/55 dark:text-ink-50/55 normal-case tracking-normal">
                {caption}
              </span>
            </>
          )}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[12.5px] leading-relaxed font-mono text-ink-900/85 dark:text-ink-50/85">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
      {children}
    </section>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3">
      <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums text-ink-900 dark:text-ink-50">
        {value}
      </div>
    </div>
  )
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
      />
      <span className="text-sm text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
        {children}
      </span>
    </li>
  )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ProbeBenchSubmitPage() {
  return (
    <div className="relative">
      {/* ------------------------------------------------------------ */}
      {/* Breadcrumb / back link                                       */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center gap-1.5 text-xs text-ink-900/55 dark:text-ink-50/55">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">
            OpenInterp
          </Link>
          <span aria-hidden>/</span>
          <Link
            href="/probebench"
            className="hover:text-brand-600 dark:hover:text-brand-400"
          >
            ProbeBench
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink-900/80 dark:text-ink-50/80">Submit</span>
        </div>
        <Link
          href="/probebench"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to ProbeBench
        </Link>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pt-8 pb-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
            ProbeBench {PROBESCORE_VERSION} · Open Submission
          </span>
          <span className="chip bg-accent-500/10 text-accent-700 dark:text-accent-300 ring-accent-500/30">
            Apache-2.0 default
          </span>
        </div>

        <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Ship your probe to the leaderboard.
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Three steps: package the artifact, write the registry entry, open a PR.
          Apache-2.0 by default. We review every submission within 7 days.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 max-w-xl">
          <StatPill label="Spec version" value={PROBESCORE_VERSION} />
          <StatPill label="PR review SLA" value="7 days" />
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Step 1 · Package                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <StepHeader
            step={1}
            Icon={FileCode}
            title="Package the artifact"
            blurb="Probes are sklearn-compatible classifiers exposing predict_proba(X) → (n, 2). Plus a StandardScaler. Plus YAML metadata. Plus the SHA-256 of the bundle."
          />

          <div className="space-y-4">
            <CodeBlock
              language="text"
              caption="directory layout"
              code={DIRECTORY_LAYOUT}
            />

            <div>
              <div className="mb-2 text-xs font-mono uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                meta.yaml · ProbeArtifactSpec
              </div>
              <CodeBlock language="yaml" code={META_YAML} />
              <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
                Schema is the{' '}
                <code className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 font-mono">
                  meta
                </code>{' '}
                field of{' '}
                <code className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 font-mono">
                  ProbeArtifactSpec
                </code>{' '}
                in{' '}
                <code className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 font-mono">
                  lib/probebench-types.ts
                </code>
                . Hash the bundle directory with{' '}
                <code className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 font-mono">
                  shasum -a 256
                </code>{' '}
                before publishing — the registry compares against the artifact URL
                you declare in step 3.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Step 2 · Validate                                             */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <StepHeader
            step={2}
            Icon={ShieldCheck}
            title="Run the validator"
            blurb="Before opening a PR, run the SDK validator. It checks the artifact format, metadata fields, and your reported metrics against the held-out test set hash."
          />

          <CodeBlock language="bash" caption="openinterp probebench" code={VALIDATOR_SH} />

          <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Output is a{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
              submission.json
            </code>{' '}
            with: per-task AUROC + 95% CI bootstraps, ECE, FPR@99TPR, latency,
            eval-awareness corrected AUROC (computed against{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
              EvalAwarenessGuard
            </code>
            ), and dist-shift AUROC (against the{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
              apollo-eval-deploy
            </code>{' '}
            long-context split).
          </p>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Step 3 · PR                                                   */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <StepHeader
            step={3}
            Icon={GitPullRequest}
            title="Open a PR"
            blurb="Drop one YAML file into the registry, push a branch, open a PR. CI runs the validator + a fresh evaluation on a fresh holdout."
          />

          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            Path:{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px]">
              OpenInterpretability/probebench-registry/probes/&#123;your-probe-id&#125;.yaml
            </code>
          </p>

          <div className="mt-4">
            <CodeBlock
              language="yaml"
              caption="probes/yourorg__yourprobe.yaml"
              code={REGISTRY_YAML}
            />
          </div>

          <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            PRs auto-trigger the SDK validator + a fresh evaluation run on a fresh
            holdout. Status flips from{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
              pending_review
            </code>{' '}
            to{' '}
            <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
              live
            </code>{' '}
            on merge.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={REGISTRY_NEW_PR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              <Github className="h-4 w-4" /> Open a PR on the registry
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
            <a
              href={REGISTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Browse the registry <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* What we evaluate · 7 axes table                                */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <div className="mb-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
              Methodology
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
              What we evaluate
            </h2>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              ProbeScore composites seven axes. Weights sum to 1.0. PR a different
              set, we mint v0.0.2.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-black/5 dark:border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[0.03] dark:bg-white/[0.04] text-[11px] uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Axis</th>
                    <th className="px-4 py-2.5 font-semibold tabular-nums w-20">
                      Weight
                    </th>
                    <th className="px-4 py-2.5 font-semibold">What it measures</th>
                    <th className="px-4 py-2.5 font-semibold">How we compute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {AXIS_ROWS.map((row) => {
                    const w = PROBESCORE_WEIGHTS[row.key]
                    return (
                      <tr
                        key={row.key}
                        className="bg-white/40 dark:bg-white/[0.02] align-top"
                      >
                        <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">
                          {row.label}
                          <div className="mt-0.5 font-mono text-[11px] text-ink-900/45 dark:text-ink-50/45">
                            {row.key}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-brand-600 dark:text-brand-400">
                          {(w * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-ink-900/75 dark:text-ink-50/75">
                          {row.measures}
                        </td>
                        <td className="px-4 py-3 text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
                          {row.computed}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-black/[0.02] dark:bg-white/[0.02] text-[11px] uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold">Total</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">100%</td>
                    <td className="px-4 py-2.5" colSpan={2}>
                      Composite ∈ [0, 1]. No single axis exceeds 30%.
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Anti-Goodhart norms                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <div className="mb-5 flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                Norms
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                Anti-Goodhart by construction
              </h2>
            </div>
          </div>

          <ul className="space-y-3">
            <CheckRow>
              We hard-cap any single component at 30% of total — you can’t win
              the leaderboard by maximizing only AUROC.
            </CheckRow>
            <CheckRow>
              Closed-weight probes max out at 0.5 license contribution × 0.05
              weight = 0.025 ceiling. You can still rank top-5, but it’s a tax on
              closed weights.
            </CheckRow>
            <CheckRow>
              Eval-awareness probes that fail to declare a corrected AUROC get the
              punishment imputation: 0.85 × raw.
            </CheckRow>
            <CheckRow>
              We re-evaluate every entry quarterly on fresh holdouts. Public diff if
              a probe degrades &gt;5pp; deprecation if &gt;10pp.
            </CheckRow>
          </ul>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Reviewer checklist                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionCard>
          <div className="mb-5 flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                PR review
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                Reviewer checklist
              </h2>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                What we check on every PR before it flips to{' '}
                <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
                  live
                </code>
                .
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            <CheckRow>
              SHA-256 hash matches the artifact at the declared HF / GitHub URL.
            </CheckRow>
            <CheckRow>
              Reproducer notebook runs end-to-end — we run it on Colab T4 / L4.
            </CheckRow>
            <CheckRow>
              Test set hash matches a registered task in{' '}
              <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
                tasks.yaml
              </code>{' '}
              — OR you ship a new task with documented sourcing.
            </CheckRow>
            <CheckRow>
              License is OSI-approved (Apache-2.0 / MIT / BSD / CC-BY) or properly
              declared as{' '}
              <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
                custom
              </code>{' '}
              /{' '}
              <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
                closed
              </code>
              .
            </CheckRow>
            <CheckRow>No PII / private data in the test set.</CheckRow>
            <CheckRow>
              Eval-awareness corrected AUROC is declared — OR the auto-imputed
              flag is acknowledged in the PR description.
            </CheckRow>
          </ul>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Code-of-conduct + deprecation                                */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <SectionCard>
          <div className="mb-3 text-[11px] font-mono uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Code of conduct · Deprecation policy
          </div>
          <div className="space-y-4 text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
            <p>
              We deprecate probes that turn out to be (a) trained with leakage we
              missed in review, (b) a reproducer that breaks and isn’t fixed within
              30 days, or (c) the author requests removal. Deprecation moves the
              probe to a hidden archive with a public notice.
            </p>
            <p>
              We don’t remove honestly failed probes — those stay live with
              rose-colored metrics. The whole point of ProbeBench is honest negative
              results.
            </p>
          </div>
        </SectionCard>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Footer CTAs                                                  */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.06] via-transparent to-accent-500/[0.06] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                Ready to ship?
              </h3>
              <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70">
                Open the registry, drop your YAML, push a branch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                <Github className="h-4 w-4" /> Open the registry on GitHub
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/probebench/about"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <BookOpen className="h-4 w-4" /> Read the methodology
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
