import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Expeditions — OpenInterp Academy' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'academy')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Expeditions"
      blurb="12 guided interactive tutorials. From 'what is a residual stream?' to 'discover an original feature in Qwen3.6.' Every step validates your work. Finish and earn a badge you can cite on your CV."
      sections={[
        {
          heading: 'Pedagogy',
          body:
            'Each Expedition is structured around doing, not reading. 80% interactive (click this feature, run this intervention, observe). 20% micro-lectures. Validation checkpoints prevent "I watched the video" completion; the platform verifies you actually manipulated the model.',
        },
        {
          heading: 'Launch catalogue (Q3 2026)',
          body:
            '1. The residual stream in 10 minutes · 2. Your first SAE feature · 3. Reading a Trace · 4. Suppressing overconfidence · 5. Circuit-level attribution · 6. Finding a new feature · 7. Writing an Expedition · 8. Cross-model feature matching · 9. RL from SAE rewards · 10. Adversarial feature detection · 11. Reproducing Gao et al. · 12. Publishing your first mini-paper.',
        },
        {
          heading: 'Author SDK',
          body:
            'Researchers who want readers to interactively re-derive their papers can author Expeditions. SDK handles traces, validation, and embedding lectures. First 10 contributors get promoted placement and revenue share from Olympics prize pools.',
        },
      ]}
    />
  )
}
