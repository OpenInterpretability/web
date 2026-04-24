import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata = { title: 'Catalog' }

const packs = [
  {
    id: 'qwen3.5-4b/reasoning_pack',
    status: 'Validated',
    model: 'Qwen/Qwen3.5-4B',
    benchmark: 'GSM8K (math reasoning)',
    rho: 0.540,
    pearson: 0.726,
    nHeldOut: 100,
    effectSizeRange: '[+2.06, +2.16] / [−2.47, −2.06]',
    features: '10 helpful + 10 harmful',
    discoveredOn: '50 GSM8K responses (raw Q/A)',
    jsonUrl:
      'https://github.com/OpenInterpretability/mechreward/blob/main/catalogs/qwen3.5-4b/reasoning_pack.json',
    sae: 'caiovicentino1/Qwen3.5-4B-SAE-L18-topk',
  },
  {
    id: 'qwen3.6-35b-a3b/reasoning_pack',
    status: 'Validated',
    model: 'Qwen/Qwen3.6-35B-A3B',
    benchmark: 'SuperGPQA (science/engineering)',
    rho: 0.522,
    pearson: 0.537,
    nHeldOut: 100,
    effectSizeRange: '[+1.72, +1.84] / [−1.73, −1.36]',
    features: '10 helpful + 10 harmful',
    discoveredOn: '50 SuperGPQA responses (thinking mode)',
    jsonUrl:
      'https://github.com/OpenInterpretability/mechreward/blob/main/catalogs/qwen3.6-35b-a3b/reasoning_pack.json',
    sae: 'caiovicentino1/Qwen3.6-35B-A3B-SAE-L23-topk-wip',
  },
  {
    id: 'gemma-4-e4b/reasoning_pack',
    status: 'Pending G1',
    model: 'Google/Gemma-4-E4B',
    benchmark: 'GSM8K (pending)',
    rho: null,
    pearson: null,
    nHeldOut: 0,
    effectSizeRange: 'pending contrastive discovery',
    features: '—',
    discoveredOn: '—',
    jsonUrl: '#',
    sae: 'caiovicentino1/Gemma-4-E4B-SAE-L21-topk',
  },
]

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">
          Feature packs
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Catalog</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Each pack is a validated set of helpful + harmful SAE features discovered via contrastive
          correctness analysis. To appear here, a pack must pass Stage Gate 1 (Spearman ρ ≥ 0.30 on
          held-out data).
        </p>
      </header>

      <div className="mt-10 grid gap-4">
        {packs.map((p) => (
          <article key={p.id} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3 className="font-semibold mono text-sm">{p.id}</h3>
                <p className="text-xs text-ink-900/60 dark:text-ink-50/60">
                  {p.model} · {p.benchmark}
                </p>
              </div>
              <span
                className={`chip ring-inset ${
                  p.status === 'Validated'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20'
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Cell
                label="Spearman ρ"
                value={p.rho != null ? p.rho.toFixed(3) : '—'}
                accent={p.rho != null}
              />
              <Cell
                label="Pearson r"
                value={p.pearson != null ? p.pearson.toFixed(3) : '—'}
              />
              <Cell label="n (held-out)" value={p.nHeldOut > 0 ? String(p.nHeldOut) : '—'} />
              <Cell label="Features" value={p.features} />
            </div>

            <div className="mt-4 space-y-1 text-xs text-ink-900/60 dark:text-ink-50/60">
              <div>
                <span className="mono text-ink-900/50 dark:text-ink-50/50">Cohen&apos;s d range:</span>{' '}
                {p.effectSizeRange}
              </div>
              <div>
                <span className="mono text-ink-900/50 dark:text-ink-50/50">Discovered on:</span>{' '}
                {p.discoveredOn}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={p.jsonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
              >
                reasoning_pack.json <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`https://huggingface.co/${p.sae}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
              >
                SAE on HuggingFace <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 card p-6">
        <h3 className="font-semibold">Contribute a pack</h3>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-2xl leading-relaxed">
          If you train a SAE on a new model + architecture and run Stage Gate 1 on a labeled
          benchmark, open a PR to the{' '}
          <Link
            href="https://github.com/OpenInterpretability/mechreward/tree/main/catalogs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-brand-600"
          >
            catalogs/
          </Link>{' '}
          directory. Packs that meet the ρ ≥ 0.30 threshold on an independent held-out set will be
          merged and appear here. See the pack template for required fields.
        </p>
      </div>
    </div>
  )
}

function Cell({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 mono">
        {label}
      </div>
      <div className={`mt-1 mono text-sm font-semibold ${accent ? 'gradient-text' : ''}`}>
        {value}
      </div>
    </div>
  )
}
