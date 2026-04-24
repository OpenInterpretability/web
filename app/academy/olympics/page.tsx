import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Interp Olympics — OpenInterp Academy' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'academy')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Interp Olympics"
      blurb="Monthly feature-hunting challenges with leaderboards and prizes. Kaggle for mechanistic interpretability. 'Find the feature that makes Qwen3.6 hallucinate on medical QA. $5k to the best discovery.'"
      sections={[
        {
          heading: 'Season 1 challenges (Q3 2026)',
          body:
            'Month 1: Hallucination hunter (Qwen3.6-27B medical) · Month 2: Jailbreak fingerprint (Gemma-2-9B) · Month 3: Reasoning-loop detector (open thinking model) · Month 4: Sycophancy eliminator (cross-model, composable recipe).',
        },
        {
          heading: 'Judging',
          body:
            'Automated scoring based on causal-validation metrics computed on held-out data: AUROC, robustness across seeds, semantic coherence via LLM-judge. Tiebreak by public vote and expert panel.',
        },
        {
          heading: 'Prizes',
          body:
            'Sponsored by participating labs and safety teams. Prize pools start at $5k per challenge, scaling with sponsor participation. Winners get public Atlas entries with their name attached — citations for their CV.',
        },
      ]}
    />
  )
}
