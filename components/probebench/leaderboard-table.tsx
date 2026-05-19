/**
 * ProbeBench leaderboard table — renders ranked probe entries.
 *
 * Restored 2026-05-19 (file was referenced from `app/probebench/page.tsx` since
 * commit 71c1522 on 2026-05-10 but never landed in the repo, breaking Vercel
 * builds). This restoration is a minimal-viable functional version matching
 * the data shape produced by `rankedProbes()` in `lib/probebench-data.ts`.
 *
 * Future iteration: client-side sorting, hover-card with full breakdown,
 * trend sparklines per axis. v0.0.1 ships static.
 */
import Link from 'next/link'
import { ExternalLink, Award } from 'lucide-react'
import type { ProbeEntry, ProbeScoreBreakdown, EvalEntry } from '@/lib/probebench-types'
import { scoreColor } from '@/lib/probebench-scoring'

export interface LeaderboardRow {
  probe: ProbeEntry
  score: ProbeScoreBreakdown & { rank?: number; globalRank?: number }
  evals: EvalEntry[]
}

interface LeaderboardTableProps {
  rows: LeaderboardRow[]
  /** Show the probe's category column. Default true; set false on per-category sub-tables. */
  showCategory?: boolean
}

const categoryLabel: Record<string, string> = {
  hallucination: 'Hallucination',
  reasoning: 'Reasoning',
  deception: 'Deception',
  sandbagging: 'Sandbagging',
  eval_awareness: 'Eval-Aware',
  reward_hacking: 'Reward-Hack',
  manipulation: 'Manipulation',
  refusal: 'Refusal',
}

function bestAuroc(evals: EvalEntry[]): number | null {
  if (!evals.length) return null
  return Math.max(...evals.map((e) => e.metrics?.auroc ?? 0))
}

function ProbeScorePill({ score }: { score: number }) {
  const c = scoreColor(score)
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ${c.bg} ${c.text}`}
      title={`ProbeScore = ${score.toFixed(3)}`}
    >
      {score.toFixed(3)}
    </span>
  )
}

export function LeaderboardTable({ rows, showCategory = true }: LeaderboardTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-900/20 dark:border-ink-50/20 bg-ink-50/30 dark:bg-ink-900/30 px-4 py-8 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
        No probes registered in this category yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-900/10 dark:border-ink-50/10">
      <table className="w-full text-sm">
        <thead className="bg-ink-50/50 dark:bg-ink-900/50 text-xs uppercase tracking-wider text-ink-900/60 dark:text-ink-50/60">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">#</th>
            <th className="px-3 py-2.5 text-left font-medium">Probe</th>
            {showCategory && <th className="px-3 py-2.5 text-left font-medium">Category</th>}
            <th className="px-3 py-2.5 text-left font-medium">Model</th>
            <th className="px-3 py-2.5 text-right font-medium" title="Best AUROC across registered tasks">AUROC</th>
            <th className="px-3 py-2.5 text-right font-medium">Latency (ms)</th>
            <th className="px-3 py-2.5 text-left font-medium">License</th>
            <th className="px-3 py-2.5 text-right font-medium">ProbeScore</th>
            <th className="px-3 py-2.5 text-right font-medium">Artifact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/5 dark:divide-ink-50/5">
          {rows.map((r) => {
            const rank = showCategory ? r.score.globalRank : r.score.rank
            const auroc = bestAuroc(r.evals)
            const latency = r.evals.length
              ? Math.min(...r.evals.map((e) => e.metrics?.latency_ms ?? Infinity))
              : null
            const isTop3 = rank !== undefined && rank <= 3
            return (
              <tr
                key={r.probe.id}
                className="hover:bg-ink-50/30 dark:hover:bg-ink-900/30 transition-colors"
              >
                <td className="px-3 py-3 font-mono tabular-nums text-ink-900/60 dark:text-ink-50/60">
                  <span className="inline-flex items-center gap-1.5">
                    {isTop3 && <Award className="h-3.5 w-3.5 text-amber-500" />}
                    {rank ?? '–'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/probebench/probe/${encodeURIComponent(r.probe.id)}`}
                    className="font-medium text-ink-900 dark:text-ink-50 hover:text-brand-600 transition-colors"
                  >
                    {r.probe.shortName ?? r.probe.name}
                  </Link>
                  <div className="text-xs text-ink-900/50 dark:text-ink-50/50">
                    {r.probe.author} · {r.probe.org}
                  </div>
                </td>
                {showCategory && (
                  <td className="px-3 py-3 text-ink-900/70 dark:text-ink-50/70">
                    {categoryLabel[r.probe.category] ?? r.probe.category}
                  </td>
                )}
                <td className="px-3 py-3 font-mono text-xs text-ink-900/70 dark:text-ink-50/70">
                  {r.probe.modelId.split('/').pop()} · L{r.probe.layer}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {auroc !== null ? auroc.toFixed(3) : '–'}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-ink-900/70 dark:text-ink-50/70">
                  {latency !== null && Number.isFinite(latency) ? latency.toFixed(1) : '–'}
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center rounded-md bg-ink-900/5 dark:bg-ink-50/10 px-1.5 py-0.5 font-mono text-xs text-ink-900/70 dark:text-ink-50/70">
                    {r.probe.license}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <ProbeScorePill score={r.score.total} />
                </td>
                <td className="px-3 py-3 text-right">
                  <a
                    href={r.probe.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                    title="Open artifact (HuggingFace)"
                  >
                    HF <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
