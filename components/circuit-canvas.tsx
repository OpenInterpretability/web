'use client'

import { useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import type { CircuitData, CircuitNode } from '@/lib/circuit-data'

const NODE_W = 180
const NODE_H = 64

function layout(data: CircuitData): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 90 })

  data.nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  data.edges.forEach((e) => g.setEdge(e.source, e.target))
  dagre.layout(g)

  const maxScore = Math.max(...data.nodes.map((n) => Math.abs(n.score)), 0.001)
  const maxEdge = Math.max(...data.edges.map((e) => Math.abs(e.score)), 0.001)

  const nodes: Node[] = data.nodes.map((n) => {
    const pos = g.node(n.id)
    const intensity = Math.abs(n.score) / maxScore
    return {
      id: n.id,
      type: 'default',
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: { label: <NodeBody node={n} /> },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        width: NODE_W,
        height: NODE_H,
        padding: 0,
        borderRadius: 12,
        border:
          n.kind === 'error'
            ? `2px dashed rgba(234,179,8,${0.35 + intensity * 0.5})`
            : `1px solid rgba(139,92,246,${0.3 + intensity * 0.5})`,
        background:
          n.kind === 'error'
            ? `rgba(234,179,8,${0.04 + intensity * 0.12})`
            : `rgba(139,92,246,${0.04 + intensity * 0.15})`,
      },
    }
  })

  const edges: Edge[] = data.edges.map((e, i) => {
    const intensity = Math.abs(e.score) / maxEdge
    const signed = e.score >= 0
    return {
      id: `${e.source}__${e.target}__${i}`,
      source: e.source,
      target: e.target,
      label: e.score.toFixed(2),
      labelStyle: { fontSize: 10, fontFamily: 'monospace', fill: '#6b7280' },
      labelBgStyle: { fill: 'transparent' },
      style: {
        stroke: signed ? '#f97316' : '#06b6d4',
        strokeWidth: 1 + intensity * 4,
        opacity: 0.45 + intensity * 0.55,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: signed ? '#f97316' : '#06b6d4',
        width: 14,
        height: 14,
      },
      animated: intensity > 0.75,
    }
  })

  return { nodes, edges }
}

function NodeBody({ node }: { node: CircuitNode }) {
  const isError = node.kind === 'error'
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 text-left">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-brand-600">
          {isError ? '△ error' : node.id.split('.').slice(-1)[0]}
        </span>
        <span className="font-mono text-[10px] text-ink-900/40">
          {node.layer}
        </span>
      </div>
      <div className="truncate text-xs text-ink-900/80 dark:text-ink-50/80">
        {isError ? 'SAE reconstruction residual' : node.name ?? 'unlabeled'}
      </div>
      <div className="font-mono text-[10px] text-orange-600 dark:text-orange-400">
        |IE| {node.score.toFixed(2)}
      </div>
    </div>
  )
}

export function CircuitCanvas({ data }: { data: CircuitData }) {
  const [selected, setSelected] = useState<string | null>(null)
  const { nodes, edges } = useMemo(() => layout(data), [data])

  const selectedNode = useMemo(
    () => (selected ? data.nodes.find((n) => n.id === selected) ?? null : null),
    [selected, data.nodes]
  )

  const incoming = useMemo(
    () =>
      selected
        ? data.edges
            .filter((e) => e.target === selected)
            .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
        : [],
    [selected, data.edges]
  )

  const outgoing = useMemo(
    () =>
      selected
        ? data.edges
            .filter((e) => e.source === selected)
            .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
        : [],
    [selected, data.edges]
  )

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] px-5 py-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-ink-900/60 dark:text-ink-50/60">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse-slow" />
          PREVIEW · {data.method?.toUpperCase()} · {data.model} · τ_node={data.tau_node} · τ_edge={data.tau_edge} · {data.prompts_n} prompts
        </div>
        <div className="flex gap-3 text-ink-900/50 dark:text-ink-50/50">
          <span>{data.nodes.length} nodes</span>
          <span>{data.edges.length} edges</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="h-[560px] bg-white dark:bg-ink-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, n) => setSelected(n.id)}
            onPaneClick={() => setSelected(null)}
            minZoom={0.3}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesFocusable={false}
            elementsSelectable={true}
          >
            <Background gap={24} color="rgba(99,102,241,0.08)" />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) =>
                n.id.endsWith('.error') ? 'rgba(234,179,8,0.5)' : 'rgba(139,92,246,0.5)'
              }
              style={{ background: 'rgba(5,5,7,0.04)', borderRadius: 8 }}
            />
          </ReactFlow>
        </div>

        <aside className="p-5 bg-black/[0.02] dark:bg-white/[0.02] space-y-4 text-sm">
          {selectedNode ? (
            <>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1">
                  Selected node
                </div>
                <div className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {selectedNode.id}
                </div>
                <div className="mt-1 text-sm font-medium">
                  {selectedNode.kind === 'error' ? 'SAE reconstruction residual' : selectedNode.name ?? 'unlabeled'}
                </div>
                <div className="mt-2 text-xs text-ink-900/60 dark:text-ink-50/60">
                  layer <span className="font-mono">{selectedNode.layer}</span> · |IE|{' '}
                  <span className="font-mono text-orange-600 dark:text-orange-400">
                    {selectedNode.score.toFixed(3)}
                  </span>
                </div>
              </div>

              {incoming.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                    ← incoming ({incoming.length})
                  </div>
                  <ul className="space-y-1">
                    {incoming.slice(0, 8).map((e, i) => (
                      <li
                        key={i}
                        onClick={() => setSelected(e.source)}
                        className="flex items-center justify-between rounded border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] px-2 py-1 text-xs cursor-pointer hover:border-brand-500/40"
                      >
                        <span className="font-mono truncate">{e.source}</span>
                        <span
                          className={`font-mono ml-2 shrink-0 ${
                            e.score >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-cyan-600 dark:text-cyan-400'
                          }`}
                        >
                          {e.score.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {outgoing.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                    outgoing → ({outgoing.length})
                  </div>
                  <ul className="space-y-1">
                    {outgoing.slice(0, 8).map((e, i) => (
                      <li
                        key={i}
                        onClick={() => setSelected(e.target)}
                        className="flex items-center justify-between rounded border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] px-2 py-1 text-xs cursor-pointer hover:border-brand-500/40"
                      >
                        <span className="font-mono truncate">{e.target}</span>
                        <span
                          className={`font-mono ml-2 shrink-0 ${
                            e.score >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-cyan-600 dark:text-cyan-400'
                          }`}
                        >
                          {e.score.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                Sample prompt
              </div>
              <p className="text-xs text-ink-900/70 dark:text-ink-50/70 italic leading-relaxed">
                &ldquo;{data.prompt_sample}&rdquo;
              </p>
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                Legend
              </div>
              <ul className="space-y-1.5 text-xs text-ink-900/70 dark:text-ink-50/70">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-brand-500/30 border border-brand-500/60" />
                  feature node
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-amber-500/20 border border-dashed border-amber-500/60" />
                  SAE error term
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-4 h-[2px] bg-orange-500" /> positive attribution
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-4 h-[2px] bg-cyan-500" /> negative attribution
                </li>
                <li className="text-ink-900/40 dark:text-ink-50/40 mt-2">
                  Click any node to drill in. Thicker edges = stronger attribution.
                </li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
