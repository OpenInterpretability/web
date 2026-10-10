"use client"

import { useEffect, useState } from "react"
import { api, ErrorLine, when } from "./ui"

type Entry = { t: number; admin: string; action: string; target: string; detail?: unknown }

export function Audit() {
  const [rows, setRows] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    api<{ entries: Entry[] }>("/api/admin/audit").then((d) => setRows(d.entries)).catch((e) => setError(String(e.message ?? e)))
  }, [])
  return (
    <div>
      <ErrorLine error={error} />
      <p className="mb-3 text-sm text-ink-900/60 dark:text-ink-50/60">Every admin change, newest first (last 5,000 kept).</p>
      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-ink-900/60 dark:bg-white/[0.04] dark:text-ink-50/60">
            <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Admin</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th><th className="px-3 py-2">Detail</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5 align-top dark:border-white/10">
                <td className="px-3 py-1.5 whitespace-nowrap text-xs">{when(r.t)}</td>
                <td className="px-3 py-1.5 text-xs">{r.admin}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{r.action}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{r.target}</td>
                <td className="px-3 py-1.5 font-mono text-[11px] text-ink-900/70 dark:text-ink-50/70"><pre className="whitespace-pre-wrap break-all">{r.detail ? JSON.stringify(r.detail) : ""}</pre></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-900/50 dark:text-ink-50/50">No admin actions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
