import Link from 'next/link'
import type { ReactNode } from 'react'
import { Source_Serif_4 } from 'next/font/google'

const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' })

export const metadata = {
  title: 'Introducing the Ekbasis API',
  description:
    'Ekbasis is a consequence model: give it the state and the action your agent is about to take, and it returns a calibrated probability for what will happen. Available today at $0.04 per million input tokens.',
  openGraph: { type: 'article', title: 'Introducing the Ekbasis API', publishedTime: '2026-10-10' },
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className={`mt-14 ${serif.className} text-[28px] font-normal leading-tight tracking-tight`}>{children}</h2>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[17px] leading-[1.75] text-ink-900/80 dark:text-ink-50/80">{children}</p>
}

const PAPER = '/research/papers/consequence-model-safety-layer'
const K8S = 'https://github.com/OpenInterpretability/ekbasis-cookbook/blob/main/docs/K8S_STUDY.md'

export default function EkbasisApiAnnouncement() {
  return (
    <main className="mx-auto max-w-[720px] px-6 pb-24 pt-16 sm:pt-24">
      <p className="text-sm text-ink-900/55 dark:text-ink-50/55">
        <Link href="/ekbasis" className="hover:underline">Product</Link> · October 10, 2026
      </p>
      <h1 className={`mt-5 ${serif.className} text-[44px] font-normal leading-[1.08] tracking-tight sm:text-[56px]`}>
        Introducing the Ekbasis API
      </h1>
      <p className="mt-6 text-xl leading-relaxed text-ink-900/70 dark:text-ink-50/70">
        A consequence model that tells your agent what an action will do — before it runs it.
      </p>

      <P>
        Agents make mistakes that are hard to undo. Most are not failures of intelligence; they are actions whose
        effects the agent could not see from where it stood. A reset that discards two hours of uncommitted work. A
        wire transfer whose fee pushes it over the balance. A reply-all that sends internal pricing to a client.
      </P>
      <P>
        Today we are releasing the Ekbasis API. Ekbasis is a consequence model: you give it the current state and the
        action your agent is about to take, and it returns a calibrated probability for what will happen — whether work
        is lost, whether a payment goes through, who ends up seeing a message. It answers in a single forward pass and
        does not generate text, so it is fast and inexpensive enough to consult before every action that matters.
      </P>

      <figure className="mt-10 rounded-2xl bg-white p-7 ring-1 ring-black/10 dark:bg-ink-900 dark:ring-white/15">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-900/45 dark:text-ink-50/45">State</p>
        <p className="mt-2 text-[15px] leading-relaxed">
          Working tree: app.py, utils.py and README.md have uncommitted changes (2 hours of edits, never committed or stashed).
        </p>
        <p className="mt-3 inline-block rounded-lg bg-amber-500/10 px-3 py-1.5 font-mono text-[13px] text-amber-900 ring-1 ring-amber-500/25 dark:text-amber-200">
          About to: git reset --hard
        </p>
        <div className="my-6 h-px bg-black/10 dark:bg-white/10" />
        <div className="flex justify-between text-[15px] font-semibold"><span>Uncommitted changes are gone</span><span className="tabular-nums">98.5%</span></div>
        <div className="mt-2 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/10"><div className="h-1.5 rounded-full bg-[#C96442]" style={{ width: '98.5%' }} /></div>
        <div className="mt-4 flex justify-between text-[15px] text-ink-900/50 dark:text-ink-50/50"><span>Nothing is lost</span><span className="tabular-nums">1.5%</span></div>
        <figcaption className="mt-6 text-xs text-ink-900/45 dark:text-ink-50/45">
          A real response from the hosted API: 135 input tokens, 0.19 seconds on the server.
        </figcaption>
      </figure>

      <H2>A forecaster, not a judge</H2>
      <P>
        Ekbasis does not decide what your agent is allowed to do. It tells you what an action is likely to cause, and
        how sure it is. Your code, or a person, decides what to do with that. When the state describes the world fully,
        its confidence is high; when a fact that decides the outcome is missing, its confidence drops, which is a signal
        to go and read that fact rather than guess.
      </P>
      <P>
        You describe the state in plain language, end it with the action, and ask typed questions: a choice among
        outcomes you list, a yes-or-no question with written criteria, or a count. Several questions about the same state
        go in one request.
      </P>

      <H2>Where it fits</H2>
      <P>
        The fastest way to start is the git guard: one command reads your repository, builds the state and flags
        commands that would lose work. The same client includes a hook for Claude Code that asks before risky shell
        commands, and an MCP server that any compatible agent can call. For actions that are not commands — payments,
        calendars, email, cloud resources — the REST API takes a state and your questions directly.
      </P>
      <pre className="mt-6 overflow-x-auto rounded-xl bg-ink-950 p-5 text-[13px] leading-relaxed text-ink-50/90 ring-1 ring-white/10">
        <code>{`pip install "git+https://github.com/OpenInterpretability/ekbasis"
export EKBASIS_URL=https://openinterp.org/api/v1
export EKBASIS_API_KEY=ekb_...

ekbasis git-check -- "git reset --hard"
# Ekbasis: RISKY (lose uncommitted work: 99%)`}</code>
      </pre>

      <H2>What we measured</H2>
      <P>
        We study whether a consequence model makes agents safer in pre-registered experiments: each plan is hashed before
        the runs, and the hypotheses that fail are published alongside the ones that hold. The studies are small and run
        by us, so we report the counts.
      </P>
      <ul className="mt-5 space-y-3 text-[17px] leading-[1.7] text-ink-900/80 dark:text-ink-50/80">
        <li className="pl-5 -indent-5">— On unmodified Gitea, Nextcloud and Roundcube driven through a real browser, Claude Sonnet did
          harm in 6 of 24 tasks on its own and in 1 of 24 with Ekbasis (one run per task).{' '}
          <Link href={PAPER} className="underline underline-offset-2">Paper</Link>.</li>
        <li className="pl-5 -indent-5">— Operating a real Kubernetes cluster, Claude Haiku did harm in 24 of 36 runs on its own and in 2 of 36
          with Ekbasis. Asking the human before every action also avoided harm, with three times as many questions.{' '}
          <a href={K8S} className="underline underline-offset-2">Study</a>.</li>
        <li className="pl-5 -indent-5">— On our test apps, harm fell for all five models we tried; a placebo reminder did not help.</li>
      </ul>
      <P>
        Not everything worked. With Claude Haiku on real apps, our pre-registered hypotheses failed: a warning alone was
        not enough for a smaller agent to change course. In the Kubernetes study, Ekbasis as a guard missed matching
        Claude Sonnet as a guard by one case — at about one twenty-seventh of the cost per run. Three earlier studies
        missed their bars as well. All of it is in the{' '}
        <Link href={PAPER} className="underline underline-offset-2">paper</Link> and the{' '}
        <a href="https://github.com/OpenInterpretability/ekbasis-cookbook" className="underline underline-offset-2">cookbook</a>.
      </P>

      <H2>Limitations</H2>
      <P>
        Ekbasis is a warning layer that can be wrong, not a security boundary. It is strongest where the state states
        the facts that decide the outcome, and weakest on domains far from its training, on command types it has not
        seen and on obfuscated commands. A low probability of harm is not proof of safety: keep your confirmations and
        backups. When it cannot answer — no key, no credits, no response in time — it fails closed and reports that it
        cannot foresee the outcome, which every client treats as risky.
      </P>

      <H2>Availability and pricing</H2>
      <P>
        The Ekbasis API is available today. It costs $0.04 per million input tokens, with no charge for output, since
        the model generates none; a typical check reads about 1,500 tokens. Credits are prepaid in USDC or USDT on
        Polygon, Arbitrum, Base or Ethereum, with no subscription and no minimum. The weights are open under Apache-2.0,
        and running them on your own hardware is free. The API logs request metadata to operate and bill the service; it
        never stores the content of your requests.
      </P>
      <P>
        For launch, the first 100 accounts to redeem the code <span className="font-mono">EKBASIS100</span> in the
        console receive $1 in credits.
      </P>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/console" className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-900/85 dark:bg-white dark:text-ink-900">
          Get an API key
        </Link>
        <Link href="/ekbasis/start" className="rounded-lg px-5 py-2.5 text-sm font-semibold ring-1 ring-black/15 hover:bg-black/[0.04] dark:ring-white/20 dark:hover:bg-white/[0.06]">
          Read the guide
        </Link>
        <a href="/ekbasis/agents.md" className="rounded-lg px-5 py-2.5 text-sm font-semibold ring-1 ring-black/15 hover:bg-black/[0.04] dark:ring-white/20 dark:hover:bg-white/[0.06]">
          For agents
        </a>
      </div>
    </main>
  )
}
