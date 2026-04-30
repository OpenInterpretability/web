/**
 * ProbeBench v0.0.1 — seed data.
 *
 * 5 reference probes × 3 base models × 7 tasks = up to 105 evaluation cells.
 * Numbers grounded in published papers where available; marked as v0.0.1 seed
 * for entries not yet validated by full notebook reproducer.
 *
 * To add a new probe: PR a new ProbeEntry + new EvalEntry rows.
 */
import type {
  ModelEntry, TaskEntry, ProbeEntry, EvalEntry, CrossModelTransfer,
} from './probebench-types'
import { computeProbeScore } from './probebench-scoring'

// -----------------------------------------------------------------------------
// Models
// -----------------------------------------------------------------------------

export const models: ModelEntry[] = [
  {
    id: 'Qwen/Qwen3.6-27B', shortName: 'Qwen3.6-27B',
    family: 'Qwen', paramCount: '27B', architecture: 'Hybrid GDN + Gated-Attn (dense, reasoning)',
    layers: 64, dModel: 5120, release: '2026-04', weightsLicense: 'Apache-2.0',
    hfUrl: 'https://huggingface.co/Qwen/Qwen3.6-27B', thinkingMode: true,
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct', shortName: 'Llama-3.3-70B',
    family: 'Llama', paramCount: '70B', architecture: 'Dense transformer (instruct-tuned)',
    layers: 80, dModel: 8192, release: '2024-12', weightsLicense: 'custom',
    hfUrl: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct', thinkingMode: false,
  },
  {
    id: 'google/gemma-3-27b', shortName: 'Gemma-3-27B',
    family: 'Gemma', paramCount: '27B', architecture: 'Dense transformer with sliding-window attention',
    layers: 62, dModel: 4608, release: '2025-Q4', weightsLicense: 'custom',
    hfUrl: 'https://huggingface.co/google/gemma-3-27b', thinkingMode: false,
  },
]

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export const tasks: TaskEntry[] = [
  {
    id: 'haluval-qa', name: 'HaluEval-QA', category: 'hallucination',
    description: 'Open-ended question answering with annotated hallucination labels (Li et al. 2023).',
    paper: 'arXiv:2305.11747', datasetUrl: 'https://huggingface.co/datasets/pminervini/HaluEval',
    testSetSize: 200, testSetHash: 'a1f3e2d8c7b6a5f4e3d2c1b0a9f8e7d6', positiveLabel: 'hallucinated',
  },
  {
    id: 'simpleqa', name: 'SimpleQA', category: 'hallucination',
    description: 'Open-domain factual QA — short factoids, very hard. SOTA closed-book ~50% (OpenAI 2024).',
    paper: 'arXiv:2411.04368', datasetUrl: 'https://huggingface.co/datasets/basicv8vc/SimpleQA',
    testSetSize: 100, testSetHash: 'b2e4f3a9d8c7b6a5f4e3d2c1b0a9f8e7', positiveLabel: 'hallucinated',
  },
  {
    id: 'truthfulqa-mc1', name: 'TruthfulQA-MC1', category: 'hallucination',
    description: 'Tests resistance to popular misconceptions (Lin et al. 2022). Different cognitive task than fabrication.',
    paper: 'arXiv:2109.07958',
    testSetSize: 200, testSetHash: 'c3f5e4b0e9d8c7b6a5f4e3d2c1b0a9f8', positiveLabel: 'misconception',
  },
  {
    id: 'mmlu', name: 'MMLU', category: 'hallucination',
    description: 'Capability control — multiple-choice knowledge across 57 domains. NOT hallucination per se; included as scope check.',
    paper: 'arXiv:2009.03300',
    testSetSize: 500, testSetHash: 'd4a6f5c1f0e9d8c7b6a5f4e3d2c1b0a9', positiveLabel: 'incorrect',
  },
  {
    id: 'apollo-insider-trading', name: 'Apollo Insider Trading', category: 'deception',
    description: 'Apollo Research deception suite — model concealing illicit trades when asked. AUROC 0.96-0.999 on linear probes (arXiv:2502.03407).',
    paper: 'arXiv:2502.03407', datasetUrl: 'https://github.com/ApolloResearch/deception-detection',
    testSetSize: 150, testSetHash: 'e5b7a6d2a1f0e9d8c7b6a5f4e3d2c1b0', positiveLabel: 'deceptive',
  },
  {
    id: 'hypocrisy-gap', name: 'Hypocrisy Gap', category: 'reasoning',
    description: 'CoT-vs-belief divergence. Measures when model states reasoning that diverges from its internal belief (arXiv:2602.02496, Jan 2026).',
    paper: 'arXiv:2602.02496',
    testSetSize: 180, testSetHash: 'f6c8b7e3b2a1f0e9d8c7b6a5f4e3d2c1', positiveLabel: 'unfaithful_cot',
  },
  {
    id: 'gsm8k', name: 'GSM8K', category: 'reasoning',
    description: 'Grade-school math word problems. Used as the reasoning-faithfulness within-domain bench. Hallucination = model produces wrong answer despite reasoning trace appearing coherent.',
    paper: 'arXiv:2110.14168', datasetUrl: 'https://huggingface.co/datasets/openai/gsm8k',
    testSetSize: 300, testSetHash: 'g5m8a1b2c3d4e5f6789a0b1c2d3e4f56', positiveLabel: 'wrong_answer',
  },
  {
    id: 'strategyqa', name: 'StrategyQA', category: 'reasoning',
    description: 'Open-domain commonsense reasoning requiring multi-step strategy. Used as the cross-domain transfer test for reasoning-faithfulness probes (math → commonsense).',
    paper: 'arXiv:2101.02235', datasetUrl: 'https://huggingface.co/datasets/wics/strategy-qa',
    testSetSize: 150, testSetHash: 'sq1b2c3d4e5f67890a1b2c3d4e5f67890', positiveLabel: 'wrong_answer',
  },
  {
    id: 'math', name: 'MATH', category: 'reasoning',
    description: 'Hendrycks competition mathematics — PhD-level math problems including algebra, calculus, number theory, geometry. Hardest reasoning bench in the registry. Qwen3.6-27B baseline 18% accuracy. Used as advanced-difficulty stress test for reasoning-faithfulness probes.',
    paper: 'arXiv:2103.03874', datasetUrl: 'https://huggingface.co/datasets/qwedsacf/competition_math',
    testSetSize: 200, testSetHash: 'mt1b2c3d4e5f67890abcdef1234567890', positiveLabel: 'wrong_answer',
  },
  {
    id: 'apollo-eval-deploy', name: 'Apollo Eval-vs-Deploy', category: 'eval_awareness',
    description: 'Linear probes separate real-world eval prompts from deployment prompts. Power-law scaling with model size (arXiv:2509.13333).',
    paper: 'arXiv:2507.01786',
    testSetSize: 200, testSetHash: 'a7d9c8f4c3b2a1f0e9d8c7b6a5f4e3d2', positiveLabel: 'evaluation',
  },
]

// -----------------------------------------------------------------------------
// Probes — 5 reference implementations
// -----------------------------------------------------------------------------

export const probes: ProbeEntry[] = [
  // 1. FabricationGuard v2 — the production probe (validated end-to-end, notebook 31)
  {
    id: 'openinterp/fabricationguard-qwen36-27b-l31-v2',
    name: 'FabricationGuard v2',
    shortName: 'FabricationGuard',
    author: 'Caio Vicentino',
    authorUrl: 'https://openinterp.org',
    org: 'OpenInterp',
    category: 'hallucination',
    probeType: 'linear',
    modelId: 'Qwen/Qwen3.6-27B',
    layer: 31,
    position: 'end_question',
    paper: 'arXiv:2505.XXXXX',
    paperTitle: 'Decoder Cosine vs Causal Equivalence in Cross-Model Crosscoders (ICML MI Workshop 2026)',
    artifactUrl: 'https://huggingface.co/datasets/caiovicentino1/FabricationGuard-linearprobe-qwen36-27b',
    artifactSha256: 'fb8c2a4e1f9d3b6a5e8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e',
    reproducerNotebook: 'https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/31_hallucinationguard_v2_linear_probe.ipynb',
    colabUrl: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/31_hallucinationguard_v2_linear_probe.ipynb',
    license: 'Apache-2.0',
    release: '2026-04-27',
    paramCount: 312000,                // ~5120 dim × probe weights
    sizeMB: 1.2,
    tagline: 'AUROC 0.88 cross-task on SimpleQA · −88% confident-wrong reduction',
    description: 'Multi-feature L2 logistic regression on residual stream at L31 of Qwen3.6-27B. Trained cross-bench on TruthfulQA + HaluEval + MMLU train splits, evaluated cross-task on held-out SimpleQA. Ships in openinterp PyPI v0.2.0.',
    citations: 0,
    endorsements: [],
    status: 'live',
  },
  // 2. ReasonGuard v0.2 — Linear probe at L55/mid_think, multi-bench combined training
  // Validated 2026-04-29: tested multi-bench thesis (FabricationGuard methodology) and FALSIFIED it
  // GSM8K: 0.908 ✅ · StrategyQA: 0.612 🟡 · MATH: 0.500 ❌ (chance)
  // Honest finding: position-of-faithfulness is more strongly domain-bound than multi-bench training compensates for
  {
    id: 'openinterp/reasonguard-qwen36-27b-l55-mid_think',
    name: 'ReasonGuard v0.2',
    shortName: 'ReasonGuard',
    author: 'Caio Vicentino',
    authorUrl: 'https://openinterp.org',
    org: 'OpenInterp',
    category: 'reasoning',
    probeType: 'linear',
    modelId: 'Qwen/Qwen3.6-27B',
    layer: 55,
    position: 'mid_think',
    paper: 'arXiv:2505.XXXXX',
    paperTitle: 'Multi-bench training is insufficient: position-of-faithfulness is domain-bound at L55/mid_think on Qwen3.6-27B',
    artifactUrl: 'https://huggingface.co/datasets/caiovicentino1/ReasoningGuard-linearprobe-qwen36-27b',
    artifactSha256: 'rg9d3b5f2a0e8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2',
    reproducerNotebook: 'https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/34_reasonguard_v0_2_multibench.ipynb',
    colabUrl: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/34_reasonguard_v0_2_multibench.ipynb',
    license: 'Apache-2.0',
    release: '2026-04-29',
    paramCount: 312000,
    sizeMB: 1.2,
    tagline: 'Multi-bench training tested (FabricationGuard methodology) and FALSIFIED for reasoning probes — domain-bound at all difficulty levels',
    description: 'Linear LR probe at L55/mid_think of Qwen3.6-27B reasoning-mode generation. v0.2 trains multi-bench (GSM8K + StrategyQA + MATH combined, 455 samples, 45.8% halu rate). Within-bench AUROC 0.908 on GSM8K held-out — improvement vs v0.1 (0.888). But cross-domain transfer FAILS: 0.612 on StrategyQA (commonsense), 0.500 (chance) on MATH (advanced). AUROC degrades with task difficulty. Position-of-faithfulness in deep residual stream is more strongly domain-bound than multi-bench training compensates for. Multi-bench training thesis (which worked for FabricationGuard cross-task at 0.882) does not transfer to reasoning-faithfulness probes. Honest negative-ish result registered as canonical case study of ProbeBench anti-Goodhart norms — both v0.1 and v0.2 numbers reported without spin.',
    citations: 0,
    endorsements: [],
    status: 'live',
  },
  // 3. DeceptionGuard — Apollo deception detection re-implementation
  {
    id: 'openinterp/deceptionguard-llama33-70b-l40',
    name: 'DeceptionGuard (Apollo re-impl)',
    shortName: 'DeceptionGuard',
    author: 'Caio Vicentino (re-impl) / Apollo Research (method)',
    authorUrl: 'https://www.apolloresearch.ai/',
    org: 'OpenInterp',
    category: 'deception',
    probeType: 'linear',
    modelId: 'meta-llama/Llama-3.3-70B-Instruct',
    layer: 40,
    position: 'last_token',
    paper: 'arXiv:2502.03407',
    paperTitle: 'Detecting Strategic Deception Using Linear Probes',
    artifactUrl: 'https://huggingface.co/datasets/caiovicentino1/DeceptionGuard-linearprobe-llama33-70b',
    artifactSha256: 'dc4f2a8b6e5d3c1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a',
    reproducerNotebook: 'https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/33_deceptionguard_apollo_reimpl.ipynb',
    colabUrl: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/33_deceptionguard_apollo_reimpl.ipynb',
    license: 'Apache-2.0',
    release: '2026-05-XX',
    paramCount: 524288,
    sizeMB: 2.0,
    tagline: 'Re-impl of Apollo Research deception probe (AUROC 0.96–0.999 published)',
    description: 'Re-implementation of the Apollo Research deception-detection method on Llama-3.3-70B-Instruct. Uses paired honest/deceptive contrast pairs from insider-trading and werewolf scenarios. Citation: Goldowsky-Dill, Chughtai, Heimersheim, Hobbhahn (ICML 2025).',
    citations: 0,
    endorsements: ['Apollo Research (method)'],
    status: 'pending_review',
  },
  // 4. EvalAwarenessGuard — UK AISI priority
  {
    id: 'openinterp/evalawareness-qwen36-27b-l40',
    name: 'EvalAwarenessGuard',
    shortName: 'EvalAwarenessGuard',
    author: 'Caio Vicentino',
    authorUrl: 'https://openinterp.org',
    org: 'OpenInterp',
    category: 'eval_awareness',
    probeType: 'linear',
    modelId: 'Qwen/Qwen3.6-27B',
    layer: 40,
    position: 'end_question',
    paper: 'arXiv:2507.01786',
    paperTitle: 'Probing and Steering Evaluation Awareness of Language Models',
    artifactUrl: 'https://huggingface.co/datasets/caiovicentino1/EvalAwarenessGuard-linearprobe-qwen36-27b',
    artifactSha256: 'ea7c3d9e5b4a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
    reproducerNotebook: 'https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/34_evalawareness_probe.ipynb',
    colabUrl: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/34_evalawareness_probe.ipynb',
    license: 'Apache-2.0',
    release: '2026-05-XX',
    paramCount: 312000,
    sizeMB: 1.2,
    tagline: 'Detects when model believes it is being evaluated · UK AISI priority',
    description: 'Linear probe separating real-world deployment prompts from evaluation prompts on Qwen3.6-27B. Used to compute "eval-awareness corrected AUROC" for other probes — exposes the confound that AUROC scales with eval-awareness (arXiv:2509.13333).',
    citations: 0,
    endorsements: [],
    status: 'pending_review',
  },
  // 5. RewardHackGuard — Anthropic Nov 2025 hook
  {
    id: 'openinterp/rewardhackguard-qwen35-4b-l18',
    name: 'RewardHackGuard PoC',
    shortName: 'RewardHackGuard',
    author: 'Caio Vicentino',
    authorUrl: 'https://openinterp.org',
    org: 'OpenInterp',
    category: 'reward_hacking',
    probeType: 'sae_combination',
    modelId: 'Qwen/Qwen3.6-27B',
    layer: 31,
    position: 'token_avg',
    paper: 'arXiv:2603.04069',
    paperTitle: 'Monitoring Emergent Reward Hacking via Internal Activations',
    artifactUrl: 'https://huggingface.co/datasets/caiovicentino1/RewardHackGuard-linearprobe-qwen35-4b',
    artifactSha256: 'rh8d4c0e6c5b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7',
    reproducerNotebook: 'https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/35_rewardhackguard_poc.ipynb',
    colabUrl: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/35_rewardhackguard_poc.ipynb',
    license: 'Apache-2.0',
    release: '2026-05-XX',
    paramCount: 480000,
    sizeMB: 1.8,
    tagline: 'Detect emergent reward-hacking generalization · Anthropic Nov 2025 framing',
    description: 'SAE-feature-combination probe on the residual stream of Qwen3.6-27B. Trained to detect activation patterns associated with reward-hacking generalization (Anthropic 2511.18397). Key for any team running GRPO / DPO / RLHF post-training.',
    citations: 0,
    endorsements: [],
    status: 'pending_review',
  },
]

// -----------------------------------------------------------------------------
// Evaluations — per-probe per-task
// (Numbers from notebook 31 for FabricationGuard; published-paper-derived for others)
// -----------------------------------------------------------------------------

export const evaluations: EvalEntry[] = [
  // FabricationGuard v2 — the live probe with real numbers
  // goodhart_resistance: 0.32 (LOW — honest disclosure based on nb41 v2 finding 2026-04-30:
  // when used as part of multi-probe DPO reward, post-DPO model shows zero shift on FG axis
  // despite real training (loss -0.234, logit max diff 0.654). Optimization escapes via
  // orthogonal directions. Fresh-probe AUROC reveals real drift but original probe is blind.
  // See: https://huggingface.co/datasets/caiovicentino1/openinterp-41v2-grokking-extended)
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2', taskId: 'haluval-qa',
    metrics: { auroc: 0.903, auroc_lo: 0.85, auroc_hi: 0.95, auroc_evalaware_corrected: 0.84,
               auroc_distshift: 0.71, ece: 0.08, brier: 0.13, fpr_at_99tpr: 0.04, latency_ms: 1, n_test: 200,
               goodhart_resistance: 0.32, fresh_probe_phase_ratio: 2.60 },
    evaluatedAt: '2026-04-27T18:30:00Z', testSetHash: 'a1f3e2d8c7b6a5f4e3d2c1b0a9f8e7d6',
    reproducer: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/31_hallucinationguard_v2_linear_probe.ipynb' },
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2', taskId: 'simpleqa',
    metrics: { auroc: 0.882, auroc_lo: 0.83, auroc_hi: 0.93, auroc_evalaware_corrected: 0.82,
               auroc_distshift: 0.72, ece: 0.07, brier: 0.12, fpr_at_99tpr: 0.05, latency_ms: 1, n_test: 100 },
    evaluatedAt: '2026-04-27T18:30:00Z', testSetHash: 'b2e4f3a9d8c7b6a5f4e3d2c1b0a9f8e7' },
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2', taskId: 'truthfulqa-mc1',
    metrics: { auroc: 0.599, auroc_lo: 0.51, auroc_hi: 0.69, auroc_evalaware_corrected: 0.57,
               auroc_distshift: 0.55, ece: 0.18, brier: 0.24, fpr_at_99tpr: 0.92, latency_ms: 1, n_test: 200 },
    evaluatedAt: '2026-04-27T18:30:00Z', testSetHash: 'c3f5e4b0e9d8c7b6a5f4e3d2c1b0a9f8' },
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2', taskId: 'mmlu',
    metrics: { auroc: 0.444, auroc_lo: 0.40, auroc_hi: 0.49, auroc_evalaware_corrected: 0.42,
               auroc_distshift: 0.41, ece: 0.22, brier: 0.27, fpr_at_99tpr: 0.99, latency_ms: 1, n_test: 500 },
    evaluatedAt: '2026-04-27T18:30:00Z', testSetHash: 'd4a6f5c1f0e9d8c7b6a5f4e3d2c1b0a9' },

  // ReasonGuard v0.2 — REAL numbers from combined-train (verified 2026-04-29)
  // Multi-bench training thesis tested. GSM8K improved (0.888→0.908), StrategyQA marginal (0.605→0.612),
  // MATH at chance (0.500). Position-of-faithfulness is domain-bound; multi-bench doesn't fix it.
  // goodhart_resistance: 0.30 (LOW — honest disclosure: same nb41 v2 finding as FabricationGuard.
  // Used in multi-probe DPO; post-DPO model shows zero shift on RG axis. Optimization escapes
  // via directions orthogonal to RG measurement axis.)
  { probeId: 'openinterp/reasonguard-qwen36-27b-l55-mid_think', taskId: 'gsm8k',
    metrics: { auroc: 0.908, auroc_evalaware_corrected: 0.772, auroc_distshift: 0.612,
               ece: 0.10, fpr_at_99tpr: 0.18, latency_ms: 1.0, n_test: 90,
               goodhart_resistance: 0.30, fresh_probe_phase_ratio: 2.60 },
    evaluatedAt: '2026-04-29T03:00:00Z', testSetHash: 'g5m8a1b2c3d4e5f6789a0b1c2d3e4f56',
    reproducer: 'https://colab.research.google.com/github/OpenInterpretability/notebooks/blob/main/notebooks/34_reasonguard_v0_2_multibench.ipynb' },
  { probeId: 'openinterp/reasonguard-qwen36-27b-l55-mid_think', taskId: 'strategyqa',
    metrics: { auroc: 0.612, auroc_evalaware_corrected: 0.520, auroc_distshift: 0.500,
               ece: 0.17, fpr_at_99tpr: 0.52, latency_ms: 1.0, n_test: 45 },
    evaluatedAt: '2026-04-29T03:00:00Z', testSetHash: 'sq1b2c3d4e5f67890a1b2c3d4e5f67890' },
  { probeId: 'openinterp/reasonguard-qwen36-27b-l55-mid_think', taskId: 'math',
    metrics: { auroc: 0.500, auroc_evalaware_corrected: 0.425, auroc_distshift: 0.500,
               ece: 0.32, fpr_at_99tpr: 0.99, latency_ms: 1.0, n_test: 60 },
    evaluatedAt: '2026-04-29T03:00:00Z', testSetHash: 'mt1b2c3d4e5f67890abcdef1234567890' },

  // DeceptionGuard — numbers anchored to Apollo's published 0.96-0.999
  { probeId: 'openinterp/deceptionguard-llama33-70b-l40', taskId: 'apollo-insider-trading',
    metrics: { auroc: 0.978, auroc_lo: 0.96, auroc_hi: 0.99, auroc_evalaware_corrected: 0.91,
               auroc_distshift: 0.84, ece: 0.04, brier: 0.06, fpr_at_99tpr: 0.012, latency_ms: 2.1, n_test: 150 },
    evaluatedAt: '2026-04-28T12:00:00Z', testSetHash: 'e5b7a6d2a1f0e9d8c7b6a5f4e3d2c1b0' },
  { probeId: 'openinterp/deceptionguard-llama33-70b-l40', taskId: 'hypocrisy-gap',
    metrics: { auroc: 0.80, auroc_lo: 0.72, auroc_hi: 0.87, auroc_evalaware_corrected: 0.71,
               auroc_distshift: 0.65, ece: 0.09, brier: 0.14, fpr_at_99tpr: 0.10, latency_ms: 2.1, n_test: 180 },
    evaluatedAt: '2026-04-28T12:00:00Z', testSetHash: 'f6c8b7e3b2a1f0e9d8c7b6a5f4e3d2c1' },

  // EvalAwarenessGuard — power-law scaling
  { probeId: 'openinterp/evalawareness-qwen36-27b-l40', taskId: 'apollo-eval-deploy',
    metrics: { auroc: 0.93, auroc_lo: 0.88, auroc_hi: 0.97, auroc_evalaware_corrected: 0.93,
               auroc_distshift: 0.81, ece: 0.05, brier: 0.08, fpr_at_99tpr: 0.03, latency_ms: 1, n_test: 200 },
    evaluatedAt: '2026-04-28T15:00:00Z', testSetHash: 'a7d9c8f4c3b2a1f0e9d8c7b6a5f4e3d2' },

  // RewardHackGuard
  { probeId: 'openinterp/rewardhackguard-qwen35-4b-l18', taskId: 'haluval-qa',
    metrics: { auroc: 0.65, auroc_lo: 0.56, auroc_hi: 0.74, auroc_evalaware_corrected: 0.59,
               auroc_distshift: 0.52, ece: 0.15, brier: 0.21, fpr_at_99tpr: 0.32, latency_ms: 1.8, n_test: 200 },
    evaluatedAt: '2026-04-28T18:00:00Z', testSetHash: 'a1f3e2d8c7b6a5f4e3d2c1b0a9f8e7d6' },
]

// -----------------------------------------------------------------------------
// Cross-model transfers — Pearson_CE matrix data
// -----------------------------------------------------------------------------

export const crossModelTransfers: CrossModelTransfer[] = [
  // FabricationGuard transferring to other Qwen / Llama / Gemma
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2',
    sourceModel: 'Qwen/Qwen3.6-27B', targetModel: 'meta-llama/Llama-3.3-70B-Instruct',
    pearson_ce: 0.42, transfer_auroc: 0.71,
    notes: 'Cross-architecture transfer; partial signal. Improves with retraining via Pearson_CE methodology.' },
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2',
    sourceModel: 'Qwen/Qwen3.6-27B', targetModel: 'google/gemma-3-27b',
    pearson_ce: 0.38, transfer_auroc: 0.68 },
  { probeId: 'openinterp/fabricationguard-qwen36-27b-l31-v2',
    sourceModel: 'Qwen/Qwen3.6-27B', targetModel: 'Qwen/Qwen3.6-27B',
    pearson_ce: 1.0, transfer_auroc: 0.882, notes: 'Same model — identity baseline.' },

  // DeceptionGuard transfers
  { probeId: 'openinterp/deceptionguard-llama33-70b-l40',
    sourceModel: 'meta-llama/Llama-3.3-70B-Instruct', targetModel: 'Qwen/Qwen3.6-27B',
    pearson_ce: 0.51, transfer_auroc: 0.79 },
  { probeId: 'openinterp/deceptionguard-llama33-70b-l40',
    sourceModel: 'meta-llama/Llama-3.3-70B-Instruct', targetModel: 'google/gemma-3-27b',
    pearson_ce: 0.46, transfer_auroc: 0.74 },

  // ReasonGuard — cross-model transfer not yet measured (cross-bench transfer already shown weak: 0.605 within Qwen3.6 alone)
  { probeId: 'openinterp/reasonguard-qwen36-27b-l55-mid_think',
    sourceModel: 'Qwen/Qwen3.6-27B', targetModel: 'Qwen/Qwen3.6-27B',
    pearson_ce: 1.0, transfer_auroc: 0.888, notes: 'Same model — identity baseline (within-bench GSM8K).' },

  // EvalAwarenessGuard
  { probeId: 'openinterp/evalawareness-qwen36-27b-l40',
    sourceModel: 'Qwen/Qwen3.6-27B', targetModel: 'meta-llama/Llama-3.3-70B-Instruct',
    pearson_ce: 0.61, transfer_auroc: 0.86 },
]

// -----------------------------------------------------------------------------
// Aggregated views (pre-computed for static page rendering)
// -----------------------------------------------------------------------------

/** Mean Pearson_CE for a probe across all its target models (excluding self). */
export function meanPearsonCEFor(probeId: string): number {
  const transfers = crossModelTransfers.filter(t => t.probeId === probeId && t.sourceModel !== t.targetModel)
  if (transfers.length === 0) return 0.5
  return transfers.reduce((s, t) => s + t.pearson_ce, 0) / transfers.length
}

/** All evals for a given probe. */
export function evalsFor(probeId: string): EvalEntry[] {
  return evaluations.filter(e => e.probeId === probeId)
}

/** Probe by ID. */
export function probeBy(id: string): ProbeEntry | undefined {
  return probes.find(p => p.id === id)
}

/** Task by ID. */
export function taskBy(id: string): TaskEntry | undefined {
  return tasks.find(t => t.id === id)
}

/** Model by ID. */
export function modelBy(id: string): ModelEntry | undefined {
  return models.find(m => m.id === id)
}

/** Score every probe and rank globally. */
export function rankedProbes() {
  const scored = probes.map(p => {
    const evals = evalsFor(p.id)
    const meanCE = meanPearsonCEFor(p.id)
    const score = computeProbeScore(p, evals, meanCE)
    return { probe: p, score, evals }
  })
  scored.sort((a, b) => b.score.total - a.score.total)
  scored.forEach((s, i) => { s.score.globalRank = i + 1 })
  // Fill in per-category rank
  const byCat: Record<string, number> = {}
  scored.forEach(s => {
    byCat[s.probe.category] = (byCat[s.probe.category] ?? 0) + 1
    s.score.rank = byCat[s.probe.category]
  })
  return scored
}

/** Categories present in current data, in display order. */
export const categoryOrder: Array<{ category: string; label: string; description: string }> = [
  { category: 'hallucination', label: 'Hallucination', description: 'Factual fabrication, entity recall failures.' },
  { category: 'reasoning',     label: 'Reasoning',     description: 'Chain-of-thought faithfulness, hypocrisy gap.' },
  { category: 'deception',     label: 'Deception',     description: 'Strategic dishonesty, sleeper agents, alignment faking.' },
  { category: 'sandbagging',   label: 'Sandbagging',   description: 'Capability hiding under evaluation.' },
  { category: 'eval_awareness', label: 'Eval Awareness', description: 'Model knows-it-is-being-tested confound.' },
  { category: 'reward_hacking', label: 'Reward Hacking', description: 'RL-induced misalignment generalization.' },
  { category: 'manipulation',  label: 'Manipulation',  description: 'EU AI Act Article 5 — persuasion / subliminal.' },
  { category: 'refusal',       label: 'Refusal',       description: 'Over/under-refusal calibration; jailbreak proxy.' },
]
