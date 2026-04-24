import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Sandbox — OpenInterp Laboratory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'laboratory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q2"
      title="Sandbox"
      blurb="Drag-and-drop steering. Suppress feature A, amplify feature B, compose the intervention, hit play, watch the model regenerate. Save as a recipe URL. Export as a .pt that plugs into transformers in one line."
      sections={[
        {
          heading: 'Composable interventions',
          body:
            'Current tools (Goodfire Ember, SAELens) support single-feature interventions. Sandbox supports composable stacks: amplify [honesty, hedging] + suppress [overconfidence, sycophancy], serialize the stack, reuse across prompts and models.',
        },
        {
          heading: 'Live counterfactuals',
          body:
            'Every change re-runs a 4-token prefix forward pass under your subscription budget and updates the response below. 200ms latency target. This is only possible with our Feature Firehose infra (shared with Watchtower).',
        },
        {
          heading: 'Export paths',
          body:
            'Your steering stack exports as: (1) a shareable URL anyone can open, (2) a `.pt` file for `transformers.apply_interventions()`, (3) a Goodfire-compatible `.json`, (4) a PyTorch hook you can paste into your own code.',
        },
      ]}
    />
  )
}
