"use client"

import { useCallback, useEffect, useState } from "react"
import { api, Btn, Card, ErrorLine, Input, when } from "./ui"
import { DEFAULT_PRICE_PER_M, compactChecks, compactTokens, formatPrice, perThousandChecksUsd, priceUnits, tokensForUsd } from "@/lib/price"
import { PACKS } from "@/lib/crypto-pay/config"

type Change = { t: number; old: number; new: number; by: string }
type P = { pricePerM: number; history: Change[]; defaultPricePerM: number; min: number; max: number }

export function Pricing() {
  const [d, setD] = useState<P | null>(null)
  const [value, setValue] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setD(await api<P>("/api/admin/pricing")); setError(null) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [])
  useEffect(() => { void load() }, [load])

  const units = priceUnits(value)
  const next = units === null ? null : units / 1e4

  const save = async () => {
    if (next === null) return
    setBusy(true); setError(null); setMsg(null)
    try {
      const r = await api<{ pricePerM: number; old: number }>("/api/admin/pricing", { method: "POST", body: { pricePerM: next } })
      setMsg(`Price changed from ${formatPrice(r.old)} to ${formatPrice(r.pricePerM)} per 1M input tokens.`)
      setValue(""); setConfirming(false)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <ErrorLine error={error} />
      {msg && <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Current price">
          <p className="text-3xl font-semibold tabular-nums">{d ? formatPrice(d.pricePerM) : "—"} <span className="text-sm font-normal text-ink-900/55 dark:text-ink-50/55">per 1M input tokens</span></p>
          {d && (
            <ul className="mt-3 space-y-1 text-xs text-ink-900/60 dark:text-ink-50/60">
              <li>{compactTokens(tokensForUsd(1, d.pricePerM))} tokens per $1 · {perThousandChecksUsd(d.pricePerM)} per 1,000 checks</li>
              {Object.values(PACKS).map((p) => (
                <li key={p.usd}>${p.usd} {p.name}: {compactTokens(tokensForUsd(p.usd, d.pricePerM))} tokens ≈ {compactChecks(tokensForUsd(p.usd, d.pricePerM))} checks</li>
              ))}
              <li>Default when unset: {formatPrice(d.defaultPricePerM)}</li>
            </ul>
          )}
        </Card>
        <Card title="Change the price">
          <label className="text-xs">New price, USD per 1M input tokens
            <Input value={value} onChange={(e) => { setValue(e.target.value.replace(/[^\d.]/g, "")); setConfirming(false) }} placeholder="0.04" className="mt-1 w-full font-mono" disabled={busy} />
          </label>
          <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50">{d ? `${formatPrice(d.min)} to ${formatPrice(d.max)}, at most 4 decimals` : " "}</p>
          {value && next === null && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Not a valid price.</p>}
          {next !== null && d && next === d.pricePerM && <p className="mt-2 text-xs text-ink-900/60 dark:text-ink-50/60">That is the current price.</p>}
          {next !== null && d && next !== d.pricePerM && !confirming && (
            <div className="mt-3"><Btn kind="primary" onClick={() => setConfirming(true)}>Review change</Btn></div>
          )}
          {confirming && next !== null && d && (
            <div className="mt-3 rounded-lg p-3 ring-1 ring-amber-500/40">
              <p className="text-sm font-semibold">{formatPrice(d.pricePerM)} → {formatPrice(next)} per 1M input tokens</p>
              <p className="mt-1 text-xs text-ink-900/70 dark:text-ink-50/70">
                New orders will buy {tokensForUsd(1, next).toLocaleString("en-US")} tokens per $1
                ({Object.values(PACKS).map((p) => `$${p.usd} → ${compactTokens(tokensForUsd(p.usd, next))}`).join(" · ")}); existing balances are unchanged.
                Orders already created are credited at their own price. Public pages update within a minute.
              </p>
              <div className="mt-3 flex gap-2">
                <Btn kind="danger" onClick={() => { void save() }} disabled={busy}>Confirm: set {formatPrice(next)}</Btn>
                <Btn onClick={() => setConfirming(false)} disabled={busy}>Cancel</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
      <Card title="History">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="text-left text-xs text-ink-900/60 dark:text-ink-50/60">
              <tr><th className="py-1">When</th><th>Old</th><th>New</th><th>By</th></tr>
            </thead>
            <tbody>
              {(d?.history ?? []).map((h, i) => (
                <tr key={i} className="border-t border-black/5 dark:border-white/10">
                  <td className="py-1 text-xs whitespace-nowrap">{when(h.t)}</td>
                  <td className="font-mono text-xs">{formatPrice(h.old)}</td>
                  <td className="font-mono text-xs">{formatPrice(h.new)}</td>
                  <td className="text-xs">{h.by}</td>
                </tr>
              ))}
              {d && d.history.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-xs text-ink-900/50 dark:text-ink-50/50">Never changed: the price is the default.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/** The live price for the other tabs' USD estimates (falls back to the default while loading or on error). */
export function usePrice(): number {
  const [p, setP] = useState<number | null>(null)
  useEffect(() => { api<P>("/api/admin/pricing").then((d) => setP(d.pricePerM)).catch(() => setP(null)) }, [])
  return p ?? DEFAULT_PRICE_PER_M
}
