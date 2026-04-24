import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Compare — OpenInterp Observatory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'observatory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q2"
      title="Compare"
      blurb="N-way diff of reasoning. Put four models side-by-side on the same prompt. Or four prompts on the same model. Heatmap of where feature activations diverge. The killer mode for the reasoning-model era."
      sections={[
        {
          heading: 'Why this matters',
          body:
            'When Qwen gets a math question right and Gemma gets it wrong, the interesting question is not "which answer". It is "at what token did the reasoning diverge, and which feature flipped the outcome?" Compare mode answers this visually in 5 seconds.',
        },
        {
          heading: 'Thinking-trace mode',
          body:
            'For reasoning models with visible thinking traces, Compare aligns the <think> blocks across models and highlights semantic-equivalent steps. "Both models considered path A, only model B pursued path B after token 47" — visual, immediate.',
        },
        {
          heading: 'Use cases unlocked',
          body:
            'Red-teaming (why did one fine-tune regress on safety?), dataset debugging (which prompts in this eval expose divergent reasoning?), vendor benchmarking, distillation target selection.',
        },
      ]}
      todayLink={{ label: 'Open the Trace Theater', href: '/observatory/trace' }}
    />
  )
}
