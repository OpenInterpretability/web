import Link from 'next/link'
import {
  ArrowRight, KeyRound, BookOpen, Terminal, Plug, Code2, Bot, GitBranch, FolderX, Database, Mail, Cloud,
  Wallet, ShieldCheck, Lock, FlaskConical, Scale, FileText, Check,
} from 'lucide-react'
import examplesFile from '@/content/ekbasis-start-examples.json'
import { ConsequenceDemo, type DemoExample } from '@/components/home/consequence-demo'

export const metadata = {
  title: 'Ekbasis API — know what an action will do before your agent runs it',
  description:
    'Ekbasis is an open consequence model. Send the state and the action; get calibrated probabilities for what happens — lost work, a failed payment, a leaked file — in one call. $0.04 per 1M input tokens, no output charge. Pay in USDC or USDT.',
}

type Rec = {
  id: string
  request: { state: string; questions: Record<string, { type: string; instructions: string; options?: string[]; criteria?: Record<string, string> }> }
  response: { answers: Record<string, { type: string; probabilities?: Record<string, number>; probability?: number }>; usage: { input_tokens: number }; latency_s?: number }
}

const DEMO: [string, string][] = [
  ['type_noul', 'Git'],
  ['money_wire_fee', 'Payments'],
  ['sh_rm_unset_var', 'Shell'],
  ['db_delete_no_where', 'Database'],
  ['mail_reply_all', 'Email'],
  ['k8s_wrong_env', 'Kubernetes'],
]

function demoExamples(): DemoExample[] {
  const all = (examplesFile as unknown as { examples: Rec[] }).examples.filter((e) => e && e.id && e.response && e.response.answers)
  return DEMO.flatMap(([id, tab]) => {
    const rec = all.find((e) => e.id === id)
    if (!rec) return []
    const [name, q] = Object.entries(rec.request.questions)[0]
    const a = rec.response.answers[name]
    const options =
      a.type === 'noul'
        ? [
            { label: q.criteria?.true ?? 'yes', p: a.probability ?? 0 },
            { label: q.criteria?.false ?? 'no', p: 1 - (a.probability ?? 0) },
          ]
        : Object.entries(a.probabilities ?? {}).map(([label, p]) => ({ label, p }))
    return [{ id, tab, state: rec.request.state, question: q.instructions, options, tokens: rec.response.usage.input_tokens, latencyS: rec.response.latency_s ?? null }]
  })
}

const STUDIES = [
  { k: '6/24 → 1/24', v: 'tasks where Claude Sonnet did harm on real apps (Gitea, Nextcloud, Roundcube): 25.0% → 4.2%', q: 'secondary contrast, one run per task; for Claude Haiku the pre-registered hypotheses failed', href: '/research/papers/consequence-model-safety-layer', src: 'paper' },
  { k: '24/36 → 2/36', v: 'harmful runs by Claude Haiku operating a real Kubernetes cluster: 66.7% → 5.6%', q: 'asking the human every time also reached 0%, with 3× the questions; matching a Sonnet guard failed by one case', href: 'https://github.com/OpenInterpretability/ekbasis-cookbook/blob/main/docs/K8S_STUDY.md', src: 'study' },
  { k: '24/60 → 0/60', v: 'harmful runs by Claude Sonnet on our demo apps; a placebo reminder: 22/60. Harm fell for all 5 models tested', q: 'apps built for the study, with consequences hidden from the agent', href: '/research/papers/consequence-model-safety-layer', src: 'paper' },
  { k: '8 / 8', v: 'classic git work losses flagged at 98–99%, with 0 false alarms on 9 safe commands', q: 'a small battery written by us; never-seen git command types: 85.8%', href: 'https://github.com/OpenInterpretability/ekbasis-cookbook', src: 'cookbook' },
]

const WAYS = [
  {
    icon: Terminal,
    title: 'Git and shell guard',
    note: 'One command. The CLI reads your repository and writes the state for you.',
    code: `pip install "git+https://github.com/OpenInterpretability/ekbasis"
export EKBASIS_URL=https://openinterp.org/api/v1
export EKBASIS_API_KEY=ekb_...

ekbasis git-check -- "git reset --hard"
# Ekbasis: RISKY (lose uncommitted work: 99%)  → exit 2`,
  },
  {
    icon: Bot,
    title: 'Claude Code hook',
    note: 'Before every Bash command, the hook asks you only when something could be lost.',
    code: `// ~/.claude/settings.json
{"hooks": {"PreToolUse": [{"matcher": "Bash",
  "hooks": [{"type": "command",
             "command": "ekbasis-claude-hook", "timeout": 30}]}]}}`,
  },
  {
    icon: Plug,
    title: 'MCP server',
    note: 'check_git_commands, predict_consequences and preflight_command for any MCP client.',
    code: `claude mcp add --scope user ekbasis \\
  -e EKBASIS_URL=https://openinterp.org/api/v1 \\
  -e EKBASIS_API_KEY=ekb_... -- ekbasis-mcp`,
  },
  {
    icon: Code2,
    title: 'REST API',
    note: 'Any action, any language: describe the state, ask typed questions.',
    code: `curl https://openinterp.org/api/v1/v1/systemone \\
  -H "Authorization: Bearer $EKBASIS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"state": "Balance: $1,020.00. About to: wire $1,000 + $25 fee.",
       "questions": {"q": {"type": "choice",
         "instructions": "What happens with the wire?",
         "options": ["succeeds", "fails: exceeds the balance"]}}}'`,
  },
]

const USES = [
  { icon: GitBranch, t: 'Git', d: 'reset, checkout, clean, branch -D, stash drop, force-push over commits the remote holds' },
  { icon: FolderX, t: 'Files and shell', d: 'rm and redirects over data without a backup, unset variables in paths, symlinks' },
  { icon: Database, t: 'Databases', d: 'DELETE or UPDATE without a narrow WHERE, DROP, migrations on real data' },
  { icon: Wallet, t: 'Payments and apps', d: 'transfers and fees, refunds in flight, cancellations that take the return flight too' },
  { icon: Mail, t: 'Messages and sharing', d: 'reply-all with an external recipient, links that expose more than the folder you meant' },
  { icon: Cloud, t: 'Cloud and infra', d: 'the wrong kubectl context, compose down -v on a volume with data, overwrites on S3' },
]

export default function HomePage() {
  const examples = demoExamples()
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div className="absolute left-1/2 top-10 -z-10 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10 text-center sm:pt-20">
          <Link
            href="/news/ekbasis-api"
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-700 backdrop-blur-sm hover:bg-brand-500/15 dark:text-brand-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            Introducing the Ekbasis API · read the announcement
          </Link>
          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Know what an action will do <span className="gradient-text">before your agent runs it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-900/70 text-balance dark:text-ink-50/70 sm:text-xl">
            Ekbasis is a consequence model. Send the state and the action; get a calibrated probability for what
            happens — lost work, a failed payment, a leaked file — in one call.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/console"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40"
            >
              <KeyRound className="h-4 w-4" /> Get your API key
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/ekbasis/start"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white/50 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/80 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" /> How to use it (5 min)
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-900/55 dark:text-ink-50/55">
            $0.04 per 1M input tokens · no output charge · pay in USDC or USDT · sign in with GitHub, Google or email
          </p>
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pb-6">
          {examples.length > 0 && <ConsequenceDemo examples={examples} />}
        </div>
      </section>

      {/* ===== Evidence ===== */}
      <section className="mx-auto mt-14 max-w-7xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-900/45 dark:text-ink-50/45">
          Measured, pre-registered, failures published too
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-ink-900/55 dark:text-ink-50/55">
          Small studies run by us: every plan was hashed before the runs, and the hypotheses that failed are published
          next to the ones that held. Read them before you rely on the numbers.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIES.map((s) => (
            <a key={s.k} href={s.href} className="card group p-5 transition hover:ring-brand-500/40">
              <p className="gradient-text text-3xl font-semibold tracking-tight tabular-nums">{s.k}</p>
              <p className="mt-2 text-sm leading-snug text-ink-900/70 dark:text-ink-50/70">{s.v}</p>
              <p className="mt-2 text-xs leading-snug text-ink-900/50 dark:text-ink-50/50">{s.q}</p>
              <p className="mt-3 text-xs font-medium text-brand-600 group-hover:underline dark:text-brand-400">Read the {s.src}, failures included →</p>
            </a>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-900/65 dark:text-ink-50/65">
          Not a chatbot and not a judge. A forecaster: it tells you what will happen, and your code — or a person —
          decides what to do about it.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Describe the state', 'The facts the action touches: files, balances, branches, recipients, rules. End with “About to: …”. The CLI writes it for you for git.'],
            ['2', 'Ask typed questions', 'Choice among outcomes you list, yes/no with criteria, or a count. Several questions about one state go in one request.'],
            ['3', 'Act on calibrated odds', 'Each option gets a probability. High risk: stop and ask the human. Low confidence: a fact is missing — go read it. Can’t foresee: treat it as risky.'],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700 dark:text-brand-300">{n}</span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/65 dark:text-ink-50/65">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Ways to use it ===== */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Plug it in where your agent acts</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-900/65 dark:text-ink-50/65">
          Same key, same endpoint. Start with the guard in a minute; go to the API when the action is not a command.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {WAYS.map((w) => (
            <div key={w.title} className="card flex flex-col p-6">
              <div className="flex items-center gap-2">
                <w.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-semibold">{w.title}</h3>
              </div>
              <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65">{w.note}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-xl bg-ink-950 p-4 text-[12.5px] leading-relaxed text-ink-50/90 ring-1 ring-white/10">
                <code>{w.code}</code>
              </pre>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
          Building an agent? Point it at{' '}
          <a href="/ekbasis/agents.md" className="font-mono text-brand-600 underline underline-offset-2 dark:text-brand-400">openinterp.org/ekbasis/agents.md</a>
          {' '}— the same guide written for language models.
        </p>
      </section>

      {/* ===== Use cases ===== */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">The mistakes it is built to see</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USES.map((u) => (
            <div key={u.t} className="card p-5">
              <u.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-3 font-semibold">{u.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-900/65 dark:text-ink-50/65">{u.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-900/60 dark:text-ink-50/60">
          Every example, with the real answer: <Link href="/ekbasis/start#examples" className="text-brand-600 underline underline-offset-2 dark:text-brand-400">the getting-started guide</Link>.
        </p>
      </section>

      {/* ===== Pricing ===== */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="grid gap-6 rounded-2xl bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/10 p-8 ring-1 ring-brand-500/25 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">Pricing</p>
            <p className="mt-3 text-5xl font-semibold tracking-tight">$0.04 <span className="text-xl font-medium text-ink-900/55 dark:text-ink-50/55">per 1M input tokens</span></p>
            <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
              No output charge: the model only reads. A check is about 1.5k tokens, so roughly $0.06 per 1,000 checks.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                'Prepaid credit packs: $5 · $20 · $50 — no subscription, no minimum, credits never expire',
                'Pay in USDC or USDT on Polygon, Arbitrum, Base or Ethereum — no card',
                'Out of credits it fails closed: “cannot foresee”, treated as risky',
                'Self-host the open weights for free (27B · FP8 · INT4 · MLX)',
              ].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-xl bg-white/70 p-6 ring-1 ring-black/10 dark:bg-ink-900/60 dark:ring-white/15">
            <p className="font-semibold">Start in three steps</p>
            <ol className="space-y-2 text-sm text-ink-900/75 dark:text-ink-50/75">
              <li><b>1.</b> Sign in at the console with GitHub, Google or a one-time email code.</li>
              <li><b>2.</b> Create an API key (shown once) and add credits.</li>
              <li><b>3.</b> Run your first check with the CLI or one curl.</li>
            </ol>
            <Link href="/console" className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              <KeyRound className="h-4 w-4" /> Open the console
            </Link>
            <Link href="/ekbasis/pricing" className="text-center text-sm text-brand-600 hover:underline dark:text-brand-400">Pricing details →</Link>
          </div>
        </div>
      </section>

      {/* ===== Trust ===== */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Built to be checked</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Scale, t: 'Open weights', d: 'Apache-2.0. Run it on your own GPU or Mac and nothing leaves your machine.' },
            { icon: FlaskConical, t: 'Pre-registered', d: 'Plans hashed before the runs. The studies that missed their bars are published next to the ones that held.' },
            { icon: ShieldCheck, t: 'Fails closed', d: 'No key, no credits, no answer in time: “cannot foresee”, which every tool treats as risky.' },
            { icon: Lock, t: 'Contents never stored', d: 'The API logs metadata to bill and operate (time, account, tokens, latency) — never your states or questions.' },
          ].map((x) => (
            <div key={x.t} className="card p-5">
              <x.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-3 font-semibold">{x.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-900/65 dark:text-ink-50/65">{x.d}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-ink-900/55 dark:text-ink-50/55">
          A warning layer that can be wrong, not a security boundary. It is strongest where the state states the facts
          and weakest on domains far from its training — <Link href="/ekbasis/start#limits" className="underline underline-offset-2">read the limits</Link>.
        </p>
      </section>

      {/* ===== The lab ===== */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" /> From OpenInterpretability</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-900/65 dark:text-ink-50/65">
              An independent lab for AI-agent safety. Ekbasis came out of our research on why agents fail; the papers,
              datasets and the other open tools are all public.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/research" className="rounded-lg px-4 py-2 text-sm font-semibold ring-1 ring-black/15 hover:bg-black/[0.04] dark:ring-white/20 dark:hover:bg-white/[0.06]">Research</Link>
            <Link href="/lab" className="rounded-lg px-4 py-2 text-sm font-semibold ring-1 ring-black/15 hover:bg-black/[0.04] dark:ring-white/20 dark:hover:bg-white/[0.06]">The lab</Link>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto mb-20 mt-20 max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Let your agent look before it leaps.</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/console" className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700">
            <KeyRound className="h-4 w-4" /> Get your API key <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/ekbasis" className="inline-flex items-center gap-2 rounded-lg border border-black/15 px-6 py-3 text-sm font-semibold hover:bg-black/[0.04] dark:border-white/20 dark:hover:bg-white/[0.06]">
            Results and models
          </Link>
        </div>
      </section>
    </>
  )
}
