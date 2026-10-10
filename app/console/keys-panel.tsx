"use client"

import { useCallback, useEffect, useState } from "react"
import { useHexclaveApp, useUser } from "@hexclave/next"
import { KeyRound, Plus, Trash2, Copy, Check } from "lucide-react"

type ApiKeyRow = {
  id: string
  description: string | null
  createdAt: string
  expiresAt: string | null
  revoked: string | null
  lastFour: string
}

export function KeysPanel() {
  const app = useHexclaveApp()
  const user = useUser()
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [newValue, setNewValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/console/keys", { cache: "no-store" })
      if (r.status === 401) { setKeys([]); return }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      setKeys(d.keys)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => { if (user) void load() }, [user, load])

  const create = async () => {
    setCreating(true); setError(null)
    try {
      const r = await fetch("/api/console/keys", { method: "POST" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      setNewValue(d.value)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (id: string) => {
    setError(null)
    try {
      const r = await fetch(`/api/console/keys?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  if (!user) {
    return (
      <div className="mt-4 rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
        <p className="text-sm text-ink-900/70 dark:text-ink-50/70">Sign in with GitHub, Google or a one-time code to manage your keys.</p>
        <button
          onClick={() => { void app.redirectToSignIn() }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-ink-900"
        >
          <KeyRound className="h-4 w-4" /> Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {newValue && (
        <div className="mb-4 rounded-xl bg-brand-500/5 p-4 ring-1 ring-brand-500/30">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Your new key — shown only once:</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-black/[0.04] px-2 py-1 text-xs dark:bg-white/[0.06]">{newValue}</code>
            <button
              onClick={() => { void navigator.clipboard.writeText(newValue); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="inline-flex items-center gap-1 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-2.5 py-1 text-xs font-medium"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50">Use it as <code>Authorization: Bearer</code>. This exact value cannot be retrieved again.</p>
        </div>
      )}
      <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/15 overflow-hidden">
        {keys === null ? (
          <p className="p-4 text-sm text-ink-900/60 dark:text-ink-50/60">Loading keys…</p>
        ) : keys.length === 0 ? (
          <p className="p-4 text-sm text-ink-900/60 dark:text-ink-50/60">No keys yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10 text-sm">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <span className="font-mono">ekb_…{k.lastFour}</span>
                <span className="text-ink-900/50 dark:text-ink-50/50">{k.description || "Ekbasis key"}</span>
                <span className="text-xs text-ink-900/40 dark:text-ink-50/40 tabular-nums">
                  created {new Date(k.createdAt).toLocaleDateString()}
                  {k.revoked && " · revoked"}
                  {k.expiresAt && ` · expires ${new Date(k.expiresAt).toLocaleDateString()}`}
                </span>
                {!k.revoked && (
                  <button
                    onClick={() => { void revoke(k.id) }}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => { void create() }}
        disabled={creating}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-ink-900 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> {creating ? "Creating…" : "Create API key"}
      </button>
    </div>
  )
}
