import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Counterfactual Studio — OpenInterp Laboratory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'laboratory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Counterfactual Studio"
      blurb="'What if this token were X?' Surgical replay. Edit one token in the middle of a generation; see how features downstream shift; compare full trajectories. Feels like a React time-travel debugger but for the residual stream."
      sections={[
        {
          heading: 'Beyond steering',
          body:
            'Sandbox asks: what happens if I change this feature? Counterfactual Studio asks: what happens if I change this token, and how did that propagate through features? The two are complementary tools for two different debugging questions.',
        },
        {
          heading: 'Prefix replay',
          body:
            'Pick any token in an existing trace. Edit its value. We re-run the forward pass from that point (cached prefix), show you the new features, the new output tokens, and — critically — the feature-level diff vs original. Cached prefixes make this fast enough to explore interactively.',
        },
        {
          heading: 'Research uses',
          body:
            'Chain-of-thought robustness studies, prompt-injection susceptibility mapping, "what is the minimum edit that flips the answer" questions. Q3 2026.',
        },
      ]}
    />
  )
}
