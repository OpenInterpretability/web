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
          heading: 'Why this is a moat',
          body:
            'The equivalence graph only gets better with time, because every new model + new SAE adds edges. Replication requires re-training every SAE from scratch and maintaining the matching pipeline. Years to catch up; impossible to front-run.',
        },
      ]}
      todayLink={{ label: 'Browse current SAE catalog', href: '/models' }}
    />
  )
}
