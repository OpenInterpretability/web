/**
 * Circuit data types (shared between notebooks 14/15/15b/16 and the Canvas UI).
 * Matches the JSON emitted by scripts/circuit-*.ipynb in OpenInterpretability/notebooks.
 */

export type CircuitNodeKind = 'feature' | 'error'

export interface CircuitNode {
  id: string          // e.g. 'up.f2503' (layer-prefixed)
  layer: string       // e.g. 'L11' or 'L31'
  score: number       // |IE| attribution magnitude
  kind: CircuitNodeKind
  name?: string       // semantic label from feature_catalog (if available)
}

export interface CircuitEdge {
  source: string      // node id
  target: string      // node id
  score: number       // signed attribution
}

export interface CircuitData {
  nodes: CircuitNode[]
  edges: CircuitEdge[]
  metric: string
  prompts_n: number
  tau_node: number
  tau_edge: number
  model?: string
  sae_repo?: string
  prompt_sample?: string
  method?: 'atp' | 'atp-ig' | 'acdc' | 'mask-gradient-prune' | 'edge-pruning'
}

export interface CircuitScenario {
  id: string
  title: string
  blurb: string
  prompt: string
  metric_label: string
  /** If true, circuit not yet computed — page shows a notebook-pending card. */
  placeholder?: boolean
  data: CircuitData
}

// ────────────────────────────────────────────────────────────────────────────
// Medical triage — this is the current canonical demo (L11 → L31 on Qwen3.6-27B)
// ────────────────────────────────────────────────────────────────────────────
const medicalCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
  metric: 'logit',
  prompts_n: 20,
  tau_node: 0.08,
  tau_edge: 0.02,
  method: 'atp',
  prompt_sample:
    'A 52-year-old patient arrives with sudden sharp chest pain radiating to the left arm.',
  nodes: [
    { id: 'up.f4102', layer: 'L11', score: 0.42, kind: 'feature', name: 'patient_demographics' },
    { id: 'up.f892',  layer: 'L11', score: 0.38, kind: 'feature', name: 'anatomical_knowledge' },
    { id: 'up.f3383', layer: 'L11', score: 0.55, kind: 'feature', name: 'medical_domain_terms' },
    { id: 'up.f1847', layer: 'L11', score: 0.34, kind: 'feature', name: 'urgency_assessment' },
    { id: 'up.error', layer: 'L11', score: 0.18, kind: 'error' },
    { id: 'down.f2503', layer: 'L31', score: 0.71, kind: 'feature', name: 'overconfidence_pattern' },
    { id: 'down.f4521', layer: 'L31', score: 0.68, kind: 'feature', name: 'cardiovascular_lexicon' },
    { id: 'down.f2156', layer: 'L31', score: 0.48, kind: 'feature', name: 'clinical_guidelines' },
    { id: 'down.f3892', layer: 'L31', score: 0.52, kind: 'feature', name: 'pharmaceutical_names' },
    { id: 'down.f152',  layer: 'L31', score: 0.31, kind: 'feature', name: 'physician_perspective' },
    { id: 'down.error', layer: 'L31', score: 0.12, kind: 'error' },
  ],
  edges: [
    { source: 'up.f4102', target: 'down.f2503', score: 0.11 },
    { source: 'up.f4102', target: 'down.f152',  score: 0.18 },
    { source: 'up.f892',  target: 'down.f4521', score: 0.29 },
    { source: 'up.f892',  target: 'down.f2503', score: 0.07 },
    { source: 'up.f3383', target: 'down.f4521', score: 0.45 },
    { source: 'up.f3383', target: 'down.f3892', score: 0.33 },
    { source: 'up.f3383', target: 'down.f2156', score: 0.22 },
    { source: 'up.f1847', target: 'down.f2503', score: 0.38 },
    { source: 'up.f1847', target: 'down.f152',  score: 0.19 },
    { source: 'up.error', target: 'down.f2503', score: 0.08 },
    { source: 'up.error', target: 'down.error', score: 0.15 },
    { source: 'up.f3383', target: 'down.error', score: 0.11 },
  ],
}

function placeholderCircuit(prompt: string, metric: string): CircuitData {
  return {
    model: 'Qwen/Qwen3.6-27B',
    sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
    metric,
    prompts_n: 0,
    tau_node: 0.05,
    tau_edge: 0.01,
    method: 'atp',
    prompt_sample: prompt,
    nodes: [],
    edges: [],
  }
}

export const circuitScenarios: CircuitScenario[] = [
  {
    id: 'medical',
    title: 'Medical triage',
    blurb: 'Clinical reasoning — features for anatomy, urgency, and diagnostic commitment at L11/L31.',
    prompt:
      'A 52-year-old patient arrives with sudden sharp chest pain radiating to the left arm. The most likely diagnosis is',
    metric_label: "logit['myocardial'] − logit['gastric']",
    data: medicalCircuit,
  },
  {
    id: 'ioi',
    title: 'Indirect Object Identification',
    blurb: 'Wang et al. 2022 canonical circuit. Does Qwen3.6-27B reproduce it on our SAE features?',
    prompt: 'When Alice and Bob went to the store, Bob gave a drink to',
    metric_label: "logit['Alice'] − logit['Bob']",
    placeholder: true,
    data: placeholderCircuit(
      'When Alice and Bob went to the store, Bob gave a drink to',
      "logit['Alice'] − logit['Bob']",
    ),
  },
  {
    id: 'math',
    title: 'Arithmetic commitment',
    blurb: 'Two-token math probe — which features commit to the answer token at late layers?',
    prompt: 'Q: What is 10 plus 5? A: The answer is',
    metric_label: "logit['15'] − logit['14']",
    placeholder: true,
    data: placeholderCircuit(
      'Q: What is 10 plus 5? A: The answer is',
      "logit['15'] − logit['14']",
    ),
  },
  {
    id: 'refusal',
    title: 'Refusal contrast',
    blurb: 'Benign request — which features encode compliance vs deflection at each layer?',
    prompt: 'Please tell me how to bake a chocolate cake. Answer:',
    metric_label: "logit['Sure'] − logit['Sorry']",
    placeholder: true,
    data: placeholderCircuit(
      'Please tell me how to bake a chocolate cake. Answer:',
      "logit['Sure'] − logit['Sorry']",
    ),
  },
]

/** Default export — medical triage (the original demo). */
export const demoCircuit: CircuitData = medicalCircuit
