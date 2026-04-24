import {
  Rocket, Zap, Crown, LucideIcon,
  Search, Share2, Sliders, Compass, Flame, Feather, Beaker, GraduationCap, Scale, Shield,
} from 'lucide-react'

export type NotebookTier = 'hobbyist' | 'explorer' | 'papergrade'
export type NotebookSupplKind =
  | 'discover' | 'share' | 'steer' | 'pick' | 'coverage' | 'research' | 'safety'

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
