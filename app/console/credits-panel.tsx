"use client"

import { useCallback, useEffect, useState } from "react"
import { useUser } from "@hexclave/next"
import { CreditCard, ExternalLink } from "lucide-react"

const PACKS = [
  { id: "pack-5", name: "Starter", usd: "$5", tokens: "125M tokens ≈ 83k checks" },
  { id: "pack-20", name: "Team", usd: "$20", tokens: "500M tokens ≈ 333k checks" },
  { id: "pack-50", name: "Business", usd: "$50", tokens: "1.25B tokens ≈ 833k checks" },
]

export function CreditsPanel() {
  const user = useUser()
  const [balance, setBalance] = useState<number | null>(null)
  const [buying, setBuying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const r = await fetch("/api/console/credits", { cache: "no-store" })
      if (r.status === 401) { setBalance(null); return }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      setBalance(d.tokens)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [user])

  useEffect(() => { void load() }, [load])

  const buy = async (packId: string) => {
    setBuying(packId); setError(null)
    try {
      const r = await fetch("/api/console/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      if (d.checkoutUrl) window.location.href = d.checkoutUrl
      else throw new Error(d.error || "no checkout URL")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBuying(null)
    }
  }

  if (!user) return null

  return (
    <div className="mt-4">
      {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
        <p className="text-sm text-ink-900/60 dark:text-ink-50/60">Current balance</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {balance === null ? "—" : balance.toLocaleString()}{" "}
          <span className="text-sm font-normal text-ink-900/50 dark:text-ink-50/50">input tokens</span>
        </p>
        <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50">
          ≈ {balance === null ? "—" : Math.floor(balance / 1500).toLocaleString()} checks at 1.5k tokens each
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => { void buy(p.id) }}
            disabled={buying !== null}
            className="rounded-xl p-4 text-left ring-1 ring-black/10 dark:ring-white/15 hover:ring-brand-500/40 disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-semibold">{p.name}</span>
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums">{p.usd}</p>
            <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50">{p.tokens}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400">
              {buying === p.id ? "Opening checkout…" : "Buy pack"} <ExternalLink className="h-3 w-3" />
            </p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50">
        Checkout runs on Stripe via Hexclave. Payments open with the public beta; until then the packs are shown for transparency.
      </p>
    </div>
  )
}
