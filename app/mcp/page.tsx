import Link from 'next/link'
import { ArrowRight, ShieldCheck, Server, Database, ExternalLink, Layers } from 'lucide-react'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'openinterp-mcp — Bring-your-own-agent interp infrastructure · OpenInterp',
  description:
    'MCP server + Colab backend for mechanistic interpretability research. 8 typed primitives, 5 skills, Claude-Code-as-judge replication, atlas publishing with Zenodo DOIs. Privacy-first: nothing crosses our infra.',
}

const REPO_URL = 'https://github.com/OpenInterpretability/openinterp-mcp'
const PYPI_URL = 'https://pypi.org/project/openinterp-mcp/'

const installCmd = 'pip install "openinterp-mcp[server]"'

export default function McpPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="space-y-3 border-b border-zinc-800 pb-10">
        <p className="text-sm uppercase tracking-wide text-zinc-500">openinterp / mcp</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">openinterp-mcp</h1>
        <p className="max-w-3xl text-lg text-zinc-400">
          Bring-your-own-agent infrastructure for mechanistic interpretability research. Works with
          Claude Code, Cursor, Cline, OpenHands, Aider — anything that speaks MCP.{' '}
          <strong className="text-zinc-200">We never see your model, your data, or your keys.</strong>
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            First result in 10 minutes <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={REPO_URL}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
          >
            GitHub <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-medium text-zinc-100">Architecture</h2>
        <p className="max-w-3xl text-zinc-400">
          The model runs in <em>your</em> Colab / vast.ai / runpod session. A FastAPI backend
          exposes 8 typed endpoints. An ngrok tunnel makes them reachable from your laptop. The
          MCP server on your laptop is stateless — it just routes tool calls.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-xs text-zinc-300">
{`USER'S LAPTOP                                USER'S COMPUTE (Colab / vast.ai / runpod)
├── Claude Code / Cursor / Cline             ├── Colab Secrets (HF, OpenAI, Anthropic, ngrok)
├── openinterp-mcp (stateless tool router)   ├── FastAPI with 8 typed endpoints
└── ~/.openinterp/sessions.json              ├── HF model + tokenizer
    (URLs only, no secrets)                  ├── Probe registry
                                             └── ngrok HTTPS tunnel
            ←──── HTTPS (ngrok URL) ────────────────────┘

DOES NOT EXIST: hosted inference, key custody, telemetry, query database.`}
        </pre>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-medium text-zinc-100">8 typed primitives</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Primitive name="colab_attach" desc="Attach to a running Colab session via its ngrok URL." />
          <Primitive name="colab_status" desc="Health check, loaded model, probes in memory." />
          <Primitive name="list_probes" desc="Probes currently in the backend registry." />
          <Primitive name="capture_acts" desc="Forward pass with hooks. Returns capture_id." />
          <Primitive name="probe_eval" desc="Apply a probe to a stored capture. AUROC if labels." />
          <Primitive name="steer" desc="Inject direction*α. Control-token-normalized Δrel returned." />
          <Primitive name="sae_lookup" desc="Decompose an activation into top-K SAE features." />
          <Primitive name="causality_protocol" desc="Three mandatory checks → verdict in 5 classes." />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-medium text-zinc-100">What's distinctive</h2>
        <ul className="space-y-3 text-zinc-300">
          <li className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <strong className="text-zinc-100">Methodology built-in.</strong> The three paper-6
              mandatory checks (random-feature baseline, control-token normalization,
              structural-rigidity α-sweep) are not optional flags — they run inside{' '}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-sm">causality_protocol</code>{' '}
              by default and emit a 5-class verdict.
            </div>
          </li>
          <li className="flex gap-3">
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <strong className="text-zinc-100">Claude-Code-as-judge.</strong> Every published
              result can be independently re-executed by a Claude agent loop that uses the same
              MCP tools to verify. Distinct from passive LLM-as-judge — active verification.
            </div>
          </li>
          <li className="flex gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <strong className="text-zinc-100">Public atlas with DOIs.</strong> Researchers opt
              in to publish results. Each entry gets a HF dataset, a Zenodo DOI, an auto-generated
              BibTeX, and citation tracking via Semantic Scholar + arXiv.
            </div>
          </li>
          <li className="flex gap-3">
            <Server className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <strong className="text-zinc-100">Zero-server design.</strong> openinterp.org hosts
              docs + index, nothing else. All compute happens on user hardware. All persistence is
              HuggingFace + Zenodo. No openinterp-controlled API.
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-medium text-zinc-100">Install</h2>
        <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm">
          <span className="flex-1 text-zinc-300">{installCmd}</span>
          <CopyButton value={installCmd} />
        </div>
        <p className="text-sm text-zinc-500">
          Apache-2.0. <Link href={PYPI_URL} target="_blank" className="underline-offset-4 hover:underline">PyPI</Link> ·{' '}
          <Link href={REPO_URL} target="_blank" className="underline-offset-4 hover:underline">GitHub</Link> ·{' '}
          <Link href={REPO_URL + '/blob/main/docs/quick-start.md'} target="_blank" className="underline-offset-4 hover:underline">
            Quick start docs
          </Link>
        </p>
      </section>
    </main>
  )
}

function Primitive({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
      <code className="text-sm text-amber-400">{name}</code>
      <p className="mt-1 text-sm text-zinc-400">{desc}</p>
    </div>
  )
}
