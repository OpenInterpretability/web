/**
 * ProbeBench v0.0.2 — type definitions
 *
 * Categorical standardization layer for activation probes in open-weights LLMs.
 * Single source of truth for all /probebench/* routes + the openinterp.probebench
 * SDK module.
 *
 * v0.0.2 adds the 8th axis: `goodhart_resistance` — measures whether a probe
 * survives being used as training reward in a DPO/GRPO loop. See the nb37 v2 +
 * nb41 v2 finding (2026-04-30): probes used in multi-probe DPO can show zero
 * effect on the trained model while a fresh probe still detects ~+5pp drift.
 */

// -----------------------------------------------------------------------------
// Top-level entities
// -----------------------------------------------------------------------------

export type ProbeCategory =
  | 'hallucination'        // FabricationGuard, RAG-aware probes
  | 'reasoning'            // ReasonGuard, Hypocrisy Gap, faithfulness
  | 'deception'            // Apollo deception probes, sleeper detection
  | 'sandbagging'          // capability hiding
  | 'eval_awareness'       // model-knows-it-is-being-tested
  | 'reward_hacking'       // RL-induced misalignment generalization
  | 'manipulation'         // EU AI Act Art 5 — persuasion
  | 'refusal'              // Arditi refusal direction work

export type ProbeType = 'linear' | 'mlp' | 'sae_feature' | 'sae_combination' | 'tree' | 'ensemble'

export type License = 'Apache-2.0' | 'MIT' | 'BSD-3-Clause' | 'CC-BY-4.0' | 'custom' | 'closed'

export type ProbePosition =
  | 'last_token'
  | 'end_question'
  | 'mid_think'
  | 'end_think'
  | 'end_answer'
  | 'token_avg'
  | 'attention_weighted'

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

export interface ModelEntry {
  id: string                       // "Qwen/Qwen3.6-27B"
  shortName: string                // "Qwen3.6-27B"
  family: 'Qwen' | 'Llama' | 'Gemma' | 'Mistral' | 'DeepSeek' | 'Phi' | 'GPT-OSS'
  paramCount: string               // "27B"
  architecture: string             // "Hybrid GDN" / "Dense" / "MoE+GDN"
  layers: number
  dModel: number
  release: string                  // "2026-04"
  weightsLicense: License
  hfUrl: string
  thinkingMode: boolean
}

// -----------------------------------------------------------------------------
// Tasks (each probe is evaluated on a subset)
// -----------------------------------------------------------------------------

export interface TaskEntry {
  id: string                       // "haluval-qa"
  name: string                     // "HaluEval-QA"
  category: ProbeCategory
  description: string
  paper?: string                   // arxiv ID or URL
  datasetUrl?: string              // HF dataset URL
  testSetSize: number
  /** sha256 of the held-out test set — anti-contamination */
  testSetHash: string
  /** what counts as positive class */
  positiveLabel: string
}

// -----------------------------------------------------------------------------
// Probes (the leaderboard entries)
// -----------------------------------------------------------------------------

export interface ProbeEntry {
  id: string                       // "openinterp/fabricationguard-qwen36-27b-l31-v2"
  name: string                     // "FabricationGuard v2"
  shortName: string
  author: string                   // "Caio Vicentino" / "Apollo Research" / etc.
  authorUrl?: string
  org: string                      // "OpenInterp" / "Apollo" / etc.
  category: ProbeCategory
  probeType: ProbeType
  modelId: string                  // links to ModelEntry.id
  layer: number
  position: ProbePosition

  paper?: string                   // arxiv ID or transformer-circuits URL
  paperTitle?: string
  artifactUrl: string              // HF dataset URL
  artifactSha256: string           // verification hash
  reproducerNotebook: string       // GitHub notebook URL
  colabUrl: string                 // 1-click Colab
  license: License
  release: string                  // "2026-04-27"
  paramCount: number               // total trainable params (1.2 MB = 312k * 4 bytes)
  sizeMB: number                   // artifact size

  /** brief tagline for cards */
  tagline: string
  /** longer description */
  description: string

  /** trust signals */
  citations?: number
  endorsements?: string[]          // ["Apollo Research", "UK AISI"] — placeholder
  status: 'live' | 'pending_review' | 'deprecated'
}

// -----------------------------------------------------------------------------
// Evaluations (per-probe per-task results)
// -----------------------------------------------------------------------------

export interface EvalMetrics {
  auroc: number                    // headline AUROC
  auroc_lo?: number                // 95% bootstrap CI low
  auroc_hi?: number                // 95% bootstrap CI high
  /** AUROC corrected for evaluation-awareness confound (arxiv 2509.13333) */
  auroc_evalaware_corrected?: number
  /** AUROC under long-context distribution shift (DeepMind 2601.11516) */
  auroc_distshift?: number
  /** Expected calibration error (lower is better) */
  ece: number
  /** Brier score */
  brier?: number
  /** False positive rate at 99% TPR */
  fpr_at_99tpr: number
  /** scoring latency in milliseconds */
  latency_ms: number
  /** number of test examples */
  n_test: number
  /**
   * Goodhart-resistance score (v0.0.2 axis) ∈ [0,1].
   *
   * Measures whether the probe survives being used as training reward in a
   * DPO/GRPO loop. Defined as: post-train_AUROC / pre-train_AUROC, where
   * post-train uses a model that was finetuned with this probe in its reward.
   *
   * 1.0 = probe still calibrated post-finetune (Goodhart-resistant)
   * 0.5 = probe partially drifted
   * 0.0 = probe completely useless post-finetune (full Goodhart escape)
   *
   * Probes that have not been tested in this dimension report `null` and
   * default to 0.5 (unknown) in the composite ProbeScore.
   */
  goodhart_resistance?: number | null
  /** Fresh-probe AUROC trajectory ratio (max/avg delta) — ≥2.0 = phase transition */
  fresh_probe_phase_ratio?: number | null
}

export interface EvalEntry {
  probeId: string                  // links to ProbeEntry.id
  taskId: string                   // links to TaskEntry.id
  metrics: EvalMetrics
  evaluatedAt: string              // ISO 8601
  /** sha256 of the version of the test set used */
  testSetHash: string
  /** notebook reproducing this number */
  reproducer?: string
}

// -----------------------------------------------------------------------------
// Cross-model transfer (Pearson_CE methodology)
// -----------------------------------------------------------------------------

export interface CrossModelTransfer {
  probeId: string                  // source probe
  sourceModel: string
  targetModel: string
  /** Pearson correlation of paired ablation effects (Pearson_CE) */
  pearson_ce: number
  /** AUROC on target model's task using transferred probe */
  transfer_auroc?: number
  notes?: string
}

// -----------------------------------------------------------------------------
// Composite ProbeScore
// -----------------------------------------------------------------------------

export interface ProbeScoreBreakdown {
  probeId: string
  /** Final composite ∈ [0, 1] */
  total: number
  /** Components, weighted (v0.0.2 — 8 axes) */
  components: {
    auroc: { value: number; weight: number; contribution: number }
    auroc_evalaware: { value: number; weight: number; contribution: number }
    distshift_robustness: { value: number; weight: number; contribution: number }
    ece_calibration: { value: number; weight: number; contribution: number }
    cross_model_transfer: { value: number; weight: number; contribution: number }
    inference_efficiency: { value: number; weight: number; contribution: number }
    license_score: { value: number; weight: number; contribution: number }
    /** v0.0.2: probe's Goodhart-resistance under DPO/GRPO training loops */
    goodhart_resistance: { value: number; weight: number; contribution: number }
  }
  /** rank in its category */
  rank: number
  /** rank in the global leaderboard */
  globalRank: number
}

// -----------------------------------------------------------------------------
// Aggregate views (computed)
// -----------------------------------------------------------------------------

export interface ProbeWithScore extends ProbeEntry {
  score: ProbeScoreBreakdown
  bestEval: EvalEntry              // their best (highest-AUROC) task
  evalsByTask: Record<string, EvalEntry>
}

export interface CategoryLeaderboard {
  category: ProbeCategory
  description: string
  taskIds: string[]
  probes: ProbeWithScore[]         // sorted by score.total
}

// -----------------------------------------------------------------------------
// Submission spec (for /submit page + SDK validator)
// -----------------------------------------------------------------------------

export interface ProbeArtifactSpec {
  /** scikit-learn-compatible classifier with predict_proba(X) -> (n, 2) */
  probe: 'sklearn-compatible'
  /** sklearn StandardScaler-compatible */
  scaler: 'sklearn-compatible'
  /** required metadata fields */
  meta: {
    probe_type: ProbeType
    model: string
    layer: number
    position: ProbePosition
    training_data: string          // human-readable: "TruthfulQA + HaluEval + ..."
    license: License
    paper?: string
    author: string
    contact?: string
    /** ISO 8601 */
    created_at: string
    /** spec version this artifact targets */
    spec_version: '0.0.1' | '0.0.2'
  }
}
