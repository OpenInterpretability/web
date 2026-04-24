import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Atlas — OpenInterp Observatory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'observatory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q2"
      title="Atlas"
      blurb="Cross-model feature search. Type 'overconfidence'; get back matching features from Qwen, Gemma, Llama, Claude (via API probes), and Mistral — with equivalence scores, top-activating examples, and a citation graph."
      sections={[
        {
          heading: 'The Rosetta Stone',
          body:
            'A public graph of feature equivalences across every major model family we can train SAEs on. Semantic matching done offline with LLM-judge + activation-signature similarity. Rebuilt weekly. "Feature 2503 in Qwen3.6-27B ≈ feature 8901 in Gemma-2-9B" — rendered, searchable, citable.',
        },
        {
          heading: 'What ships first',
          body:
            'Atlas v0 (Q2 2026) covers 3 model families: Qwen3.5/3.6, Gemma-2/4, and a hybrid-architecture class. v1 (Q3) adds Llama-4 and Mistral. v2 (Q4) adds Claude via API-probe features from Anthropic research.',
        },
        {
          heading: 'Why we think it compounds',
          body:
            'The equivalence graph gets more useful as more SAEs are added — each new model × each new layer adds edges and tightens the matching. We expect that to take time and community contributions, and we welcome others building similar graphs; the field benefits from multiple attempts.',
        },
      ]}
      todayLink={{ label: 'Browse current SAE catalog', href: '/models' }}
    />
  )
}
