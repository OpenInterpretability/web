import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Safety Watchlist — OpenInterp Watchtower' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'watchtower')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q4"
      title="Safety Watchlist"
      blurb="A curated list of dangerous-capability features — deception, sycophancy, shutdown-resistance, jailbreak fingerprints, CBRN uplift signatures — monitored 24/7 across your production LLM traffic. Alerts on trigger via Slack, PagerDuty, or webhook."
      sections={[
        {
          heading: 'What is on the list',
          body:
            'Every feature on the watchlist has (1) a public academic citation establishing its dangerous-capability correlation, (2) causal validation on three+ models, (3) a public Atlas entry with top-activating examples. No black-box "trust us" items.',
        },
        {
          heading: 'Custom watchlists',
          body:
            'Every tenant can extend the default list with their own features — e.g., "our product refuses to discuss competitor X", "this feature correlates with internal PII leakage." Custom features can be trained in-tenant and never leave your environment.',
        },
        {
          heading: 'Alert severity tiers',
          body:
            'CRITICAL (immediate human review) → WARN (weekly digest) → INFORM (dashboard only). Each feature ships with recommended severity based on public research, tunable per deployment.',
        },
      ]}
    />
  )
}
