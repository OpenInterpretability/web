"use client"

import Link from "next/link"
import { useHexclaveApp } from "@hexclave/next"
import { KeyRound, LogIn, BookOpen, Terminal } from "lucide-react"

/** What /console shows before sign-in: what you get here and one obvious button. */
export function SignedOut() {
  const app = useHexclaveApp()
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">EKBASIS API · CONSOLE</span>
      <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">Get your Ekbasis API key</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-ink-900/70 dark:text-ink-50/70 text-balance">
        Sign in to create API keys, add credits and see your usage. New here? Your account is created the first time you sign in.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={() => { void app.redirectToSignIn() }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
        >
          <LogIn className="h-5 w-5" /> Sign in or create an account
        </button>
        <p className="text-sm text-ink-900/55 dark:text-ink-50/55">GitHub, Google or a one-time code sent to your email. No password.</p>
      </div>

      <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
        {[
          { icon: LogIn, t: "1 · Sign in", d: "With GitHub, Google or an email code." },
          { icon: KeyRound, t: "2 · Create a key", d: "Shown once, as ekb_…. Add credits in USDC or USDT, or redeem a coupon." },
          { icon: Terminal, t: "3 · First check", d: "export EKBASIS_API_KEY=ekb_… then ekbasis git-check -- \"git reset --hard\"" },
        ].map((s) => (
          <div key={s.t} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
            <s.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <p className="mt-3 font-semibold">{s.t}</p>
            <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65 break-words">{s.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-ink-900/60 dark:text-ink-50/60">
        <BookOpen className="mr-1 inline h-4 w-4" />
        First time with a model like this? <Link href="/ekbasis/start" className="text-brand-600 underline underline-offset-2 dark:text-brand-400">Read the 5-minute guide</Link>
        {" · "}
        <Link href="/ekbasis/pricing" className="text-brand-600 underline underline-offset-2 dark:text-brand-400">Pricing</Link>
      </p>
    </div>
  )
}
