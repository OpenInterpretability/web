import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  Cpu,
  Brain,
  ShieldCheck,
  GitBranch,
  Award,
} from 'lucide-react'
import {
  models,
  probes,
  evaluations,
  categoryOrder,
  modelBy,
  evalsFor,
} from '@/lib/probebench-data'
import { scoreColor } from '@/lib/probebench-scoring'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'Models — ProbeBench',
  description:
    'Open-weights LLMs covered by ProbeBench probes: Qwen3.6, Llama-3.3, Gemma-3 and growing. Architecture details, license posture, per-category probe counts.',
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const mathCls =
  'font-mono text-[13px] px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded'

/** Sort models by family then by paramCount (ascending numeric value of B/M suffix). */
function paramCountValue(p: string): number {
  const m = p.match(/([\d.]+)\s*([BbMm]?)/)
  if (!m) return 0
  const v = parseFloat(m[1])
  const unit = (m[2] || 'B').toUpperCase()
  return unit === 'M' ? v / 1000 : v
}

const sortedModels = [...models].sort((a, b) => {
  if (a.family !== b.family) return a.family.localeCompare(b.family)
  return paramCountValue(a.paramCount) - paramCountValue(b.paramCount)
})

/** Number of probes for a (modelId, category) pair. */
function probeCount(modelId: string, category: string): number {
  return probes.filter((p) => p.modelId === modelId && p.category === category).length
}

/** Probes for a model, sorted by best AUROC desc. */
function probesForModel(modelId: string) {
  return probes
    .filter((p) => p.modelId === modelId)
    .map((p) => {
      const evals = evalsFor(p.id)
      const bestAuroc =
        evals.length > 0
          ? Math.max(...evals.map((e) => e.metrics.auroc))
          : 0
      return { probe: p, bestAuroc, nEvals: evals.length }
    })
    .sort((a, b) => b.bestAuroc - a.bestAuroc)
}

/** Family pill colors. */
function familyPill(family: string): string {
  switch (family) {
    case 'Qwen':
      return 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30'
    case 'Llama':
      return 'bg-accent-500/15 text-accent-700 dark:text-accent-300 ring-accent-500/30'
    case 'Gemma':
      return 'bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/30'
    case 'Mistral':
      return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 ring-orange-500/30'
    case 'DeepSeek':
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30'
    case 'Phi':
      return 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-fuchsia-500/30'
    case 'GPT-OSS':
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/30'
    default:
      return 'bg-ink-900/10 text-ink-900/70 dark:text-ink-50/70 ring-ink-900/20'
  }
}

/** License badge colors. */
function licensePill(lic: string): string {
  switch (lic) {
    case 'Apache-2.0':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30'
    case 'MIT':
      return 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30'
    case 'BSD-3-Clause':
      return 'bg-accent-500/15 text-accent-700 dark:text-accent-300 ring-accent-500/30'
    case 'CC-BY-4.0':
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30'
    case 'custom':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
    case 'closed':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
    default:
      return 'bg-ink-900/10 text-ink-900/70 dark:text-ink-50/70 ring-ink-900/20'
  }
}

/** Category-pill style for probe rows. */
function categoryPill(category: string): string {
  switch (category) {
    case 'hallucination':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
    case 'reasoning':
      return 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30'
    case 'deception':
      return 'bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/30'
    case 'sandbagging':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30'
    case 'eval_awareness':
      return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30'
    case 'reward_hacking':
      return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 ring-orange-500/30'
    case 'manipulation':
      return 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 ring-fuchsia-500/30'
    case 'refusal':
      return 'bg-accent-500/15 text-accent-700 dark:text-accent-300 ring-accent-500/30'
    default:
      return 'bg-ink-900/10 text-ink-900/70 dark:text-ink-50/70 ring-ink-900/20'
  }
}

/** Coverage cell (model × category) styling by count. */
function cellStyles(count: number): {
  bg: string
  ring: string
  text: string
  border: string
} {
  if (count === 0)
    return {
      bg: 'bg-transparent',
      ring: 'ring-transparent',
      text: 'text-ink-900/30 dark:text-ink-50/30',
      border: 'border border-dashed border-black/15 dark:border-white/15',
    }
  if (count === 1)
    return {
      bg: 'bg-brand-500/10',
      ring: 'ring-brand-500/25',
      text: 'text-brand-700 dark:text-brand-300',
      border: 'ring-1 ring-inset',
    }
  return {
    bg: 'bg-brand-500/30',
    ring: 'ring-brand-500/50',
    text: 'text-brand-800 dark:text-brand-200',
    border: 'ring-1 ring-inset',
  }
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ProbeBenchModelsPage() {
  const apacheModels = models.filter((m) => m.weightsLicense === 'Apache-2.0')
  const customModels = models.filter((m) => m.weightsLicense === 'custom')
  const closedModels = models.filter((m) => m.weightsLicense === 'closed')
  const familyCount = new Set(models.map((m) => m.family)).size

  // Submission YAML
  const submissionYaml = `id: "Qwen/Qwen3.6-27B"
short_name: "Qwen3.6-27B"
family: "Qwen"
param_count: "27B"
architecture: "Hybrid GDN + Gated-Attn"
layers: 64
d_model: 5120
release: "2026-04"
weights_license: "Apache-2.0"
hf_url: "https://huggingface.co/Qwen/Qwen3.6-27B"
thinking_mode: true`

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
          ProbeBench Models
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance inline-flex items-center gap-3">
          <Cpu className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          Open-weights models we evaluate probes on.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          {models.length} models registered. Probes are model-specific by design — a
          Qwen3.6 probe will not transfer to Llama-3 without re-training. Cross-model
          transfer numbers are reported via{' '}
          <code className={mathCls}>Pearson_CE</code> on each probe DNA page.
        </p>

        {/* Stat row */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Cpu className="h-4 w-4" />}
            label="Models"
            value={`${models.length}`}
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Apache-2.0 weights"
            value={`${apacheModels.length}`}
          />
          <StatCard
            icon={<Award className="h-4 w-4" />}
            label="Probes ranked"
            value={`${probes.length}`}
          />
          <StatCard
            icon={<GitBranch className="h-4 w-4" />}
            label="Architecture families"
            value={`${familyCount}`}
          />
        </div>
      </div>

      {/* Coverage Matrix */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Models × Categories coverage
        </h2>
        <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
          {models.length} models · {categoryOrder.length} categories
        </div>
      </div>

      <div className="card p-5 mb-4 overflow-x-auto group/matrix">
        <div className="min-w-[920px]">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `minmax(180px, 240px) repeat(${categoryOrder.length}, minmax(80px, 1fr))`,
            }}
          >
            {/* corner */}
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-900/40 dark:text-ink-50/40 flex items-end justify-end pr-3 pb-2">
              model ↓ / category →
            </div>
            {/* column headers */}
            {categoryOrder.map((c) => (
              <div
                key={`col-${c.category}`}
                className="text-[11px] font-semibold text-ink-900/70 dark:text-ink-50/70 px-1 pb-2 text-center leading-tight"
                title={c.description}
              >
                <div className="truncate">{c.label}</div>
              </div>
            ))}

            {/* rows */}
            {sortedModels.map((m) => {
              const total = probes.filter((p) => p.modelId === m.id).length
              return (
                <CoverageRow
                  key={m.id}
                  model={m}
                  total={total}
                  cells={categoryOrder.map((c) => ({
                    category: c.category,
                    label: c.label,
                    count: probeCount(m.id, c.category),
                  }))}
                />
              )
            })}
          </div>
        </div>
      </div>

      <p className="mb-12 text-xs text-ink-900/55 dark:text-ink-50/55 leading-relaxed max-w-3xl">
        Cell value = number of registered probes for that model × category combination.
        Empty dashed cells indicate categories where no probe has been registered yet for
        that model — these are the highest-leverage targets for new submissions.
      </p>

      {/* Per-model card grid */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">
        Per-model registry
      </h2>
      <div className="grid gap-5 md:grid-cols-2 mb-14">
        {sortedModels.map((m) => {
          const mProbes = probesForModel(m.id)
          return (
            <article key={m.id} className="card p-5 flex flex-col">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold tracking-tight text-lg">
                      {m.shortName}
                    </h3>
                    <span
                      className={`chip ring-inset font-medium text-xs ${familyPill(
                        m.family,
                      )}`}
                    >
                      {m.family}
                    </span>
                  </div>
                  <a
                    href={m.hfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-baseline gap-1 font-mono text-[11px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 truncate max-w-full"
                  >
                    {m.id}
                    <ExternalLink className="h-3 w-3 self-center shrink-0" />
                  </a>
                </div>
                <span
                  className={`chip ring-inset font-mono text-[11px] shrink-0 ${licensePill(
                    m.weightsLicense,
                  )}`}
                >
                  {m.weightsLicense}
                </span>
              </div>

              {/* Architecture line */}
              <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {m.architecture}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono text-ink-900/55 dark:text-ink-50/55">
                <div>
                  <span className="text-ink-900/40 dark:text-ink-50/40">layers</span>{' '}
                  <span className="font-semibold text-ink-900/80 dark:text-ink-50/80">
                    {m.layers}
                  </span>
                </div>
                <div>
                  <span className="text-ink-900/40 dark:text-ink-50/40">d_model</span>{' '}
                  <span className="font-semibold text-ink-900/80 dark:text-ink-50/80">
                    {m.dModel}
                  </span>
                </div>
                <div>
                  <span className="text-ink-900/40 dark:text-ink-50/40">params</span>{' '}
                  <span className="font-semibold text-ink-900/80 dark:text-ink-50/80">
                    {m.paramCount}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-[11px] font-mono text-ink-900/45 dark:text-ink-50/45">
                released {m.release}
              </div>

              {/* Thinking-mode chip */}
              {m.thinkingMode && (
                <div className="mt-3 inline-flex items-center gap-1.5 self-start chip ring-inset bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/30 text-[11px]">
                  <Brain className="h-3 w-3" />
                  Reasoning model · supports &lt;think&gt; traces
                </div>
              )}

              {/* Probes for this model */}
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-[11px] uppercase tracking-wider font-semibold text-ink-900/50 dark:text-ink-50/50">
                    Probes for this model
                  </h4>
                  <span className="font-mono text-[11px] text-ink-900/45 dark:text-ink-50/45">
                    {mProbes.length}
                  </span>
                </div>
                {mProbes.length === 0 ? (
                  <p className="text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                    No probes registered yet — open territory.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {mProbes.map(({ probe, bestAuroc, nEvals }) => {
                      const sc = scoreColor(bestAuroc)
                      return (
                        <li
                          key={probe.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Link
                              href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
                              className="font-medium text-ink-900/85 dark:text-ink-50/85 hover:text-brand-600 dark:hover:text-brand-400 truncate"
                            >
                              {probe.shortName}
                            </Link>
                            <span
                              className={`chip ring-inset text-[10px] ${categoryPill(
                                probe.category,
                              )}`}
                            >
                              {probe.category}
                            </span>
                            <span className="font-mono text-[10px] text-ink-900/45 dark:text-ink-50/45">
                              L{probe.layer}
                            </span>
                          </div>
                          {nEvals > 0 && (
                            <span
                              className={`chip ring-inset font-mono text-[10px] ${sc.bg} ${sc.ring} ${sc.text}`}
                              title={`best AUROC across ${nEvals} eval${nEvals === 1 ? '' : 's'}`}
                            >
                              AUROC {bestAuroc.toFixed(3)}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Cross-model transfer summary */}
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                <Link
                  href="/probebench/transfer-matrix"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  <GitBranch className="h-3 w-3" />
                  {mProbes.length} probe{mProbes.length === 1 ? '' : 's'} with transfer
                  data — view matrix
                </Link>
              </div>

              {/* Submit CTA */}
              <div className="mt-3">
                <Link
                  href="/probebench/submit"
                  className="inline-flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink-900/75 dark:text-ink-50/75 hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  + Add a probe for this model
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {/* License posture */}
      <h2 className="text-2xl font-semibold tracking-tight mb-5">
        License posture
      </h2>
      <div className="grid gap-4 md:grid-cols-3 mb-14">
        <div className="card p-5 border-emerald-500/30 dark:border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold tracking-tight">Apache-2.0 weights</h3>
            <span className="ml-auto font-mono text-xs text-emerald-700 dark:text-emerald-300">
              {apacheModels.length}
            </span>
          </div>
          <ul className="mb-3 space-y-1">
            {apacheModels.length === 0 ? (
              <li className="text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                None yet.
              </li>
            ) : (
              apacheModels.map((m) => (
                <li
                  key={m.id}
                  className="text-xs font-mono text-ink-900/70 dark:text-ink-50/70 truncate"
                >
                  {m.shortName}
                </li>
              ))
            )}
          </ul>
          <p className="text-xs text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
            These are the models the open-weights community can fork, fine-tune,
            redistribute. ProbeBench prioritizes coverage here.
          </p>
        </div>

        <div className="card p-5 border-amber-500/30 dark:border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold tracking-tight">Custom-license weights</h3>
            <span className="ml-auto font-mono text-xs text-amber-700 dark:text-amber-300">
              {customModels.length}
            </span>
          </div>
          <ul className="mb-3 space-y-1">
            {customModels.length === 0 ? (
              <li className="text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                None yet.
              </li>
            ) : (
              customModels.map((m) => (
                <li
                  key={m.id}
                  className="text-xs font-mono text-ink-900/70 dark:text-ink-50/70 truncate"
                >
                  {m.shortName}
                </li>
              ))
            )}
          </ul>
          <p className="text-xs text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
            Llama, Gemma, others. Subject to original license — research use generally
            OK; commercial use varies.
          </p>
        </div>

        <div className="card p-5 border-rose-500/30 dark:border-rose-500/30">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-semibold tracking-tight">Closed weights</h3>
            <span className="ml-auto font-mono text-xs text-rose-700 dark:text-rose-300">
              {closedModels.length}
            </span>
          </div>
          <ul className="mb-3 space-y-1">
            {closedModels.length === 0 ? (
              <li className="text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                Currently 0 in v0.0.1.
              </li>
            ) : (
              closedModels.map((m) => (
                <li
                  key={m.id}
                  className="text-xs font-mono text-ink-900/70 dark:text-ink-50/70 truncate"
                >
                  {m.shortName}
                </li>
              ))
            )}
          </ul>
          <p className="text-xs text-ink-900/65 dark:text-ink-50/65 leading-relaxed">
            We accept closed-weight probes (e.g. GPT-4) but cap their license score at{' '}
            <code className={mathCls}>0.5 × 0.05 = 0.025</code>.
          </p>
        </div>
      </div>

      {/* Architecture-aware notes */}
      <div className="card p-6 mb-14 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <div className="flex items-start gap-3 mb-3">
          <Brain className="h-6 w-6 text-brand-600 dark:text-brand-400 mt-1 shrink-0" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Architecture-aware notes
            </h2>
            <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-3xl">
              Hybrid architectures (Qwen3.6 GDN, Mamba SSMs, MoE) require model-specific
              probe-extraction code. The <code className={mathCls}>openinterp</code>{' '}
              SDK auto-detects layer paths via{' '}
              <code className={mathCls}>model.language_model.layers[N]</code> for HF
              transformers and <code className={mathCls}>model.layers[N]</code> for
              dense paths. Probes for hybrid models declare the{' '}
              <code className={mathCls}>position</code> field carefully —{' '}
              <code className={mathCls}>token_avg</code> vs{' '}
              <code className={mathCls}>end_question</code> vs{' '}
              <code className={mathCls}>mid_think</code> have very different semantics on
              reasoning models.
            </p>
            <Link
              href="/probebench/about#section-5"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              Full extraction protocol → /probebench/about §5
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Submit a model */}
      <div className="card p-8 mb-10 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <div className="flex items-start gap-3 mb-4">
          <Cpu className="h-6 w-6 text-brand-600 dark:text-brand-400 mt-1 shrink-0" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Submit a model</h2>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
              Have a model that should be on here? PR a registry entry against{' '}
              <code className={mathCls}>lib/probebench-data.ts</code>. Required fields
              follow the <code className={mathCls}>ModelEntry</code> schema in{' '}
              <code className={mathCls}>lib/probebench-types.ts</code>.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton text={submissionYaml} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-black/[0.04] dark:bg-white/[0.04] ring-1 ring-inset ring-black/5 dark:ring-white/10 p-4 pr-24 text-[12px] leading-relaxed font-mono text-ink-900/85 dark:text-ink-50/85">
            {submissionYaml}
          </pre>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/probebench/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Cpu className="h-4 w-4" /> Open submission spec
          </Link>
          <Link
            href="/probebench"
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to ProbeBench overview
          </Link>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-900/55 dark:text-ink-50/55">
        <Link
          href="/probebench"
          className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> /probebench
        </Link>
        <Link
          href="/probebench/transfer-matrix"
          className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
        >
          <GitBranch className="h-3 w-3" /> /probebench/transfer-matrix
        </Link>
        <Link
          href="/probebench/submit"
          className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
        >
          <Award className="h-3 w-3" /> /probebench/submit
        </Link>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-ink-900/50 dark:text-ink-50/50">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono font-bold text-2xl text-ink-900/90 dark:text-ink-50/90">
        {value}
      </div>
    </div>
  )
}

function CoverageRow({
  model,
  total,
  cells,
}: {
  model: (typeof models)[number]
  total: number
  cells: Array<{ category: string; label: string; count: number }>
}) {
  return (
    <>
      {/* row label */}
      <div className="flex flex-col justify-center pr-3 py-2 border-r border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-ink-900/85 dark:text-ink-50/85 truncate">
            {model.shortName}
          </span>
          <span
            className={`chip ring-inset text-[10px] shrink-0 ${familyPill(model.family)}`}
          >
            {model.family}
          </span>
        </div>
        <div className="font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40 mt-0.5 truncate">
          {model.layers}L · {model.dModel}d · {model.paramCount} ·{' '}
          <span className="text-ink-900/55 dark:text-ink-50/55">
            {total} probe{total === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* row cells */}
      {cells.map((c) => {
        const styles = cellStyles(c.count)
        const titleLines = [
          `${model.shortName} × ${c.label}`,
          c.count === 0
            ? 'No probes registered for this combination yet.'
            : `${c.count} probe${c.count === 1 ? '' : 's'} registered.`,
        ]
        return (
          <div
            key={`${model.id}-${c.category}`}
            title={titleLines.join('\n')}
            className={`relative aspect-square rounded-lg ${styles.bg} ${
              styles.border === 'ring-1 ring-inset' ? `ring-1 ring-inset ${styles.ring}` : styles.border
            } flex items-center justify-center text-center transition-transform hover:scale-[1.05]`}
          >
            <div className={`font-mono font-bold text-base leading-none ${styles.text}`}>
              {c.count === 0 ? '·' : c.count}
            </div>
          </div>
        )
      })}
    </>
  )
}
