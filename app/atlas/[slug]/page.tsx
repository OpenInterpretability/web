import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileCode,
  FileText,
  Github,
  Hash,
  Microscope,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import {
  fetchAtlasIndex,
  fetchAtlasEntry,
  TYPE_LABELS,
  TYPE_COLORS,
  githubFileUrl,
  rawFileUrl,
  type AtlasEntry,
  type AtlasEntryType,
} from '@/lib/atlas-registry'

export const revalidate = 300

export async function generateStaticParams() {
  const idx = await fetchAtlasIndex()
  return idx.entries.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = await fetchAtlasEntry(slug)
  if (!entry) {
    return { title: `Entry ${slug} not found · Atlas · OpenInterp` }
  }
  return {
    title: `${entry.title} · Atlas · OpenInterp`,
    description: entry.claim ?? `Atlas entry ${slug}`,
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return iso.slice(0, 10)
  }
}

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { Icon: typeof ShieldCheck; cls: string }> = {
    causal: {
      Icon: ShieldCheck,
      cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    },
    'weak-causal': {
      Icon: ShieldCheck,
      cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/30',
    },
    'epiphenomenal-softmax': {
      Icon: ShieldAlert,
      cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    },
    'epiphenomenal-template': {
      Icon: ShieldAlert,
      cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
    },
    undetermined: {
      Icon: ShieldAlert,
      cls: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/30',
    },
  }
  const cfg = map[verdict] ?? map['undetermined']
  return (
    <span className={`chip ring-inset ${cfg.cls} font-mono whitespace-nowrap`}>
      <cfg.Icon className="mr-1 inline h-3 w-3" />
      {verdict}
    </span>
  )
}

function NumberCard({ label, value }: { label: string; value: unknown }) {
  // Pretty-print scalar values; nested objects/arrays get JSON.stringify.
  let display: string
  if (typeof value === 'number') {
    display = Number.isInteger(value) ? String(value) : value.toFixed(3)
  } else if (typeof value === 'boolean') {
    display = value ? 'true' : 'false'
  } else if (value === null || value === undefined) {
    display = '—'
  } else if (typeof value === 'string') {
    display = value
  } else {
    display = JSON.stringify(value)
  }
  return (
    <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink-900 dark:text-ink-50 break-all">
        {display}
      </div>
    </div>
  )
}

function MethodologyRow({ label, value }: { label: string; value: unknown }) {
  let display: React.ReactNode
  if (Array.isArray(value)) {
    display = (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <span
            key={String(v)}
            className="rounded-md bg-black/[0.05] dark:bg-white/[0.05] px-2 py-0.5 text-[11px] font-mono text-ink-900/80 dark:text-ink-50/80"
          >
            {String(v)}
          </span>
        ))}
      </div>
    )
  } else if (typeof value === 'boolean') {
    display = (
      <span
        className={`font-mono text-sm font-semibold ${
          value ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        }`}
      >
        {value ? '✓ yes' : '✗ no'}
      </span>
    )
  } else if (value === null || value === undefined) {
    display = <span className="font-mono text-sm text-ink-900/40 dark:text-ink-50/40">—</span>
  } else if (typeof value === 'string' && value.startsWith('http')) {
    display = (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-brand-600 dark:text-brand-400 hover:underline"
      >
        {value}
      </a>
    )
  } else {
    display = (
      <span className="font-mono text-sm text-ink-900/80 dark:text-ink-50/80">{String(value)}</span>
    )
  }
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_1fr] py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55">
        {label}
      </dt>
      <dd>{display}</dd>
    </div>
  )
}

export default async function AtlasEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await fetchAtlasEntry(slug)
  if (!entry) {
    notFound()
  }

  const verdict =
    (entry.methodology_check?.verdict as string | undefined) ??
    (entry.numbers?.verdict_class as string | undefined)

  return (
    <div className="relative">
      {/* Back link */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <Link
          href="/atlas"
          className="inline-flex items-center gap-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Atlas
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`chip ring-inset ${TYPE_COLORS[entry.type as AtlasEntryType]} whitespace-nowrap`}
          >
            {TYPE_LABELS[entry.type as AtlasEntryType]}
          </span>
          {verdict && <VerdictChip verdict={verdict} />}
          <span className="chip bg-black/[0.04] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10 font-mono text-[10px]">
            {entry.model_id ?? 'no model'}
          </span>
          <span className="text-[11px] font-mono text-ink-900/50 dark:text-ink-50/50">
            {formatDate(entry.created_at)} · by {entry.author}
          </span>
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance leading-tight">
          {entry.title}
        </h1>

        {entry.claim && (
          <p className="mt-4 text-lg text-ink-900/75 dark:text-ink-50/75 leading-relaxed text-balance">
            {entry.claim}
          </p>
        )}

        {/* Resource links */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {entry.hf_url && (
            <a
              href={entry.hf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-3.5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              🤗 HF dataset
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {entry.paper_url && (
            <Link
              href={entry.paper_url}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-3.5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Paper
            </Link>
          )}
          {entry.doi && (
            <a
              href={`https://doi.org/${entry.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300 px-3.5 py-2 text-sm font-medium hover:bg-brand-500/20 transition-colors"
            >
              DOI {entry.doi}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={githubFileUrl(entry.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 px-3.5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Github className="h-3.5 w-3.5" /> Manifest
          </a>
          <a
            href={rawFileUrl(entry.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-mono text-ink-900/55 dark:text-ink-50/55 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
          >
            <ScrollText className="h-3 w-3" /> Raw JSON
          </a>
        </div>
      </section>

      {/* Numbers grid */}
      {Object.keys(entry.numbers).length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Microscope className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Numbers
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(entry.numbers).map(([k, v]) => (
              <NumberCard key={k} label={k} value={v} />
            ))}
          </div>
        </section>
      )}

      {/* Methodology check */}
      {entry.methodology_check && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Methodology check
          </h2>
          <p className="mb-4 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-2xl">
            Output of the <code className="font-mono text-xs">causality_protocol</code> primitive when
            it was run on this artifact. See{' '}
            <Link
              href="/research/papers/two-forms-epiphenomenal-probes"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              paper-6
            </Link>{' '}
            for the 3-baseline methodology and the 5-class verdict spec.
          </p>
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
            <dl>
              {Object.entries(entry.methodology_check).map(([k, v]) => (
                <MethodologyRow key={k} label={k} value={v} />
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Artifacts */}
      {entry.artifacts.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <FileCode className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Artifacts
          </h2>
          <div className="flex flex-wrap gap-2">
            {entry.artifacts.map((a) => (
              <span
                key={a}
                className="rounded-lg border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2 font-mono text-sm text-ink-900/80 dark:text-ink-50/80"
              >
                {a}
              </span>
            ))}
          </div>
          {entry.hf_url && (
            <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
              These files live in the linked HF dataset.{' '}
              <a
                href={entry.hf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Open dataset →
              </a>
            </p>
          )}
        </section>
      )}

      {/* Citation block */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Hash className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          Cite
        </h2>
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5">
          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 mb-3">
            Content-only sha256 below. Verifiable: re-hash the JSON manifest (with{' '}
            <code className="font-mono text-xs">manifest_sha256</code> set to{' '}
            <code className="font-mono text-xs">null</code>, sort_keys=True) and you get the same
            digest. {entry.doi ? 'Zenodo DOI minted; prefer it for citation.' : 'Zenodo DOI pending.'}
          </p>
          <div className="space-y-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 mb-1">
                manifest_sha256
              </div>
              <code className="block rounded-md bg-ink-950 text-emerald-200 px-3 py-2 text-[11px] font-mono break-all">
                {entry.manifest_sha256}
              </code>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 mb-1">
                Atlas URL
              </div>
              <code className="block rounded-md bg-ink-950 text-emerald-200 px-3 py-2 text-[11px] font-mono break-all">
                https://openinterp.org/atlas/{entry.slug}
              </code>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 mb-1">
                Raw manifest
              </div>
              <code className="block rounded-md bg-ink-950 text-emerald-200 px-3 py-2 text-[11px] font-mono break-all">
                {rawFileUrl(entry.path)}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Reproduce via MCP */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-brand-500/[0.04] to-emerald-500/[0.04] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-semibold tracking-tight">Reproduce this in your agent</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            In an agent session attached to your Colab via{' '}
            <Link href="/mcp" className="text-brand-600 dark:text-brand-400 hover:underline">
              openinterp-mcp
            </Link>
            :
          </p>
          <pre className="mt-4 rounded-lg bg-ink-950 text-emerald-200 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`from openinterp_mcp.atlas import load_entry

entry = load_entry("${entry.slug}")
print(entry.methodology_check)

# Re-run the causality protocol against the linked HF artifact:
${entry.hf_repo_id ? `from openinterp_mcp.judge import reproduce
reproduce(entry, hf_repo_id="${entry.hf_repo_id}")` : '# (no HF artifact attached — replicate from methodology alone)'}`}
          </pre>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/start"
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
            >
              First result in 10 minutes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
