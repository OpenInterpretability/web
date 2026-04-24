import { Rocket, Zap, Crown, LucideIcon } from 'lucide-react'

export type NotebookTier = 'hobbyist' | 'explorer' | 'papergrade'

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
  /** Tailwind gradient for the card */
  gradient: string
}

const NOTEBOOK_REPO = 'OpenInterpretability/notebooks'
const GITHUB_BASE = `https://github.com/${NOTEBOOK_REPO}/blob/main/notebooks`
const RAW_BASE = `https://raw.githubusercontent.com/${NOTEBOOK_REPO}/main/notebooks`

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
    colabUrl: `https://colab.research.google.com/github/${NOTEBOOK_REPO}/blob/main/notebooks/01_hobbyist_gemma2_2b_colab.ipynb`,
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
    kaggleUrl: `https://www.kaggle.com/code/new?source=${encodeURIComponent(RAW_BASE + '/02_explorer_qwen35_4b_kaggle.ipynb')}`,
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
