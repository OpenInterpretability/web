import Link from 'next/link'
import { ArrowRight, ExternalLink, Github, Hash, Library, ScrollText, Terminal } from 'lucide-react'
import {
  fetchAtlasIndex,
  TYPE_LABELS,
  TYPE_COLORS,
  REGISTRY_GITHUB,
  type AtlasIndexEntry,
  type AtlasEntryType,
} from '@/lib/atlas-registry'

export const revalidate = 300

export const metadata = {
  title: 'Atlas — Public registry of mech-interp publications · OpenInterp',
  description:
    'Public index of mechanistic-interpretability findings published via openinterp-mcp. Each entry has a content-only sha256 hash, an HF dataset (when applicable), and an optional Zenodo DOI. Apache-2.0.',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return iso.slice(0, 10)
  }
}

function TypeChip({ type }: { type: AtlasEntryType }) {
  return (
    <span
      className={`chip ring-inset ${TYPE_COLORS[type]} whitespace-nowrap`}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}

function StatCard({ value, label, hint }: { value: string | number; label: string; hint?: string }) {
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

function EntryRow({ entry }: { entry: AtlasIndexEntry }) {
  return (
    <Link
      href={`/atlas/${entry.slug}`}
      className="group block rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5 hover:border-brand-500/40 hover:bg-white/80 dark:hover:bg-white/[0.06] transition-colors"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <TypeChip type={entry.type} />
            {entry.model_id && (
              <span className="chip bg-black/[0.04] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 font-mono text-[10px]">
                {entry.model_id.split('/').pop()}
              </span>
            )}
            <span className="text-[11px] font-mono text-ink-900/50 dark:text-ink-50/50">
              {formatDate(entry.created_at)}
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {entry.title}
          </h3>
          {entry.claim && (
            <p className="mt-1.5 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed line-clamp-2">
              {entry.claim}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-ink-900/55 dark:text-ink-50/55">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" /> {entry.slug}
            </span>
            <span>by {entry.author}</span>
            {entry.hf_repo_id && (
              <span className="inline-flex items-center gap-1">
                🤗 {entry.hf_repo_id}
              </span>
            )}
            {entry.doi && (
              <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400">
                DOI {entry.doi}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-900/30 dark:text-ink-50/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

export default async function AtlasPage() {
  const idx = await fetchAtlasIndex()

  // Group by type so the page reads like a categorical index, not a chronological feed.
  const byType: Record<AtlasEntryType, AtlasIndexEntry[]> = {
    'probe-result': [],
    'atlas-entry': [],
    replication: [],
    'adversarial-finding': [],
    'sae-feature': [],
  }
  for (const e of idx.entries) {
    byType[e.type].push(e)
  }
  // Within each type, newest first.
  for (const t of Object.keys(byType) as AtlasEntryType[]) {
    byType[t].sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  const typesInOrder: AtlasEntryType[] = [
    'probe-result',
    'atlas-entry',
    'adversarial-finding',
    'replication',
    'sae-feature',
  ]

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/[0.06] via-transparent to-emerald-500/[0.06]"
        />
        <div
          aria-hidden
          className="absolute -top-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30">
              <Library className="mr-1 inline h-3 w-3" /> Public registry
            </span>
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30">
              Schema v{idx.schema_version} · Apache-2.0
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
            The Atlas — <span className="gradient-text">every public mech-interp finding</span>, hashed and citable.
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            A read-only index of probes, causality verdicts, and honest-negative findings —
            published via <Link href="/mcp" className="text-brand-600 dark:text-brand-400 underline-offset-2 hover:underline">openinterp-mcp</Link>. Every entry ships
            with a content-only sha256, an HF dataset (when applicable), and an optional Zenodo DOI.
          </p>

          {/* Stats */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              value={idx.count}
              label="Entries"
              hint={`updated ${formatDate(idx.last_updated)}`}
            />
            <StatCard
              value={byType['probe-result'].length}
              label="Probes"
              hint="detection-tier artifacts"
            />
            <StatCard
              value={byType['adversarial-finding'].length}
              label="Adversarial / negative"
              hint="honest-negatives are first-class"
            />
            <StatCard
              value={byType['atlas-entry'].length}
              label="Findings"
              hint="principles + methodology results"
            />
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5" /> Publish via your agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={REGISTRY_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Github className="h-4 w-4" /> Registry on GitHub
            </a>
            <a
              href="https://raw.githubusercontent.com/OpenInterpretability/registry/main/index.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-mono text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              <ScrollText className="h-3.5 w-3.5" /> Raw index.json
            </a>
          </div>
        </div>
      </section>

      {/* Categorical sections */}
      <section className="mx-auto max-w-7xl px-6 py-14 space-y-12">
        {typesInOrder.map((type) => {
          const rows = byType[type]
          if (rows.length === 0) return null
          return (
            <div key={type}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {TYPE_LABELS[type]}
                  </h2>
                  <p className="mt-1 text-sm text-ink-900/60 dark:text-ink-50/60">
                    {typeDescription(type)}
                  </p>
                </div>
                <span className="chip bg-black/[0.04] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10">
                  {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <div className="grid gap-3">
                {rows.map((entry) => (
                  <EntryRow key={entry.slug} entry={entry} />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* How to publish */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-emerald-500/[0.04] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-semibold tracking-tight">Publish your finding to the Atlas</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            In your agent session (Claude Code / Cursor / Cline / OpenHands / Aider), once attached
            to a Colab backend via <code className="font-mono text-xs">openinterp-mcp</code>:
          </p>
          <pre className="mt-4 rounded-lg bg-ink-950 text-emerald-200 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`from openinterp_mcp.publish import publish

publish(
  title="My probe — what it does in one line",
  type="probe-result",
  model_id="Qwen/Qwen3.6-27B-Instruct",
  numbers={"auroc": 0.91, "n_samples": 240},
  methodology_check={"verdict": "weak-causal", "baselines_run": [...]},
  hf_repo_id="myuser/my-probe-artifact",
)
# → HF dataset created + Zenodo DOI minted + PR opened against the registry`}
          </pre>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/start"
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
            >
              First result in 10 minutes <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-ink-900/40 dark:text-ink-50/40">·</span>
            <a
              href="https://github.com/OpenInterpretability/openinterp-mcp/blob/main/docs/publish.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50"
            >
              Publish docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function typeDescription(type: AtlasEntryType): string {
  switch (type) {
    case 'probe-result':
      return 'Detection-tier probe artifacts — joblib + scaler + metadata, often with cross-task AUROC.'
    case 'atlas-entry':
      return 'Principles, methodology results, and findings without a single probe artifact attached.'
    case 'adversarial-finding':
      return 'Causality verdicts that walked back claims (epiphenomenal, template-locked, OOD failures). Honest-negatives are first-class citizens.'
    case 'replication':
      return 'Independent reproductions of published methodology, including walkthroughs of small discrepancies.'
    case 'sae-feature':
      return 'Individual SAE features with auto-interp labels + max-activating examples.'
  }
}
