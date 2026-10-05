import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GitBranch, ExternalLink, Database, ShieldCheck, Boxes } from 'lucide-react'
import { site } from '@/lib/constants'
import {
  ekbasis, gitComparison, realRepo, longChains, planning, speed, routing, injection, limits, kinds, builds, lookWhenUnsure,
} from '@/lib/ekbasis-data'

const URL_ = `${site.url}/ekbasis`

export const metadata: Metadata = {
  title: 'Ekbasis — what happens if I run this? An open world model for agents',
  description: ekbasis.description,
  keywords: [
    'Ekbasis', 'world model', 'consequence model', 'forward model', 'JEPA', 'agent safety', 'AI agents', 'action firewall', 'AgentGuard',
    'git guard', 'Claude Code hook', 'MCP server', 'calibrated prediction', 'prompt injection', 'AI control',
    'trusted monitoring', 'open source model', 'OpenInterpretability',
  ],
  alternates: { canonical: '/ekbasis' },
  openGraph: {
    type: 'website',
    url: URL_,
    siteName: site.name,
    title: `Ekbasis — ${ekbasis.tagline}`,
    description: ekbasis.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@openinterp',
    creator: '@openinterp',
    title: `Ekbasis — ${ekbasis.tagline}`,
    description: ekbasis.description,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${URL_}#code`,
      name: 'Ekbasis',
      description: ekbasis.description,
      codeRepository: ekbasis.links.github,
      programmingLanguage: 'Python',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      author: { '@id': `${site.url}#org` },
      keywords: 'consequence model, agent safety, world model, git guard, MCP',
      url: URL_,
    },
    {
      '@type': 'Dataset',
      '@id': `${URL_}#data`,
      name: 'Ekbasis data: synthetic worlds and real git executions',
      description:
        'Training and evaluation data of the Ekbasis consequence model: rule-based worlds with typed questions about the outcome of actions, git commands executed in throwaway repositories with the observed outcome, multi-question items, real-repository scenarios, and every evaluation prediction for recomputation.',
      url: ekbasis.links.dataset,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: { '@id': `${site.url}#org` },
      isAccessibleForFree: true,
    },
    {
      '@type': 'Organization',
      '@id': `${site.url}#org`,
      name: site.name,
      url: site.url,
      sameAs: [site.github, 'https://huggingface.co/caiovicentino1', site.twitter],
    },
  ],
}

function Table({ columns, rows, highlight }: { columns: string[]; rows: string[][]; highlight?: string }) {
  return (
    <>
      {/* phones: one card per row, so no column hides off-screen */}
      <div className="mt-6 space-y-3 sm:hidden">
        {rows.map((r, k) => (
          <div
            key={k}
            className={`rounded-xl p-4 ring-1 ${
              r[0] === highlight ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'
            }`}
          >
            <p className={`font-semibold ${r[0] === highlight ? 'text-brand-700 dark:text-brand-300' : ''}`}>{r[0]}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {r.slice(1).map((cell, i) => (
                <div key={i} className="contents">
                  <dt className="text-ink-900/55 dark:text-ink-50/55">{columns[i + 1]}</dt>
                  <dd className="tabular-nums">{cell}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="mt-6 hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <tr
                key={k}
                className={`border-t border-black/5 dark:border-white/10 ${
                  r[0] === highlight ? 'bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-300' : ''
                }`}
              >
                {r.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium' : 'tabular-nums'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const LAYERS = [
  { name: 'L0 · policy', q: 'Are the parameters policy-compliant?', blind: 'intent, state' },
  { name: 'L1 · provenance', q: 'Does the action derive from untrusted data?', blind: 'model-origin harm' },
  { name: 'L2 · intent brake', q: 'Is the agent internally committed to an unauthorized irreversible action?', blind: 'needs open weights; inherits the agent’s beliefs' },
  { name: 'Ekbasis · consequence', q: 'What will this action do in this state?', blind: 'domains it was not trained on; obfuscated commands', novel: true },
  { name: 'L3 · actuation', q: 'Block, redirect to safe, or escalate to a human', blind: '—' },
]

export default function EkbasisPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        OPEN MODEL · OPEN DATA · OPEN CODE · APACHE-2.0
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        Ekbasis <span className="text-ink-900/40 dark:text-ink-50/40 font-normal">{ekbasis.greek}</span>
      </h1>
      <p className="mt-3 text-2xl font-medium tracking-tight text-balance">{ekbasis.tagline}</p>
      <p className="mt-1 text-lg text-brand-700 dark:text-brand-300 font-medium">{ekbasis.category}</p>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        A <strong>world model</strong> for agents. Given the current state and an action, it answers typed
        questions — <em>will this lose work? will it fail? what will X be afterwards?</em> — with a{' '}
        <strong>calibrated probability</strong>, in <strong>one forward pass</strong> (~0.1 s, no generated text).
        Trained on <strong>real executions</strong>, so it knows what actions do, not what an agent believes they do.
      </p>
      <p className="mt-3 text-sm text-ink-900/50 dark:text-ink-50/50">{ekbasis.status}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={ekbasis.links.github} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-white dark:bg-white dark:text-ink-900 px-4 py-2 text-sm font-medium">
          <GitBranch className="h-4 w-4" /> GitHub
        </a>
        <a href={ekbasis.links.model} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <Boxes className="h-4 w-4" /> Model · Hugging Face
        </a>
        <a href={ekbasis.links.dataset} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <Database className="h-4 w-4" /> Data
        </a>
        {ekbasis.links.paper && (
          <a href={ekbasis.links.paper} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
            <ExternalLink className="h-4 w-4" /> Paper · DOI
          </a>
        )}
        <a href={ekbasis.links.prereg} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <ExternalLink className="h-4 w-4" /> Pre-registration
        </a>
      </div>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">{ekbasis.motto}</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          An LLM thinks in text. A System One model judges the present in one pass. Ekbasis predicts what an action will
          change — the next state — in one pass, from what actions actually did.
        </p>
        <div className="mt-6 space-y-3 sm:hidden">
          {kinds.rows.map((r) => (
            <div key={r[0]} className="rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-ink-50/50">{r[0]}</p>
              <dl className="mt-2 space-y-1.5 text-sm">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={i === 3 ? '-mx-2 rounded-lg bg-brand-500/10 px-2 py-1 font-semibold text-brand-700 dark:text-brand-300' : ''}
                  >
                    <dt className={`inline ${i === 3 ? '' : 'text-ink-900/55 dark:text-ink-50/55'}`}>{kinds.columns[i]}: </dt>
                    <dd className="inline">{r[i]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-6 hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                {kinds.columns.map((c, i) => (
                  <th key={i} className={`px-4 py-3 text-left font-semibold ${i === 3 ? 'text-brand-700 dark:text-brand-300' : ''}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kinds.rows.map((r) => (
                <tr key={r[0]} className="border-t border-black/5 dark:border-white/10">
                  {r.map((cell, i) => (
                    <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium text-ink-900/60 dark:text-ink-50/60' : ''} ${i === 3 ? 'bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-300' : ''}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {kinds.analogies.map((a) => (
            <div key={a.title} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-900/50 dark:text-ink-50/50">
          It is derived from an LLM (Qwen3.8-27B via Eikos-27B) but does not work as one: its training objective and its
          readout make it answer with probabilities, not text.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Why it exists</h2>
        <ul className="mt-4 space-y-3 text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          <li>
            <strong>Harm depends on the state.</strong>{' '}<code>git reset --hard</code> does nothing on a clean tree and
            destroys hours of work on a dirty one. Text and policy filters see the same command in both cases.
          </li>
          <li>
            <strong>Monitors that read the agent inherit its beliefs.</strong>{' '}When an agent believes a destructive
            command is safe, there is no intent to harm to detect. Ekbasis is trained on what actions actually did,
            independently of any agent&apos;s judgment.
          </li>
          <li>
            <strong>It works with closed agents.</strong>{' '}It reads the action and the environment, not the
            agent&apos;s weights — so it runs next to Claude Code, GPT-based agents or your own.
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">The consequence layer for AgentGuard</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          <Link href={ekbasis.links.agentguard} className="text-brand-600 dark:text-brand-400 underline">AgentGuard</Link>{' '}
          asks who wants the action and whether the agent intends harm. Ekbasis adds what the action will do.
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
              <p className="mt-2 text-sm"><span className="text-ink-900/50 dark:text-ink-50/50">blind to:</span> {l.blind}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Git: close to frontier models, in one pass</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{gitComparison.caption}</p>
        <Table columns={gitComparison.columns} rows={gitComparison.rows} highlight={gitComparison.highlight} />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {realRepo.stats.map((s) => (
            <div key={s.label} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
              <div className="text-3xl font-semibold tabular-nums">{s.value}</div>
              <div className="mt-1 text-sm text-ink-900/60 dark:text-ink-50/60">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50">{realRepo.caption}</p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Long sequences, and when to look again</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{longChains.caption}</p>
        <Table columns={longChains.columns} rows={longChains.rows} />
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">{planning}</p>
      </section>

      <section id="look-when-unsure" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight">Look when unsure: predict, observe, correct</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{lookWhenUnsure.intro}</p>
        <div className="mt-6 rounded-xl ring-1 ring-black/10 dark:ring-white/15 p-6">
          <pre className="text-sm overflow-x-auto"><code>{lookWhenUnsure.code}</code></pre>
        </div>
        <p className="mt-6 text-ink-900/70 dark:text-ink-50/70">{lookWhenUnsure.rule}</p>
        <Table columns={lookWhenUnsure.columns} rows={lookWhenUnsure.rows} />
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">{lookWhenUnsure.less}</p>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          <strong className="text-ink-900 dark:text-ink-50">What the confidence sees, and what it does not.</strong>{' '}
          {lookWhenUnsure.why}
        </p>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          {lookWhenUnsure.lineage}{' '}
          <a
            className="underline underline-offset-2"
            href="https://github.com/OpenInterpretability/ekbasis/blob/main/docs/REFERENCES.md#looking-when-unsure-prior-work"
          >
            Prior work
          </a>
          .
        </p>
        <h3 className="mt-8 text-lg font-semibold">What it unlocks</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {lookWhenUnsure.unlocks.map((u) => (
            <div key={u.title} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
              <p className="font-semibold">{u.title}</p>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{u.body}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-lg font-semibold">Where to use it</h3>
        <ul className="mt-4 space-y-2 text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
          {lookWhenUnsure.uses.map(([k, v]) => (
            <li key={k}>
              <strong className="text-ink-900 dark:text-ink-50">{k}:</strong>{' '}{v}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-900/55 dark:text-ink-50/55">{lookWhenUnsure.note}</p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Speed and cost</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{speed.caption}</p>
        <Table columns={speed.columns} rows={speed.rows} />
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          As a first opinion before expensive reasoning, on short consequence checks (Ekbasis alone 96.3%; a reasoning
          model alone 100%, at ~200 generated tokens per question):{' '}
          {routing.map((r, i) => (
            <span key={r.cut}>
              {i > 0 && '; '}
              <strong>{r.acc}</strong> accuracy sending <strong>{r.toLLM}</strong> of the questions to a reasoning
              model (confidence cut {r.cut})
            </span>
          ))}
          .
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">We attacked our own guard</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{injection.caption}</p>
        <Table columns={injection.columns} rows={injection.rows} />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Use it</h2>
        <div className="mt-6 rounded-xl ring-1 ring-black/10 dark:ring-white/15 p-6">
          <pre className="text-sm overflow-x-auto"><code>{`pip install "git+https://github.com/OpenInterpretability/ekbasis"
export EKBASIS_URL=http://127.0.0.1:8000     # your served Ekbasis (see the model card)

ekbasis git-check -- "git checkout -- app.py"
# Ekbasis: RISKY  (lose uncommitted work: 98%)

# Claude Code: ask before git commands that may lose work
#   ~/.claude/settings.json → PreToolUse, matcher "Bash", command "ekbasis-claude-hook"
# Any MCP client (Python ≥ 3.10):
pip install "ekbasis[mcp] @ git+https://github.com/OpenInterpretability/ekbasis"
claude mcp add --scope user ekbasis -e EKBASIS_URL=http://127.0.0.1:8000 -- ekbasis-mcp`}</code></pre>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Pick the build that fits your machine</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">{builds.caption}</p>
        <Table columns={builds.columns} rows={builds.rows} />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Everything is open</h2>
        <p className="mt-4 text-ink-900/75 dark:text-ink-50/75 leading-relaxed">
          The weights, the world generators, the git sandbox that executes commands in throwaway repositories, the
          training code with the exact recipes, every evaluation with its predictions, and the full history of runs —
          including the ones that did not work. The release evaluation was pre-registered before it was run.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Honest scope</h2>
        <ul className="mt-4 space-y-2 text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
          {limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
