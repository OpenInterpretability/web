// The agent-safety research arc (WANDERING -> felt-not-granted), the homepage spine.
// Each beat links to its permanent Zenodo DOI. Findings are one-line, honest.

const Z = (id: string) => `https://zenodo.org/record/${id}`

export interface ArcBeat {
  n: string
  title: string
  finding: string
  doi: string
  url: string
}

export const arc: ArcBeat[] = [
  {
    n: '01',
    title: 'WANDERING',
    finding:
      'Long-horizon agents collapse into tool-call loops and never finish. A probe-free tool-entropy-collapse signal flags it — cross-architecture, cross-task.',
    doi: '10.5281/zenodo.20368601',
    url: Z('20368601'),
  },
  {
    n: '02',
    title: 'It is finalization, not competence',
    finding:
      'A behavioral interruption rescues WANDERING finalization 30% → 70% (paired McNemar p = 0.021). The agent can finish; it fails to commit the ending.',
    doi: '10.5281/zenodo.20490286',
    url: Z('20490286'),
  },
  {
    n: '03',
    title: 'Detect ≠ control',
    finding:
      'The clean "task complete" feature predicts the stop (AUROC 0.91) but clamping it does not cause the stop. Detection is not control — even at the exact, named feature.',
    doi: '10.5281/zenodo.20532769',
    url: Z('20532769'),
  },
  {
    n: '04',
    title: 'The lever is late',
    finding:
      'Knowledge consolidates ~30 layers before the action is committed (L51–63, not the mid-layer verdict). The knowledge–action gap is a LAYER gap — the arc’s first positive causal lever.',
    doi: '10.5281/zenodo.20534219',
    url: Z('20534219'),
  },
  {
    n: '05',
    title: 'It generalizes — and it brakes',
    finding:
      'The late lever generalizes across actions and architectures and works as a brake on irreversible actions (send / delete / drop / deploy): ~100% suppress-and-redirect where the agent commits.',
    doi: '10.5281/zenodo.20679287',
    url: Z('20679287'),
  },
  {
    n: '06',
    title: 'The authorization direction',
    finding:
      'A single late-layer direction both detects AND controls an agent’s commitment to unauthorized irreversible actions — and replicates across architectures (Qwen3.6-27B, gpt-oss-20b).',
    doi: '10.5281/zenodo.20683623',
    url: Z('20683623'),
  },
  {
    n: '07',
    title: 'Felt, not granted',
    finding:
      'But that direction reads the authorization the model FEELS, not the one the user GRANTED. On 21 realistic over-reaches it allows 100% (CI [0.845, 1.0]); an external task-grounded check catches all. Internal monitors inherit the model’s judgment error.',
    doi: '10.5281/zenodo.20685264',
    url: Z('20685264'),
  },
]

// The memorable results, pulled out for a strip near the top.
export const findings = [
  {
    headline: 'The lever is late.',
    detail: 'In a long-horizon agent, knowledge consolidates ~30 layers before the action is committed. The knowledge–action gap is a depth gap.',
  },
  {
    headline: 'Detect ≠ control.',
    detail: 'A feature can predict a behavior at AUROC ≈ 1 and not cause it — even the exact feature, clamped at its own value.',
  },
  {
    headline: 'Felt, not granted.',
    detail: 'An internal authorization monitor inherits the model’s judgment error: it is blind to the realistic over-reach the agent makes in good faith.',
  },
]

// Why the claims are trustworthy — the discipline, not the marketing.
export const discipline = [
  {
    title: 'We publish our own nulls.',
    body: 'Six pre-registered walk-backs across the arc. A negative result, reported as a negative result, is the unit of progress.',
  },
  {
    title: 'Every number is recomputed.',
    body: 'Each paper ships an eval script that recomputes every figure from the public ledgers (35/35, 54/54, 88/88) plus a web-verified citation check.',
  },
  {
    title: 'Permanent + reproducible.',
    body: 'Zenodo DOIs, public GitHub, Hugging Face datasets, and one-command replication via openinterp-lab on the Colab CLI.',
  },
  {
    title: 'Depth over breadth.',
    body: 'One open-weights reasoning model (Qwen3.6-27B) studied deeply, with cross-architecture checks (gpt-oss-20b, Llama-3.1) where the claim is universal.',
  },
]

// A second, smaller research line (training & efficiency) — agent-safety is the headline.
export const secondLine = [
  { name: 'Full-stack SAE training', detail: '11-layer sparse autoencoders on Qwen3.6-27B; the substrate for the probes above.' },
  { name: 'Mechanistic reward modeling', detail: 'reward signals grounded in interpretable internal features, not surface text.' },
  { name: 'Sub-4-bit quantization', detail: 'ternary / trit-plane post-training quantization for cheap open-weights inference.' },
]

// Tools that fell out of the research (demoted; Apache-2.0 / OSS, not a product pitch).
export const researchTools = [
  { name: 'openinterp-lab', detail: 'one-command replication of the papers on the Colab CLI', href: 'https://github.com/OpenInterpretability/openinterp-lab' },
  { name: 'openinterp-mcp', detail: 'run probe-causality experiments from any agent (Claude Code, Cursor)', href: 'https://github.com/OpenInterpretability/openinterp-mcp' },
  { name: 'AgentGuard', detail: 'the four-layer action firewall the safety papers prototype', href: 'https://github.com/OpenInterpretability/agentguard' },
  { name: 'Eval / probe schemas', detail: 'the recompute-every-number harness used in each paper', href: 'https://github.com/OpenInterpretability' },
]

export const credibility = {
  name: 'Caio Vicentino',
  role: 'Independent researcher · OpenInterpretability',
  orcid: '0009-0003-4331-6259',
  orcidUrl: 'https://orcid.org/0009-0003-4331-6259',
  scholar: 'https://scholar.google.com/',
  notes: [
    'Accepted — ICML 2026 Mechanistic Interpretability Workshop (poster)',
    'NVIDIA Inception · AWS Activate',
    '10 papers, permanent Zenodo DOIs, indexed on Google Scholar',
  ],
}
