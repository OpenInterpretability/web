import {
  Rocket, Zap, Crown, LucideIcon,
  Search, Share2, Sliders, Compass, Flame, Feather, Beaker, GraduationCap, Scale, Shield,
  Network, GitBranch, Layers, Workflow,
  Award, Telescope, Eye, Ruler, ScanSearch, Wand2,
  Tag, Crosshair, Microscope, BarChart3, AlertTriangle, Brain, Move, FlaskConical,
} from 'lucide-react'

export type NotebookTier = 'hobbyist' | 'explorer' | 'papergrade'
export type NotebookSupplKind =
  | 'discover' | 'share' | 'steer' | 'pick' | 'coverage' | 'research' | 'safety' | 'circuits'
  | 'score' | 'lens' | 'probing' | 'hallucination' | 'guard'

const NOTEBOOK_REPO = 'OpenInterpretability/notebooks'
const GITHUB_BASE = `https://github.com/${NOTEBOOK_REPO}/blob/main/notebooks`
const RAW_BASE = `https://raw.githubusercontent.com/${NOTEBOOK_REPO}/main/notebooks`
const colabFor = (filename: string) =>
  `https://colab.research.google.com/github/${NOTEBOOK_REPO}/blob/main/notebooks/${filename}`
const kaggleFor = (filename: string) =>
  `https://www.kaggle.com/code/new?source=${encodeURIComponent(RAW_BASE + '/' + filename)}`

export interface TrainingNotebook {
  tier: NotebookTier
  title: string
  badge: string
  icon: LucideIcon
  platform: string
  platformIcon: string
  vram: string
  cost: string
  model: string
  modelSize: string
  architecture: string
  tokens: string
  expansion: string
  kFeatures: string
  timeEstimate: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  whatYouLearn: string[]
  prerequisites: string[]
  notebookPath: string
  githubUrl: string
  colabUrl?: string
  kaggleUrl?: string
  rawUrl: string
  status: 'live' | 'coming'
  gradient: string
}

export interface SupplNotebook {
  kind: NotebookSupplKind
  title: string
  tagline: string
  icon: LucideIcon
  description: string
  estimatedTime: string
  platform: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  notebookPath: string
  githubUrl: string
  colabUrl?: string
  kaggleUrl?: string
}

export const notebooks: TrainingNotebook[] = [
  {
    tier: 'hobbyist',
    title: 'Your first SAE in 30 minutes',
    badge: 'TIER 1 · HOBBYIST',
    icon: Rocket,
    platform: 'Google Colab · Free T4',
    platformIcon: '🆓',
    vram: '15 GB',
    cost: '$0',
    model: 'Gemma-2-2B',
    modelSize: '2.6 B params',
    architecture: 'Dense transformer',
    tokens: '50 M',
    expansion: '7× (n=16k)',
    kFeatures: 'k=64',
    timeEstimate: '30–40 min',
    difficulty: 'beginner',
    description:
      'Train a complete TopK SAE with AuxK dead-feature mitigation on Gemma-2-2B. Drive-based checkpoint recovery handles Colab\'s 90-minute idle disconnect. Ends with your own SAE uploaded to HuggingFace — citable, reusable, shareable.',
    whatYouLearn: [
      'Forward hooks + residual stream extraction',
      'TopK activation + AuxK auxiliary loss (Gao et al. 2024)',
      'Geometric-median b_dec initialization',
      'HuggingFace safetensors + cfg.json format',
      'Crash-safe checkpointing to Google Drive',
    ],
    prerequisites: [
      'Google account (Colab Free access)',
      'HuggingFace account + HF_TOKEN in Colab Secrets',
      'Edit one line: HF_USERNAME',
    ],
    notebookPath: '01_hobbyist_gemma2_2b_colab.ipynb',
    githubUrl: `${GITHUB_BASE}/01_hobbyist_gemma2_2b_colab.ipynb`,
    colabUrl: colabFor('01_hobbyist_gemma2_2b_colab.ipynb'),
    rawUrl: `${RAW_BASE}/01_hobbyist_gemma2_2b_colab.ipynb`,
    status: 'live',
    gradient: 'from-emerald-500/15 to-brand-500/10',
  },
  {
    tier: 'explorer',
    title: 'Hybrid-architecture SAE — Qwen3.5-4B',
    badge: 'TIER 2 · EXPLORER',
    icon: Zap,
    platform: 'Kaggle · 2× T4 (32 GB)',
    platformIcon: '📦',
    vram: '32 GB (2× T4)',
    cost: '$0 · 30 h/wk',
    model: 'Qwen3.5-4B',
    modelSize: '4.0 B params',
    architecture: 'Hybrid Gated Delta Network',
    tokens: '150 M',
    expansion: '16× (n=40k)',
    kFeatures: 'k=128',
    timeEstimate: '4–5 h',
    difficulty: 'intermediate',
    description:
      'The first-public-ready SAE recipe for hybrid GDN architectures. Installs transformers from source for qwen3_5 support, uses output_hidden_states path (Qwen3.5 has no .layers), survives Kaggle kernel-kill via HF-resumable checkpoints. Produces a publishable SAE matching the Stage Gate 1 research bar.',
    whatYouLearn: [
      'Hybrid GDN activation capture (output_hidden_states)',
      'transformers-from-source install + restart dance',
      'Dual-GPU model/SAE split (model on cuda:0, SAE on cuda:1)',
      'HuggingFace streaming checkpoints for kernel-kill recovery',
      'Held-out validation + val_report.json publishing',
    ],
    prerequisites: [
      'Completed Tier 1, or SAE experience',
      'Kaggle account + HF_TOKEN in Kaggle Secrets',
      'Basic understanding of Gated Delta Networks (links in notebook)',
    ],
    notebookPath: '02_explorer_qwen35_4b_kaggle.ipynb',
    githubUrl: `${GITHUB_BASE}/02_explorer_qwen35_4b_kaggle.ipynb`,
    kaggleUrl: kaggleFor('02_explorer_qwen35_4b_kaggle.ipynb'),
    rawUrl: `${RAW_BASE}/02_explorer_qwen35_4b_kaggle.ipynb`,
    status: 'live',
    gradient: 'from-brand-500/15 to-pink-500/10',
  },
  {
    tier: 'papergrade',
    title: 'Paper-grade SAE — Qwen3.6-27B',
    badge: 'TIER 3 · PAPER-GRADE',
    icon: Crown,
    platform: 'Vast.ai / Lambda · RTX 6000 Pro (96 GB)',
    platformIcon: '☁️',
    vram: '96 GB',
    cost: '~$30–60 / run',
    model: 'Qwen3.6-27B',
    modelSize: '27 B params',
    architecture: 'Dense transformer (reasoning-tuned)',
    tokens: '200 M',
    expansion: '13× (n=65k)',
    kFeatures: 'k=128, AuxK k=2560',
    timeEstimate: '20–24 h',
    difficulty: 'advanced',
    description:
      'The Gemma-Scope-27B-parity recipe. 3 TopK SAEs trained in parallel on L11/L31/L55 with a single shared forward pass, 70/20/10 FineWeb-Edu + OpenThoughts + OpenMath corpus mix, and HF streaming checkpoints every 10M tokens so a crash costs at most 10 minutes. This is the notebook behind qwen36-27b-sae-papergrade.',
    whatYouLearn: [
      'Multi-layer simultaneous SAE training (one forward pass, 3 SAEs)',
      'Corpus mixing for reasoning-model SAEs',
      'Streaming activation buffer pattern (never OOM)',
      'AuxK calibration for large n (d_model/2 heuristic)',
      'sae_lens / Neuronpedia-ready export',
    ],
    prerequisites: [
      'Completed Tier 1 + Tier 2, or production SAE experience',
      'Cloud GPU account (Vast.ai / Lambda / RunPod) with ≥96 GB VRAM',
      'HF_TOKEN env var on the cloud instance',
    ],
    notebookPath: '03_papergrade_qwen36_27b_cloud.ipynb',
    githubUrl: `${GITHUB_BASE}/03_papergrade_qwen36_27b_cloud.ipynb`,
    rawUrl: `${RAW_BASE}/03_papergrade_qwen36_27b_cloud.ipynb`,
    status: 'live',
    gradient: 'from-orange-500/15 to-pink-500/15',
  },
]

// ---------- Supplementary notebooks: post-train, pre-train, coverage, research, safety ----------
export const supplementary: SupplNotebook[] = [
  // Post-train: closes the loop
  {
    kind: 'discover',
    title: 'Discover your features',
    tagline: 'Auto-label your SAE with an LLM judge',
    icon: Search,
    description:
      'You trained an SAE. Now what? This notebook streams activations, ranks features by interestingness, sends top-activating examples to Claude or GPT-4, and returns a feature_catalog.json with 1-sentence descriptions.',
    estimatedTime: '~20 min · Colab T4',
    platform: 'Colab Free · ANTHROPIC_API_KEY or OPENAI_API_KEY',
    difficulty: 'beginner',
    notebookPath: '04_discover_features.ipynb',
    githubUrl: `${GITHUB_BASE}/04_discover_features.ipynb`,
    colabUrl: colabFor('04_discover_features.ipynb'),
  },
  {
    kind: 'discover',
    title: 'Auto-interp at scale — paper-grade SAE',
    tagline: '1500 features × 32 examples · Claude Opus 4.7 via OpenRouter',
    icon: Tag,
    description:
      'The auto-interp pipeline behind feature-catalog.json (1500 labels, ~$80 OpenRouter spend). Streams top-activating examples from the Qwen3.6-27B SAE (L11/L31/L55), filters Pile-noise features, sends to Opus 4.7, and emits per-feature semantic labels. Apache-2.0.',
    estimatedTime: '~6 h · Colab T4 (~$0 GPU + LLM credit)',
    platform: 'Colab Free · OPENROUTER_API_KEY required',
    difficulty: 'intermediate',
    notebookPath: '04b_autointerp_qwen36_27b_papergrade.ipynb',
    githubUrl: `${GITHUB_BASE}/04b_autointerp_qwen36_27b_papergrade.ipynb`,
    colabUrl: colabFor('04b_autointerp_qwen36_27b_papergrade.ipynb'),
  },
  {
    kind: 'discover',
    title: 'Auto-interp targeted — circuit features',
    tagline: 'Label only the features your circuit needs',
    icon: Crosshair,
    description:
      'Smaller-budget variant of 04b — pass a list of (layer, feature_id) tuples (e.g., from Sparse Feature Circuits output) and get labels only for those. Used to fill in 36 missing labels for the medical / IOI / math / refusal circuits in the Circuit Canvas viewer.',
    estimatedTime: '~10 min · Colab T4 (~$1 LLM credit)',
    platform: 'Colab Free · OPENROUTER_API_KEY required',
    difficulty: 'beginner',
    notebookPath: '04c_autointerp_missing_circuit_features.ipynb',
    githubUrl: `${GITHUB_BASE}/04c_autointerp_missing_circuit_features.ipynb`,
    colabUrl: colabFor('04c_autointerp_missing_circuit_features.ipynb'),
  },
  {
    kind: 'share',
    title: 'Build a shareable Trace',
    tagline: 'Your SAE + your prompt → trace.json + shareable URL',
    icon: Share2,
    description:
      'Generate a TraceData JSON (exact Trace Theater schema) for a custom prompt + SAE. Emits the same format /observatory/trace consumes. Upload to HF and share the URL.',
    estimatedTime: '~5 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'beginner',
    notebookPath: '05_build_shareable_trace.ipynb',
    githubUrl: `${GITHUB_BASE}/05_build_shareable_trace.ipynb`,
    colabUrl: colabFor('05_build_shareable_trace.ipynb'),
  },
  {
    kind: 'steer',
    title: 'Steer your model',
    tagline: 'Live feature intervention — baseline vs α ∈ [-3, 0, 1, 3]',
    icon: Sliders,
    description:
      'Pick a feature, slide its activation coefficient, regenerate. Shows causal effect side-by-side. Q1 preview of the Q2 Sandbox. Exports interventions.json for inclusion in Trace Theater counterfactuals.',
    estimatedTime: '~3 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '06_steer_your_model.ipynb',
    githubUrl: `${GITHUB_BASE}/06_steer_your_model.ipynb`,
    colabUrl: colabFor('06_steer_your_model.ipynb'),
  },
  // Pre-train: reduces friction
  {
    kind: 'pick',
    title: 'Pick your tier',
    tagline: 'VRAM calculator + layer recommender',
    icon: Compass,
    description:
      'Interactive "what tier should I train?" advisor. Auto-detects your GPU, asks for time budget, recommends a notebook + model + layer. Zero GPU required.',
    estimatedTime: '< 1 min · CPU fine',
    platform: 'Anywhere',
    difficulty: 'beginner',
    notebookPath: '07_pick_your_tier.ipynb',
    githubUrl: `${GITHUB_BASE}/07_pick_your_tier.ipynb`,
    colabUrl: colabFor('07_pick_your_tier.ipynb'),
  },
  // Coverage: more models, more architectures
  {
    kind: 'coverage',
    title: 'Llama-3.1-8B SAE',
    tagline: 'Tier 2 port — Llama-3.1-8B on Kaggle free',
    icon: Flame,
    description:
      'Train an SAE on the most popular open model. 100M tokens on Kaggle 2× T4 in ~5-6h, HF resumable checkpoints, standard .model.layers path.',
    estimatedTime: '5–6 h · Kaggle 2× T4',
    platform: 'Kaggle Free · Meta license acceptance required',
    difficulty: 'intermediate',
    notebookPath: '08_explorer_llama3_8b_kaggle.ipynb',
    githubUrl: `${GITHUB_BASE}/08_explorer_llama3_8b_kaggle.ipynb`,
    kaggleUrl: kaggleFor('08_explorer_llama3_8b_kaggle.ipynb'),
  },
  {
    kind: 'coverage',
    title: 'Mistral-7B SAE',
    tagline: 'Tier 2 port — Mistral-7B-v0.3 on Kaggle free',
    icon: Flame,
    description:
      'Clean decoder, sliding-window attention is transparent to SAE training. Same Kaggle recipe as Llama, swaps the model. HF resumable checkpoints.',
    estimatedTime: '4–5 h · Kaggle 2× T4',
    platform: 'Kaggle Free',
    difficulty: 'intermediate',
    notebookPath: '09_explorer_mistral_7b_kaggle.ipynb',
    githubUrl: `${GITHUB_BASE}/09_explorer_mistral_7b_kaggle.ipynb`,
    kaggleUrl: kaggleFor('09_explorer_mistral_7b_kaggle.ipynb'),
  },
  {
    kind: 'coverage',
    title: 'Phi-3-mini SAE',
    tagline: 'Tier 1 alt — even faster hobbyist path',
    icon: Feather,
    description:
      'Microsoft Phi-3-mini (3.8B) fits comfortably on Colab free T4. 20-min training, Drive checkpoints, first-feature-discovery gift-wrapped.',
    estimatedTime: '~20 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'beginner',
    notebookPath: '10_hobbyist_phi3_mini_colab.ipynb',
    githubUrl: `${GITHUB_BASE}/10_hobbyist_phi3_mini_colab.ipynb`,
    colabUrl: colabFor('10_hobbyist_phi3_mini_colab.ipynb'),
  },
  // Research
  {
    kind: 'research',
    title: 'Stage Gate G1 — correlation pre-test',
    tagline: 'ρ ≥ 0.30 or don\'t burn GPU on RL',
    icon: GraduationCap,
    description:
      'Replicates the Stage Gate 1 protocol from mechreward. Computes Spearman ρ between your SAE feature pack and GSM8K correctness on 100 held-out samples. Pass/fail + scatter plot + report upload.',
    estimatedTime: '20–30 min · Colab T4',
    platform: 'Colab · any tier',
    difficulty: 'intermediate',
    notebookPath: '11_stage_gate_g1.ipynb',
    githubUrl: `${GITHUB_BASE}/11_stage_gate_g1.ipynb`,
    colabUrl: colabFor('11_stage_gate_g1.ipynb'),
  },
  {
    kind: 'research',
    title: 'BatchTopK vs TopK',
    tagline: 'Replicate arxiv:2412.06410',
    icon: Scale,
    description:
      'Train TopK and BatchTopK on identical activation batches, compare Pareto (var_exp, L0, dead%). Shows where BatchTopK dominates and by how much.',
    estimatedTime: '~45 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'advanced',
    notebookPath: '12_batchtopk_vs_topk.ipynb',
    githubUrl: `${GITHUB_BASE}/12_batchtopk_vs_topk.ipynb`,
    colabUrl: colabFor('12_batchtopk_vs_topk.ipynb'),
  },
  // Circuits
  {
    kind: 'circuits',
    title: 'Attribution Patching (AtP*)',
    tagline: 'Kramár 2024 — QK-fix + GradDrop · node attribution',
    icon: Network,
    description:
      'Compute per-feature attribution scores on your SAE using AtP* (the 2-forward-1-backward linearization). Mean-ablation baseline, QK-fix for attention heads, GradDrop for sign-cancellation robustness. Emits circuit JSON for the Canvas viewer.',
    estimatedTime: '~15 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '14_attribution_patching.ipynb',
    githubUrl: `${GITHUB_BASE}/14_attribution_patching.ipynb`,
    colabUrl: colabFor('14_attribution_patching.ipynb'),
  },
  {
    kind: 'circuits',
    title: 'Sparse Feature Circuits (Marks 2024)',
    tagline: 'arxiv:2403.19647 replication · node + edge DAG',
    icon: GitBranch,
    description:
      'Full replication of Marks et al. 2024. Node attribution via AtP + IG-10 fallback for early layers. Edge attribution via Appendix A.1 (upstream decoder × downstream encoder × upstream delta × downstream gradient). SAE error terms as triangle nodes.',
    estimatedTime: '~20 min · A100',
    platform: 'Colab Pro A100',
    difficulty: 'advanced',
    notebookPath: '15_sparse_feature_circuits.ipynb',
    githubUrl: `${GITHUB_BASE}/15_sparse_feature_circuits.ipynb`,
    colabUrl: colabFor('15_sparse_feature_circuits.ipynb'),
  },
  {
    kind: 'circuits',
    title: 'ACDC slow-mode via AutoCircuit',
    tagline: 'NeurIPS 2023 algorithm · independent verification',
    icon: Workflow,
    description:
      'Run the original ACDC algorithm (Conmy 2023) using AutoCircuit (UFO-101 — the practitioner-default fork). Slower than AtP but peer-reviewed. Compare faithfulness curves across methods. Emits circuit.json compatible with the Canvas viewer.',
    estimatedTime: '1–2 h · Colab T4',
    platform: 'Colab · any tier',
    difficulty: 'advanced',
    notebookPath: '16_autocircuit_acdc.ipynb',
    githubUrl: `${GITHUB_BASE}/16_autocircuit_acdc.ipynb`,
    colabUrl: colabFor('16_autocircuit_acdc.ipynb'),
  },
  {
    kind: 'circuits',
    title: 'Sparse Feature Circuits — paper-grade 27B',
    tagline: 'Marks 2024 method on Qwen3.6-27B / 65k features per layer',
    icon: Microscope,
    description:
      'Scaled-up companion to notebook 15. Same SFC pipeline (node attribution via AtP, edge attribution via Marks Appendix A.1) but on the published Qwen3.6-27B SAE across L11/L31/L55. Emits the circuit JSON files consumed by /observatory/circuits (medical, IOI, math, refusal scenarios).',
    estimatedTime: '~1 h · A100 / RTX 6000 Pro',
    platform: 'Cloud GPU · ≥48 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '15b_sfc_qwen36_27b_papergrade.ipynb',
    githubUrl: `${GITHUB_BASE}/15b_sfc_qwen36_27b_papergrade.ipynb`,
  },
  {
    kind: 'circuits',
    title: 'Train a Sparse Crosscoder',
    tagline: 'Lindsey 2024 · shared dictionary across 3+ layers',
    icon: Layers,
    description:
      'Train a single crosscoder that reads and writes across multiple residual layers simultaneously. Unifies L11/L31/L55-style multi-layer SAEs into one feature index. Greenfield — not yet in SAELens. Classifies features as persistent / early-only / late-only / mixed.',
    estimatedTime: '~30 min · T4 (20M tok) · scales to paper-grade',
    platform: 'Colab Free · T4',
    difficulty: 'advanced',
    notebookPath: '17_train_crosscoder.ipynb',
    githubUrl: `${GITHUB_BASE}/17_train_crosscoder.ipynb`,
    colabUrl: colabFor('17_train_crosscoder.ipynb'),
  },
  {
    kind: 'circuits',
    title: 'Cross-model crosscoder + Pearson_CE',
    tagline: 'Gemma-2-2B base/IT · BatchTopK · cosine vs causal universality',
    icon: GitBranch,
    description:
      'Companion to 17 (cross-layer). This is cross-MODEL — diff base vs IT-tuned variant of Gemma-2-2B with BatchTopK + decoder-norm sparsity. First per-feature Pearson causal-equivalence test in the literature. Median cosine 0.965 vs median CE 0.616 on shared features (38% gap). The methodology paper-1 uses for ICML MI Workshop 2026.',
    estimatedTime: '~5 h · A100 / RTX 6000 Pro',
    platform: 'Cloud GPU · ≥40 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '17b_crosscoder_model_diff_papergrade.ipynb',
    githubUrl: `${GITHUB_BASE}/17b_crosscoder_model_diff_papergrade.ipynb`,
  },
  {
    kind: 'circuits',
    title: 'RL-diffing crosscoder — base vs mechreward',
    tagline: 'Qwen3.5-4B base vs G3-LoRA · LoRA toggle pattern',
    icon: Workflow,
    description:
      'Cross-stage crosscoder companion to 17b. Single base model + LoRA toggle via PEFT.disable_adapter() for activation collection. Diffs Qwen3.5-4B base against the mechreward-G3 LoRA (GSM8K 64%→83%) — first cross-stage RL diffing crosscoder on hybrid GDN architecture. Hypothesis: RL preserves residuals at L18 but rewires downstream consumers — Pearson_CE catches it.',
    estimatedTime: '~5 h · A100 / RTX 6000 Pro',
    platform: 'Cloud GPU · ≥40 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '17c_crosscoder_rl_diffing_papergrade.ipynb',
    githubUrl: `${GITHUB_BASE}/17c_crosscoder_rl_diffing_papergrade.ipynb`,
  },
  // InterpScore
  {
    kind: 'score',
    title: 'InterpScore v0.0.1 — rank your SAE',
    tagline: 'Composite metric · submit to the leaderboard',
    icon: Award,
    description:
      'Compute the InterpScore of your SAE: loss_recovered + alive features + L0 sweet spot + sparse probing + TPP causal faithfulness. Emits interpscore.json, ready to PR into the public leaderboard at openinterp.org/interpscore.',
    estimatedTime: '~20 min · Colab T4',
    platform: 'Colab Free · Gemma-2-2B default',
    difficulty: 'intermediate',
    notebookPath: '18_interpscore_eval.ipynb',
    githubUrl: `${GITHUB_BASE}/18_interpscore_eval.ipynb`,
    colabUrl: colabFor('18_interpscore_eval.ipynb'),
  },
  {
    kind: 'score',
    title: 'InterpScore on the paper-grade 27B SAE',
    tagline: 'Real numbers — L11=0.7788 / L31=0.7600 / L55=0.7507',
    icon: BarChart3,
    description:
      'Computes InterpScore v0.0.1 on the public caiovicentino1/qwen36-27b-sae-papergrade SAE. Loss-recovered + alive features + L0 sweet spot + sparse probing + TPP causal faithfulness with proportional k=0.5% of d_sae. Emits interpscore.json identical to what we submitted to the public leaderboard.',
    estimatedTime: '~3 h · A100 / RTX 6000 Pro',
    platform: 'Cloud GPU · ≥48 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '18b_interpscore_qwen36_27b_papergrade.ipynb',
    githubUrl: `${GITHUB_BASE}/18b_interpscore_qwen36_27b_papergrade.ipynb`,
  },
  // Hallucination — the full research arc behind the 2026-04-25 blog post
  {
    kind: 'hallucination',
    title: 'Entity-recognition v0.0.1 — the failed first try',
    tagline: 'How a 2× tokenization confound gave a fake AUROC=1.0',
    icon: AlertTriangle,
    description:
      'Educational "how NOT to do it" notebook. Synthetic Slavic-style fake-entity names had ~2× the token count of famous entities — even the best feature was just counting subword tokens. Posted unchanged so the failure mode is reproducible. The fix is in 24b.',
    estimatedTime: '~30 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '24_hallucination_entity_separation_qwen36_27b.ipynb',
    githubUrl: `${GITHUB_BASE}/24_hallucination_entity_separation_qwen36_27b.ipynb`,
    colabUrl: colabFor('24_hallucination_entity_separation_qwen36_27b.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Ferrando 2024 replication on Qwen3.6-27B',
    tagline: 'AUROC 0.8379 on real Wikidata entities (vs 0.732 baseline)',
    icon: Brain,
    description:
      'The methodology fix for 24. Uses real known/unknown Wikidata entities from javiferran/sae_entities, labels via attribute recall on the 27B model, applies the Pile noise filter (>2% rate dropped), and ranks single latents by Cohen\'s d. Surfaces feature L11/f61723 — first proper Ferrando replication at 27B scale.',
    estimatedTime: '~2 h · Colab A100',
    platform: 'Colab Pro · A100 recommended',
    difficulty: 'advanced',
    notebookPath: '24b_hallucination_v002_ferrando_proper.ipynb',
    githubUrl: `${GITHUB_BASE}/24b_hallucination_v002_ferrando_proper.ipynb`,
    colabUrl: colabFor('24b_hallucination_v002_ferrando_proper.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Single-feature steering — the null result',
    tagline: 'Clamp ±5 on f61723 · no calibration effect',
    icon: Move,
    description:
      'First steering test: clamp the entity-recognition feature to ±5 (additive ±2) at L11 and check whether refusal rate on unknown entities moves. It does not. Detection ≠ control. Sets up the multi-feature experiments in 26 / 27.',
    estimatedTime: '~45 min · Colab A100',
    platform: 'Colab Pro · A100 recommended',
    difficulty: 'advanced',
    notebookPath: '25_steering_f61723_calibration.ipynb',
    githubUrl: `${GITHUB_BASE}/25_steering_f61723_calibration.ipynb`,
    colabUrl: colabFor('25_steering_f61723_calibration.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Multi-feature steering — top-K (no controls)',
    tagline: '−15pp on unknown refusal · would have shipped overclaimed',
    icon: Sliders,
    description:
      'Ablate top-K (K∈{5,20,50,200}) features sorted by Cohen\'s d. Naive read: −15pp on unknown-entity refusal at K=200 — looks like a calibration knob. We almost shipped it before adding controls. The honest version is 27.',
    estimatedTime: '~1.5 h · Colab A100',
    platform: 'Colab Pro · A100 recommended',
    difficulty: 'advanced',
    notebookPath: '26_multi_feature_steering.ipynb',
    githubUrl: `${GITHUB_BASE}/26_multi_feature_steering.ipynb`,
    colabUrl: colabFor('26_multi_feature_steering.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Multi-feature steering with full controls',
    tagline: 'Random-K null + direction-sort + Claude judge → it induces hallucination',
    icon: FlaskConical,
    description:
      'The walk-back. Six controls: random-K (R=30 draws), direction-sorted (top positive-d / top negative-d / mixed |d|), 3-way split, anti-feature, Claude Haiku judge, permutation test. Top-K is 4-8σ outside random null — but the judge shows the "less hedging" is confident-wrong answers (62%→77% on incorrect refusal), not improved correctness. Hallucination-induction mechanism, not a calibration knob.',
    estimatedTime: '~3 h · Colab A100',
    platform: 'Colab Pro · A100 + ANTHROPIC_API_KEY',
    difficulty: 'advanced',
    notebookPath: '27_multi_feature_steering_with_controls.ipynb',
    githubUrl: `${GITHUB_BASE}/27_multi_feature_steering_with_controls.ipynb`,
    colabUrl: colabFor('27_multi_feature_steering_with_controls.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Paper baselines — Ferrando 2024 on Qwen3.6-27B',
    tagline: 'L31/f34957 0.81 · LR 0.887 · diff-of-means 0.859',
    icon: BarChart3,
    description:
      'The headline-numbers notebook for the ICML MI Workshop paper-1. Ferrando-style entity-recognition replication with 607 entities, per-layer scan across all 64 layers for linear probe + diff-of-means baselines, 95% bootstrap CI, HF resumable checkpoints. Cleanly compares single SAE feature vs supervised LR ceiling vs cross-bench generalization.',
    estimatedTime: '~3 h · Colab A100',
    platform: 'Colab Pro · A100 recommended',
    difficulty: 'advanced',
    notebookPath: '28_paper_baselines_qwen36_27b.ipynb',
    githubUrl: `${GITHUB_BASE}/28_paper_baselines_qwen36_27b.ipynb`,
    colabUrl: colabFor('28_paper_baselines_qwen36_27b.ipynb'),
  },
  {
    kind: 'hallucination',
    title: 'Sensitivity — refusal-only vs Ferrando labelling',
    tagline: 'Same residual capture · 2 labelling rules → which signal survives?',
    icon: Scale,
    description:
      'Ablation companion to 28. Re-uses the cached residual capture, swaps labelling rule (refusal-only vs Ferrando-style confabulation-as-unknown). Builds reviewer defence: shows the L31/f34957 0.81 AUROC is robust to the labelling rule choice, falsifies an earlier "L11 best" claim from v0.0.2.',
    estimatedTime: '~30 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'advanced',
    notebookPath: '28b_sensitivity_refusal_only.ipynb',
    githubUrl: `${GITHUB_BASE}/28b_sensitivity_refusal_only.ipynb`,
    colabUrl: colabFor('28b_sensitivity_refusal_only.ipynb'),
  },
  // Guard — product reproducers (each notebook reproduces a shipped product number)
  {
    kind: 'guard',
    title: 'FabricationGuard PoC v1 — single SAE feature',
    tagline: 'How the entity feature failed cross-bench',
    icon: AlertTriangle,
    description:
      'The first attempt at HallucinationGuard: single SAE feature L31/f34957 (AUROC 0.81 on Ferrando entity test) applied to 4 public benchmarks. AUROC collapsed to ~0.5 chance on TruthfulQA / HaluEval / SimpleQA / MMLU. The honest negative result that motivated v2. Open-sourced as part of the OpenInterp methodology arc.',
    estimatedTime: '~1.5 h · Colab Pro+ RTX 6000',
    platform: 'Colab Pro+ · ≥48 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '30_hallucinationguard_proof_qwen36_27b.ipynb',
    githubUrl: `${GITHUB_BASE}/30_hallucinationguard_proof_qwen36_27b.ipynb`,
    colabUrl: colabFor('30_hallucinationguard_proof_qwen36_27b.ipynb'),
  },
  {
    kind: 'guard',
    title: 'FabricationGuard v2 — linear probe (production)',
    tagline: 'AUROC 0.88 cross-task SimpleQA · −88% confident-wrong reduction',
    icon: Shield,
    description:
      'The probe behind the shipped openinterp.FabricationGuard (PyPI v0.2.0). Multi-feature LR on residual stream at L31, trained on TruthfulQA + HaluEval + MMLU train splits, evaluated cross-task on held-out SimpleQA. AUROC 0.88. Mitigation analysis shows −52% to −88% confident-wrong reduction on factual QA. Outputs probe.joblib that ships in the SDK.',
    estimatedTime: '~50 min · Colab Pro+ RTX 6000',
    platform: 'Colab Pro+ · ≥48 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '31_hallucinationguard_v2_linear_probe.ipynb',
    githubUrl: `${GITHUB_BASE}/31_hallucinationguard_v2_linear_probe.ipynb`,
    colabUrl: colabFor('31_hallucinationguard_v2_linear_probe.ipynb'),
  },
  {
    kind: 'guard',
    title: 'ReasoningGuard PoC — probe during thinking',
    tagline: 'Probe at end-of-think · GSM8K + MATH + StrategyQA',
    icon: Brain,
    description:
      'Companion to 31. Score the *reasoning trace itself* (during thinking-mode generation), not the prompt. Sweeps 3 layers × 4 positions (end-of-question, mid-think, end-of-think, end-of-answer). Cross-domain test: train on GSM8K, eval on MATH + StrategyQA. If passes, ships as openinterp.ReasoningGuard v0.3.',
    estimatedTime: '~3 h · Colab Pro+ RTX 6000',
    platform: 'Colab Pro+ · ≥48 GB VRAM',
    difficulty: 'advanced',
    notebookPath: '32_reasoningguard_proof_qwen36_27b.ipynb',
    githubUrl: `${GITHUB_BASE}/32_reasoningguard_proof_qwen36_27b.ipynb`,
    colabUrl: colabFor('32_reasoningguard_proof_qwen36_27b.ipynb'),
  },
  // Lenses
  {
    kind: 'lens',
    title: 'Logit Lens — per-layer predictions',
    tagline: 'nostalgebraist 2020 · 5 lines of PyTorch',
    icon: Eye,
    description:
      'Apply final_ln + unembed to every intermediate residual stream. See what the model is "thinking" at each depth. Pure transformers — no TransformerLens dep. Handles Llama/Gemma/Qwen/GPT-2/multimodal paths.',
    estimatedTime: '~5 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'beginner',
    notebookPath: '19_logit_lens.ipynb',
    githubUrl: `${GITHUB_BASE}/19_logit_lens.ipynb`,
    colabUrl: colabFor('19_logit_lens.ipynb'),
  },
  {
    kind: 'lens',
    title: 'Tuned Lens — calibrated predictions',
    tagline: 'Belrose 2023 · pretrained or fresh-fit',
    icon: Telescope,
    description:
      'Per-layer affine transformation that fixes Logit Lens under-specification. Tries pretrained checkpoints first (GPT-2, Pythia, Llama-3-8B, OPT, Vicuna); falls back to 200-step fresh training on the Pile (~20 min on T4).',
    estimatedTime: '2 min (pretrained) · 20 min (fresh fit)',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '20_tuned_lens.ipynb',
    githubUrl: `${GITHUB_BASE}/20_tuned_lens.ipynb`,
    colabUrl: colabFor('20_tuned_lens.ipynb'),
  },
  // Probing suite
  {
    kind: 'probing',
    title: 'Linear Probe — the SAE baseline',
    tagline: 'Alain & Bengio 2016 · the indispensable baseline',
    icon: Ruler,
    description:
      'Fit sklearn LogisticRegression on residual-stream activations. Per-layer AUROC sweep. Diff-of-means baseline shipped (Farquhar 2023 critique). This is the number any SAE feature-pack must beat.',
    estimatedTime: '~10 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'beginner',
    notebookPath: '21_linear_probe.ipynb',
    githubUrl: `${GITHUB_BASE}/21_linear_probe.ipynb`,
    colabUrl: colabFor('21_linear_probe.ipynb'),
  },
  {
    kind: 'probing',
    title: 'CCS — Contrast Consistent Search',
    tagline: 'Burns 2022 · unsupervised truth-probing, with honest baselines',
    icon: ScanSearch,
    description:
      'Replicates Burns et al. 2022 CCS on IMDB or TruthfulQA. Ships diff-of-means + supervised LR ceiling alongside CCS per Farquhar 2023 critique. Best-of-10 restarts. Honest verdict when CCS adds no value over diff-of-means.',
    estimatedTime: '~15 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '22_ccs_probe.ipynb',
    githubUrl: `${GITHUB_BASE}/22_ccs_probe.ipynb`,
    colabUrl: colabFor('22_ccs_probe.ipynb'),
  },
  {
    kind: 'probing',
    title: 'RepE reading vector (LAT)',
    tagline: 'Zou 2023 · extract + monitor + steer a concept',
    icon: Wand2,
    description:
      'Linear Artificial Tomography. 32 contrastive prompt pairs → PCA → first component is the "honesty" / "sycophancy" / "refusal" / "confidence" direction. Monitor new prompts. Confirmed causal via ±α steering at the end.',
    estimatedTime: '~10 min · Colab T4',
    platform: 'Colab Free',
    difficulty: 'intermediate',
    notebookPath: '23_repe_reading_vector.ipynb',
    githubUrl: `${GITHUB_BASE}/23_repe_reading_vector.ipynb`,
    colabUrl: colabFor('23_repe_reading_vector.ipynb'),
  },
  // Safety
  {
    kind: 'safety',
    title: 'Watchtower preview — monitor input prompts',
    tagline: 'Detect anomalous feature activations in production traffic',
    icon: Shield,
    description:
      'Q1 preview of the Q4 Watchtower Enterprise API. Streams input prompts, measures watchlist feature activations, flags anomalies above threshold, emits dashboard-style report. Forward-only, no generation.',
    estimatedTime: '~5 min · any Colab',
    platform: 'Colab · any tier',
    difficulty: 'intermediate',
    notebookPath: '13_watchtower_preview.ipynb',
    githubUrl: `${GITHUB_BASE}/13_watchtower_preview.ipynb`,
    colabUrl: colabFor('13_watchtower_preview.ipynb'),
  },
]

export const supplementaryGroups: {
  label: string
  sub: string
  kinds: NotebookSupplKind[]
}[] = [
  {
    label: 'Closes the loop',
    sub: 'You have an SAE. Now understand it, share it, edit it.',
    kinds: ['discover', 'share', 'steer'],
  },
  {
    label: 'Reduce friction',
    sub: 'Pick the right tier before you spin up a GPU.',
    kinds: ['pick'],
  },
  {
    label: 'More models',
    sub: 'Same recipe, different architectures.',
    kinds: ['coverage'],
  },
  {
    label: 'Research-grade',
    sub: 'Replicate published results. Write your paper.',
    kinds: ['research'],
  },
  {
    label: 'Circuits',
    sub: 'Attribution graphs between SAE features. View with /observatory/circuits.',
    kinds: ['circuits'],
  },
  {
    label: 'Leaderboard',
    sub: 'Rank your SAE on the public InterpScore leaderboard.',
    kinds: ['score'],
  },
  {
    label: 'Lenses',
    sub: 'Classic tools — see what each layer is predicting.',
    kinds: ['lens'],
  },
  {
    label: 'Probing',
    sub: 'The supervised baselines that SAE features must beat.',
    kinds: ['probing'],
  },
  {
    label: 'Hallucination — detection & steering',
    sub: 'The full research arc behind the 2026-04-25 blog post: Ferrando replication on 27B, single-feature null, multi-feature ablation under random-K + Claude-judge controls. Plus the ICML MI Workshop paper-1 baseline notebook.',
    kinds: ['hallucination'],
  },
  {
    label: 'Guards — product reproducers',
    sub: 'Reproduce the exact numbers behind shipped openinterp Guards. Each notebook is a self-contained validation of a probe that ships in the PyPI SDK.',
    kinds: ['guard'],
  },
  {
    label: 'Safety + production',
    sub: 'Q4 Watchtower preview.',
    kinds: ['safety'],
  },
]

export const tierComparison = {
  headers: ['', 'Hobbyist', 'Explorer', 'Paper-grade'],
  rows: [
    { label: 'Platform', values: ['', 'Colab Free T4', 'Kaggle 2× T4', 'Cloud RTX 6000 Pro'] },
    { label: 'Cost', values: ['', '$0', '$0 · 30 h/wk quota', '~$30–60 per run'] },
    { label: 'VRAM', values: ['', '15 GB', '32 GB', '96 GB'] },
    { label: 'Model', values: ['', 'Gemma-2-2B (2.6 B)', 'Qwen3.5-4B (4.0 B)', 'Qwen3.6-27B (27 B)'] },
    { label: 'Architecture', values: ['', 'Dense', 'Hybrid GDN', 'Dense (reasoning)'] },
    { label: 'Dictionary', values: ['', 'n=16k (7×)', 'n=40k (16×)', 'n=65k (13×)'] },
    { label: 'TopK', values: ['', 'k=64', 'k=128', 'k=128 + AuxK'] },
    { label: 'Tokens', values: ['', '50 M', '150 M', '200 M'] },
    { label: 'Time', values: ['', '30–40 min', '4–5 h', '20–24 h'] },
    { label: 'What you get', values: ['', 'First SAE', 'Hybrid-arch SAE', 'Paper-grade SAE'] },
  ],
}
