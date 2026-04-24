export const site = {
  name: 'OpenInterpretability',
  shortName: 'OpenInterp',
  tagline: 'Watch language models think.',
  description:
    'Open source mechanistic interpretability — trace every feature, every circuit, every second of reasoning. Train SAEs in 30 min on free Colab or paper-grade on cloud. Apache-2.0 licensed.',
  url: 'https://openinterp.org',
  github: 'https://github.com/OpenInterpretability',
  huggingface: 'https://huggingface.co/caiovicentino1',
  twitter: 'https://twitter.com/openinterp',
  discord: '#', // placeholder
  contact: 'hi@openinterp.org',
}

export const headline = {
  eyebrow: 'Research-grade tools for alignment and interpretability',
  h1: 'Mechanistic interpretability, operational.',
  sub:
    'The first open stack for training sparse autoencoders on hybrid architectures and using their features as per-token reward signals in reinforcement learning.',
}

export const moat = [
  {
    title: 'Hybrid-architecture SAEs',
    body: 'First public TopK residual-stream SAEs on Gated DeltaNet, ensemble MoE, and triple-hybrid MoE+GDN+Gated-Attn. No one else has released these.',
    meta: '3 models, 2048–2560 d_model, 16× expansion, 200M–1B training tokens',
  },
  {
    title: 'Validated feature packs',
    body: 'Stage Gate 1 correlation ρ=0.52–0.54 on held-out GSM8K / SuperGPQA. Features predict answer correctness across architectures.',
    meta: 'ρ verified on n≥100 held-out per model',
  },
  {
    title: 'mechreward library',
    body: 'Per-token SAE feature activations as dense reward inside GRPO. Qwen3.5-4B → +19 pp on GSM8K in 168 effective training steps.',
    meta: 'pip install mechreward',
  },
  {
    title: 'Cross-architecture evidence',
    body: 'Same protocol, same contrastive reward formula, runs on 4B dense-GDN, 9B ensemble-MoE, and 35B-A3B triple-hybrid. Thesis transfers.',
    meta: 'Stage Gate protocol: G1 → G2 → G3',
  },
  {
    title: 'Sparse vs raw-direction ablation',
    body: 'Our G2 ablation (R1 SAE-sparse vs R2 raw-direction) shows an 11 pp gap on GSM8K. Sparse decomposition is causal, not cosmetic.',
    meta: 'Direct empirical argument vs linear-probe baselines',
  },
  {
    title: 'Open catalog + protocol',
    body: 'Every SAE, every reward pack, every evaluation result is public. No black boxes. Stage Gates are reproducible step by step.',
    meta: 'Apache-2.0, all artifacts on GitHub + HF Hub',
  },
]

export const saes = [
  {
    model: 'Qwen/Qwen3.6-27B',
    architecture: 'Dense reasoning-tuned · 3 layers in parallel (L11/L31/L55)',
    layer: 'Residual post-L11 · L31 · L55',
    dSae: 65536,
    k: 128,
    expansion: '13×',
    tokens: '200M',
    varExp: 0.843,
    g1Rho: null,
    repo: 'caiovicentino1/qwen36-27b-sae-papergrade',
    status: 'Released',
    firstPublic: 'Paper-grade 3-layer SAE on Qwen3.6-27B · held-out var_expl L11 0.843 · L31 0.714 · L55 0.816 · AuxK',
  },
  {
    model: 'Qwen/Qwen3.5-4B',
    architecture: 'Hybrid Gated DeltaNet',
    layer: 'Residual post-L18',
    dSae: 40960,
    k: 128,
    expansion: '16×',
    tokens: '200M',
    varExp: 0.866,
    g1Rho: 0.540,
    repo: 'caiovicentino1/Qwen3.5-4B-SAE-L18-topk',
    status: 'Released',
    firstPublic: 'First TopK residual-stream SAE for hybrid GDN',
  },
  {
    model: 'Google/Gemma-4-E4B',
    architecture: 'Ensemble MoE',
    layer: 'Residual post-L21',
    dSae: 32768,
    k: 128,
    expansion: '16×',
    tokens: '1B',
    varExp: 0.939,
    g1Rho: null,
    repo: 'caiovicentino1/Gemma-4-E4B-SAE-L21-topk',
    status: 'Released',
    firstPublic: 'First public SAE for Gemma-4 ensemble-MoE',
  },
  {
    model: 'Qwen/Qwen3.6-35B-A3B',
    architecture: 'Triple-hybrid (MoE + GDN + Gated Attention)',
    layer: 'Residual post-L23',
    dSae: 32768,
    k: 128,
    expansion: '16×',
    tokens: '92M (WIP)',
    varExp: 0.835,
    g1Rho: 0.522,
    repo: 'caiovicentino1/Qwen3.6-35B-A3B-SAE-L23-topk-wip',
    status: 'Training in progress',
    firstPublic:
      'First public SAE on triple-hybrid MoE+GDN+Gated-Attention. No precedent in literature.',
  },
]

export const benchmarks = {
  qwen35_g3: {
    title: 'Qwen3.5-4B · Stage Gate 3 Phase A (GSM8K)',
    baseline: 64,
    r1: 83,
    deltaPp: 19,
    stepsEffective: 168,
    lrEffective: '3e-6',
    kl: 0.11,
    mmluDelta: 4.5,
    hackRateBase: 4,
    hackRateTrained: 8,
    notes:
      'Per-token SAE-feature reward lifts Qwen3.5-4B from 64% → 83% on GSM8K in 168 effective training steps, +7pp above the same-SAE trajectory-level G2 R1 ceiling (76%). MMLU non-regressed. Hack rate within baseline 95% CI.',
  },
  qwen36_g1: {
    title: 'Qwen3.6-35B-A3B · Stage Gate 1 (SuperGPQA)',
    rho: 0.522,
    pearson: 0.537,
    pValue: 2.62e-8,
    nHeldOut: 100,
    notes:
      'First cross-architecture validation. SAE trained on 92M tokens (46% of Qwen3.5-4B budget) already matches Qwen3.5-4B correlation level (ρ=0.540). Signal transfers to triple-hybrid MoE.',
  },
}

export const priorWork = [
  {
    name: 'RLFR (Goodfire)',
    arxiv: '2602.10067',
    url: 'https://arxiv.org/abs/2602.10067',
    method: 'Linear probes on activations → online RL reward',
    result: '58% hallucination reduction on Gemma-3-12B-IT',
    vsUs: 'We use sparse TopK SAE features instead of raw probes; the 11 pp R1-vs-R2 gap in our G2 is the empirical argument for why decomposition matters.',
  },
  {
    name: 'CRL (Holistic AI)',
    arxiv: '2602.10437',
    url: 'https://arxiv.org/abs/2602.10437',
    method: 'PPO with SAE features as action space (select which feature to amplify)',
    result: '+1.03 pp on GSM8K with Gemma-2-2B',
    vsUs: 'We use SAE features as the reward signal itself, not as an action space. +19 pp on Qwen3.5-4B GSM8K. Methods are complementary (different axes of using SAE features in RL).',
  },
  {
    name: 'SARM',
    arxiv: '2508.08746',
    url: 'https://arxiv.org/abs/2508.08746',
    method: 'SAE features → linear head → frozen reward model for offline RLHF',
    result: 'Preference-model quality improvements',
    vsUs: 'We are online, per-token, and target reasoning on hybrid architectures — not preference modeling on dense transformers.',
  },
  {
    name: 'AIRI ReasonScore',
    arxiv: '2503.18878',
    url: 'https://arxiv.org/abs/2503.18878',
    method: 'SAE feature amplification at inference (contrastive around reasoning vocabulary)',
    result: '+13.4% AIME-2024 on DeepSeek-R1-Distill-Llama-8B',
    vsUs: 'Inference-time intervention vs training-time reward. We ported ReasonScore in our library for completeness and ran it on Qwen3.5-4B — confirmed rhetoric features, not correctness features.',
  },
]

export const stages = [
  {
    id: 'G1',
    name: 'Stage Gate 1 — correlation pre-test',
    purpose: 'Verify features predict outcome on held-out data before spending GPU hours on RL.',
    threshold: 'ρ ≥ 0.30',
    budget: '~$5, ~30 min',
    artifacts: 'reasoning_pack.json (10 helpful + 10 harmful feature IDs)',
  },
  {
    id: 'G2',
    name: 'Stage Gate 2 — three-way reward ablation',
    purpose: 'Compare outcome-only (R0) vs outcome + SAE-sparse (R1) vs outcome + raw-direction (R2).',
    threshold: 'R1 ≥ R0 + 2 pp AND R1 − R2 ≥ 5 pp',
    budget: '~$15, ~100 steps',
    artifacts: 'R0/R1/R2 LoRA adapters + comparison table',
  },
  {
    id: 'G3',
    name: 'Stage Gate 3 — full RL, ceiling-breaking',
    purpose: 'Scale-up with per-token mech-reward, MMLU preservation check, adversarial canary suite.',
    threshold: 'R1 ≥ 80% of target benchmark, hack_rate < 30%, MMLU regression < 2 pp',
    budget: '~$60, ~400 steps',
    artifacts: 'Published LoRA adapter + full eval table + LW writeup',
  },
]
