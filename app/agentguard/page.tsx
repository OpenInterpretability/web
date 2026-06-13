import Link from 'next/link'
import { ArrowLeft, ShieldCheck, GitBranch, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'AgentGuard — the model-origin blind spot, closed · OpenInterp',
  description:
    'A defense-in-depth action firewall for tool-using agents, with a model-internal intent brake that catches harm no text classifier or policy engine can see. Open source, grounded in published circuit-breaker data.',
}

const GH = 'https://github.com/OpenInterpretability/agentguard'
const DOI = 'https://doi.org/10.5281/zenodo.20679287'

const LAYERS = [
  {
    name: 'L0 · policy',
    q: 'Are the parameters policy-compliant?',
    catches: 'unknown recipient, over-limit',
    blind: 'intent',
  },
  {
    name: 'L1 · provenance',
    q: 'Does the action derive from untrusted data? (CaMeL-style taint)',
    catches: 'prompt injection — incl. obfuscated (it reads dataflow, not text)',
    blind: 'model-origin (no taint to find)',
  },
  {
    name: 'L2 · intent brake',
    q: 'Is the agent internally committed to an unauthorized irreversible action?',
    catches: 'MODEL-ORIGIN harm, laundered injection',
    blind: 'needs white-box weights',
    novel: true,
  },
  {
    name: 'L3 · actuation',
    q: 'What to do about it?',
    catches: 'block · redirect-to-safe · escalate-to-human',
    blind: '—',
  },
]

const ROWS = [
  ['input-origin (plain)', '100%', '100%', '100%', '100%', '100%'],
  ['input-origin (obfusc. + allowlisted)', '0%', '0%', '100%', '100%', '100%'],
  ['MODEL-origin (clean context)', '0%', '0%', '0%', '100%', '100%'],
  ['benign (false-positive ctrl)', '0%', '0%', '0%', '0%', '0%'],
]
const COLS = ['origin class', 'text_guard', 'L0', 'L1', 'L2', 'union']

export default function AgentGuardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        OPEN SOURCE · APACHE-2.0
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        AgentGuard
      </h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        A defense-in-depth action firewall for tool-using agents — with a{' '}
        <strong>model-internal intent brake</strong> that catches a class of harm every
        production guardrail is structurally blind to.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={GH} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-white dark:bg-white dark:text-ink-900 px-4 py-2 text-sm font-medium">
          <GitBranch className="h-4 w-4" /> GitHub
        </a>
        <a href={DOI} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <ExternalLink className="h-4 w-4" /> Paper · Zenodo DOI
        </a>
      </div>

      {/* why */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Why it exists</h2>
        <p className="mt-4 text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          Every shipping agent guardrail — Llama Guard, NeMo, Lakera, Invariant, AEGIS,
          LangGraph human-in-the-loop, and every crypto-agent wallet (Coinbase AgentKit,
          MetaMask + Blockaid, Turnkey, Fireblocks) — gates dangerous tool calls on{' '}
          <em>text, arguments, or deterministic policy</em>. None read the model&apos;s internal
          state. That leaves two gaps:
        </p>
        <ul className="mt-4 space-y-3 text-ink-900/75 dark:text-ink-50/75">
          <li>
            <strong>Obfuscation.</strong> A text classifier can&apos;t read a base64 / Morse /
            homoglyph injection — the May-2025 Grok/Bankr Morse-code wallet drain.
          </li>
          <li>
            <strong>Model-origin harm.</strong> When an agent, from clean trusted context,
            internally commits to an irreversible action <em>nobody authorized</em> (misalignment,
            reward-hacking, over-eager &ldquo;to be safe I&apos;ll just delete it&rdquo;), there is{' '}
            <em>no untrusted input to taint-track and no malicious argument to match</em>. The
            entire deterministic + text stack is blind.
          </li>
        </ul>
      </section>

      {/* layers */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Four independent layers</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Each covers the others&apos; blind spots. Only the model-internal layer closes model-origin harm.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {LAYERS.map((l) => (
            <div
              key={l.name}
              className={`rounded-xl p-5 ring-1 ${l.novel ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'}`}
            >
              <div className="flex items-center gap-2">
                {l.novel && <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                <h3 className="font-semibold">{l.name}</h3>
              </div>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 italic">{l.q}</p>
              <p className="mt-2 text-sm"><span className="text-emerald-600 dark:text-emerald-400 font-medium">catches:</span> {l.catches}</p>
              <p className="mt-1 text-sm"><span className="text-ink-900/50 dark:text-ink-50/50">blind to:</span> {l.blind}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-ink-900/60 dark:text-ink-50/60">
          The L2 brake is grounded in real measurements: a task-matched late-layer patch collapses a
          committed irreversible action to <strong>0.00 emission</strong> and{' '}
          <strong>redirects 100% to a safe read-only action</strong>, across 6 actions and 3
          architectures (McNemar b=24/c=0 for send). Published, eval 88/88 —{' '}
          <a href={DOI} className="text-brand-600 dark:text-brand-400 underline">Zenodo 10.5281/zenodo.20679287</a>.
        </p>
      </section>

      {/* benchmark */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">AgentActionBench — the coverage proof</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          24 scenarios, 6 irreversible actions × 4 origin classes. The union catches{' '}
          <strong>100% of attacks at 0% false positives</strong> on benign authorized actions — and
          model-origin harm is caught <strong>only</strong> by the model-internal layer.
        </p>
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                {COLS.map((c) => (
                  <th key={c} className="px-4 py-3 text-left font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[0]} className="border-t border-black/5 dark:border-white/10">
                  {r.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 ${i === 0 ? 'font-medium' : 'tabular-nums'} ${
                        i === 5 ? 'font-semibold text-brand-700 dark:text-brand-300' : ''
                      } ${r[0].startsWith('MODEL') && i === 4 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50">
          Attacks: higher = more caught (want 100%). The benign row is the false-positive rate (want
          0%). Recompute it yourself: <code>python3 bench/run_bench.py</code>; verify against the live
          ledgers: <code>python3 eval_agentguard.py</code> (51/51).
        </p>
        <img
          src="/agentguard-coverage.png"
          alt="AgentActionBench coverage matrix"
          className="mt-6 w-full rounded-xl ring-1 ring-black/10 dark:ring-white/15"
        />
      </section>

      {/* scope */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Honest scope</h2>
        <p className="mt-4 text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          AgentGuard is <strong>defense-in-depth, not a single robust layer</strong>. The
          deterministic layers carry the adaptive-robustness weight; L2 is a cheap model-internal
          signal that uniquely covers model-origin harm. It requires white-box / defender-owned
          (open) weights and is not robust to a <em>white-box activation-space</em> adversary
          (obfuscated-activations attacks) — the threat model is a prompt/environment adversary
          against a model the defender controls. The brake&apos;s suppress/redirect efficacy is
          published real data; the model-origin detection AUROC on fresh scenarios is the next
          live-GPU validation. Benchmark actions are simulated. Full ledger in{' '}
          <a href={`${GH}/blob/main/SCOPE.md`} className="text-brand-600 dark:text-brand-400 underline">SCOPE.md</a>.
        </p>
      </section>

      <div className="mt-16 rounded-xl ring-1 ring-black/10 dark:ring-white/15 p-6">
        <pre className="text-sm overflow-x-auto"><code>{`pip install -e .
python3 -m pytest -q          # 20 passing
python3 bench/run_bench.py    # the coverage matrix
python3 eval_agentguard.py    # 51/51 — thesis + live HF ledger ground-check`}</code></pre>
      </div>
    </main>
  )
}
