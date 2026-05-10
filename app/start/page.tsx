import Link from 'next/link'
import { ArrowRight, Check, Cpu, ShieldCheck, Terminal, ExternalLink } from 'lucide-react'
import { CopyButton } from '@/components/copy-button'

export const metadata = {
  title: 'Start — Run interp experiments via your agent · OpenInterp',
  description:
    'First Result in 10 Minutes. Connect Claude Code / Cursor / Cline to your Colab session and run probe-causality experiments by conversation. Privacy-first.',
}

const COLAB_TEMPLATE_URL =
  'https://colab.research.google.com/github/OpenInterpretability/openinterp-mcp/blob/main/templates/research.ipynb'
const REPO_URL = 'https://github.com/OpenInterpretability/openinterp-mcp'
const NGROK_SIGNUP = 'https://dashboard.ngrok.com/signup'

const installCmd = 'pip install "openinterp-mcp[server]"'

const claudeJson = `{
  "mcpServers": {
    "openinterp": {
      "command": "openinterp-mcp",
      "args": ["serve"]
    }
  }
}`

export default function StartPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="space-y-3 border-b border-zinc-800 pb-10">
        <p className="text-sm uppercase tracking-wide text-zinc-500">openinterp / start</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">First Result in 10 Minutes</h1>
        <p className="max-w-3xl text-lg text-zinc-400">
          Connect your favorite agent harness (Claude Code, Cursor, Cline) to a Colab session and
          run probe-causality experiments by conversation. No GPU on your laptop. No data leaves
          your compute.
        </p>
      </div>

      <ol className="mt-12 space-y-12">
        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            1
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">Open the Colab template</h2>
            <p className="text-zinc-400">
              A single notebook with three cells. Free-tier compatible for Qwen2.5-7B at 4-bit;
              Pro recommended for bf16.
            </p>
            <Link
              href={COLAB_TEMPLATE_URL}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20"
            >
              Open in Colab <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </li>

        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            2
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">Add your ngrok token to Colab Secrets</h2>
            <p className="text-zinc-400">
              Colab → 🔑 Secrets in the left sidebar → add <code className="rounded bg-zinc-900 px-1.5 py-0.5">NGROK_AUTHTOKEN</code>.
            </p>
            <Link
              href={NGROK_SIGNUP}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
            >
              Get a free token at dashboard.ngrok.com <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <p className="text-sm text-zinc-500">
              <ShieldCheck className="mr-1.5 inline h-4 w-4 text-emerald-500" />
              Secrets stay in your Colab account. We never see them.
            </p>
          </div>
        </li>

        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            3
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">Run the three cells</h2>
            <p className="text-zinc-400">
              The third prints a line that starts with{' '}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5">/colab-attach https://…ngrok-free.app</code>.
              Keep the notebook tab open while you work.
            </p>
          </div>
        </li>

        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            4
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">Install the MCP server on your laptop</h2>
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm">
              <Terminal className="h-4 w-4 text-zinc-500" />
              <span className="flex-1 text-zinc-300">{installCmd}</span>
              <CopyButton value={installCmd} />
            </div>
          </div>
        </li>

        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            5
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">Wire into your agent</h2>
            <p className="text-zinc-400">
              For Claude Code, edit <code className="rounded bg-zinc-900 px-1.5 py-0.5">~/.claude/mcp.json</code>:
            </p>
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <pre className="overflow-x-auto text-sm text-zinc-300">{claudeJson}</pre>
            </div>
            <p className="text-sm text-zinc-500">
              Cursor: <code className="rounded bg-zinc-900 px-1 py-0.5">~/.cursor/mcp.json</code> · Cline: settings panel · same JSON.
              <Link href={REPO_URL + '/blob/main/docs'} target="_blank" className="ml-2 underline-offset-4 hover:underline">
                Full guides
              </Link>
            </p>
          </div>
        </li>

        <li className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
            6
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-zinc-100">First experiment — paste in your agent</h2>
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
              /colab-attach https://abc123.ngrok-free.app
              <br />
              <span className="text-zinc-500"># the agent connects, prints loaded model + probes</span>
              <br />
              <br />
              Capture L20 at end_question for "Solve x^2 = 4".
              <br />
              Then run causality_protocol on saturation-direction-L20 with labels [1].
            </div>
            <p className="text-sm text-zinc-500">
              <Check className="mr-1.5 inline h-4 w-4 text-emerald-500" />
              Total time from Colab attach to first verdict: ~30 seconds.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-16 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="text-lg font-medium text-zinc-100">What you can do next</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>
            <Link href="/mcp" className="text-amber-400 hover:underline">Read the architecture</Link> — privacy model, what lives where, why no hosted inference.
          </li>
          <li>
            <Link href="/atlas" className="text-amber-400 hover:underline">Browse the atlas</Link> — researchers publishing replications, probe results, adversarial findings.
          </li>
          <li>
            <Link href="/research/papers/two-forms-epiphenomenal-probes" className="text-amber-400 hover:underline">
              The methodology behind the protocol
            </Link>{' '}
            — paper-6, the three mandatory causality checks.
          </li>
        </ul>
      </div>

      <p className="mt-12 text-center text-sm text-zinc-500">
        <Cpu className="mr-1.5 inline h-4 w-4" />
        Your model, your compute, your keys. We just route the conversation.
      </p>
    </main>
  )
}
