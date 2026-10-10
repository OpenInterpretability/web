import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, ArrowDown, FileText, Zap, ListChecks, Gauge, Terminal, Bot, Code2, Check, X,
  AlertTriangle, KeyRound, CreditCard, BookOpen, GitBranch, HardDrive, Database, AppWindow, Cloud,
} from 'lucide-react'
import { site } from '@/lib/constants'
import { ekbasis } from '@/lib/ekbasis-data'
import { CopyButton } from '@/components/copy-button'
import recorded from '@/content/ekbasis-start-examples.json'

const URL_ = `${site.url}/ekbasis/start`
const COOKBOOK = 'https://github.com/OpenInterpretability/ekbasis-cookbook'
const HOSTED = 'https://openinterp.org/api/v1'

export const metadata: Metadata = {
  title: 'How to use Ekbasis — getting started with the consequence model',
  description:
    'A first-time guide to Ekbasis: what a consequence model is (not a chatbot), how to describe a state, the three question types, how to read calibrated probabilities, and copy-paste examples with the real answers.',
  keywords: ['Ekbasis', 'getting started', 'consequence model', 'world model', 'git guard', 'Claude Code hook', 'MCP', 'agent safety', 'API'],
  alternates: { canonical: '/ekbasis/start' },
  openGraph: {
    type: 'article',
    url: URL_,
    siteName: site.name,
    title: 'How to use Ekbasis',
    description: 'State + action + typed questions → calibrated answers. A guide for first-time users, with real outputs.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@openinterp',
    creator: '@openinterp',
    title: 'How to use Ekbasis',
    description: 'State + action + typed questions → calibrated answers. A guide for first-time users, with real outputs.',
  },
}

/* ------------------------------------------------------------------ recorded examples */

type Question = {
  type: 'choice' | 'noul' | 'boolean' | 'score'
  instructions: string
  options?: string[]
  criteria?: Record<string, string>
}
type Ans = {
  type: string
  choice?: string
  score?: number
  value?: boolean
  probability?: number
  probabilities?: Record<string, number>
  confidence: number
}
type Example = {
  id: string
  group: string
  title: string
  note?: string | null
  source?: string | null
  status?: number
  request: { state: string; questions: Record<string, Question> }
  response: { answers?: Record<string, Ans>; usage?: { input_tokens: number; output_tokens: number }; error?: string }
  client_latency_s: number
  code?: string
  stdout?: string
}

const data = recorded as unknown as { meta: { recorded_at: string; calls: number; model: string }; examples: Example[] }
const byId = Object.fromEntries(data.examples.map((e) => [e.id, e])) as Record<string, Example>
const ex = (id: string) => {
  const e = byId[id]
  if (!e) throw new Error(`missing recorded example ${id}`)
  return e
}
const recordedDay = data.meta.recorded_at.slice(0, 10)
/** Confidence of the first answer of a recorded example, as a percentage. */
const conf = (id: string) => pct(Object.values(ex(id).response.answers ?? {})[0]?.confidence ?? 0)
const modelCalls = data.examples.filter((e) => e.response?.answers || e.stdout)
const latencies = modelCalls.map((e) => e.client_latency_s)
const tokens = data.examples.flatMap((e) => (e.response?.usage ? [e.response.usage.input_tokens] : []))
const serverTimes = data.examples.flatMap((e) => {
  const t = (e.response as { latency_s?: number } | undefined)?.latency_s
  return typeof t === 'number' ? [t] : []
})
const range = (xs: number[], f: (x: number) => string) => `${f(Math.min(...xs))}–${f(Math.max(...xs))}`

function pct(p: number) {
  const v = p * 100
  if (v > 99.9) return '>99.9%'
  if (v < 0.1) return '<0.1%'
  return `${v.toFixed(1)}%`
}

function curlFor(e: Example) {
  const body = JSON.stringify(e.request, null, 2).replace(/'/g, `'\\''`)
  return `curl -s "$EKBASIS_URL/v1/systemone" \\
  -H "Authorization: Bearer $EKBASIS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
}

/** Rows to draw for one answer: [label, probability, chosen]. */
function rows(q: Question, a: Ans): [string, number, boolean][] {
  if (a.type === 'noul' || a.type === 'boolean') {
    const p = a.probability ?? 0
    const yes = q.criteria?.true ? `yes: ${q.criteria.true}` : 'yes'
    const no = q.criteria?.false ? `no: ${q.criteria.false}` : 'no'
    return [[yes, p, a.value === true], [no, 1 - p, a.value === false]]
  }
  const probs = a.probabilities ?? {}
  const labels = q.options ?? Object.keys(q.criteria ?? probs)
  const picked = a.type === 'score' ? String(a.score) : a.choice
  return labels.map((l) => {
    const shown = a.type === 'score' && q.criteria?.[l] ? `${l} (${q.criteria[l]})` : l
    return [shown, probs[l] ?? 0, l === picked] as [string, number, boolean]
  })
}

function Bars({ q, a }: { q: Question; a: Ans }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {rows(q, a).map(([label, p, chosen]) => (
        <li key={label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className={`min-w-0 break-words ${chosen ? 'font-semibold text-brand-700 dark:text-brand-300' : 'text-ink-900/60 dark:text-ink-50/60'}`}>
              {chosen && <Check className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />}
              {label}
            </span>
            <span className={`shrink-0 tabular-nums ${chosen ? 'font-semibold' : 'text-ink-900/50 dark:text-ink-50/50'}`}>{pct(p)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <div
              className={`h-1.5 rounded-full ${chosen ? 'bg-brand-500' : 'bg-ink-900/25 dark:bg-ink-50/25'}`}
              style={{ width: `${Math.max(p * 100, 0.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Answers({ e }: { e: Example }) {
  const answers = e.response.answers ?? {}
  const names = Object.keys(e.request.questions)
  return (
    <div className="space-y-4">
      {names.map((n) => {
        const q = e.request.questions[n]
        const a = answers[n]
        if (!a) return null
        return (
          <div key={n}>
            <p className="text-sm">
              {names.length > 1 && <code className="mr-1.5 rounded bg-black/[0.05] px-1.5 py-0.5 text-xs dark:bg-white/[0.07]">{n}</code>}
              <span className="text-ink-900/50 dark:text-ink-50/50">{q.type}:</span> {q.instructions}
            </p>
            <Bars q={q} a={a} />
            <p className="mt-1.5 text-xs text-ink-900/50 dark:text-ink-50/50 tabular-nums">confidence {a.confidence.toFixed(3)}</p>
          </div>
        )
      })}
    </div>
  )
}

function Code({ code, label, wrap }: { code: string; label?: string; wrap?: boolean }) {
  return (
    <div className="mt-4 min-w-0 rounded-xl bg-black/[0.03] ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/15">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <span className="text-xs font-medium text-ink-900/50 dark:text-ink-50/50">{label ?? ''}</span>
        <CopyButton text={code} />
      </div>
      <pre className={`overflow-x-auto px-4 pb-4 pt-2 text-[13px] leading-relaxed ${wrap ? 'whitespace-pre-wrap break-words' : ''}`}><code>{code}</code></pre>
    </div>
  )
}

/** One recorded example: what was sent, what came back, and the request to copy. */
function ExampleCard({ e, longState, highlight }: { e: Example; longState?: boolean; highlight?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl p-5 ring-1 ${highlight ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'}`}>
      <h4 className="font-semibold">{e.title}</h4>
      {longState ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-ink-900/60 dark:text-ink-50/60">State ({e.request.state.split('\n').length} lines, written by hand in the git client’s layout)</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-black/[0.03] p-3 text-xs leading-relaxed dark:bg-white/[0.04]">{e.request.state}</pre>
        </details>
      ) : (
        <p className="mt-2 break-words text-sm leading-relaxed text-ink-900/75 dark:text-ink-50/75">
          <span className="font-semibold text-ink-900/45 dark:text-ink-50/45">state · </span>
          {e.request.state}
        </p>
      )}
      <div className="mt-3">
        <Answers e={e} />
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-brand-600 dark:text-brand-400">Copy this request</summary>
        <Code code={curlFor(e)} label="curl" />
      </details>
      {e.note && <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50">{e.note}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ page content */

const TOC = [
  ['what', 'What it is'],
  ['mental-model', 'The mental model'],
  ['quickstart', '3 ways to use it'],
  ['state', 'Writing a good state'],
  ['types', 'Question types'],
  ['reading', 'Reading the answer'],
  ['examples', 'Examples by domain'],
  ['limits', 'Strong and weak'],
  ['cost', 'Cost'],
  ['faq', 'FAQ'],
]

const IS_NOT = [
  {
    icon: Check,
    title: 'It is a forecaster',
    body: 'You describe the world as it is now and the action about to happen. It tells you what the world will look like afterwards, as probabilities over answers you defined.',
    ok: true,
  },
  {
    icon: X,
    title: 'It is not a chatbot',
    body: 'It never writes text. There is no conversation, no "hello", no explanation. Every request is a state plus typed questions; every answer is numbers.',
    ok: false,
  },
  {
    icon: X,
    title: 'It is not a judge',
    body: 'It does not decide what is allowed or good. It says what will happen; your code (or a person) decides what to do with that, using thresholds you choose.',
    ok: false,
  },
]

const QUICK_CLI = `# 1. get a key: ${site.url}/console → Create API key (then buy credits)
# 2. install the client (Python ≥ 3.9, no dependencies)
pip install "git+https://github.com/OpenInterpretability/ekbasis"

# 3. point it at the hosted API
export EKBASIS_URL=${HOSTED}
export EKBASIS_API_KEY=ekb_...          # the key from the console
ekbasis health                         # setup check: free, needs no key

# 4. ask before you run
cd your-repo
ekbasis git-check -- "git reset --hard"
ekbasis git-check -- "git checkout main" && git checkout main   # only runs if exit 0`

const CLI_OUT = `Ekbasis: RISKY  (lose uncommitted work: 99%)`

const HOOK_JSON = `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "ekbasis-claude-hook", "timeout": 30 }]
      }
    ]
  }
}`

const MCP_CMD = `pip install "ekbasis[mcp] @ git+https://github.com/OpenInterpretability/ekbasis"   # Python ≥ 3.10
claude mcp add --scope user ekbasis \\
  -e EKBASIS_URL=${HOSTED} -e EKBASIS_API_KEY=ekb_... -- ekbasis-mcp`

const EXIT_CODES: [string, string, string][] = [
  ['0', 'no risk found', 'run it'],
  ['2', 'RISKY: may lose work or file content', 'stop, read the reason, decide'],
  ['3', 'cannot foresee (server unreachable, no key, no credits, unreadable repo, parts it cannot evaluate)', 'treat as risky'],
  ['1', 'usage error', 'fix the command'],
]

const DOS = [
  ['Put the numbers in the state', 'Write "balance: $180.20, transfer: $250.00", not "the balance is a bit low". Amounts, counts, sizes, times and limits are what decide most outcomes.'],
  ['Say what is irreplaceable, and what is backed up', 'The model cannot see your disk. "The only copy, never backed up" and "synced with version history" lead to opposite answers for the same rm.'],
  ['Write out the hidden rules', 'If the consequence comes from a rule that is not visible on the screen (a fare that cancels the return flight, a folder link that shares subfolders), state the rule. This is the #1 reason a first answer looks wrong.'],
  ['Send the slice the action touches', '3–8 concrete facts beat three pages of context. States over ~32k tokens are refused (HTTP 422); the git client caps itself at 8 files and 12 branches.'],
  ['Make the options exhaustive and distinct', 'Each option should be a different outcome that you would act on differently. The probabilities are spread over your options only.'],
  ['Separate rules, state and actions', 'The client helper world_state(rules, state, actions) writes the layout the model was trained on. To make a rule count, repeat it right before the question with recap() (the client docs measure the gain).'],
]

const HTTP: [string, string][] = [
  ['200', 'answers, plus usage.input_tokens (what you are billed for)'],
  ['401', 'no key, or an invalid or revoked key'],
  ['402', 'out of credits: buy more in the console'],
  ['403', 'the account is restricted'],
  ['422', 'the request cannot be read, e.g. a state over ~32k tokens (the reason is in the body)'],
  ['503', 'the model server is unreachable'],
]

const THRESHOLDS: [string, string][] = [
  ['p(bad outcome) ≥ 0.5', 'pause: show the person the reason, do not proceed without confirmation'],
  ['0.2 ≤ p(bad) < 0.5', 'the git CLI already calls this RISKY (its default --lost-threshold is 0.2): confirm first'],
  ['p(bad) < 0.2 and confidence ≥ 0.9', 'no warning: the guard stays quiet. That is not a guarantee: keep your normal confirmations and backups for anything irreversible'],
  ['confidence < 0.9 on a destructive action', 'a fact is probably missing: go and read it (the file, ps, the calendar) and ask again'],
  ['cannot foresee (exit 3, any HTTP error)', 'treat as risky: never as "ok"'],
]

const STRONG = [
  'Not a git-only model: it works wherever the state writes down the facts and rules that decide the outcome. Git is where it was trained most; the domains below were measured after training.',
  'Agents, in pre-registered studies: less harm on unmodified Gitea, Nextcloud and Roundcube (Claude Sonnet 6/24 → 1/24 harmful tasks) and on a real Kubernetes cluster (Claude Haiku 24/36 → 2/36), and for all 5 models on our demo apps.',
  'Classic git losses: 8 of 8 destructive commands flagged at 98–99%, and no false alarm on the 9 safe commands tested (a small battery).',
  'Short consequence questions in 21 domains (money, files, mail, calendar, cloud, databases, deploys, shell, identity, docker, network, pipelines, ML ops, scheduled jobs): 168 of 168 scored scenarios right, ~0.55 s each on a GPU. These are short states that spell out the deciding facts; real states are messier, and it will be wrong sometimes.',
  'Honest uncertainty: on states that do not decide the outcome, confidence drops to 0.59–0.84 instead of a fake 0.99.',
  'Arithmetic in the state: running totals, fees on top, unit conversions (MB vs GB), rounding with tax, deadlines to the minute: 8 of 8.',
]

const WEAK = [
  'shell-check is a prototype: `curl … | bash` and `kill -9 -1` pass it today, and patterns like `dd of=/dev/sda` return "cannot foresee" (exit 3).',
  'Remote loss from `git push --force`: the model alone does not see it. Since client 0.1.7 the Claude Code hook asks when a force-push would overwrite commits only the remote holds.',
  'Outside what it was trained on, accuracy drops: on git command types never seen in training it scored 85.8% against 95.8% on seen ones.',
  'It only knows what you wrote. A missing fact is filled with a default assumption, sometimes with high confidence (see the rm example above).',
  'It is a warning layer, not a security boundary. Obfuscated commands (bash -c, aliases) are out of scope: keep backups, confirmations and least privilege.',
  'With the rules written out and time to think, large reasoning models are more accurate. Ekbasis wins on cost, speed and calibrated confidence, not on peak accuracy.',
]

const FAQ: [string, React.ReactNode][] = [
  [
    'Why does it not answer in text?',
    'Because the answer is read straight from the model’s scores for your options, in one forward pass. That is what makes it fast, cheap (no output tokens) and calibrated: the probability is the model’s, not a number it wrote. If you need an explanation, the state and the option it chose are the explanation.',
  ],
  [
    'How is this different from asking an LLM “is this safe?”',
    'An LLM generates a judgment, often with reasoning, and its stated confidence is text. Ekbasis was trained on what actions actually did (including git commands executed in throwaway repositories), answers only the questions you typed, and its probabilities are calibrated. It does not know or care what the agent intended. On short consequence checks a reasoning model can be more accurate, at roughly 200 generated tokens per question; a common pattern is Ekbasis first, the reasoning model only when Ekbasis is unsure.',
  ],
  [
    'Can I ask it anything?',
    'You can ask about any situation you can describe in text, but it is strongest in the kinds of worlds it was trained on: written rules, apps, infrastructure and git. Always give it options; it cannot invent an answer you did not list.',
  ],
  [
    'Can I self-host it?',
    <>
      Yes. The weights are open under Apache-2.0 on{' '}
      <a className="underline underline-offset-2" href={ekbasis.links.model}>Hugging Face</a>, with a GPU build (bf16, FP8, INT4) and an MLX
      4-bit build for Apple Silicon. Same API, same client: set <code>EKBASIS_URL</code> to your server. A self-hosted server has no
      authentication, so keep it on a network you trust. Setup guides:{' '}
      <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/docs/SETUP_GPU.md`}>GPU</a> ·{' '}
      <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/docs/SETUP_MAC_MLX.md`}>Mac (MLX)</a>.
    </>,
  ],
  [
    'How fast is it?',
    `The requests on this page took ${range(latencies, (x) => x.toFixed(2))} s each, measured from a laptop over the internet; the server itself reported ${range(serverTimes, (x) => x.toFixed(2))} s of that. On a dedicated GPU a check is about 0.1 s; on a MacBook with the MLX build, 4.7–12.5 s.`,
  ],
  [
    'What happens to my data?',
    'The hosted API logs request metadata to operate and bill the service (time, account, the last 4 characters of the key, IP address and country, path, status, input tokens, latency). The content of your requests (states, questions, images) is not stored. If nothing may leave your machines, self-host.',
  ],
  [
    'Does it run my commands?',
    'Never. It only reads the text you send. The git CLI reads your repository with read-only git commands to build the state (plus git fetch, only if you pass --fetch); the commands you ask about are never run by Ekbasis.',
  ],
  [
    'Does it replace confirmations or backups?',
    'No. It is a warning layer that can be wrong. Use it to catch the mistakes that are easy to miss, and keep your backups, permissions and human confirmations.',
  ],
]

const DOMAINS: { id: string; icon: typeof GitBranch; title: string; ids: string[]; intro: string }[] = [
  {
    id: 'git',
    icon: GitBranch,
    title: 'Git (raw API, the layout the CLI builds)',
    ids: ['git_reset_hard', 'git_stash_then_reset'],
    intro: 'The same repository (3 files with uncommitted edits), two plans. The questions are the ones the git CLI asks, worded as in training. Stashing first changes the answer.',
  },
  {
    id: 'files',
    icon: HardDrive,
    title: 'Shell and files',
    ids: ['disk_symlink', 'sh_rm_unset_var', 'disk_redirect_trunc'],
    intro: 'Facts about the filesystem in the state; the shell semantics come from the model.',
  },
  {
    id: 'sql',
    icon: Database,
    title: 'SQL and data',
    ids: ['db_delete_no_where', 'db_transaction', 'db_backup_first'],
    intro: 'Blast radius before a statement runs. Note the lower confidence on the backup-then-drop plan: the state does not say the dump succeeded.',
  },
  {
    id: 'apps',
    icon: AppWindow,
    title: 'Apps: bank, calendar, email',
    ids: ['money_wire_fee', 'money_refund_timing', 'cal_rec_one', 'mail_reply_all', 'mail_bcc_reply_all'],
    intro: 'For actions that are not shell commands, the state is what the screen and the account show.',
  },
  {
    id: 'infra',
    icon: Cloud,
    title: 'Cloud and infrastructure',
    ids: ['k8s_wrong_env', 'dk_compose_down_v', 's3_versioning'],
    intro: 'Contexts, volumes and versioning: the facts that make the same command harmless or destructive.',
  },
]

const BATTERY: [string, string, string][] = [
  ['git reset --hard (3 modified files)', 'RISKY, 99%', '2'],
  ['git clean -fd (2 untracked files)', 'RISKY, 98%', '2'],
  ['git stash drop / git stash clear (1 real stash)', 'RISKY, 99%', '2'],
  ['git stash pop (1 real stash)', 'ok, 3%', '0'],
  ['9 safe commands on clean repos (status, log, add -A, commit, …)', 'ok, 0% (no false alarms)', '0'],
  ['rm -rf / (shell-check)', 'RISKY, 90%', '2'],
  ['dd if=/dev/zero of=/dev/sda (shell-check)', 'cannot foresee → treated as risky', '3'],
]

/** Text with `code` spans. */
function Ticks({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? <code key={i} className="rounded bg-black/[0.05] px-1 py-0.5 text-[0.9em] dark:bg-white/[0.07]">{part}</code> : part,
      )}
    </>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
      {children}
    </h2>
  )
}

export default function EkbasisStartPage() {
  const mm = ex('money_transfer_fail')
  const mmAns = mm.response.answers!.q
  const py = ex('python_client')
  const noKey = ex('no_key')
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <Link
        href="/ekbasis"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Ekbasis
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        GETTING STARTED · FOR FIRST-TIME USERS
      </span>
      <h1 className="mt-4 text-4xl sm:text-6xl font-semibold tracking-tight text-balance">How to use Ekbasis</h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        Ekbasis does not chat. You give it a <strong>state</strong> (what the world looks like now), an{' '}
        <strong>action</strong> and a few <strong>typed questions</strong>, and it answers each question with{' '}
        <strong>calibrated probabilities</strong>, in one forward pass. This page shows how to think about it, how to
        write a state it can use, and what it really answers.
      </p>
      <p className="mt-3 text-sm text-ink-900/50 dark:text-ink-50/50">
        Every answer on this page is a real response of {data.meta.model} on the hosted API, recorded on {recordedDay}{' '}
        ({data.meta.calls} calls), unless it is marked as measured in the{' '}
        <a className="underline underline-offset-2" href={COOKBOOK}>cookbook</a>.
      </p>
      <p className="mt-2 text-sm text-ink-900/60 dark:text-ink-50/60">
        Building an agent? Point it at{' '}
        <a className="font-mono underline underline-offset-2" href="/ekbasis/agents.md">openinterp.org/ekbasis/agents.md</a>
        {' '}— the same guide written for language models: exact formats, when to consult, decision rules, failure handling.
      </p>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
        {TOC.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full px-3 py-1 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-brand-500/10 hover:ring-brand-500/30"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* ---------------------------------------------------------------- what */}
      <section className="mt-16">
        <H2 id="what">What it is, and what it is not</H2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 [&>*]:min-w-0">
          {IS_NOT.map((c) => (
            <div
              key={c.title}
              className={`rounded-xl p-5 ring-1 ${c.ok ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'}`}
            >
              <div className="flex items-center gap-2">
                <c.icon className={`h-4 w-4 ${c.ok ? 'text-brand-600 dark:text-brand-400' : 'text-ink-900/50 dark:text-ink-50/50'}`} />
                <h3 className="font-semibold">{c.title}</h3>
              </div>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          The closest everyday analogy is a weather forecast: it does not argue with you or tell you to stay home. It says
          “70% rain”, and you decide about the umbrella. Ekbasis says “99%: this loses uncommitted work”, and your tool
          decides whether to stop. Because nothing is generated, you pay only for the input tokens it reads.
        </p>
      </section>

      {/* ---------------------------------------------------------------- mental model */}
      <section className="mt-16">
        <H2 id="mental-model">The mental model</H2>
        <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
            <div className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" /> State</div>
            <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65">The facts now: files, balances, branches, rules, what the screen shows.</p>
          </div>
          <div className="self-center text-ink-900/40 dark:text-ink-50/40">+</div>
          <div className="flex-1 rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
            <div className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Action</div>
            <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65">What is about to happen, usually written into the state (“About to: …”).</p>
          </div>
          <div className="self-center text-ink-900/40 dark:text-ink-50/40">+</div>
          <div className="flex-1 rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
            <div className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Questions</div>
            <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65">Typed, with the possible answers listed: choice, yes/no, score.</p>
          </div>
          <ArrowRight className="hidden h-5 w-5 shrink-0 self-center text-brand-600 dark:text-brand-400 lg:block" />
          <ArrowDown className="h-5 w-5 shrink-0 self-center text-brand-600 dark:text-brand-400 lg:hidden" />
          <div className="flex-1 rounded-xl p-4 ring-1 ring-brand-500/40 bg-brand-500/5">
            <div className="flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-300"><Gauge className="h-4 w-4" /> Answers</div>
            <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65">A probability for every option, the pick and its confidence. One pass, no text.</p>
          </div>
        </div>

        <h3 className="mt-10 text-lg font-semibold">The smallest useful request</h3>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <div className="min-w-0">
            <Code
              label="request: POST $EKBASIS_URL/v1/systemone"
              code={JSON.stringify(mm.request, null, 2)}
            />
            <ul className="mt-4 space-y-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              <li><code className="text-brand-700 dark:text-brand-300">state</code>: the facts and the action, in plain English. The numbers are there.</li>
              <li><code className="text-brand-700 dark:text-brand-300">questions</code>: a map of names to questions; you pick the names (here <code>q</code>).</li>
              <li><code className="text-brand-700 dark:text-brand-300">type: choice</code> with <code>options</code>: the answer is always one of these.</li>
            </ul>
          </div>
          <div className="min-w-0">
            <Code
              label={`response (real, ${mm.client_latency_s} s, ${mm.response.usage?.input_tokens} input tokens)`}
              code={JSON.stringify({ answers: mm.response.answers, usage: mm.response.usage }, null, 2)}
            />
            <div className="mt-4 rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
              <Answers e={mm} />
              <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70">
                Read it as: “the transfer fails, {`${pct(mmAns.confidence)} sure`}”. The state decided the outcome
                ($180.20 &lt; $250.00), so the model is confident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- quickstart */}
      <section className="mt-16">
        <H2 id="quickstart">Three ways to use it, fastest first</H2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          All three use the same hosted endpoint and key. Get the key in the{' '}
          <Link className="underline underline-offset-2" href="/console">console</Link> (sign in, create a key, buy credits).
        </p>

        <div className="mt-8 rounded-2xl p-5 sm:p-6 ring-1 ring-brand-500/30 bg-brand-500/5">
          <h3 className="flex items-center gap-2 text-xl font-semibold"><Terminal className="h-5 w-5 text-brand-600 dark:text-brand-400" /> a · The git guard, in 60 seconds</h3>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
            The CLI reads your repository with read-only git commands, writes the state for you and asks the trained git questions. You
            write no state at all.
          </p>
          <Code label="terminal" code={QUICK_CLI} />
          <Code label="first line of the output, repo with 3 modified files (measured, cookbook guard battery) · exit 2" code={CLI_OUT} />
          <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-transparent">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                  <th className="px-3 py-2 text-left font-semibold">exit</th>
                  <th className="px-3 py-2 text-left font-semibold">meaning</th>
                  <th className="px-3 py-2 text-left font-semibold">do</th>
                </tr>
              </thead>
              <tbody>
                {EXIT_CODES.map(([c, m, d]) => (
                  <tr key={c} className="border-t border-black/5 dark:border-white/10 align-top">
                    <td className="px-3 py-2 font-mono font-semibold">{c}</td>
                    <td className="px-3 py-2">{m}</td>
                    <td className="px-3 py-2">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
            Also: <code>ekbasis shell-check -- &quot;rm -r build/&quot;</code> (prototype) and{' '}
            <code>ekbasis preflight -- &quot;sqlite3 app.db &lt; migrations/0012.sql&quot;</code> (which step of a multi-step change fails first).
            <code> --fail-open</code> turns exit 3 into 0; do not use it for anything destructive.
          </p>
        </div>

        <div className="mt-6 grid gap-6 [&>*]:min-w-0">
          <div className="min-w-0 rounded-2xl p-5 sm:p-6 ring-1 ring-black/10 dark:ring-white/15">
            <h3 className="flex items-center gap-2 text-xl font-semibold"><Bot className="h-5 w-5 text-brand-600 dark:text-brand-400" /> b · For agents: hook or MCP</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              <strong>Claude Code hook.</strong> Before every Bash call that runs git, the hook asks Ekbasis. If the command may lose
              work, Claude Code asks you to confirm, with the reason. Put <code>EKBASIS_URL</code> and <code>EKBASIS_API_KEY</code> in your
              shell profile, then add to <code>~/.claude/settings.json</code>:
            </p>
            <Code label="~/.claude/settings.json" code={HOOK_JSON} />
            <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
              <code>EKBASIS_GUARD_MODE=deny</code> blocks instead of asking; <code>EKBASIS_SHELL_GUARD=1</code> also checks non-git lines that change
              files (prototype). On top of the model the hook adds a rule layer for committed work (e.g. <code>git branch -D</code> of a branch with
              unique commits). When it cannot foresee, it asks.
            </p>
            <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70">
              <strong>MCP (any MCP client).</strong> Three tools: <code>check_git_commands</code>, <code>predict_consequences</code> (your own
              rules, state, actions and questions) and <code>preflight_command</code>.
            </p>
            <Code label="terminal" code={MCP_CMD} />
            <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
              To teach an agent when to ask (and when not to: over-asking trains people to click through), give it the{' '}
              <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/skills/ekbasis-guard/SKILL.md`}>ekbasis-guard skill</a>.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl p-5 sm:p-6 ring-1 ring-black/10 dark:ring-white/15">
            <h3 className="flex items-center gap-2 text-xl font-semibold"><Code2 className="h-5 w-5 text-brand-600 dark:text-brand-400" /> c · Python, for your own app</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              <code>client.ask(state, questions)</code> sends every question about one state in one request. The helpers write
              the question dicts for you: <code>yes_no</code>, <code>choice</code>, <code>number</code>, and <code>world_state</code> for the
              rules / state / actions layout.
            </p>
            <Code label="python" code={py.code ?? ''} />
            <Code label={`output (real, ${py.client_latency_s} s)`} code={py.stdout ?? ''} />
            <p className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55">
              Each answer has <code>.value</code> (True/False or the chosen label), <code>.confidence</code>, <code>.probabilities</code> and,
              for yes/no, <code>.p_yes</code>. Errors raise <code>CannotJudge</code> (a subclass of <code>ekbasis.EkbasisError</code>): catch it and treat the action as risky. Any language
              works: it is one JSON POST (see the curl under every example below).
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- state */}
      <section className="mt-16">
        <H2 id="state">How to write a good state</H2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          This is where first answers go wrong. The model knows how actions behave; it does not know <em>your</em> world. Whatever
          decides the outcome has to be in the text. Three pairs, same question, real answers:
        </p>

        {[
          ['state_vague_money', 'money_transfer_fail', 'Numbers, not adjectives',
            `Same pick, but ${conf('state_vague_money')} instead of ${conf('money_transfer_fail')}: with “a bit low” it is guessing, and the confidence says so.`],
          ['state_file_vague', 'state_file_synced', 'Say what is backed up',
            `Without the fact it assumes the usual case, rm of a file nobody backed up: ${conf('state_file_vague')} lost. It cannot see your cloud sync until you write it down; with it, ${conf('state_file_synced')} recoverable.`],
          ['state_hidden_without', 'state_hidden_with', 'Write out the hidden rule',
            `Without the fare rule it leans on the common case at ${conf('state_hidden_without')}, close to a coin flip. With the rule written in the state, ${conf('state_hidden_with')} the other way.`],
        ].map(([bad, good, title, lesson]) => (
          <div key={title} className="mt-8">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900/50 dark:text-ink-50/50"><X className="h-3.5 w-3.5" /> Weak state</p>
                <ExampleCard e={ex(bad)} />
              </div>
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300"><Check className="h-3.5 w-3.5" /> Better state</p>
                <ExampleCard e={ex(good)} highlight />
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70">{lesson}</p>
          </div>
        ))}

        <h3 className="mt-10 text-lg font-semibold">Checklist</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          {DOS.map(([t, b]) => (
            <div key={t} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
              <p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" /> {t}</p>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- types */}
      <section className="mt-16">
        <H2 id="types">The question types</H2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          A question is <code>{'{type, instructions, …}'}</code>. You always define the possible answers; the model spreads its
          probability over them.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          <div className="min-w-0">
            <p className="mb-2 text-sm"><code className="font-semibold text-brand-700 dark:text-brand-300">choice</code> · pick one of <code>options</code> (a list) or <code>criteria</code> (label → description)</p>
            <ExampleCard e={ex('cal_timezone')} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-sm"><code className="font-semibold text-brand-700 dark:text-brand-300">noul</code> · yes/no; optional <code>criteria</code> say what true and false mean</p>
            <ExampleCard e={ex('type_noul')} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-sm"><code className="font-semibold text-brand-700 dark:text-brand-300">score</code> · how many / how much, over labelled values</p>
            <ExampleCard e={ex('type_score')} />
          </div>
        </div>
        <h3 className="mt-10 text-lg font-semibold">Several questions, one state, one request</h3>
        <p className="mt-2 text-ink-900/70 dark:text-ink-50/70">
          Put every question about the same state in one request: one round trip, and every answer is the same as if asked alone. Usage still counts the state once per question ({ex('batch_three').response.usage?.input_tokens} input tokens here).
          Note the subtle one: <code>reset --hard</code> keeps the untracked file.
        </p>
        <div className="mt-4 max-w-2xl">
          <ExampleCard e={ex('batch_three')} />
        </div>
      </section>

      {/* ---------------------------------------------------------------- reading */}
      <section className="mt-16">
        <H2 id="reading">How to read the answer</H2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <div className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
            <h3 className="font-semibold">probability</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              For yes/no questions, <code>probability</code> is p(true): “how likely is the bad thing”. For choice and score,{' '}
              <code>probabilities</code> has one number per option, summing to 1.
            </p>
          </div>
          <div className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
            <h3 className="font-semibold">confidence</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              The probability of the answer it picked. 0.95–0.99 when the state decides the outcome; it drops when the state does
              not. Low confidence is information, not an error: it means a fact is missing.
            </p>
          </div>
        </div>

        <h3 className="mt-8 text-lg font-semibold">When the state does not decide, it says so</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
          <ExampleCard e={ex('calb_unknown_config')} />
          <ExampleCard e={ex('calb_unknown_migration')} />
        </div>

        <h3 className="mt-8 text-lg font-semibold">Suggested thresholds</h3>
        <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          <table className="w-full text-sm">
            <tbody>
              {THRESHOLDS.map(([k, v]) => (
                <tr key={k} className="border-t border-black/5 first:border-t-0 dark:border-white/10 align-top">
                  <td className="px-4 py-3 font-medium sm:whitespace-nowrap">{k}</td>
                  <td className="px-4 py-3 text-ink-900/70 dark:text-ink-50/70">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50">
          From the cookbook’s guard skill and the CLI defaults. Tune them to how bad the bad outcome is. A low p(bad) means the
          model found no risk <em>in what you described</em>; it is not a proof that the action is safe.
        </p>

        <h3 className="mt-8 flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /> Errors fail closed</h3>
        <p className="mt-2 text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          With no key, no credits or no server, the client tools answer <strong>cannot foresee</strong> (exit 3), which they treat as
          risky. A guard that runs out of credits never silently turns into “everything is fine”. In your own code, do the same:
          any non-200 means “do not proceed unattended”.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                  <th className="px-4 py-2 text-left font-semibold">HTTP</th>
                  <th className="px-4 py-2 text-left font-semibold">meaning</th>
                </tr>
              </thead>
              <tbody>
                {HTTP.map(([c, m]) => (
                  <tr key={c} className="border-t border-black/5 dark:border-white/10 align-top">
                    <td className="px-4 py-2 font-mono font-semibold">{c}</td>
                    <td className="px-4 py-2">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Code
            label={`real response with no key · HTTP ${noKey.status}`}
            code={JSON.stringify(noKey.response, null, 2)}
            wrap
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- examples */}
      <section className="mt-16">
        <H2 id="examples">Worked examples by domain</H2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Most states below are scenarios from the cookbook’s{' '}
          <a className="underline underline-offset-2" href={`${COOKBOOK}/tree/main/examples`}>re-runnable suites</a>; the answers are
          the hosted API’s. Open “Copy this request” on any card to run it yourself (with <code>EKBASIS_URL</code> and{' '}
          <code>EKBASIS_API_KEY</code> exported).
        </p>
        {DOMAINS.map((d) => (
          <div key={d.id} className="mt-10">
            <h3 id={`ex-${d.id}`} className="flex scroll-mt-24 items-center gap-2 text-xl font-semibold">
              <d.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" /> {d.title}
            </h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">{d.intro}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
              {d.ids.map((id) => (
                <ExampleCard key={id} e={ex(id)} longState={d.id === 'git'} />
              ))}
            </div>
            {d.id === 'git' && (
              <>
                <p className="mt-6 text-sm text-ink-900/70 dark:text-ink-50/70">
                  With the CLI on real repositories (measured in the cookbook’s{' '}
                  <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/examples/results.md`}>guard battery</a>, client 0.1.6):
                </p>
                <div className="mt-3 space-y-2 sm:hidden">
                  {BATTERY.map(([c, v, x]) => (
                    <div key={c} className="rounded-xl p-3 ring-1 ring-black/10 dark:ring-white/15 text-sm">
                      <p className="font-mono text-xs break-words">{c}</p>
                      <p className="mt-1">{v} · exit {x}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                        <th className="px-4 py-2 text-left font-semibold">command (state)</th>
                        <th className="px-4 py-2 text-left font-semibold">verdict</th>
                        <th className="px-4 py-2 text-left font-semibold">exit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BATTERY.map(([c, v, x]) => (
                        <tr key={c} className="border-t border-black/5 dark:border-white/10">
                          <td className="px-4 py-2 font-mono text-xs">{c}</td>
                          <td className="px-4 py-2">{v}</td>
                          <td className="px-4 py-2 font-mono">{x}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      {/* ---------------------------------------------------------------- limits */}
      <section className="mt-16">
        <H2 id="limits">Where it is strong, and where it is weak</H2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <div className="rounded-xl p-5 ring-1 ring-brand-500/40 bg-brand-500/5">
            <h3 className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Strong (measured)</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
              {STRONG.map((s) => <li key={s}><Ticks text={s} /></li>)}
            </ul>
            <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50">
              Ekbasis-27B-INT4, October 2026, hand-verified ground truth:{' '}
              <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/docs/USE_CASES.md`}>use-case map</a>. These are the
              authors’ own scenarios, not an independent benchmark: measure on your own cases before relying on it.
            </p>
          </div>
          <div className="rounded-xl p-5 ring-1 ring-amber-500/40 bg-amber-500/5">
            <h3 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Weak, or not covered</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
              {WEAK.map((s) => <li key={s}><Ticks text={s} /></li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- cost */}
      <section className="mt-16">
        <H2 id="cost">What it costs</H2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          <strong>$0.04 per 1M input tokens</strong>, no output charges (it generates none), prepaid credits, no subscription. Pricing
          assumes ~1.5k input tokens for a git-guard check, <strong>≈ $0.00006 per check</strong> ($0.06 per 1,000); the requests on this page used{' '}
          {range(tokens, (x) => x.toLocaleString('en-US'))} input tokens each; every response reports <code>usage.input_tokens</code>. Self-hosting is free under Apache-2.0.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/console" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-white dark:bg-white dark:text-ink-900 px-4 py-2 text-sm font-medium">
            <KeyRound className="h-4 w-4" /> Get an API key
          </Link>
          <Link href="/ekbasis/pricing" className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
            <CreditCard className="h-4 w-4" /> Pricing
          </Link>
          <a href={COOKBOOK} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
            <BookOpen className="h-4 w-4" /> Cookbook
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------------- faq */}
      <section className="mt-16">
        <H2 id="faq">FAQ</H2>
        <div className="mt-6 divide-y divide-black/5 dark:divide-white/10 rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold flex items-start justify-between gap-4">
                <span>{q}</span>
                <span className="text-brand-600 dark:text-brand-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink-900/60 dark:text-ink-50/60">
          More: the <Link className="underline underline-offset-2" href="/ekbasis">Ekbasis page</Link> (results and papers), the{' '}
          <a className="underline underline-offset-2" href={`${COOKBOOK}/blob/main/docs/API.md`}>API reference</a>, the{' '}
          <a className="underline underline-offset-2" href={ekbasis.links.github}>client on GitHub</a>, or{' '}
          <a className="underline underline-offset-2" href={`mailto:${site.contact}`}>{site.contact}</a>.
        </p>
      </section>
    </main>
  )
}
