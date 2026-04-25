'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'
import { CircuitCanvas } from '@/components/circuit-canvas'
import { circuitScenarios, type CircuitScenario } from '@/lib/circuit-data'

export function CircuitsInteractive() {
  const [activeId, setActiveId] = useState(circuitScenarios[0].id)
  const scenario = circuitScenarios.find((s) => s.id === activeId) ?? circuitScenarios[0]

  return (
    <>
      <ScenarioTabs active={activeId} onChange={setActiveId} />

      {scenario.placeholder ? (
        <PlaceholderCard scenario={scenario} />
      ) : (
        <CircuitCanvas data={scenario.data} />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-ink-900/55 dark:text-ink-50/55">
        <span className="chip bg-black/5 dark:bg-white/10 text-ink-900/70 dark:text-ink-50/70 ring-black/10">
          metric · {scenario.metric_label}
        </span>
        <span className="truncate max-w-2xl">
          prompt · <span className="italic text-ink-900/70 dark:text-ink-50/70">&ldquo;{scenario.prompt}&rdquo;</span>
        </span>
      </div>
    </>
  )
}

function ScenarioTabs({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {circuitScenarios.map((s) => {
        const isActive = s.id === active
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-left transition-all ${
              isActive
                ? 'border-brand-500/50 bg-brand-500/10 text-ink-900 dark:text-ink-50 shadow-sm'
                : 'border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] text-ink-900/65 dark:text-ink-50/65 hover:border-brand-500/30 hover:bg-brand-500/5'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-ink-900/40 dark:text-ink-50/40">
                  {s.id}
                </span>
                {s.placeholder && (
                  <Clock className="h-3 w-3 text-amber-500/80" aria-label="pending notebook run" />
                )}
              </div>
              <span className="text-sm font-semibold tracking-tight">{s.title}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PlaceholderCard({ scenario }: { scenario: CircuitScenario }) {
  return (
    <div className="card p-10 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent border-amber-500/20">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="chip bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30 mb-5">
          <Clock className="h-3 w-3 mr-1" /> Pending notebook run
        </div>
        <h3 className="text-2xl font-semibold tracking-tight mb-3">
          {scenario.title}
        </h3>
        <p className="text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed mb-2">
          {scenario.blurb}
        </p>
        <div className="mt-6 font-mono text-[11px] text-ink-900/50 dark:text-ink-50/50 border border-dashed border-black/10 dark:border-white/10 rounded-lg px-4 py-3 bg-white/40 dark:bg-white/[0.02] max-w-xl">
          <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ink-900/40 dark:text-ink-50/40">
            scheduled metric
          </div>
          <div className="font-semibold text-ink-900/80 dark:text-ink-50/80">
            {scenario.metric_label}
          </div>
          <div className="mt-3 mb-1 text-[10px] uppercase tracking-[0.14em] text-ink-900/40 dark:text-ink-50/40">
            prompt
          </div>
          <div className="italic">&ldquo;{scenario.prompt}&rdquo;</div>
        </div>
        <Link
          href="https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/15b_sfc_qwen36_27b_papergrade.ipynb"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-5 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-500/20 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Notebook 15b — Sparse Feature Circuits
        </Link>
        <p className="mt-4 text-xs text-ink-900/50 dark:text-ink-50/50">
          Runs on RTX 6000 Pro / H100 · ~15 min per scenario · outputs JSON in this exact schema.
        </p>
      </div>
    </div>
  )
}
