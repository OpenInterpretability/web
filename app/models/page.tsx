import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { saes } from '@/lib/constants'

export const metadata = { title: 'SAE Models' }

export default function ModelsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">
          SAE Registry
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Trained SAEs</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Every SAE we ship is TopK, residual-stream, and hook-accessible via standard
          HuggingFace <code className="mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">output_hidden_states=True</code>.
          No TransformerLens dependency — works on hybrid architectures that TL doesn&apos;t support.
        </p>
      </header>

      <div className="mt-10 space-y-4">
        {saes.map((s) => (
          <article key={s.model} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3 className="font-semibold text-lg">{s.model}</h3>
                <p className="text-sm text-ink-900/70 dark:text-ink-50/70">{s.architecture}</p>
              </div>
              <span
                className={`chip ring-inset ${
                  s.status === 'Released'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20'
                }`}
              >
                {s.status}
              </span>
            </div>

            <p className="mt-3 text-sm italic text-ink-900/70 dark:text-ink-50/70">
              {s.firstPublic}
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Cell label="Layer" value={s.layer} />
              <Cell label="d_sae" value={s.dSae.toLocaleString()} />
              <Cell label="k (TopK)" value={String(s.k)} />
              <Cell label="Expansion" value={s.expansion} />
              <Cell label="Training tokens" value={s.tokens} />
              <Cell label="var_exp" value={s.varExp.toFixed(3)} accent />
              <Cell label="G1 Spearman ρ" value={s.g1Rho != null ? s.g1Rho.toFixed(3) : '—'} accent={s.g1Rho != null} />
              <div className="flex items-end">
                <Link
                  href={`https://huggingface.co/${s.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
                >
                  HuggingFace repo <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 card p-6">
        <h3 className="font-semibold">Quickstart loading</h3>
        <pre className="mt-3 mono text-xs md:text-sm bg-ink-950 text-ink-50 dark:bg-ink-950 rounded-lg p-4 overflow-x-auto">
{`import torch
from huggingface_hub import hf_hub_download

ckpt = hf_hub_download(
    repo_id="caiovicentino1/Qwen3.5-4B-SAE-L18-topk",
    filename="sae_final.pt",
)
state = torch.load(ckpt, map_location="cuda", weights_only=True)
W_enc, W_dec = state["W_enc"], state["W_dec"]
b_enc, b_dec = state["b_enc"], state["b_dec"]
k = int(state["k"])

def encode(h):
    pre = (h - b_dec) @ W_enc + b_enc
    topv, topi = torch.topk(pre, k, dim=-1)
    out = torch.zeros_like(pre).scatter_(-1, topi, topv)
    return torch.relu(out)`}
        </pre>
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
