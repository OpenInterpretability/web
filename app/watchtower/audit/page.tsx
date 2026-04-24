import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Audit Trail — OpenInterp Watchtower' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'watchtower')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q4"
      title="Audit Trail"
      blurb="Immutable, time-stamped, cryptographically-signed logs of every feature activation in your LLM deployment. The compliance artifact for SOC2, EU AI Act Article 12 (logging), NIST AI RMF, and US EO 14110."
      sections={[
        {
          heading: 'What it proves',
          body:
            '"We continuously monitored our LLM at feature-level granularity, flagged dangerous-capability activations in real time, and retained signed logs for 7+ years." This is the AI-Act logging requirement materialized.',
        },
        {
          heading: 'How we make it tamper-evident',
          body:
            'Logs are written to an append-only WORM store (AWS S3 Object Lock or on-prem equivalent) with per-event Merkle-chained signatures. External auditors can independently verify log integrity without trusting us.',
        },
        {
          heading: 'Exportable reports',
          body:
            'One-click export of compliance-ready PDF summaries: "feature X activated Y times in Q2, of which Z triggered the watchlist, all reviewed by human within SLA." Drop into your audit response.',
        },
      ]}
    />
  )
}
