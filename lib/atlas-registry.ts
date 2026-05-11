/**
 * Atlas registry — TypeScript types + fetch helpers for the
 * github.com/OpenInterpretability/registry data.
 *
 * Index lives at raw.githubusercontent.com/.../main/index.json.
 * Per-entry payloads live at atlas/2026/<slug>.json.
 *
 * Fetched server-side with Next.js cache (revalidate 5 min).
 */

export const REGISTRY_BASE =
  'https://raw.githubusercontent.com/OpenInterpretability/registry/main'

export const REGISTRY_GITHUB =
  'https://github.com/OpenInterpretability/registry'

export const REVALIDATE_SECONDS = 300

export type AtlasEntryType =
  | 'probe-result'
  | 'atlas-entry'
  | 'replication'
  | 'adversarial-finding'
  | 'sae-feature'

export interface AtlasIndexEntry {
  slug: string
  title: string
  author: string
  type: AtlasEntryType
  model_id: string | null
  claim: string | null
  path: string
  hf_repo_id: string | null
  hf_url: string | null
  doi: string | null
  paper_url: string | null
  manifest_sha256: string
  created_at: string
}

export interface AtlasIndex {
  schema_version: number
  last_updated: string
  count: number
  entries: AtlasIndexEntry[]
}

export interface AtlasEntry extends AtlasIndexEntry {
  license: string
  schema_version: number
  numbers: Record<string, unknown>
  artifacts: string[]
  methodology_check: Record<string, unknown> | null
  reproduces: string | null
}

export async function fetchAtlasIndex(): Promise<AtlasIndex> {
  const res = await fetch(`${REGISTRY_BASE}/index.json`, {
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!res.ok) {
    throw new Error(`Atlas index fetch failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as AtlasIndex
}

export async function fetchAtlasEntry(slug: string): Promise<AtlasEntry | null> {
  // The slug is the first 10 chars of manifest_sha256; the file lives at atlas/<year>/<slug>.json.
  // We try a few years to be future-proof (2026 + 2027); cheap because cached.
  for (const year of ['2026', '2027']) {
    const res = await fetch(`${REGISTRY_BASE}/atlas/${year}/${slug}.json`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (res.ok) {
      const payload = (await res.json()) as AtlasEntry
      // The per-entry file does not include the `slug` and `path` fields by default
      // (those are index-only). We synthesize them so the detail page is self-contained.
      return {
        ...payload,
        slug,
        path: `atlas/${year}/${slug}.json`,
      }
    }
  }
  return null
}

export const TYPE_LABELS: Record<AtlasEntryType, string> = {
  'probe-result': 'Probe result',
  'atlas-entry': 'Finding',
  replication: 'Replication',
  'adversarial-finding': 'Adversarial / negative',
  'sae-feature': 'SAE feature',
}

export const TYPE_COLORS: Record<AtlasEntryType, string> = {
  'probe-result': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  'atlas-entry': 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30',
  replication: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/30',
  'adversarial-finding': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  'sae-feature': 'bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/30',
}

export function rawFileUrl(path: string): string {
  return `${REGISTRY_BASE}/${path}`
}

export function githubFileUrl(path: string): string {
  return `${REGISTRY_GITHUB}/blob/main/${path}`
}
