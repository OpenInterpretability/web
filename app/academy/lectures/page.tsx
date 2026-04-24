import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Live Lectures — OpenInterp Academy' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'academy')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Live Lectures"
      blurb="Researchers lecture inside the tool. The slides are Traces. The homework is an Expedition. Real-time Q&A in a panel. First interpretability course where the data + lecture + practice live in the same browser tab."
      sections={[
        {
          heading: 'The format',
          body:
            'A researcher opens a Trace of their own work, talks through it for 40 minutes, drops interactive homework cells, answers questions live in the panel. Recorded and remixable — future viewers scrub the lecture and the model state in sync.',
        },
        {
          heading: 'Invited Q3 2026 speakers',
          body:
            'We are in early conversations with researchers at Anthropic, DeepMind, EleutherAI, Goodfire, and independent interpretability labs. Confirmed names published as partnerships finalize.',
        },
        {
          heading: 'Host a lecture',
          body:
            'Active researchers in interpretability who want to demo their work interactively: email us. Priority for work published in 2025–2026 with reproducible artifacts.',
        },
      ]}
    />
  )
}
