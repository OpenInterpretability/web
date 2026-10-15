/** The /ekbasis table and stat row, shared with /ekbasis/skopos (same markup as the table in app/ekbasis/page.tsx). */
export function DataTable({ columns, rows, highlight }: { columns: string[]; rows: string[][]; highlight?: string }) {
  return (
    <>
      {/* phones: one card per row, so no column hides off-screen */}
      <div className="mt-6 space-y-3 sm:hidden">
        {rows.map((r, k) => (
          <div
            key={k}
            className={`rounded-xl p-4 ring-1 ${
              r[0] === highlight ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'
            }`}
          >
            <p className={`font-semibold ${r[0] === highlight ? 'text-brand-700 dark:text-brand-300' : ''}`}>{r[0]}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {r.slice(1).map((cell, i) => (
                <div key={i} className="contents">
                  <dt className="text-ink-900/55 dark:text-ink-50/55">{columns[i + 1]}</dt>
                  <dd className="tabular-nums">{cell}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="mt-6 hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <tr
                key={k}
                className={`border-t border-black/5 dark:border-white/10 ${
                  r[0] === highlight ? 'bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-300' : ''
                }`}
              >
                {r.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium' : 'tabular-nums'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Stats({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
          <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
          <p className="mt-1 text-sm text-ink-900/60 dark:text-ink-50/60">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
