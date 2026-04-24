import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Circuit Canvas — OpenInterp Observatory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'observatory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q2"
      title="Circuit Canvas"
      blurb="Figma-style attribution graphs. Click a token, watch the causal chain propagate backward through features, through layers, to the input. Zoomable, pannable, shareable by URL."
      sections={[
        {
          heading: 'What it will do',
          body:
            'Given an output token, compute attribution back to features at every layer using gradient × activation and patching. Render as a DAG in deck.gl, with edge thickness = attribution strength. Drill-in on any node opens its feature page. Shift-click to multi-select and compare circuits across seeds.',
        },
        {
          heading: 'Why now',
          body:
            'Circuit analysis lives in papers, not tools. Every circuit figure in the 2023–2026 Anthropic and DeepMind literature was hand-drawn in Figma or mpl. We make circuit discovery a 10-second operation, shareable as a URL, citable with a hash.',
        },
        {
          heading: 'Data moat',
          body:
            'Every circuit computed gets stored in the public graph database. By Q3 2026 this becomes the largest public repository of verified LLM circuits, indexed by model × prompt × behavior. The Cross-model Rosetta Stone begins here.',
        },
      ]}
      todayLink={{ label: 'Try Trace Theater now', href: '/observatory/trace' }}
    />
  )
}
