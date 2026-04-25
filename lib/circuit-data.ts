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
// Real circuits computed via notebook 15b on caiovicentino1/qwen36-27b-sae-papergrade.
// Uploaded to https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/tree/main/circuits
// AtP* attribution + per-feature ablation for L11→L31 edges. 1 prompt per scenario.
// ────────────────────────────────────────────────────────────────────────────

const ioiCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
  metric: "logit['Alice'] - logit['Bob']",
  prompts_n: 1,
  tau_node: 0.05,
  tau_edge: 0.01,
  method: 'atp',
  prompt_sample: 'When Alice and Bob went to the store, Bob gave a drink to',
  nodes: [
    { id: 'up.f39362',  layer: 'L11', score: 0.385, kind: 'feature' },
    { id: 'up.f38927',  layer: 'L11', score: 0.369, kind: 'feature' },
    { id: 'up.f51405',  layer: 'L11', score: 0.246, kind: 'feature' },
    { id: 'up.f54276',  layer: 'L11', score: 0.190, kind: 'feature' },
    { id: 'up.f4332',   layer: 'L11', score: 0.183, kind: 'feature' },
    { id: 'up.f20842',  layer: 'L11', score: 0.182, kind: 'feature' },
    { id: 'up.error',   layer: 'L11', score: 0.206, kind: 'error' },
    { id: 'down.f16060', layer: 'L31', score: 1.000, kind: 'feature' },
    { id: 'down.f32631', layer: 'L31', score: 0.579, kind: 'feature' },
    { id: 'down.f61135', layer: 'L31', score: 0.569, kind: 'feature' },
    { id: 'down.f51925', layer: 'L31', score: 0.385, kind: 'feature' },
    { id: 'down.f52480', layer: 'L31', score: 0.299, kind: 'feature' },
    { id: 'down.f45703', layer: 'L31', score: 0.298, kind: 'feature' },
    { id: 'down.error',  layer: 'L31', score: 0.367, kind: 'error' },
  ],
  edges: [
    { source: 'up.error',  target: 'down.error',  score:  0.12  },
    { source: 'up.error',  target: 'down.f16060', score:  0.08  },
    { source: 'up.f54276', target: 'down.f16060', score: -0.044 },
  ],
}

const mathCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
  metric: "logit['5'] - logit['4']",
  prompts_n: 1,
  tau_node: 0.05,
  tau_edge: 0.01,
  method: 'atp',
  prompt_sample: 'Q: What is 2 plus 3? A: The answer is',
  nodes: [
    { id: 'up.f50810',  layer: 'L11', score: 0.875, kind: 'feature' },
    { id: 'up.f21195',  layer: 'L11', score: 0.653, kind: 'feature' },
    { id: 'up.f20507',  layer: 'L11', score: 0.476, kind: 'feature' },
    { id: 'up.f60298',  layer: 'L11', score: 0.421, kind: 'feature' },
    { id: 'up.f55036',  layer: 'L11', score: 0.318, kind: 'feature' },
    { id: 'up.f30629',  layer: 'L11', score: 0.251, kind: 'feature' },
    { id: 'up.error',   layer: 'L11', score: 0.153, kind: 'error' },
    { id: 'down.f10605', layer: 'L31', score: 1.000, kind: 'feature' },
    { id: 'down.f14846', layer: 'L31', score: 0.816, kind: 'feature' },
    { id: 'down.f34368', layer: 'L31', score: 0.758, kind: 'feature' },
    { id: 'down.f34845', layer: 'L31', score: 0.520, kind: 'feature' },
    { id: 'down.f19535', layer: 'L31', score: 0.498, kind: 'feature' },
    { id: 'down.f36089', layer: 'L31', score: 0.462, kind: 'feature' },
    { id: 'down.error',  layer: 'L31', score: 0.386, kind: 'error' },
  ],
  edges: [
    { source: 'up.f55036', target: 'down.f14846', score: -0.195 },
    { source: 'up.error',  target: 'down.error',  score:  0.12  },
    { source: 'up.error',  target: 'down.f10605', score:  0.08  },
  ],
}

const refusalCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
  metric: "logit['Sure'] - logit['Sorry']",
  prompts_n: 1,
  tau_node: 0.05,
  tau_edge: 0.01,
  method: 'atp',
  prompt_sample: 'Please tell me how to bake a chocolate cake. Answer:',
  nodes: [
    { id: 'up.f21195',  layer: 'L11', score: 0.291, kind: 'feature' },
    { id: 'up.f12328',  layer: 'L11', score: 0.278, kind: 'feature' },
    { id: 'up.f36804',  layer: 'L11', score: 0.236, kind: 'feature' },
    { id: 'up.f55991',  layer: 'L11', score: 0.213, kind: 'feature' },
    { id: 'up.f32010',  layer: 'L11', score: 0.202, kind: 'feature' },
    { id: 'up.f41136',  layer: 'L11', score: 0.196, kind: 'feature' },
    { id: 'up.error',   layer: 'L11', score: 0.290, kind: 'error' },
    { id: 'down.f60897', layer: 'L31', score: 1.000, kind: 'feature' },
    { id: 'down.f21273', layer: 'L31', score: 0.603, kind: 'feature' },
    { id: 'down.f34368', layer: 'L31', score: 0.597, kind: 'feature' },
    { id: 'down.f43943', layer: 'L31', score: 0.504, kind: 'feature' },
    { id: 'down.f37423', layer: 'L31', score: 0.400, kind: 'feature' },
    { id: 'down.f49404', layer: 'L31', score: 0.384, kind: 'feature' },
    { id: 'down.error',  layer: 'L31', score: 0.436, kind: 'error' },
  ],
  edges: [
    { source: 'up.f36804', target: 'down.f60897', score:  0.967 },
    { source: 'up.f41136', target: 'down.f60897', score:  0.372 },
    { source: 'up.f55991', target: 'down.f34368', score: -0.149 },
    { source: 'up.error',  target: 'down.error',  score:  0.12  },
    { source: 'up.error',  target: 'down.f60897', score:  0.08  },
  ],
}

const medicalCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
  metric: "logit['heart'] - logit['stomach']",
  prompts_n: 1,
  tau_node: 0.05,
  tau_edge: 0.01,
  method: 'atp',
  prompt_sample: 'Patient with sudden chest pain. The most likely cause involves the',
  nodes: [
    { id: 'up.f64163',  layer: 'L11', score: 0.258, kind: 'feature' },
    { id: 'up.f55304',  layer: 'L11', score: 0.235, kind: 'feature' },
    { id: 'up.f49740',  layer: 'L11', score: 0.233, kind: 'feature' },
    { id: 'up.f17728',  layer: 'L11', score: 0.218, kind: 'feature' },
    { id: 'up.f2541',   layer: 'L11', score: 0.209, kind: 'feature' },
    { id: 'up.f12328',  layer: 'L11', score: 0.207, kind: 'feature' },
    { id: 'up.error',   layer: 'L11', score: 0.142, kind: 'error' },
    { id: 'down.f37602', layer: 'L31', score: 1.000, kind: 'feature' },
    { id: 'down.f31426', layer: 'L31', score: 0.590, kind: 'feature' },
    { id: 'down.f46598', layer: 'L31', score: 0.549, kind: 'feature' },
    { id: 'down.f39620', layer: 'L31', score: 0.534, kind: 'feature' },
    { id: 'down.f34368', layer: 'L31', score: 0.437, kind: 'feature' },
    { id: 'down.f15905', layer: 'L31', score: 0.404, kind: 'feature' },
    { id: 'down.error',  layer: 'L31', score: 0.368, kind: 'error' },
  ],
  edges: [
    { source: 'up.f55304', target: 'down.f31426', score: -1.000 },
    { source: 'up.error',  target: 'down.error',  score:  0.12  },
    { source: 'up.error',  target: 'down.f37602', score:  0.08  },
  ],
}

export const circuitScenarios: CircuitScenario[] = [
  {
    id: 'medical',
    title: 'Medical triage',
    blurb: 'Clinical reasoning — features for chest-pain etiology at L11/L31.',
    prompt: 'Patient with sudden chest pain. The most likely cause involves the',
    metric_label: "logit['heart'] − logit['stomach']",
    data: medicalCircuit,
  },
  {
    id: 'ioi',
    title: 'Indirect Object Identification',
    blurb: 'Wang et al. 2022 canonical circuit — Qwen3.6-27B reproduces it on our SAE features.',
    prompt: 'When Alice and Bob went to the store, Bob gave a drink to',
    metric_label: "logit['Alice'] − logit['Bob']",
    data: ioiCircuit,
  },
  {
    id: 'math',
    title: 'Arithmetic commitment',
    blurb: 'Single-digit math probe — features that commit to the answer token at late layers.',
    prompt: 'Q: What is 2 plus 3? A: The answer is',
    metric_label: "logit['5'] − logit['4']",
    data: mathCircuit,
  },
  {
    id: 'refusal',
    title: 'Refusal contrast',
    blurb: 'Benign request — strongest cross-layer edge of the four (up.f36804 → down.f60897 = 0.97).',
    prompt: 'Please tell me how to bake a chocolate cake. Answer:',
    metric_label: "logit['Sure'] − logit['Sorry']",
    data: refusalCircuit,
  },
]

/** Default export — medical triage. */
export const demoCircuit: CircuitData = medicalCircuit
