import Link from "next/link"
import { ArrowLeft, KeyRound, CreditCard, Activity, Shield } from "lucide-react"
import { currentAdmin } from "@/lib/admin"
import { getHexclaveServerApp } from "@/hexclave/server"
import { SignedOut } from "./signed-out"
import { KeysPanel } from "./keys-panel"
import { CreditsPanel } from "./credits-panel"
import { getPricePerM } from "@/lib/pricing"
import { formatPrice } from "@/lib/price"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Console — Ekbasis",
  description: "Your API keys, prepaid credits and usage for the Ekbasis consequence model.",
}

const SLOW = Symbol("slow")

/** The sign-in provider (Hexclave) sometimes answers slowly or rate-limits: never leave the page spinning. */
async function userOrSlow(ms = 8000) {
  const timer = new Promise<typeof SLOW>((resolve) => setTimeout(() => resolve(SLOW), ms))
  return Promise.race([getHexclaveServerApp().getUser().catch(() => null), timer])
}

export default async function ConsolePage() {
  const user = await userOrSlow()
  if (user === SLOW) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">The sign-in service is slow right now</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Your keys and credits are safe, and the API keeps answering. Reload in a few seconds.
        </p>
        <a href="/console" className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Reload the console
        </a>
      </main>
    )
  }
  if (!user) {
    return (
      <main className="px-6 py-16 sm:py-24">
        <SignedOut />
      </main>
    )
  }
  const [admin, pricePerM] = await Promise.all([currentAdmin().catch(() => null), getPricePerM()])
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Home
      </Link>

      {admin && (
        <Link
          href="/console/admin"
          className="mb-6 ml-auto flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-brand-500/40 hover:bg-brand-500/10"
        >
          <Shield className="h-4 w-4" /> Admin
        </Link>
      )}
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        CONSOLE · KEYS · CREDITS
      </span>
      <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">Ekbasis console</h1>
      <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-2xl text-balance">
        Generate your API keys, buy prepaid credits and watch your balance. Out of credits the guard fails
        closed: it answers &quot;cannot foresee&quot; — which every tool treats as risky — instead of silently going away.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <KeyRound className="h-5 w-5 text-brand-600 dark:text-brand-400" /> API keys
          </h2>
          <p className="mt-2 text-sm text-ink-900/60 dark:text-ink-50/60">
            Send them as <code className="rounded bg-black/[0.04] px-1.5 py-0.5 dark:bg-white/[0.06]">Authorization: Bearer</code>{" "}
            headers. The full value is shown once, at creation.
          </p>
          <KeysPanel />
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Credits
          </h2>
          <p className="mt-2 text-sm text-ink-900/60 dark:text-ink-50/60">
            Credit packs buy input tokens at {formatPrice(pricePerM)}/1M, paid in USDC or USDT. A check is ~1.5k tokens. Credits never expire.
          </p>
          <CreditsPanel pricePerM={pricePerM} />
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Activity className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Usage
          </h2>
          <p className="mt-2 text-sm text-ink-900/60 dark:text-ink-50/60">
            Every API request is metered against your balance as it happens. To operate and bill the API we log
            request metadata — time, account, key (last 4 characters), IP address and country, path, status, input
            tokens and latency. The content of your requests (states, questions, images) is never stored.
          </p>
        </section>
      </div>
    </main>
  )
}
