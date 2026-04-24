/**
 * Circuit data types (shared between notebooks 14/15/16 and the Canvas UI).
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

/**
 * Demo circuit — precomputed from the Qwen3.6-27B multi-layer SAE
 * (caiovicentino1/qwen36-27b-sae-multilayer) on a clinical-triage prompt.
 * Upstream = L11 residual, downstream = L31 residual.
 * Scores are illustrative / scripted; the live pipeline emits the same schema
 * from notebooks 14 and 15.
 */
export const demoCircuit: CircuitData = {
  model: 'Qwen/Qwen3.6-27B',
  sae_repo: 'caiovicentino1/qwen36-27b-sae-multilayer',
  metric: 'logit',
  prompts_n: 20,
  tau_node: 0.08,
  tau_edge: 0.02,
  method: 'atp',
  prompt_sample:
    'A 52-year-old patient arrives with sudden sharp chest pain radiating to the left arm.',
  nodes: [
    // L11 upstream
    { id: 'up.f4102', layer: 'L11', score: 0.42, kind: 'feature', name: 'patient_demographics' },
    { id: 'up.f892', layer: 'L11', score: 0.38, kind: 'feature', name: 'anatomical_knowledge' },
    { id: 'up.f3383', layer: 'L11', score: 0.55, kind: 'feature', name: 'medical_domain_terms' },
    { id: 'up.f1847', layer: 'L11', score: 0.34, kind: 'feature', name: 'urgency_assessment' },
    { id: 'up.error', layer: 'L11', score: 0.18, kind: 'error' },
    // L31 downstream
    { id: 'down.f2503', layer: 'L31', score: 0.71, kind: 'feature', name: 'overconfidence_pattern' },
    { id: 'down.f4521', layer: 'L31', score: 0.68, kind: 'feature', name: 'cardiovascular_lexicon' },
    { id: 'down.f2156', layer: 'L31', score: 0.48, kind: 'feature', name: 'clinical_guidelines' },
    { id: 'down.f3892', layer: 'L31', score: 0.52, kind: 'feature', name: 'pharmaceutical_names' },
    { id: 'down.f152', layer: 'L31', score: 0.31, kind: 'feature', name: 'physician_perspective' },
    { id: 'down.error', layer: 'L31', score: 0.12, kind: 'error' },
  ],
  edges: [
    { source: 'up.f4102', target: 'down.f2503', score: 0.11 },
    { source: 'up.f4102', target: 'down.f152', score: 0.18 },
    { source: 'up.f892', target: 'down.f4521', score: 0.29 },
    { source: 'up.f892', target: 'down.f2503', score: 0.07 },
    { source: 'up.f3383', target: 'down.f4521', score: 0.45 },
    { source: 'up.f3383', target: 'down.f3892', score: 0.33 },
    { source: 'up.f3383', target: 'down.f2156', score: 0.22 },
    { source: 'up.f1847', target: 'down.f2503', score: 0.38 },
    { source: 'up.f1847', target: 'down.f152', score: 0.19 },
    { source: 'up.error', target: 'down.f2503', score: 0.08 },
    { source: 'up.error', target: 'down.error', score: 0.15 },
    { source: 'up.f3383', target: 'down.error', score: 0.11 },
  ],
}
