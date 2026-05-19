import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  BookOpen,
  Database,
  GitPullRequest,
  ArrowRight,
  Hash,
  ShieldCheck,
} from 'lucide-react'
import {
  tasks,
  evaluations,
  probes,
  categoryOrder,
  taskBy,
  probeBy,
} from '@/lib/probebench-data'
import { scoreColor, fmtAuroc } from '@/lib/probebench-scoring'
import { CopyButton } from '@/components/copy-button'
import type { TaskEntry, EvalEntry, ProbeCategory } from '@/lib/probebench-types'

export const metadata = {
  title: 'Tasks — ProbeBench',
  description:
    '7 alignment-relevant benchmark tasks across 8 categories. SHA-256-hashed test sets, paper provenance, public probe evaluations.',
}

// ---------------------------------------------------------------------------
// Helpers (server-side, pure)
// ---------------------------------------------------------------------------

/** All evals for a given task, sorted by AUROC desc. */
function evalsForTask(taskId: string): EvalEntry[] {
  return evaluations
    .filter((e) => e.taskId === taskId)
    .slice()
    .sort((a, b) => b.metrics.auroc - a.metrics.auroc)
}

/** Distinct probe count for a task. */
function distinctProbeCount(taskId: string): number {
  const ids = new Set<string>()
  evaluations.forEach((e) => {
    if (e.taskId === taskId) ids.add(e.probeId)
  })
  return ids.size
}

/** Truncated hash like  a1f3e2d8c7b6 ... a9f8e7d6 */
function hashShort(hash: string): string {
  if (hash.length <= 24) return hash
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`
}

/** Hostname extraction for dataset URL display. */
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Category style chip. */
function categoryChip(cat: ProbeCategory): string {
  const map: Record<ProbeCategory, string> = {
    hallucination: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30',
    reasoning: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/30',
    deception: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30',
    sandbagging: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    eval_awareness: 'bg-accent-500/10 text-accent-700 dark:text-accent-300 ring-accent-500/30',
    reward_hacking: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    manipulation: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 ring-fuchsia-500/30',
    refusal: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/30',
  }
  return map[cat]
}

const YAML_SCHEMA = `id: your-task-id
name: "Your Task Name"
category: hallucination   # or any of the 8 ProbeBench categories
description: "Short description"
paper: "arXiv:XXXX.XXXXX"
dataset_url: "https://huggingface.co/datasets/your/dataset"
test_set_size: 200
test_set_hash: "abc123..."   # SHA-256 of the canonical test split
positive_label: "hallucinated"`

// ---------------------------------------------------------------------------
// Sub-components (server, no client interaction)
// ---------------------------------------------------------------------------

function StatCard({
  value,
  label,
  hint,
}: {
  value: number | string
  label: string
  hint?: string
}) {
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

function TaskProbeRow({ ev }: { ev: EvalEntry }) {
  const probe = probeBy(ev.probeId)
  const m = ev.metrics
  const sc = scoreColor(m.auroc)
  return (
    <tr className="border-t border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2 text-xs">
        {probe ? (
          <Link
            href={`/probebench/probe/${encodeURIComponent(probe.id)}`}
            className="font-medium text-ink-900 dark:text-ink-50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {probe.shortName}
          </Link>
        ) : (
          <span className="font-mono text-ink-900/60 dark:text-ink-50/60">{ev.probeId}</span>
        )}
        {probe && (
          <div className="mt-0.5 text-[10px] font-mono text-ink-900/40 dark:text-ink-50/40">
            L{probe.layer} · {probe.position}
          </div>
        )}
      </td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset ${sc.bg} ${sc.ring} ${sc.text}`}
        >
          {fmtAuroc(m.auroc, m.auroc_lo, m.auroc_hi)}
        </span>
      </td>
      <td className="px-3 py-2 text-xs tabular-nums text-ink-900/70 dark:text-ink-50/70">
        {m.auroc_evalaware_corrected != null ? m.auroc_evalaware_corrected.toFixed(3) : '—'}
      </td>
      <td className="px-3 py-2 text-xs tabular-nums text-ink-900/70 dark:text-ink-50/70">
        {m.auroc_distshift != null ? m.auroc_distshift.toFixed(3) : '—'}
      </td>
    </tr>
  )
}

function TaskCard({ task }: { task: TaskEntry }) {
  const evs = evalsForTask(task.id)
  const probeCount = distinctProbeCount(task.id)
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5 sm:p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            {task.name}
          </h3>
          <div className="mt-1 font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40">
            id: {task.id}
          </div>
        </div>
        <span
          className={`chip whitespace-nowrap ring-1 ring-inset ${categoryChip(task.category)}`}
        >
          {task.category.replace('_', ' ')}
        </span>
      </div>

      <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed line-clamp-2">
        {task.description}
      </p>

      {/* Provenance row */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {task.paper && (
          <a
            href={`https://arxiv.org/abs/${task.paper.replace(/^arXiv:/i, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/[0.04] px-2 py-1 font-medium text-ink-900/70 dark:text-ink-50/70 hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            Paper: {task.paper}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        )}
        {task.datasetUrl && (
          <a
            href={task.datasetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/[0.04] px-2 py-1 font-medium text-ink-900/70 dark:text-ink-50/70 hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <Database className="h-3 w-3" />
            Dataset: {hostnameOf(task.datasetUrl)}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        )}
      </div>

      {/* Test set + hash */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            Test set size
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-ink-900 dark:text-ink-50">
            {task.testSetSize.toLocaleString()} examples
          </div>
        </div>
        <div className="rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] px-3 py-2.5">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
            <Hash className="h-3 w-3" /> SHA-256
          </div>
          <div
            className="mt-0.5 font-mono text-[11px] text-ink-900/80 dark:text-ink-50/80 truncate"
            title={task.testSetHash}
          >
            {hashShort(task.testSetHash)}
          </div>
        </div>
      </div>

      {/* Positive label */}
      <div className="mt-3 rounded-xl border border-brand-500/20 bg-brand-500/[0.05] px-3 py-2 text-xs">
        <span className="font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60 mr-2">
          Positive class
        </span>
        <code className="font-mono text-brand-700 dark:text-brand-300">{task.positiveLabel}</code>
      </div>

      {/* Probes evaluated */}
      <details className="mt-4 group" open={evs.length > 0 && evs.length <= 3}>
        <summary className="flex items-center justify-between cursor-pointer list-none rounded-lg px-3 py-2 -mx-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">
          <span className="text-xs font-semibold text-ink-900 dark:text-ink-50">
            Probes evaluated:{' '}
            <span className="tabular-nums text-brand-600 dark:text-brand-400">{probeCount}</span>
          </span>
          <span className="text-[10px] font-mono text-ink-900/40 dark:text-ink-50/40 group-open:rotate-180 transition-transform">
            ▾
          </span>
        </summary>

        <div className="mt-3">
          {evs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/10 dark:border-white/15 px-3 py-4 text-center text-xs text-ink-900/50 dark:text-ink-50/50">
              — No probes evaluated on this task yet —
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-black/5 dark:border-white/10">
              <table className="w-full text-left">
                <thead className="bg-black/[0.03] dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                      Probe
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                      AUROC [CI]
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                      Eval-aware
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
                      Dist-shift
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evs.map((ev) => (
                    <TaskProbeRow key={`${ev.probeId}-${ev.taskId}`} ev={ev} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
    </article>
  )
}

function EmptyCategoryPanel({ label }: { label: string }) {
  return (
    <Link
      href="/probebench/submit"
      className="group block rounded-2xl border border-dashed border-black/15 dark:border-white/15 px-8 py-10 text-center transition-colors hover:border-brand-500/50 hover:bg-brand-500/[0.04]"
    >
      <div className="text-2xl">🌱</div>
      <div className="mt-2 text-sm font-semibold text-ink-900 dark:text-ink-50">
        Slot open · propose a benchmark task
      </div>
      <div className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60">
        No task registered for{' '}
        <span className="font-mono">{label.toLowerCase()}</span> yet. Open a PR with a YAML registry
        entry to claim the slot.
      </div>
      <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
        Submit a task <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProbeBenchTasksPage() {
  const totalTestExamples = tasks.reduce((s, t) => s + t.testSetSize, 0)

  return (
    <div className="relative">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/probebench"
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-900/60 dark:text-ink-50/60 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to ProbeBench
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.05] via-transparent to-accent-500/[0.05]"
        />
        <div
          aria-hidden
          className="absolute -top-24 right-1/4 -z-10 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
              ProbeBench Tasks
            </span>
            <span className="chip bg-accent-500/10 text-accent-700 dark:text-accent-300 ring-accent-500/30">
              SHA-256 pinned
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Benchmarks the leaderboard runs on.
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            {tasks.length} tasks across {categoryOrder.length} categories. Each test set is
            SHA-256-hashed and version-pinned. Probes that train on a test set get caught at
            validation time.
          </p>

          {/* Stats */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              value={tasks.length}
              label="Tasks"
              hint="across alignment-relevant categories"
            />
            <StatCard
              value={categoryOrder.length}
              label="Categories"
              hint="hallucination → refusal"
            />
            <StatCard
              value={totalTestExamples.toLocaleString()}
              label="Total test examples"
              hint="held-out, hashed splits"
            />
            <StatCard
              value={probes.length}
              label="Active probes"
              hint="evaluated on these tasks"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Tasks by category                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-14">
          {categoryOrder.map(({ category, label, description }) => {
            const categoryTasks = tasks.filter((t) => t.category === category)
            // Determine grid layout based on count
            const gridCols =
              categoryTasks.length === 1
                ? 'grid-cols-1'
                : categoryTasks.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            return (
              <div key={category}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                      {label}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`chip ring-1 ring-inset ${categoryChip(category as ProbeCategory)}`}
                    >
                      {categoryTasks.length} task{categoryTasks.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {categoryTasks.length > 0 ? (
                  <div className={`grid gap-4 ${gridCols}`}>
                    {categoryTasks.map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                  </div>
                ) : (
                  <EmptyCategoryPanel label={label} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Open-source dataset commitment                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-accent-500/[0.04] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl font-semibold tracking-tight">
              Open-source dataset commitment
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
            Every test set referenced here is publicly available under the dataset's original
            license. We pin a SHA-256 hash so probes can be validated against the exact bytes we
            evaluated on.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
            If a dataset is gated (e.g., requires HF agreement), we link to the canonical source
            and ship our exact preprocessed splits as a separate Apache-2.0 derivative when
            permitted.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Submit a task                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
                <GitPullRequest className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">Submit a task</h3>
              <p className="mt-2 max-w-2xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                Have a benchmark task that should be in here? Open a PR with the YAML registry
                entry.
              </p>
            </div>
            <CopyButton text={YAML_SCHEMA} />
          </div>

          <div className="mt-5 rounded-xl border border-black/5 dark:border-white/10 bg-ink-950 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-50/50">
                <FileText className="h-3 w-3" />
                tasks/your-task-id.yaml
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-50/40">
                YAML
              </span>
            </div>
            <pre className="px-4 py-4 text-xs sm:text-sm font-mono text-ink-50 leading-relaxed overflow-x-auto">
              {YAML_SCHEMA}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="https://github.com/OpenInterpretability/probebench-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Open the registry on GitHub <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href="/probebench/submit"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Submission template <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-10 border-t border-black/5 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
            ProbeBench v0.0.1 · Tasks index
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-xs">
            <Link
              href="/probebench"
              className="font-medium text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Leaderboard
            </Link>
            <span className="text-ink-900/30 dark:text-ink-50/30">·</span>
            <Link
              href="/probebench/about"
              className="font-medium text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Methodology
            </Link>
            <span className="text-ink-900/30 dark:text-ink-50/30">·</span>
            <Link
              href="/probebench/submit"
              className="font-medium text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Submit
            </Link>
          </nav>
        </div>
      </section>
    </div>
  )
}
