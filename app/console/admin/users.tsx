"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy } from "lucide-react"
import { api, Badge, Btn, Card, ErrorLine, Input, ago, fmt, fmtTok, usd, when } from "./ui"

type Row = {
  id: string; name: string | null; email: string | null; verified: boolean; signedUpAt: number; lastActiveAt: number
  restricted: boolean; restrictedReason: unknown; note: string; balance: number | null; requests: number; tokensUsed: number; errors: number; lastRequestAt: number | null
}
type Detail = {
  user: Row
  keys: { id: string; description: string | null; lastFour: string; createdAt: number; expiresAt: number | null; revokedAt: number | null; valid: boolean }[]
  orders: { id: string; packId: string; tokens: number; network: string; token: string; usd: number; status: string; createdAt: number; txHash: string | null }[]
  events: { t: number; path: string; status: number; tok: number; ms: number; err?: string }[]
  coupons: { code: string; t: number; tokens: number }[]
}

export function Users() {
  const [rows, setRows] = useState<Row[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newTokens, setNewTokens] = useState("")

  const load = useCallback(async (append = false, c: string | null = null) => {
    try {
      const d = await api<{ users: Row[]; nextCursor: string | null }>(`/api/admin/users?query=${encodeURIComponent(query)}${c ? `&cursor=${encodeURIComponent(c)}` : ""}`)
      setRows((prev) => (append ? [...prev, ...d.users] : d.users))
      setCursor(d.nextCursor)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [query])

  useEffect(() => { const t = setTimeout(() => { void load() }, 250); return () => clearTimeout(t) }, [load])

  const create = async () => {
    try {
      await api("/api/admin/users", { method: "POST", body: { email: newEmail, tokens: Number(newTokens || 0) } })
      setCreating(false); setNewEmail(""); setNewTokens(""); void load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  if (selected) return <UserDetail id={selected} onBack={() => { setSelected(null); void load() }} />

  return (
    <div className="space-y-4">
      <ErrorLine error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email, name or user id" className="w-80" />
        <Btn onClick={() => setCreating((c) => !c)}>+ New user</Btn>
      </div>
      {creating && (
        <Card title="Create a user">
          <p className="mb-3 text-xs text-ink-900/60 dark:text-ink-50/60">They sign in with a one-time code sent to this email. Optional starting balance.</p>
          <div className="flex flex-wrap gap-2">
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@company.com" className="w-72" />
            <Input value={newTokens} onChange={(e) => setNewTokens(e.target.value.replace(/\D/g, ""))} placeholder="starting tokens (e.g. 25000000)" className="w-64" />
            <Btn kind="primary" onClick={() => { void create() }} disabled={!newEmail}>Create</Btn>
          </div>
        </Card>
      )}
      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-3 py-2">Email</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Balance</th><th className="px-3 py-2 text-right">Requests</th><th className="px-3 py-2 text-right">Tokens used</th><th className="px-3 py-2">Last request</th><th className="px-3 py-2">Signed up</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => setSelected(r.id)} className="cursor-pointer border-t border-black/5 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.03]">
                <td className="px-3 py-2">{r.email ?? <span className="text-ink-900/40">(no email)</span>}{r.name && <span className="ml-2 text-xs text-ink-900/50 dark:text-ink-50/50">{r.name}</span>}</td>
                <td className="px-3 py-2 space-x-1">{r.restricted ? <Badge tone="bad">suspended</Badge> : <Badge tone="good">active</Badge>}{!r.verified && <Badge tone="warn">unverified</Badge>}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${r.balance !== null && r.balance < 0 ? "text-red-600" : ""}`}>{fmtTok(r.balance)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.requests)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtTok(r.tokensUsed)}</td>
                <td className="px-3 py-2 text-xs">{ago(r.lastRequestAt)}</td>
                <td className="px-3 py-2 text-xs">{ago(r.signedUpAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-900/50 dark:text-ink-50/50">No users.</td></tr>}
          </tbody>
        </table>
      </div>
      {cursor && <Btn onClick={() => { void load(true, cursor) }}>Load more</Btn>}
    </div>
  )
}

function UserDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [d, setD] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [delta, setDelta] = useState("")
  const [reason, setReason] = useState("")
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState("")

  const load = useCallback(async () => {
    try {
      const x = await api<Detail>(`/api/admin/users/${id}`)
      setD(x); setName(x.user.name ?? ""); setNote(x.user.note); setError(null)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [id])
  useEffect(() => { void load() }, [load])

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setError(null); setMsg(null)
    try { await fn(); setMsg(ok); await load() } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  if (!d) return <div><Btn onClick={onBack}>← Users</Btn><ErrorLine error={error} /></div>
  const u = d.user
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Btn onClick={onBack}>← Users</Btn>
        <h2 className="text-xl font-semibold">{u.email}</h2>
        {u.restricted ? <Badge tone="bad">suspended</Badge> : <Badge tone="good">active</Badge>}
        {!u.verified && <Badge tone="warn">email unverified</Badge>}
        <span className="font-mono text-xs text-ink-900/50 dark:text-ink-50/50">{u.id}</span>
      </div>
      <ErrorLine error={error} />
      {msg && <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Balance">
          <p className={`text-3xl font-semibold tabular-nums ${u.balance !== null && u.balance < 0 ? "text-red-600" : ""}`}>{fmt(u.balance)}</p>
          <p className="text-xs text-ink-900/55 dark:text-ink-50/55">input tokens · ≈ {usd(((u.balance ?? 0) / 1e6) * 0.04)}</p>
          <div className="mt-4 space-y-2">
            <Input value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^\d-]/g, ""))} placeholder="+25000000 or -1000000" className="w-full" />
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason (goes to the audit log)" className="w-full" />
            <div className="flex flex-wrap gap-2">
              {[25_000_000, 125_000_000, 500_000_000].map((n) => (
                <button key={n} onClick={() => setDelta(String(n))} className="rounded-md px-2 py-0.5 text-xs ring-1 ring-black/10 dark:ring-white/15">+{fmtTok(n)}</button>
              ))}
            </div>
            <Btn kind="primary" disabled={!delta || !reason} onClick={() => { void act(() => api(`/api/admin/users/${id}/credits`, { method: "POST", body: { delta: Number(delta), reason } }), "Balance updated"); setDelta(""); setReason("") }}>Apply</Btn>
          </div>
        </Card>
        <Card title="Usage">
          <p className="text-sm tabular-nums">{fmt(u.requests)} requests · {fmtTok(u.tokensUsed)} tokens · {fmt(u.errors)} errors</p>
          <p className="mt-1 text-xs text-ink-900/55 dark:text-ink-50/55">last request {ago(u.lastRequestAt)} · signed up {when(u.signedUpAt)} · last active {ago(u.lastActiveAt)}</p>
        </Card>
        <Card title="Profile">
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="display name" className="w-full" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="private admin note" rows={3} className="w-full rounded-lg bg-transparent px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15" />
            <Btn onClick={() => { void act(() => api(`/api/admin/users/${id}`, { method: "PATCH", body: { name, note } }), "Profile saved") }}>Save</Btn>
          </div>
        </Card>
      </div>

      <Card title="API keys" right={<Btn onClick={() => { void act(async () => { const r = await api<{ value: string }>(`/api/admin/users/${id}/keys`, { method: "POST", body: { description: "Created by admin" } }); setNewKey(r.value) }, "Key created") }}>+ Create key</Btn>}>
        {newKey && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
            <code className="min-w-0 flex-1 break-all font-mono">{newKey}</code>
            <button onClick={() => { void navigator.clipboard.writeText(newKey) }} aria-label="Copy key"><Copy className="h-4 w-4" /></button>
            <span className="text-xs">shown once</span>
          </div>
        )}
        <table className="w-full text-sm">
          <tbody>
            {d.keys.map((k) => (
              <tr key={k.id} className="border-t border-black/5 dark:border-white/10">
                <td className="py-1.5 font-mono">…{k.lastFour}</td>
                <td className="py-1.5 text-xs">{k.description}</td>
                <td className="py-1.5 text-xs">created {ago(k.createdAt)}</td>
                <td className="py-1.5">{k.valid ? <Badge tone="good">valid</Badge> : <Badge tone="bad">{k.revokedAt ? "revoked" : "expired"}</Badge>}</td>
                <td className="py-1.5 text-right">{k.valid && <Btn onClick={() => { void act(() => api(`/api/admin/users/${id}/keys?keyId=${k.id}`, { method: "DELETE" }), "Key revoked") }}>Revoke</Btn>}</td>
              </tr>
            ))}
            {d.keys.length === 0 && <tr><td className="text-ink-900/50 dark:text-ink-50/50">No keys.</td></tr>}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Recent requests">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full font-mono text-xs">
              <tbody>
                {d.events.map((e, i) => (
                  <tr key={i} className="border-t border-black/5 dark:border-white/10">
                    <td className="py-1">{new Date(e.t).toLocaleString()}</td><td>{e.path}</td>
                    <td><Badge tone={e.status < 300 ? "good" : e.status < 500 ? "warn" : "bad"}>{e.status}</Badge></td>
                    <td className="text-right">{e.tok || "—"}</td><td className="text-right">{e.ms} ms</td>
                  </tr>
                ))}
                {d.events.length === 0 && <tr><td className="text-ink-900/50">No requests yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Orders and coupons">
          <table className="w-full text-xs">
            <tbody>
              {d.orders.map((o) => (
                <tr key={o.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="py-1">{when(o.createdAt)}</td><td>{o.packId}</td><td>{usd(o.usd)} {o.token} · {o.network}</td>
                  <td><Badge tone={o.status === "paid" ? "good" : o.status === "pending" ? "neutral" : "warn"}>{o.status}</Badge></td>
                </tr>
              ))}
              {d.coupons.map((c, i) => (
                <tr key={`c${i}`} className="border-t border-black/5 dark:border-white/10">
                  <td className="py-1">{when(c.t)}</td><td className="font-mono">{c.code}</td><td>+{fmtTok(c.tokens)} tokens</td><td><Badge tone="good">coupon</Badge></td>
                </tr>
              ))}
              {d.orders.length + d.coupons.length === 0 && <tr><td className="text-ink-900/50">None.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Danger zone">
        <div className="flex flex-wrap items-center gap-2">
          {u.restricted ? (
            <Btn onClick={() => { void act(() => api(`/api/admin/users/${id}`, { method: "PATCH", body: { restricted: false } }), "Account reactivated") }}>Reactivate account</Btn>
          ) : (
            <>
              <Input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="reason for suspension" className="w-72" />
              <Btn onClick={() => { void act(() => api(`/api/admin/users/${id}`, { method: "PATCH", body: { restricted: true, reason: suspendReason || "suspended by admin" } }), "Account suspended: the API answers 403") }}>Suspend</Btn>
            </>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="type the email to delete" className="w-72" />
          <Btn kind="danger" disabled={confirmDelete !== u.email} onClick={() => { void act(() => api(`/api/admin/users/${id}`, { method: "DELETE" }), "Deleted").then(onBack) }}>Delete account</Btn>
        </div>
      </Card>
    </div>
  )
}
