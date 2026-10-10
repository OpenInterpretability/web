'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export type DemoExample = {
  id: string
  tab: string
  state: string
  question: string
  options: { label: string; p: number }[]
  tokens: number
  latencyS: number | null
}

/** Real answers recorded on the hosted API (content/ekbasis-start-examples.json); no request is made from here. */
export function ConsequenceDemo({ examples }: { examples: DemoExample[] }) {
  const [i, setI] = useState(0)
  const ex = examples[i]
  const best = Math.max(...ex.options.map((o) => o.p))
  const [before, action] = splitAction(ex.state)

  return (
    <div className="rounded-2xl bg-white/80 text-left shadow-2xl shadow-brand-600/10 ring-1 ring-black/10 backdrop-blur-sm dark:bg-ink-900/70 dark:ring-white/15">
      <div className="flex gap-1 overflow-x-auto border-b border-black/5 px-3 pt-3 dark:border-white/10" role="tablist">
        {examples.map((e, k) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
              k === i
                ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'text-ink-900/55 hover:text-ink-900 dark:text-ink-50/55 dark:hover:text-ink-50'
            }`}
          >
            {e.tab}
          </button>
        ))}
      </div>

      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/45 dark:text-ink-50/45">State you send</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-900/80 dark:text-ink-50/80">{before}</p>
          {action && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 font-mono text-[13px] text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200">
              About to: {action}
            </p>
          )}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-900/45 dark:text-ink-50/45">Question</p>
          <p className="mt-1 text-sm font-medium">{ex.question}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-900/45 dark:text-ink-50/45">Ekbasis answers</p>
          <div className="mt-2 space-y-3">
            {ex.options.map((o) => {
              const top = o.p === best
              return (
                <div key={o.label}>
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className={top ? 'font-semibold' : 'text-ink-900/60 dark:text-ink-50/60'}>
                      {top && <Check className="mr-1 inline h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
                      {o.label}
                    </span>
                    <span className={`tabular-nums ${top ? 'font-semibold' : 'text-ink-900/50 dark:text-ink-50/50'}`}>
                      {(o.p * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                    <div
                      className={`h-2 rounded-full ${top ? 'bg-gradient-to-r from-brand-600 to-accent-500' : 'bg-ink-900/25 dark:bg-ink-50/25'}`}
                      style={{ width: `${Math.max(o.p * 100, 1)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-ink-900/50 dark:text-ink-50/50">
            One forward pass · {ex.tokens} input tokens ≈ ${((ex.tokens / 1e6) * 0.04).toFixed(6)}
            {ex.latencyS ? ` · ${ex.latencyS.toFixed(2)} s on the server` : ''}
          </p>
        </div>
      </div>
      <p className="border-t border-black/5 px-5 py-2.5 text-[11px] text-ink-900/45 dark:border-white/10 dark:text-ink-50/45 sm:px-6">
        Real responses of Ekbasis-27B on the hosted API, recorded on 10 Oct 2026. Nothing is generated: the answer is read from the model in one pass.
      </p>
    </div>
  )
}

function splitAction(state: string): [string, string | null] {
  const k = state.indexOf('About to:')
  if (k < 0) return [state, null]
  return [state.slice(0, k).trim(), state.slice(k + 'About to:'.length).trim()]
}
