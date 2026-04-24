'use client'

import { useEffect, useMemo, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { traceData } from '@/lib/trace-data'

const PLAYBACK_MS = 650

export function TraceTheater() {
  const [currentToken, setCurrentToken] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [alpha, setAlpha] = useState(1.0)

  const { tokens, features, activations, counterfactuals, prompt, model, layer, sae_repo } =
    traceData

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setCurrentToken((prev) => {
        if (prev >= tokens.length - 1) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, PLAYBACK_MS)
    return () => clearInterval(id)
  }, [playing, tokens.length])

  const rankedFeatures = useMemo(
    () =>
      features
        .map((f, i) => ({ ...f, idx: i, v: activations[i][currentToken] }))
        .sort((a, b) => b.v - a.v),
    [currentToken, features, activations]
  )

  const currentCF = useMemo(() => {
    const f = features[selectedFeature]
    const cfs = counterfactuals[f.id]
    if (!cfs) {
      return `Counterfactual steering for ${f.id} requires a full Lab run — available when Sandbox ships in Q2 2026.`
    }
    const key = String(Math.round(alpha))
    return cfs[key] ?? cfs['1']
  }, [selectedFeature, alpha, features, counterfactuals])

  function reset() {
    setPlaying(false)
    setCurrentToken(0)
    setAlpha(1)
  }

  function togglePlay() {
    if (currentToken >= tokens.length - 1) setCurrentToken(0)
    setPlaying((p) => !p)
  }

  const sel = features[selectedFeature]

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-2.5 text-xs font-mono text-ink-900/60 dark:text-ink-50/60">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse-slow shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          LIVE PREVIEW · scripted demo · real SAE feature IDs from {sae_repo}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            {playing ? (
              <>
                <Pause className="h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> Play
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 p-5">
          {/* Prompt */}
          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1.5">
              Prompt
            </div>
            <div className="text-sm text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
              {prompt}
            </div>
          </div>

          {/* Response stream */}
          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
              <span>
                Response · <span className="text-brand-600 dark:text-brand-400">{model}</span>
              </span>
              <span className="font-mono normal-case tracking-normal">
                {currentToken + 1} / {tokens.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-0.5 font-mono text-sm leading-relaxed">
              {tokens.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentToken(i)}
                  className={`rounded px-0.5 py-0.5 transition-colors ${
                    i === currentToken
                      ? 'bg-brand-600 text-white shadow-[0_0_0_2px_rgba(99,102,241,0.25)]'
                      : i < currentToken
                      ? 'text-ink-900 dark:text-ink-50'
                      : 'text-ink-900/30 dark:text-ink-50/30'
                  }`}
                >
                  {t.replace(/ /g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4 overflow-x-auto">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-3">
              <span>
                Feature × Token heatmap · <span className="text-brand-600 dark:text-brand-400">{layer}</span>
              </span>
              <span className="font-mono normal-case tracking-normal">
                orange = high activation · click any cell to inspect
              </span>
            </div>
            <div className="min-w-[600px] space-y-1">
              {features.map((f, fi) => (
                <div key={f.id} className="grid grid-cols-[180px_1fr] items-center gap-2">
                  <button
                    onClick={() => setSelectedFeature(fi)}
                    className={`truncate text-left font-mono text-[11px] transition-colors ${
                      fi === selectedFeature
                        ? 'text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50'
                    }`}
                  >
                    {f.id}&nbsp;&nbsp;{f.name}
                  </button>
                  <div
                    className="grid gap-[2px]"
                    style={{ gridTemplateColumns: `repeat(${tokens.length}, 1fr)` }}
                  >
                    {activations[fi].map((v, ti) => {
                      const active = ti === currentToken && fi === selectedFeature
                      return (
                        <button
                          key={ti}
                          onClick={() => {
                            setCurrentToken(ti)
                            setSelectedFeature(fi)
                          }}
                          className={`relative h-[22px] rounded-sm bg-black/[0.05] dark:bg-white/[0.04] transition-all ${
                            active ? 'ring-2 ring-brand-600 ring-offset-1 ring-offset-transparent' : ''
                          }`}
                          aria-label={`${f.id} @ token ${ti}: ${v.toFixed(2)}`}
                        >
                          <span
                            className="absolute inset-0 rounded-sm bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ opacity: v }}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="space-y-5 bg-black/[0.02] dark:bg-white/[0.02] p-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
              Top features @ current token
            </div>
            <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
              {rankedFeatures.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFeature(f.idx)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                    f.idx === selectedFeature
                      ? 'border-brand-500/50 bg-brand-500/[0.07]'
                      : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-black/15 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-mono text-[11px] text-ink-900/70 dark:text-ink-50/70">
                      {f.id} · {f.name}
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                      {f.v.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1.5 h-[3px] rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                      style={{ width: `${f.v * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
              Inspect
            </div>
            <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {sel.id}
                  </div>
                  <div className="mt-1 text-sm font-semibold capitalize leading-tight">
                    {sel.name.replace(/_/g, ' ')}
                  </div>
                </div>
                <span className="shrink-0 rounded border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-ink-900/50 dark:text-ink-50/50">
                  AUROC {sel.auroc.toFixed(2)}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-900/60 dark:text-ink-50/60">
                {sel.desc}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-900/60 dark:text-ink-50/60">Intervention</span>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    α = {alpha.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.1}
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="mt-2 rounded-md border-l-2 border-brand-500 bg-black/[0.03] dark:bg-white/[0.03] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1">
                    Counterfactual (α = {alpha.toFixed(2)})
                  </div>
                  <div className="text-xs leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                    {currentCF}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
