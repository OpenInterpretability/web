import Link from "next/link"
import { Bot, CheckCircle2, KeyRound, ShieldAlert } from "lucide-react"
import { getHexclaveServerApp } from "@/hexclave/server"
import { ASSERTION_TTL_S, regByAttemptToken } from "@/lib/agent-auth"
import { ClaimSignIn } from "./sign-in"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Authorize an agent — Ekbasis",
  description: "Confirm the code your AI agent showed you to give it access to the Ekbasis API on your account.",
  robots: { index: false, follow: false },
}

const ERRORS: Record<string, string> = {
  missing: "This link is incomplete. Ask your agent to start again.",
  invalid: "This link is no longer valid — it may have been used, replaced by a newer one, or expired. Ask your agent for a new code.",
  expired: "This code has expired. Ask your agent for a fresh code.",
  too_many: "Too many wrong codes. Ask your agent to start again.",
  wrong_account: "You are signed in with a different email than the one the agent registered.",
  done: "This request was already confirmed.",
  wrong: "That code is not right. Check the 6 digits your agent showed you and try again.",
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">EKBASIS · AGENT ACCESS</span>
      {children}
    </main>
  )
}

const SLOW = Symbol("slow")
async function userOrSlow(ms = 8000) {
  const timer = new Promise<typeof SLOW>((resolve) => setTimeout(() => resolve(SLOW), ms))
  return Promise.race([getHexclaveServerApp().getUser().catch(() => null), timer])
}

export default async function ClaimPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "")
  const token = one("claim_attempt_token")
  const e = one("e")

  if (one("done") === "1") {
    return (
      <Shell>
        <h1 className="mt-5 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" /> Your agent is authorized
        </h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          You can close this tab. The agent now receives an Ekbasis API key on your account. Its calls use your credits.
          To stop it at any time, revoke the key named <code>Agent via auth.md</code> in the{" "}
          <Link href="/console" className="text-brand-600 underline underline-offset-2 dark:text-brand-400">console</Link>.
        </p>
      </Shell>
    )
  }
  if (!token || (e && e !== "wrong")) {
    return (
      <Shell>
        <h1 className="mt-5 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <ShieldAlert className="h-8 w-8 text-amber-500" /> Nothing to confirm here
        </h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">{ERRORS[e] ?? ERRORS.missing}</p>
      </Shell>
    )
  }

  const reg = await regByAttemptToken(token)
  if (!reg) {
    return (
      <Shell>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">This link is no longer valid</h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">{ERRORS.invalid}</p>
      </Shell>
    )
  }

  const user = await userOrSlow()
  if (user === SLOW) {
    return (
      <Shell>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">The sign-in service is slow right now</h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">Reload this page in a few seconds; the code stays valid for 10 minutes.</p>
      </Shell>
    )
  }

  const masked = reg.email.replace(/^(.).*(@.*)$/, "$1…$2")
  if (!user) {
    return (
      <Shell>
        <h1 className="mt-5 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <Bot className="h-8 w-8 text-brand-600 dark:text-brand-400" /> An AI agent is asking for access
        </h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          An agent asked for an Ekbasis API key for <code>{masked}</code>. Sign in with that email (an account is created
          the first time), then type the 6-digit code the agent showed you. If you did not ask an agent for this, close
          this page: nothing happens without the code.
        </p>
        <div className="mt-8">
          <ClaimSignIn />
        </div>
      </Shell>
    )
  }

  const email = user.primaryEmail ?? ""
  if (!user.primaryEmailVerified || email.toLowerCase() !== reg.email) {
    return (
      <Shell>
        <h1 className="mt-5 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <ShieldAlert className="h-8 w-8 text-amber-500" /> Wrong account
        </h1>
        <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
          You are signed in as <code>{email || "an account without a verified email"}</code>, but the agent asked for{" "}
          <code>{masked}</code>. Sign out (top right) and sign in with that email, then open this link again.
        </p>
      </Shell>
    )
  }

  const days = Math.round(ASSERTION_TTL_S / 86400)
  return (
    <Shell>
      <h1 className="mt-5 flex items-center gap-3 text-3xl font-semibold tracking-tight">
        <KeyRound className="h-8 w-8 text-brand-600 dark:text-brand-400" /> Authorize your agent
      </h1>
      <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
        You are signed in as <code>{email}</code>. Type the 6-digit code your agent showed you. The agent will get an
        Ekbasis API key on this account (renewed every 24 hours for up to {days} days); its calls use your credits, and
        you can revoke it in the console at any time.
      </p>
      {e === "wrong" && <p className="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">{ERRORS.wrong}</p>}
      <form method="POST" action="/api/agent-auth/confirm" className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input type="hidden" name="claim_attempt_token" value={token} />
        <input
          name="user_code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
          placeholder="123456"
          aria-label="6-digit code"
          className="w-full rounded-lg border border-ink-900/15 bg-transparent px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] dark:border-ink-50/20 sm:w-56"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700">
          Authorize
        </button>
      </form>
    </Shell>
  )
}
