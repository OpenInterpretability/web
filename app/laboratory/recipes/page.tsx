import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Recipe Store — OpenInterp Laboratory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'laboratory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q2"
      title="Recipe Store"
      blurb="Public marketplace of steering packs. Fork, star, PR. A researcher publishes a 'reduce overconfidence' pack; 500 users apply it with one click to their Qwen3.6 deployment the same day."
      sections={[
        {
          heading: 'Zero-config apply',
          body:
            'Every recipe is a signed bundle: SAE pointer, feature IDs, alpha values, target hook paths. `openinterp apply <url>` patches your transformers model with a monkey-patch hook — no retraining, no fine-tune, no finetune weights to store.',
        },
        {
          heading: 'Quality signal',
          body:
            'Recipes earn a robustness score based on causal validation across prompts. Red = unstable. Green = reproduces across seeds + datasets. Users see the score before applying.',
        },
        {
          heading: 'Governance',
          body:
            'Recipes that amplify dangerous capabilities (jailbreak patterns, CBRN uplift) are flagged via the Watchtower safety-watchlist features. Flagged recipes are private-by-default and require case-by-case review.',
        },
      ]}
    />
  )
}
