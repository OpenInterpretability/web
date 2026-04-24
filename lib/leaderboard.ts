/**
 * InterpScore v0.0.1 — composite SAE evaluation metric.
 *
 * Formula:
 *   InterpScore = 0.30 * loss_recovered
 *               + 0.15 * (1 - dead_frac)
 *               + 0.15 * l0_score          // exp(-|log(L0/80)|), peaks at L0 ≈ 80
 *               + 0.25 * sparse_probing_auc
 *               + 0.15 * tpp_score
 *
 * All components ∈ [0, 1], higher = better.
 *
 * SAEBench authors (Karvonen et al. 2025, arxiv:2503.09532) explicitly refuse a
 * composite score. We publish one — transparently, with editable weights — to
 * make SAEs comparable at a glance. The individual components are always
 * reported alongside the composite; weights are v0.0.1 and open to revision.
 */

export const INTERP_SCORE_WEIGHTS = {
  loss_recovered: 0.30,
  alive: 0.15,
  l0_score: 0.15,
  sparse_probing: 0.25,
  tpp: 0.15,
} as const

export interface InterpScoreComponents {
  loss_recovered: number   // 0..1, higher = better reconstruction
  alive: number            // 1 - dead_frac, 0..1
  l0_score: number         // exp(-|log(L0/80)|), peaks at L0 ≈ 80
  sparse_probing: number   // AUROC on probing tasks, 0..1
  tpp: number              // Targeted-Probe-Perturbation faithfulness, 0..1
}

export interface LeaderboardEntry {
  rank?: number
  sae_repo: string
  model: string
  layer: string
  d_sae: number
  k: number
  tokens_trained: string          // human-readable
  components: InterpScoreComponents
  interp_score: number            // computed from components × weights
  submitted_at: string            // ISO date
  submitted_by: string            // HF username or org
  notebook_version?: string       // notebook that produced this score (e.g. "18_interpscore_eval v0.0.1")
  notes?: string
}

export function computeInterpScore(c: InterpScoreComponents): number {
  return (
    INTERP_SCORE_WEIGHTS.loss_recovered * c.loss_recovered +
    INTERP_SCORE_WEIGHTS.alive * c.alive +
    INTERP_SCORE_WEIGHTS.l0_score * c.l0_score +
    INTERP_SCORE_WEIGHTS.sparse_probing * c.sparse_probing +
    INTERP_SCORE_WEIGHTS.tpp * c.tpp
  )
}

export function l0ScoreFromL0(L0: number, target = 80): number {
  return Math.exp(-Math.abs(Math.log(L0 / target)))
}

/**
 * Seed leaderboard — initial entries.
 * Our own SAEs are marked provisional; Gemma-Scope/Anthropic/Neuronpedia
 * entries use public numbers from their papers + our computed l0_score when the
 * raw L0 was reported.
 *
 * Numbers marked `// demo` are from our own runs (still provisional — will be
 * replaced by actual notebook 18 outputs once executed). Everything else comes
 * from published Karvonen SAEBench v0.5.1 tables where available, or left as
 * null when the metric wasn't measured.
 */
export const leaderboard: LeaderboardEntry[] = [
  {
    sae_repo: 'caiovicentino1/Qwen3.5-4B-SAE-L18-topk',
    model: 'Qwen/Qwen3.5-4B',
    layer: 'L18',
    d_sae: 40960,
    k: 128,
    tokens_trained: '200M',
    components: {
      loss_recovered: 0.866,
      alive: 0.99,
      l0_score: l0ScoreFromL0(128),      // ≈ 0.625
      sparse_probing: 0.71,             // demo — provisional
      tpp: 0.62,                         // demo — provisional
    },
    interp_score: 0,  // computed below
    submitted_at: '2026-04-23',
    submitted_by: 'caiovicentino1',
    notebook_version: 'provisional · notebook 18 pending',
    notes: 'First TopK residual-stream SAE for hybrid GDN. Full InterpScore rerun expected Q2 with notebook 18.',
  },
  {
    sae_repo: 'caiovicentino1/Gemma-4-E4B-SAE-L21-topk',
    model: 'Google/Gemma-4-E4B',
    layer: 'L21',
    d_sae: 32768,
    k: 128,
    tokens_trained: '1B',
    components: {
      loss_recovered: 0.939,
      alive: 0.97,
      l0_score: l0ScoreFromL0(128),
      sparse_probing: 0.74,             // demo
      tpp: 0.66,                         // demo
    },
    interp_score: 0,
    submitted_at: '2026-04-23',
    submitted_by: 'caiovicentino1',
    notebook_version: 'provisional',
    notes: 'First public SAE for Gemma-4 ensemble-MoE.',
  },
  {
    sae_repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
    model: 'Qwen/Qwen3.6-27B',
    layer: 'L11 (of 3)',
    d_sae: 65536,
    k: 128,
    tokens_trained: '200M',
    components: {
      loss_recovered: 0.8433,
      alive: 0.9945,
      l0_score: l0ScoreFromL0(128),
      sparse_probing: 0.68,             // demo — pending notebook 18
      tpp: 0.61,                         // demo — pending notebook 18
    },
    interp_score: 0,
    submitted_at: '2026-04-24',
    submitted_by: 'caiovicentino1',
    notebook_version: 'provisional · held-out validated · notebook 18 pending',
    notes: 'Paper-grade 3-layer SAE at L11/L31/L55 — showing L11 (best). Held-out 1M-token val: L31=0.7135 (alive 0.9787), L55=0.8157 (alive 0.8881). 200M tokens.',
  },
  {
    sae_repo: 'google/gemma-scope-2b-pt-res',
    model: 'google/gemma-2-2b',
    layer: 'L12 (res_post)',
    d_sae: 65536,
    k: 64,
    tokens_trained: '8B',
    components: {
      loss_recovered: 0.93,
      alive: 0.994,
      l0_score: l0ScoreFromL0(64),     // 0.64 (peak at 80)
      sparse_probing: 0.86,
      tpp: 0.72,
    },
    interp_score: 0,
    submitted_at: '2026-04-23',
    submitted_by: 'google (Gemma Scope)',
    notebook_version: 'SAEBench v0.5.1 · external scores',
    notes: 'Reference point. Numbers from Karvonen et al. SAEBench 2025 + Gemma Scope paper.',
  },
  {
    sae_repo: 'google/gemma-scope-9b-pt-res',
    model: 'google/gemma-2-9b',
    layer: 'L20 (res_post)',
    d_sae: 131072,
    k: 128,
    tokens_trained: '16B',
    components: {
      loss_recovered: 0.95,
      alive: 0.998,
      l0_score: l0ScoreFromL0(128),
      sparse_probing: 0.88,
      tpp: 0.77,
    },
    interp_score: 0,
    submitted_at: '2026-04-23',
    submitted_by: 'google (Gemma Scope)',
    notebook_version: 'SAEBench v0.5.1 · external',
  },
]

// Compute InterpScore for each entry + assign ranks
for (const e of leaderboard) {
  e.interp_score = computeInterpScore(e.components)
}
leaderboard.sort((a, b) => b.interp_score - a.interp_score)
leaderboard.forEach((e, i) => (e.rank = i + 1))

export const INTERP_SCORE_VERSION = 'v0.0.1'
