"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { api, Badge, Btn, ErrorLine, usd, when } from "./ui"

type O = { id: string; userId: string; email: string | null; packId: string; tokens: number; network: string; token: string; amount: number; status: string; createdAt: number; payBy: number; txHash: string | null; explorerUrl: string | null }

export function Orders() {
  const [list, setList] = useState<O[]>([])
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setList((await api<{ orders: O[] }>(`/api/admin/orders${status ? `?status=${status}` : ""}`)).orders); setError(null) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [status])
  useEffect(() => { void load() }, [load])

  const act = async (o: O, action: "recheck" | "credit" | "expire") => {
    setError(null); setMsg(null)
    let txHash: string | undefined
    if (action !== "expire") {
      const v = window.prompt(action === "recheck" ? "Transaction hash (optional — empty scans the chain)" : `Credit ${o.tokens.toLocaleString()} tokens to ${o.email}?\nPaste the transaction hash you checked (optional):`, "")
      if (v === null) return
      txHash = v.trim() || undefined
    } else if (!window.confirm(`Close order ${o.id} without crediting?`)) return
    try {
      const r = await api<{ status: string; message?: string | null }>(`/api/admin/orders/${o.id}`, { method: "POST", body: { action, txHash } })
      setMsg(`Order ${o.id}: ${r.status}${r.message ? ` — ${r.message}` : ""}`)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  return (
    <div className="space-y-4">
      <ErrorLine error={error} />
      {msg && <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}
      <div className="flex gap-2">
        {["", "pending", "paid", "review", "expired"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-2.5 py-1 text-xs ring-1 ${status === s ? "bg-brand-500/10 ring-brand-500/60" : "ring-black/10 dark:ring-white/15"}`}>{s || "all"}</button>
        ))}
      </div>
      <p className="text-xs text-ink-900/55 dark:text-ink-50/55">"review" = a transfer was claimed but the credit was not confirmed: check the user's balance before crediting by hand.</p>
      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-3 py-2">Created</th><th className="px-3 py-2">Buyer</th><th className="px-3 py-2">Pack</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Transaction</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-3 py-2 text-xs whitespace-nowrap">{when(o.createdAt)}</td>
                <td className="px-3 py-2">{o.email ?? o.userId}</td>
                <td className="px-3 py-2">{o.packId}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.amount.toFixed(6)} {o.token} · {o.network}</td>
                <td className="px-3 py-2"><Badge tone={o.status === "paid" ? "good" : o.status === "review" ? "bad" : o.status === "expired" ? "neutral" : "warn"}>{o.status}</Badge></td>
                <td className="px-3 py-2 text-xs">{o.explorerUrl ? <a href={o.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400">{o.txHash?.slice(0, 10)}… <ExternalLink className="h-3 w-3" /></a> : "—"}</td>
                <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                  {o.status !== "paid" && <Btn onClick={() => { void act(o, "recheck") }}>Recheck</Btn>}
                  {o.status !== "paid" && <Btn onClick={() => { void act(o, "credit") }}>Credit</Btn>}
                  {(o.status === "pending" || o.status === "review") && <Btn onClick={() => { void act(o, "expire") }}>Close</Btn>}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-900/50 dark:text-ink-50/50">No orders.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-900/50 dark:text-ink-50/50">Total shown: {usd(list.filter((o) => o.status === "paid").reduce((a, o) => a + o.amount, 0))} paid in this list.</p>
    </div>
  )
}
