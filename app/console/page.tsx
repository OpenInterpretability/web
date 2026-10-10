import Link from "next/link"
import { ArrowLeft, KeyRound, CreditCard, Activity } from "lucide-react"
import { KeysPanel } from "./keys-panel"
import { CreditsPanel } from "./credits-panel"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Console — Ekbasis",
  description: "Your API keys, prepaid credits and usage for the Ekbasis consequence model.",
}

export default function ConsolePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/ekbasis/pricing"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to pricing
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        CONSOLE · KEYS · CREDITS
      </span>
      <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">Ekbasis console</h1>
      <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 max-w-2xl text-balance">
        Generate your API keys, buy prepaid credits and watch your balance. Out of credits the guard fails
        closed: it answers &quot;cannot judge&quot; — which every tool treats as risky — instead of silently going away.
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
            Credit packs buy input tokens at $0.04/1M, paid in USDC or USDT. A check is ~1.5k tokens. Credits never expire.
          </p>
          <CreditsPanel />
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Activity className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Usage
          </h2>
          <p className="mt-2 text-sm text-ink-900/60 dark:text-ink-50/60">
            Per-day charts and per-key breakdowns ship with the public beta. The live balance above is already
            metered per request.
          </p>
        </section>
      </div>
    </main>
  )
}
