import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, Stethoscope, ShieldAlert, FileWarning, BookOpen,
  ExternalLink, AlertTriangle, GitPullRequest, Activity, Microscope, ScanEye,
} from 'lucide-react'
import { evalsFor, probes, tasks, taskBy } from '@/lib/probebench-data'
import { fmtAuroc } from '@/lib/probebench-scoring'

export const metadata = {
  title: 'ProbeBench × Medical AI — fabrication detection for clinical LLM deployments',
  description:
    'Activation-probe fabrication detection applied to medical AI: clinical Q&A, drug-interaction lookup, evidence-grounded summarization. Apache-2.0, ~1ms latency. CZI Biohub $500M (Apr 2026) makes this category urgent.',
}

const fgEvals = evalsFor('openinterp/fabricationguard-qwen36-27b-l31-v2')

const useCases = [
  {
    icon: Stethoscope,
    title: 'Clinical Q&A grounding',
    description:
      'Patient-facing or clinician-facing chat: "What are the symptoms of long QT syndrome?" — model can fabricate a plausible-sounding but wrong list. FabricationGuard scores residual at end-of-question, abstains when fabrication probability > threshold.',
    fits: ['HaluEval-QA AUROC 0.903', 'SimpleQA cross-task AUROC 0.882'],
    caveat:
      "Calibrated for general open-domain factual QA. Medical-specific recalibration recommended (smaller threshold for asymmetric cost — medical false-confidence is more dangerous than over-abstention).",
  },
  {
    icon: FileWarning,
    title: 'Drug-interaction lookup',
    description:
      'Model summarizes drug interactions for clinical reference. Rare interactions = long-tail factoids = fabrication-prone. Probe surfaces when the model is generating plausibly without grounding.',
    fits: ['SimpleQA: rare-entity factoid recall — model fabrication probability is high here'],
    caveat:
      "Doesn't replace pharmacovigilance database lookup. Use as second-line confidence layer, not primary source.",
  },
  {
    icon: Activity,
    title: 'Evidence-grounded clinical summarization',
    description:
      'Model summarizes a patient chart, study abstract, or guideline document. Fabrication happens when model adds claims absent from source. Probe captures this even before the model finishes generating.',
    fits: ['HaluEval-QA: open-ended generation hallucination — directly applicable'],
    caveat:
      "Best paired with retrieval-grounded NLI (e.g., HaluGate-style post-hoc verification) for highest reliability. The two methods are complementary — see /probebench/comparisons (in development).",
  },
  {
    icon: Microscope,
    title: 'Biological / pharmaceutical reasoning',
    description:
      'AI suggesting protein-target interactions, drug repurposing candidates, or disease pathways. Model fabricates relationships not in training data — clinically critical to flag.',
    fits: ['Out-of-distribution generation: probe surfaces low-confidence/fabricated assertions'],
    caveat:
      'EvolutionaryScale-style biological reasoning was NOT in our training distribution. Recalibration on a domain-specific test set is necessary before clinical use.',
  },
]

const regulatoryFlags = [
  {
    label: 'EU AI Act Article 14',
    detail:
      'High-risk AI systems (including medical AI) require human oversight. Activation-probe abstention fits as the technical mechanism for "intervention by the operator" — model declines when uncertain, human reviews.',
    link: 'https://artificialintelligenceact.eu/article/14/',
  },
  {
    label: 'FDA SaMD Pre-Cert (US)',
    detail:
      'Software as Medical Device guidance increasingly references uncertainty quantification. Probe-based abstention provides per-query uncertainty signal more interpretable than ensemble or temperature-scaling baselines.',
    link: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd',
  },
  {
    label: 'WHO ethics guidance for AI in health',
    detail:
      'Recommends transparency about model uncertainty. Activation probes provide an audit trail — every output has a confidence number that maps to a specific layer/position decision.',
    link: 'https://www.who.int/publications/i/item/9789240029200',
  },
]

export default function MedicalAIPage() {
  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* Breadcrumb                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 pt-8">
        <Link
          href="/probebench"
          className="inline-flex items-center gap-1.5 text-xs text-ink-900/60 dark:text-ink-50/60 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> ProbeBench
        </Link>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/20">
          <ShieldAlert className="h-3 w-3" />
          ProbeBench Application · Medical AI
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
          Fabrication detection for{' '}
          <span className="gradient-text">clinical LLM deployments</span>
        </h1>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-ink-900/75 dark:text-ink-50/75">
          The 2026 medical AI category is moving fast — CZI Biohub committed{' '}
          <a
            href="https://www.axios.com/2026/04/29/zuckerberg-chan-biohub-philanthropy-ai-disease"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            $500M to AI biology
          </a>{' '}
          on Apr 29, 2026. EU AI Act Article 14 takes effect August 2026. The bottleneck
          is not modeling — it is{' '}
          <strong className="text-ink-900 dark:text-ink-50">
            knowing when the model is making things up
          </strong>
          . FabricationGuard is one open standard for that signal: ~1 ms scoring latency,
          AUROC 0.88 cross-task, Apache-2.0.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/probebench/probe/openinterp%2Ffabricationguard-qwen36-27b-l31-v2"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            View FabricationGuard probe DNA <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="#pilot"
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Pilot framework <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href="mailto:caio@openinterp.org?subject=ProbeBench%20%C3%97%20Medical%20AI%20pilot"
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Email caio@openinterp.org
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why this matters now                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-black/5 dark:border-white/10 bg-rose-500/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Why this category is urgent <span className="text-ink-900/40 dark:text-ink-50/40">in 2026</span>
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'DeepMind AI co-clinician (Apr 30, 2026)',
                body: 'Google DeepMind shipped a dual-agent clinical assistant (Planner monitors Talker) on Gemini + Project Astra. Research-only, closed weights. Validates the "monitor-gate" pattern in clinical settings — open audit layer is the natural complement.',
                link: 'https://deepmind.google/blog/ai-co-clinician/',
              },
              {
                title: '$500M just committed',
                body: 'CZI Biohub announced $500M in AI-biology funding on Apr 29, 2026. EvolutionaryScale was acquired. CZI operating budget at $1B/year. Capital is flowing into AI for medical use cases.',
              },
              {
                title: 'EU AI Act enforcement',
                body: 'Article 14 (human oversight) takes effect Aug 2026 for high-risk AI including medical. Activation-probe abstention fits the regulatory pattern: technical mechanism for operator intervention.',
              },
              {
                title: 'Hallucination is uniquely costly here',
                body: 'In open QA a fabricated answer is annoying. In medical AI it is a clinical incident. Asymmetric cost means probe-based abstention has very different threshold tuning than consumer applications.',
              },
            ].map((c: { title: string; body: string; link?: string }) => (
              <div
                key={c.title}
                className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-5"
              >
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="mt-2 text-[13.5px] text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                  {c.body}
                </div>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    DeepMind post <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closed-vs-Open audit layer (NEW — DeepMind co-clinician anchor)   */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            The closed-vs-open audit layer
          </h2>
          <span className="chip bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30 ring-inset font-mono text-[10px]">
            Updated 2026-05-11
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-[15px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          DeepMind&apos;s{' '}
          <a
            href="https://deepmind.google/blog/ai-co-clinician/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
          >
            AI co-clinician <ExternalLink className="h-3 w-3" />
          </a>{' '}
          announcement (Apr 30, 2026) validated the monitor-gate pattern at clinical scale: a{' '}
          <strong>Planner</strong> agent watching a <strong>Talker</strong> agent for safety violations.
          The substrate is Gemini + Project Astra; the audit signal lives in <em>prompted</em> behavior
          of a second LLM. OpenInterp ships the open complement: the audit signal lives in the{' '}
          <em>residual stream</em> of the model itself, available without access to a second model.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/40 dark:bg-ink-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ScanEye className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                Closed audit layer
              </span>
            </div>
            <div className="text-base font-semibold mb-2">DeepMind AI co-clinician</div>
            <ul className="space-y-1.5 text-[13px] text-ink-900/75 dark:text-ink-50/75">
              <li>• Substrate: <strong>Gemini</strong> (closed weights)</li>
              <li>• Audit signal: <strong>Planner LLM</strong> via prompted monitoring</li>
              <li>• Access: research collaborators only (Harvard, Stanford, partner hospitals)</li>
              <li>• Reproducibility: not externally verifiable</li>
              <li>• Latency: full second-LLM forward pass per audit</li>
              <li>• Citable artifact: blog post + reported metrics</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Open audit layer
              </span>
            </div>
            <div className="text-base font-semibold mb-2">OpenInterp on Qwen3.6-27B</div>
            <ul className="space-y-1.5 text-[13px] text-ink-900/75 dark:text-ink-50/75">
              <li>• Substrate: <strong>Qwen3.6-27B</strong> (open weights, Apache-compatible)</li>
              <li>• Audit signal: <strong>activation probes</strong> at L31 residual stream</li>
              <li>• Access: PyPI <code className="font-mono text-[11px]">openinterp</code> v0.3.0, any researcher</li>
              <li>• Reproducibility: sha256-hashed manifests in the{' '}
                <Link href="/atlas" className="text-brand-600 dark:text-brand-400 hover:underline">Atlas</Link>
              </li>
              <li>• Latency: ~1ms sklearn inference per audit (~50ms for thinking probes)</li>
              <li>• Citable artifact: HF probe + reproducer Colab + paper draft</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              The gap they admit
            </span>
          </div>
          <p className="text-[13.5px] text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
            The DeepMind post explicitly notes:{' '}
            <em>&quot;expert physicians performed better than the AI system overall, particularly in identifying red flags.&quot;</em>{' '}
            Red-flag identification in medicine is <strong>rare-class detection under distribution shift</strong> —
            the paradigmatic use case for activation-level probes with N-adaptive thresholds.
            FabricationGuard&apos;s methodology (random-feature baseline, control-token normalization, 5-class
            causality verdict) is built for exactly this regime. Medical transfer evaluation pending — track
            progress at{' '}
            <a
              href="https://github.com/OpenInterpretability/cli/issues/11"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
            >
              cli#11 <ExternalLink className="h-3 w-3" />
            </a>.
          </p>
        </div>

        <p className="mt-6 text-sm text-ink-900/60 dark:text-ink-50/60 italic">
          The two layers are complementary, not competitive. Closed-substrate clinical AI benefits from
          having a public reproducibility surface; open mech-interp infrastructure benefits from concrete
          deployment validation. The opportunity is to make the open audit layer the default standard so
          every clinical AI system — closed or open — can be evaluated against the same probe-tier signal.
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* What FabricationGuard does                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          What FabricationGuard does <span className="text-ink-900/40 dark:text-ink-50/40">(in 60 seconds)</span>
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          A linear logistic regression on the residual stream at layer 31 of Qwen3.6-27B,
          scored at the end of the user question. Trained cross-bench on TruthfulQA + HaluEval +
          MMLU + SimpleQA. Captures the &quot;model is fabricating&quot; signal that lives in
          the residual stream <em>before</em> generation begins — abstention happens at zero
          token cost.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fgEvals.slice(0, 4).map((e) => {
            const t = taskBy(e.taskId)
            return (
              <div
                key={e.taskId}
                className="rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 p-4"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
                  {t?.name ?? e.taskId}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {fmtAuroc(e.metrics.auroc)}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-900/50 dark:text-ink-50/50">
                  AUROC · n={e.metrics.n_test}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-6 text-xs text-ink-900/50 dark:text-ink-50/50 max-w-3xl">
          Mitigation analysis (notebook 31): in abstain mode at threshold 0.684, confidently-wrong
          response rate drops <strong>−88% on SimpleQA</strong>, −52% on HaluEval, −50% on TruthfulQA.
          MMLU is &quot;capability control&quot; — out of scope by design (see honest scope below).
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Use cases (4-up grid)                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Where FabricationGuard fits <span className="text-ink-900/40 dark:text-ink-50/40">in clinical workflows</span>
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((uc) => {
              const Icon = uc.icon
              return (
                <div
                  key={uc.title}
                  className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-brand-500/10 p-2 ring-1 ring-inset ring-brand-500/20">
                      <Icon className="h-5 w-5 text-brand-700 dark:text-brand-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">{uc.title}</h3>
                      <p className="mt-2 text-[13.5px] text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                        {uc.description}
                      </p>
                      <div className="mt-3 space-y-1">
                        {uc.fits.map((f, i) => (
                          <div
                            key={i}
                            className="text-[11.5px] text-emerald-700 dark:text-emerald-300"
                          >
                            ✓ {f}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-md bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 px-3 py-2 text-[11.5px] text-amber-800 dark:text-amber-200">
                        <strong>Caveat:</strong> {uc.caveat}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Honest scope                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-black/5 dark:border-white/10 bg-amber-500/[0.03]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-300 mt-1" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Honest scope &mdash; what is <em>not</em> validated yet
              </h2>
              <p className="mt-3 max-w-3xl text-[15px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
                We do <strong>not</strong> currently have medical-domain test sets in the registry. The probe is
                trained on general open-domain factual QA. Performance on medical-specific
                benchmarks (PubMedQA, MedQA, MIMIC-IV summarization) is{' '}
                <em className="text-ink-900 dark:text-ink-50">not yet measured</em>. Anyone deploying this in a clinical
                setting must:
              </p>
              <ul className="mt-5 space-y-2 max-w-3xl text-[14px] text-ink-900/80 dark:text-ink-50/80 list-disc pl-6">
                <li>
                  <strong>Recalibrate threshold</strong> on a held-out medical test set with annotated halu/grounded
                  labels (we recommend 200+ samples).
                </li>
                <li>
                  <strong>Estimate domain-shift AUROC</strong> &mdash; out-of-distribution AUROC for medical
                  context likely lower than the 0.88 cross-task headline.
                </li>
                <li>
                  <strong>Pair with retrieval grounding</strong> when ground truth exists (RAG, drug databases,
                  guideline DB). FabricationGuard handles closed-book; HaluGate-style NLI handles grounded. The two
                  are complementary.
                </li>
                <li>
                  <strong>Human-in-the-loop above any abstention threshold</strong>. Probe-based abstention is a
                  filter, not a replacement for clinical review &mdash; especially in the EU AI Act Article 14 sense.
                </li>
              </ul>
              <p className="mt-5 max-w-3xl text-[13px] text-ink-900/55 dark:text-ink-50/55 italic">
                If your team has annotated medical hallucination data and wants to run the probe to produce
                domain-specific numbers, we will publish those evaluations on ProbeBench (with citation to your
                team) at no cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Regulatory framework                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Regulatory framework <span className="text-ink-900/40 dark:text-ink-50/40">(why probe-based abstention fits)</span>
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {regulatoryFlags.map((r) => (
            <a
              key={r.label}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{r.label}</div>
                <ExternalLink className="h-3 w-3 text-ink-900/40 dark:text-ink-50/40" />
              </div>
              <p className="mt-2 text-[13px] text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {r.detail}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pilot framework                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="pilot"
        className="border-t border-black/5 dark:border-white/10 scroll-mt-20"
      >
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Pilot framework <span className="text-ink-900/40 dark:text-ink-50/40">— for medical-domain partners</span>
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
            We are looking for 2-3 partners (clinical research orgs, medical AI startups, hospital
            systems with ML teams) to run a 30-day pilot. Outcome: domain-validated AUROC numbers
            on your test set, published on ProbeBench with citation.
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-6">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-brand-600" />
                What we provide
              </h3>
              <ul className="mt-4 space-y-2 text-[13.5px] text-ink-900/75 dark:text-ink-50/75">
                <li>✓ FabricationGuard probe (Apache-2.0) integrated into your inference pipeline</li>
                <li>✓ Recalibration on your held-out test set (200-500 examples)</li>
                <li>✓ Threshold tuning by your asymmetric cost model (false-confidence vs over-abstention)</li>
                <li>✓ ECE / FPR@99TPR / AUROC with bootstrap CIs</li>
                <li>✓ Cross-model Pearson_CE if you use a non-Qwen model</li>
                <li>✓ Public publication of results on ProbeBench (or private if NDA)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-6">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <ScanEye className="h-4 w-4 text-accent-500" />
                What we need from you
              </h3>
              <ul className="mt-4 space-y-2 text-[13.5px] text-ink-900/75 dark:text-ink-50/75">
                <li>✓ 200-500 medical Q-A pairs with annotated hallucination labels</li>
                <li>✓ Description of clinical context (specialty, query distribution, deployment surface)</li>
                <li>✓ Asymmetric-cost specification (e.g., &quot;over-abstention 5×, false-confidence 50×&quot;)</li>
                <li>✓ Engineering counterpart for ~2 weeks integration support</li>
                <li>✓ Permission to publish anonymized aggregate results (or NDA + private deliverable)</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6">
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Pilot outcomes — what gets published
            </h3>
            <p className="mt-3 text-[13.5px] text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
              At end of pilot we co-author a post on{' '}
              <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:underline">
                openinterp.org/blog
              </Link>{' '}
              with the domain-specific numbers. Your team is named. Your task gets registered as
              a new entry in <Link href="/probebench/tasks" className="text-brand-600 dark:text-brand-400 hover:underline">/probebench/tasks</Link> with SHA-256-hashed test set.
              Probe variant tuned to your domain becomes a registered probe alongside FabricationGuard
              v2. Your customers see the validation.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Roadmap                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-black/5 dark:border-white/10 bg-brand-500/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Medical AI roadmap <span className="text-ink-900/40 dark:text-ink-50/40">on ProbeBench</span>
          </h2>
          <ol className="mt-8 space-y-3">
            {[
              {
                stage: 'v0.1 (today)',
                title: 'FabricationGuard general-domain — applicable to medical with caveat',
                body: 'Linear probe trained on TruthfulQA/HaluEval/MMLU/SimpleQA. Cross-domain AUROC unmeasured for medical. Use with explicit recalibration.',
              },
              {
                stage: 'v0.2 (Q3 2026)',
                title: 'Medical-domain test sets registered',
                body: 'PubMedQA, MedQA-USMLE, MIMIC-IV-derived summarization halu test set added to /probebench/tasks. SHA-256 pinned.',
              },
              {
                stage: 'v0.3 (Q4 2026)',
                title: 'MedicalFabricationGuard — domain-specialized probe',
                body: 'Probe re-trained on medical Q-A corpus with halu labels from clinician annotations. Released as separate registry entry alongside general-domain v2.',
              },
              {
                stage: 'v1.0 (2027)',
                title: 'Drug-interaction probe + clinical-grounding NLI ensemble',
                body: 'Specialized probe for pharmaceutical fabrications + post-hoc grounding against pharmacovigilance DB. Combined ProbeScore reported.',
              },
            ].map((s, i) => (
              <li
                key={s.stage}
                className="rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 backdrop-blur p-5 flex gap-4"
              >
                <div className="text-xs font-mono text-ink-900/40 dark:text-ink-50/40 w-20 shrink-0 pt-0.5">
                  {s.stage}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="mt-1 text-[13px] text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                    {s.body}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer CTA                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-6">
              <h3 className="text-base font-semibold">Pilot inquiry</h3>
              <p className="mt-2 text-[13px] text-ink-900/70 dark:text-ink-50/70">
                Email with a 1-paragraph description of your medical AI deployment + test-set
                availability.
              </p>
              <a
                href="mailto:caio@openinterp.org?subject=ProbeBench%20%C3%97%20Medical%20AI%20pilot"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                caio@openinterp.org <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/15 p-6">
              <h3 className="text-base font-semibold">Self-serve integration</h3>
              <p className="mt-2 text-[13px] text-ink-900/70 dark:text-ink-50/70">
                Already deployed Qwen3.6-27B and want to drop in FabricationGuard?
              </p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-ink-900 dark:bg-ink-50/5 p-3 text-[11px] text-ink-50 dark:text-ink-50">
{`pip install openinterp
from openinterp import FabricationGuard
guard = FabricationGuard.from_pretrained("Qwen/Qwen3.6-27B")
output = guard.generate(query, mode="abstain", threshold=0.5)`}
              </pre>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-ink-900/40 dark:text-ink-50/40">
            ProbeBench v0.0.1 · Apache-2.0 · OpenInterp · 2026
          </p>
        </div>
      </section>
    </div>
  )
}
