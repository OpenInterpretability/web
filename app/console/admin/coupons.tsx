"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { Copy } from "lucide-react"
import { api, Badge, Btn, Card, ErrorLine, Input, fmtTok, when } from "./ui"

type C = { code: string; tokens: number; maxRedemptions: number; expiresAt: number | null; active: boolean; note: string; createdAt: number; createdBy: string; redemptions: number }
type Red = { uid: string; email: string | null; t: number; tokens: number }

export function Coupons() {
  const [list, setList] = useState<C[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState("25000000")
  const [count, setCount] = useState("1")
  const [maxR, setMaxR] = useState("1")
  const [expires, setExpires] = useState("")
  const [code, setCode] = useState("")
  const [prefix, setPrefix] = useState("EKB")
  const [note, setNote] = useState("")
  const [created, setCreated] = useState<string[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [reds, setReds] = useState<Red[]>([])

  const load = useCallback(async () => {
    try { setList((await api<{ coupons: C[] }>("/api/admin/coupons")).coupons); setError(null) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [])
  useEffect(() => { void load() }, [load])

  const create = async () => {
    setError(null)
    try {
      const r = await api<{ codes: string[] }>("/api/admin/coupons", {
        method: "POST",
        body: { tokens: Number(tokens), count: Number(count || 1), maxRedemptions: Number(maxR || 0), expiresAt: expires ? new Date(expires + "T23:59:59").getTime() : null, code: code || undefined, prefix, note },
      })
      setCreated(r.codes); setCode(""); await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const patch = async (c: string, body: unknown) => {
    try { await api(`/api/admin/coupons/${encodeURIComponent(c)}`, { method: "PATCH", body }); await load() } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const remove = async (c: string) => {
    if (!window.confirm(`Delete coupon ${c}? Already redeemed credits stay with the users.`)) return
    try { await api(`/api/admin/coupons/${encodeURIComponent(c)}`, { method: "DELETE" }); await load() } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const showReds = async (c: string) => {
    if (open === c) { setOpen(null); return }
    try { setReds((await api<{ redemptions: Red[] }>(`/api/admin/coupons/${encodeURIComponent(c)}`)).redemptions); setOpen(c) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  return (
    <div className="space-y-4">
      <ErrorLine error={error} />
      <Card title="Create coupons">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs">Tokens per redemption<Input value={tokens} onChange={(e) => setTokens(e.target.value.replace(/\D/g, ""))} className="mt-1 w-full" /><span className="text-ink-900/50 dark:text-ink-50/50">{fmtTok(Number(tokens))} ≈ ${((Number(tokens) / 1e6) * 0.04).toFixed(2)}</span></label>
          <label className="text-xs">How many codes<Input value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} className="mt-1 w-full" disabled={!!code} /><span className="text-ink-900/50 dark:text-ink-50/50">up to 500 at once</span></label>
          <label className="text-xs">Uses per code<Input value={maxR} onChange={(e) => setMaxR(e.target.value.replace(/\D/g, ""))} className="mt-1 w-full" /><span className="text-ink-900/50 dark:text-ink-50/50">0 = unlimited · 1 per account always</span></label>
          <label className="text-xs">Expires (optional)<Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="mt-1 w-full" /></label>
          <label className="text-xs">Custom code (optional)<Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LAUNCH2026" className="mt-1 w-full" /></label>
          <label className="text-xs">Prefix for random codes<Input value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} className="mt-1 w-full" /></label>
          <label className="text-xs md:col-span-2">Note<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Reddit launch, partner X" className="mt-1 w-full" /></label>
        </div>
        <div className="mt-3"><Btn kind="primary" onClick={() => { void create() }} disabled={!tokens}>Create</Btn></div>
        {created.length > 0 && (
          <div className="mt-4 rounded-lg bg-emerald-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{created.length} code{created.length > 1 ? "s" : ""} created</p>
              <button onClick={() => { void navigator.clipboard.writeText(created.join("\n")) }} className="inline-flex items-center gap-1 text-xs"><Copy className="h-3.5 w-3.5" /> Copy all</button>
            </div>
            <pre className="mt-2 max-h-40 overflow-y-auto font-mono text-xs">{created.join("\n")}</pre>
          </div>
        )}
      </Card>
      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-3 py-2">Code</th><th className="px-3 py-2 text-right">Tokens</th><th className="px-3 py-2">Used</th><th className="px-3 py-2">Expires</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Note</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <Fragment key={c.code}>
                <tr className="border-t border-black/5 dark:border-white/10">
                  <td className="px-3 py-2 font-mono">{c.code}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtTok(c.tokens)}</td>
                  <td className="px-3 py-2 tabular-nums"><button className="underline decoration-dotted" onClick={() => { void showReds(c.code) }}>{c.redemptions} / {c.maxRedemptions || "∞"}</button></td>
                  <td className="px-3 py-2 text-xs">{c.expiresAt ? when(c.expiresAt) : "never"}</td>
                  <td className="px-3 py-2">{!c.active ? <Badge tone="bad">disabled</Badge> : c.expiresAt && c.expiresAt < Date.now() ? <Badge tone="warn">expired</Badge> : c.maxRedemptions && c.redemptions >= c.maxRedemptions ? <Badge>used up</Badge> : <Badge tone="good">active</Badge>}</td>
                  <td className="px-3 py-2 text-xs">{c.note}</td>
                  <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                    <Btn onClick={() => { void patch(c.code, { active: !c.active }) }}>{c.active ? "Disable" : "Enable"}</Btn>
                    <Btn onClick={() => { const v = window.prompt("Uses per code (0 = unlimited)", String(c.maxRedemptions)); if (v !== null) void patch(c.code, { maxRedemptions: Number(v) }) }}>Limit</Btn>
                    <Btn onClick={() => { void remove(c.code) }}>Delete</Btn>
                  </td>
                </tr>
                {open === c.code && (
                  <tr><td colSpan={7} className="bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                    {reds.length === 0 ? <p className="text-xs">No redemptions yet.</p> : reds.map((r, i) => <p key={i} className="text-xs">{when(r.t)} · {r.email ?? r.uid} · +{fmtTok(r.tokens)}</p>)}
                  </td></tr>
                )}
              </Fragment>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-900/50 dark:text-ink-50/50">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
