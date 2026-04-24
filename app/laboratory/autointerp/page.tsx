import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Auto-Interp Engine — OpenInterp Laboratory' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'laboratory')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q3"
      title="Auto-Interp Engine"
      blurb="Upload your failure dataset. We run your model through an SAE, compute per-token feature activations on every prompt, correlate with your error labels, return the top 50 features most predictive of failure — with semantic descriptions and suggested interventions."
      sections={[
        {
          heading: 'The grail of LLM debugging',
          body:
            'Today, debugging an LLM regression is notebook archaeology: check logs, run ablations, read papers, get unlucky. Auto-Interp does the archaeology automatically and returns a ranked list you can act on. Works on any HuggingFace model we have an SAE for.',
        },
        {
          heading: 'How it works',
          body:
            'Given (prompts, labels), compute L0/L31 features per token, run a regularized logistic regression or MI score on each feature against the label. Filter by AUROC > 0.6, annotate with LLM-judge using top-activating examples, return.',
        },
        {
          heading: 'Output',
          body:
            'A notebook-ready JSON report plus a web-visualizable dashboard. Every feature linked to its Atlas entry. Suggested Sandbox recipes pre-generated for the top 5.',
        },
      ]}
    />
  )
}
