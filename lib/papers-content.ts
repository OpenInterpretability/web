// Paper registry — full markdown content hosted on the site.
// Each entry corresponds to a file in /content/papers/<slug>.md.

export interface PaperMeta {
  slug: string;
  title: string;
  subtitle?: string;
  authors: string;
  orcid?: string; // ORCID iD bare (e.g. "0009-0003-4331-6259")
  venue: string;
  status: "draft" | "in-review" | "submitted" | "published";
  date: string; // ISO yyyy-mm-dd
  abstract: string;
  artifacts?: { label: string; href: string }[];
  tags?: string[];
}

export const CAIO_ORCID = "0009-0003-4331-6259";

export const papers: PaperMeta[] = [
  {
    slug: "kappa-t-coherence-buildup",
    title: "Explore-Consolidate Dynamics in Cross-Probe Coherence",
    subtitle:
      "U-Shape Trajectories of κ_t Separate Successful and Failed LLM Agent Runs on SWE-bench Pro / Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft v2) → ICLR 2027 main",
    status: "draft",
    date: "2026-05-18",
    abstract:
      "We propose cross-probe coherence κ_t — the mean absolute pairwise correlation across N concurrent per-turn behavioral probes within a moving window of agent turns — as a meta-signal for LLM agent monitoring. On 99 SWE-bench Pro trajectories from Qwen3.6-27B we report two distinct findings. (1) Per-trace mean κ̄ separates success from failure at AUROC 0.677 (Mann-Whitney p=0.0009). (2) κ_t exhibits a U-shape over each trajectory: it decreases through an early exploration phase and increases through a late consolidation phase, and the amplitude of this U-shape is markedly larger in successful traces (early-half slope −0.0078/turn vs −0.0007/turn, p=0.0002; late-half slope +0.0149/turn vs +0.0025/turn, p=0.00004). A pre-registered robustness control (C1) found the monolithic per-trace slope is substantially explained by trace-length confound (p=0.56 after length regression), motivating the length-normalized early-half/late-half decomposition. Within-trace turn-order shuffle nulls (C2) confirm the U-shape is genuinely temporal (p<0.0001). The pattern is the inverse of cardiac uncoupling: in ICU literature, cross-vital decorrelation anticipates physiological decompensation; in LLM agents, cross-probe trajectories oscillate during successful reasoning (explore→consolidate) and remain flat during failure. We document the methodological discipline — pre-registered gates that caught both five prior single-probe walk-backs in the 36 hours before this finding and this paper's own headline-confound — that gives the rescued temporal claim its credibility.",
    artifacts: [
      { label: "Reproducibility data (HF dataset — all result JSONs)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-kappa-t-coherence-buildup" },
      { label: "run_kappa_t_v2.py / v3.py / controls.py / c6_length_controlled.py (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/scripts" },
      { label: "Paper PDF (Zenodo, DOI 10.5281/zenodo.20278983)", href: "https://zenodo.org/record/20278983" },
      { label: "SWE-bench harness (Phase 6 capture pipeline)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Companion: paper-MEGA conditionally-causal probes", href: "/research/papers/conditionally-causal-probes" },
      { label: "agent-probe-guard SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
    ],
    tags: ["cross-probe correlation", "meta-signal", "LLM agent monitoring", "SWE-bench Pro", "Qwen3.6-27B", "U-shape", "explore-consolidate", "pre-registration", "walk-back-and-rescue", "honest methodology", "temporal dynamics"],
  },
  {
    slug: "conditionally-causal-probes",
    title:
      "Conditionally-Causal Probes: Five Operational Constraints on Linear-Probe Causality in Qwen3.6-27B",
    subtitle:
      "An eleven-site empirical map, a unifying operational-constraints framework, and a pre-publication diagnostic battery — derived from four prior honest negatives",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "TMLR (Survey Certification) → ICLR 2027 main (draft v1)",
    status: "draft",
    date: "2026-05-16",
    abstract:
      "Linear probes on transformer residual streams routinely achieve high predictive AUROC, yet whether a probe direction also levers downstream behavior under intervention is rarely measured systematically. We report a twelve-site causal-authority map of probes in Qwen3.6-27B (reasoning-tuned, 27B parameters), comprising eleven probes evaluated under a unified α-sweep + control-token + onset-timing protocol plus one predictive case study, and identify five distinct empirical causal regimes: causal trajectory-shaping, pushup-asymmetric, pushdown-asymmetric, structurally-locked, and epiphenomenal-via-softmax-temperature. We propose that probe causality is operationally constrained by a five-axis configuration — layer (spatial), trajectory (temporal), magnitude (α), direction (saturation alignment), and decision locus (architectural) — and demonstrate each constraint with a within-paper falsifying experiment that holds the other four fixed. We then consolidate the methodology that surfaced these constraints into a six-item pre-publication diagnostic battery: random-feature baseline, shuffled-source baseline, control-token normalization, structural-rigidity α-sweep, whitespace-stripped flip metric, and onset-timing sweep. Each diagnostic is mapped to a concrete failure mode we shipped or nearly shipped in our own work: over-parameterization at N<100, marginal-fit pathology in sparse top-k prediction, softmax-temperature artifacts that look causal, amplitude-null masquerading as structural-null, tokenization-inflated flip rates, and trajectory-versus-state confusion. Together the diagnostics cost under one GPU-hour per probe. We release the protocol, capture batches, per-probe verdicts, and an open-source SDK that implements the diagnostics, and argue that the field's growing reliance on probe-based monitoring, reward shaping, and alignment auditing should treat probe causality as a conditional property to be measured per deployment configuration, not a global per-probe attribute.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/conditionally-causal-probes.pdf" },
      { label: "Verification data — 69 raw JSONs backing every claim (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-paper-mega-conditionally-causal" },
      { label: "verify_paper_mega_claims.py — re-derive 19 claims, 19/19 PASS (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/scripts/verify_paper_mega_claims.py" },
      { label: "paper_mega_figures.py — regenerate 3 figures (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/scripts/paper_mega_figures.py" },
      { label: "Paper-3 (PSAE marginal-fit, D2 motivating case)", href: "/research/papers/marginal-fit-pathology-psae" },
      { label: "Paper-5 (saturation-direction, C4 foundation)", href: "/research/papers/saturation-direction-probe-levers" },
      { label: "Paper-6 (two-forms epiphenomenal, C5 + D3 + D4)", href: "/research/papers/two-forms-epiphenomenal-probes" },
      { label: "Paper-7 (NLA two-tier, cross-model corroboration)", href: "/research/papers/nla-two-tier-verbalization" },
      { label: "Paper-8 (trajectory-shaping, C1 + C2 + D6)", href: "/research/papers/probe-guided-anti-overthinking" },
      { label: "agent-probe-guard SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
      { label: "SWE-bench harness (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Qwen3.6-27B paper-grade SAEs (HF)", href: "https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade" },
      { label: "PSAE marginal-fit data (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-psae-v15-marginal-fit-pathology" },
    ],
    tags: ["meta-paper", "probe causality taxonomy", "operational constraints", "pre-publication diagnostics", "Qwen3.6-27B", "honest negatives", "saturation direction", "trajectory-shaping", "template-lock", "marginal-fit pathology", "softmax-temperature artifact", "mechanistic interpretability methodology"],
  },
  {
    slug: "probe-guided-anti-overthinking",
    title: "Trajectory-Shaping Probe Steering in Qwen3.6-27B Reasoning",
    subtitle:
      "Causal, Cross-Domain, and KV-Cache-Bound — a Subjective-Time Direction with Operational Constraints",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft v2.1)",
    status: "draft",
    date: "2026-05-16",
    abstract:
      "We identify a causally functional subjective-time direction in the residual stream of Qwen3.6-27B (open-weights, 27B parameters, hybrid Gated-Delta-Net plus standard attention), validate it across math (GSM8K) and code (SWE-bench Verified) reasoning, and characterize a fundamental operational constraint on its causal effect: the steering intervention works only when applied continuously from generation start. A Ridge regression probe trained on residuals at L11/L31/L55 predicts thinking-phase completion with R²=0.82-0.86 (Spearman ρ ≥ 0.90); three baselines (random-feature, shuffled-target, constant-mean) cleanly fail. Forward-hook steering at L31 with α=+50 from token 1 shortens GSM8K thinking-length in 9/14 prompts vs 2/14 for matched random (Fisher p=0.0092). Cross-domain: 19/20 (95%) probe-clean-termination on SWE-bench Verified across 6 repositories vs 6/20 (30%) random (Fisher p<0.001), at mean 299 thinking-tokens vs unbounded baselines (0/10 terminate even at MAX_NEW_TOK=2048). The mechanism is trajectory-dependent: delayed steering — even at decode step 50 — drops termination from 9/10 to 3/10; by step 200, the rescue effect vanishes entirely (0/10). Two closed-loop variants (probe-as-sensor with threshold trigger + plateau detector) achieve only 1-2/10 termination, confirming that the 'termination basin' is mediated through KV-cache state buildup rather than instantaneous residual perturbation. Phase 2C cross-layer test further establishes that the direction is causal ONLY at L31 — L11 (R²=0.84) and L55 (R²=0.82) are inert despite equivalent probe accuracy. This refines the probe-causality taxonomy with a third category beyond 'causal' / 'epiphenomenal': operationally-constrained causal — directions that lever behavior only under specific application protocols (temporal: from token 1; spatial: specific layer only).",
    artifacts: [
      { label: "Paper PDF", href: "/papers/probe-guided-anti-overthinking.pdf" },
      { label: "Phase 2A steering notebook", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/nb_subjective_time_phase2a_steering.ipynb" },
      { label: "Phase 2B design exploration notebook", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/nb_subjective_time_phase2b_steering_designs.ipynb" },
      { label: "Phase 2C cross-layer notebook", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/nb_subjective_time_phase2c_cross_layer_kv_cache.ipynb" },
      { label: "Reproduction guide (Phase 2B)", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/REPRODUCTION_subjective_time_phase2b.md" },
      { label: "Cached residuals (HF dataset, 43 MB)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-psae-v15-marginal-fit-pathology" },
      { label: "agent-probe-guard SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
      { label: "Companion: paper-3 marginal-fit pathology", href: "/research/papers/marginal-fit-pathology-psae" },
      { label: "Companion: paper-6 two forms epiphenomenal", href: "/research/papers/two-forms-epiphenomenal-probes" },
    ],
    tags: ["probe steering", "trajectory-dependent", "KV-cache", "subjective time", "Qwen3.6-27B", "causal interpretability", "anti-overthinking", "honest negative", "closed-loop"],
  },
  {
    slug: "marginal-fit-pathology-psae",
    title: "The Marginal-Fit Pathology in Predictive SAE Feature Trajectory Probes",
    subtitle:
      "An Honest-Negative on Predicting End-of-Thinking SAE Features in Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-16",
    abstract:
      "We train linear probes to predict end-of-thinking sparse-autoencoder (SAE) features in Qwen3.6-27B from residual activations at earlier thinking-phase fractions, across three layers (L11, L31, L55). Naive evaluation reports recall@1024 = 0.83-0.87 at L11/L31 and 0.67-0.72 at L55. We then run a shuffled-source baseline (X_train shuffled, y_train kept, identical recipe) and observe that the baseline reproduces the real recall within ±0.03 at all 12 (layer × source-fraction) sites, with Cohen's d < 0.15. A trivial constant baseline that predicts the top-M most-globally-common features ignoring input strictly exceeds the trained probe (1.000 at L11/L31, 0.991 at L55). The probe is not learning per-prompt predictive structure — it is fitting the marginal distribution of end-of-thinking SAE features and approximating an input-independent constant rule. We name this the marginal-fit pathology, identify five structural conditions that produce it (sparse top-k target + concentrated marginal + N_train << d_target + lazy loss + recall-style metric), contribute the shuffled-source baseline as a Phase 6c-class hard rule for sparse-target probe-prediction work, and reframe predictive-probe agendas — including JEPA-shaped LLM experiments — toward differential metrics (REAL − SHUFFLED) from day one rather than absolute recall.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/marginal-fit-pathology-psae.pdf" },
      { label: "Baseline notebook", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/nb_predictive_sae_v15_baseline.ipynb" },
      { label: "Cached residuals + features (HF dataset, 43 MB)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-psae-v15-marginal-fit-pathology" },
      { label: "Qwen3.6-27B paper-grade SAEs (Apache-2.0)", href: "https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade" },
      { label: "Companion: paper-6 two forms epiphenomenal", href: "/research/papers/two-forms-epiphenomenal-probes" },
    ],
    tags: ["sparse autoencoders", "predictive probes", "honest negative", "marginal-fit pathology", "shuffled-source baseline", "Qwen3.6-27B", "methodology", "JEPA"],
  },
  {
    slug: "nla-two-tier-verbalization",
    title: "Reconstruction Without Recall",
    subtitle:
      "Two-Tier Verbalization in Natural Language Autoencoders — Three-Model Differential Scaling on Qwen2.5-7B, Gemma-3-12B, and Gemma-3-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Natural Language Autoencoders (Fraser-Taliente et al. 2026) train an activation-verbalizer (AV) and an activation-reconstructor (AR) end-to-end with GRPO so that round-trip MSE between original and AR-reconstructed activations serves as a learnable explanation-quality reward. We replicate the canonical recipe on three NLA pairs from the kitft release spanning two model families and three scales — kitft/nla-qwen2.5-7b-L20, kitft/nla-gemma3-12b-L32, and kitft/nla-gemma3-27b-L41 — and show that the headline metric, fve_nrm, decouples from semantic content fidelity across all three models, with three differential scaling axes that sharpen the methodological position. On a 50-prompt corpus across 4 categories (chat / code / agent / reasoning) at K=3 samples (N=150 per model), fve_nrm is uniform at high absolute level (Qwen 0.880 / Gemma-12B 0.992 / Gemma-27B 0.982; spreads 0.017 / 0.005 / 0.010) while keyword recall varies 6.5–8.8× across categories (Qwen spread 0.490 → Gemma-12B 0.649 → Gemma-27B 0.654). The trajectory reveals: (a) overall content-fidelity signal-above-floor grows monotonically with NLA training quality (permutation gap +0.27 → +0.38 → +0.43, no ceiling visible); (b) per-category recall spread saturates between 12B and 27B at a training-distribution-imbalance ceiling; (c) Tier 1 fve_nrm peaks at moderate model size then slight regression at 27B, suggesting layer-extraction-dependent quality. Three controls validate on all three: permutation, random Gaussian (collapse to fve_nrm = −0.949 → −0.992 → −1.000 with exact orthogonal cosine, while AV produces increasingly contracted format templates from heterogeneous formats to single 'Educational article' hyper-template attractor), and direction-injection (4/4, 3/4, 3/4 self-category alignment with negation symmetry — agent failure mode model-specific: Gemma-12B agent → code, Gemma-27B agent → chat under format-prior contraction). Two-tier thesis: Tier 1 (format/category) is direction-modulated and what fve_nrm measures; Tier 2 (specific content) is largely unencoded. Better NLA training makes fve_nrm less, not more, informative about per-category Tier 2 quality.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/nla-two-tier-verbalization.pdf" },
      { label: "V1 notebook — Qwen2.5-7B-L20", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_track_a_phase16_decoupling.ipynb" },
      { label: "V2 notebook — Gemma-3-12B-L32 cross-model", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_track_a_phase16_gemma_crossmodel.ipynb" },
      { label: "V3 notebook — Gemma-3-27B-L41 within-family scaling", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_track_a_phase16_gemma27b_v3.ipynb" },
      { label: "kitft NLA Qwen2.5-7B-L20 AV (HF)", href: "https://huggingface.co/kitft/nla-qwen2.5-7b-L20-av" },
      { label: "kitft NLA Qwen2.5-7B-L20 AR (HF)", href: "https://huggingface.co/kitft/nla-qwen2.5-7b-L20-ar" },
      { label: "kitft NLA Gemma-3-12B-L32 AV (HF)", href: "https://huggingface.co/kitft/nla-gemma3-12b-L32-av" },
      { label: "kitft NLA Gemma-3-12B-L32 AR (HF)", href: "https://huggingface.co/kitft/nla-gemma3-12b-L32-ar" },
      { label: "kitft NLA Gemma-3-27B-L41 AV (HF)", href: "https://huggingface.co/kitft/nla-gemma3-27b-L41-av" },
      { label: "kitft NLA Gemma-3-27B-L41 AR (HF)", href: "https://huggingface.co/kitft/nla-gemma3-27b-L41-ar" },
      { label: "Reproducibility data (HF dataset — all 3 models)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-paper7-nla-two-tier-verbalization" },
      { label: "Anthropic NLA paper", href: "https://transformer-circuits.pub/2026/nla/index.html" },
      { label: "kitft/nla-inference (canonical recipe)", href: "https://github.com/kitft/nla-inference" },
    ],
    tags: ["natural language autoencoders", "activation decoding", "interpretability evaluation", "format priors", "decoupling magnification", "differential scaling", "format-prior contraction", "three-model validation", "Qwen2.5-7B", "Gemma-3-12B", "Gemma-3-27B", "Anthropic NLA"],
  },
  {
    slug: "activation-bounded-cot-monitorability",
    title: "Activation-Bounded Chain-of-Thought Monitorability",
    subtitle:
      "Template-locked reasoning decisions and the structural ceiling on text-only CoT monitoring in Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "Position paper, May 2026",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Chain-of-thought monitoring has emerged as a leading candidate for scalable AI safety oversight: if a long, serial reasoning process must pass through a textual trace, then reading that trace should reveal what the model is thinking. We argue this view is structurally incomplete in instruction-tuned reasoning models. The chat template that activates thinking mode in Qwen3.6-27B injects a fixed <think></think> token pair into the input itself; the decision to think at all is encoded in the prompt before the residual stream encodes anything else. We document this template-lock experimentally (bidirectional α-sweep up to ±200 in the L55 thinking probe direction produces zero behavioral change) and contrast it with three other reasoning loci where decisions are residual-stream-encoded and steerable: capability deployment (+33-40pp pushdown gap across distributions at α=−100), persona (+60pp pushdown at α=−200), and mid-reasoning quality (+30pp pushup at α=+200). We use this evidence to argue for an activation-derived monitorability bound: text-only CoT monitoring cannot, by construction, observe decisions made before the residual stream encodes them. Activation-derived monitoring is the structurally complementary half of any complete monitoring strategy. We discuss implications for the Frontier Model Forum's January 2026 issue brief and Anthropic's 2027 detection goal.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/activation-bounded-cot-monitorability.pdf" },
      { label: "Paper-5 (empirical foundation)", href: "https://openinterp.org/research/papers/saturation-direction-probe-levers" },
      { label: "SWE-bench harness (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Phase 8 template-lock notebook", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_swebench_v9_phase8_causal_cot.ipynb" },
      { label: "openinterp SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
    ],
    tags: ["chain-of-thought", "monitorability", "AI safety", "activation steering", "template-lock", "Qwen3.6-27B", "Frontier Model Forum"],
  },
  {
    slug: "saturation-direction-probe-levers",
    title: "Saturation-Direction Lever",
    subtitle:
      "A Five-Class Taxonomy of Probe Causality in Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Linear probes routinely achieve high predictive AUROC, yet their causal authority — whether their direction levers downstream behavior — has been only sparsely tested at frontier scale. We map probe causality across 8 probes (5 layers, 5 positions, 3 training-objective classes) on Qwen3.6-27B using a unified protocol combining bidirectional α-sweep up to α=±200, random K-matched control direction, control-token-normalized log-prob shifts, structural-rigidity diagnostic, and whitespace-stripped behavioral flip metric. We document five empirical classes of probe-causality regime and identify a single unifying principle — probes lever in the saturation direction of the baseline residual — that explains all observed asymmetric-lever cases including a falsified prediction. The classes are: (1) surface softmax-temperature artifact (L43 capability), (2) template-locked categorical decision (L55 thinking emission, L31 fabrication-detection), (3) structural fragility at fragile layers (L11/L43 think_start), (4a) pushup-asymmetric lever for reasoning quality at high amplitude (RG L55 mid_think, +30pp gap), and (4b) pushdown-asymmetric lever for capability and persona at high amplitude (5 sites, +30 to +60pp gap). We falsify the naive prediction that continuous-gradient probes lever in the pushup direction by demonstrating that persona — a continuous gradient — levers in the pushdown direction when the test prompt's baseline is in the helpful saturation region.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/saturation-direction-probe-levers.pdf" },
      { label: "SWE-bench harness (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Phase 11 capability locus notebook", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_swebench_v11_capability_locus.ipynb" },
      { label: "Phase 11b extension notebook", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_swebench_v11b_capability_locus_extension.ipynb" },
      { label: "Phase 12 persona-falsifier notebook", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_swebench_v12_persona_falsifier.ipynb" },
      { label: "Causal locus protocol spec", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/paper5_causal_locus_protocol.md" },
      { label: "Meta-analysis of probe AUROCs", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/paper5_causal_locus_meta_analysis.md" },
      { label: "openinterp SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
    ],
    tags: ["linear probes", "causal interpretability", "saturation direction", "asymmetric lever", "Qwen3.6-27B", "probe causality"],
  },
  {
    slug: "cosine-causal-gap-crosscoder",
    title: "The Cosine–Causal Gap in Cross-Model Crosscoders",
    subtitle:
      "When Decoder Universality Overstates Causal Equivalence in Gemma-2-2B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We provide the first per-feature empirical measurement of the gap between decoder cosine universality and causal-equivalence in cross-model crosscoders. Training a paper-grade BatchTopK crosscoder (73,728 latents, k=100) on Gemma-2-2B base/IT at layer 13, we measure Pearson correlation between two-model KL trajectories under per-feature ablation across 256 probes. Median decoder cosine 0.965 vs median Pearson_CE 0.616, with 38.24% of shared features having cosine > 0.7 yet CE < 0.5. Outliers in both tails — anti-aligned decoders with equivalent causal effect, and aligned decoders with opposite causal effect — show that cosine is neither necessary nor sufficient for causal equivalence. We propose Pearson_CE as a mandatory complementary diagnostic for crosscoder universality claims and release all artifacts under Apache-2.0.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/cosine-causal-gap-crosscoder.pdf" },
      { label: "Crosscoder weights (HF)", href: "https://huggingface.co/caiovicentino1/gemma2-2b-crosscoder-model-diff-papergrade" },
      { label: "Causal validation CSV (96 features)", href: "https://github.com/OpenInterpretability/openinterp-paper-pearson-ce-crosscoder/blob/main/data/gemma_causal_validation.csv" },
      { label: "Training notebook", href: "https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/17b_crosscoder_model_diff_papergrade.ipynb" },
      { label: "openinterp SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
    ],
    tags: ["crosscoders", "SAE", "universality", "causal equivalence", "Gemma-2", "Anthropic methodology"],
  },
  {
    slug: "probe-detected-grokking-dpo",
    title: "Probe-Detected Grokking in Multi-Probe DPO",
    subtitle:
      "Orthogonal Learning Beyond Task-Specific Detectors in Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We report a phase-transition-like dynamic in multi-probe Direct Preference Optimization on a 27B-parameter reasoning model, observable only through fresh probes trained after the fact. Original probes (FabricationGuard at L31, ReasoningGuard at L55) used as the joint preference signal remain invariant across training (variance 7×10⁻⁸, ~40× below within-step noise) despite a 0.234 DPO loss descent and 0.654 logit-difference. A fresh probe re-trained on each checkpoint reveals a smooth, accelerating progression in AUROC from 0.472 → 0.528 with a late-half-to-early-half slope ratio of 2.60 — the construct-then-compress signature of grokking dynamics, but with a compression target orthogonal to the original probes. We argue this is a structural Goodhart phenomenon specific to probe-derived rewards, propose fresh-probe AUROC progression as a complementary safety evaluation, and release training checkpoints, probes, and reproducer code under Apache-2.0.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/probe-detected-grokking-dpo.pdf" },
      { label: "Forward sweep dataset (HF)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-41v2-grokking-extended" },
      { label: "DPO training data (HF)", href: "https://huggingface.co/datasets/caiovicentino1/openinterp-37-multiprobe-dpo-full" },
      { label: "DPO checkpoints (HF)", href: "https://huggingface.co/caiovicentino1/openinterp-37v2-multiprobe-dpo-extended" },
      { label: "FabricationGuard probe", href: "https://huggingface.co/datasets/caiovicentino1/FabricationGuard-linearprobe-qwen36-27b" },
      { label: "openinterp SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
      { label: "Notebooks repo", href: "https://github.com/OpenInterpretability/notebooks" },
    ],
    tags: ["grokking", "DPO", "Goodhart", "probes", "Qwen3.6-27B", "phase transition"],
  },
  {
    slug: "two-forms-epiphenomenal-probes",
    title: "Two Forms of Epiphenomenal Probes in Code Agents",
    subtitle:
      "Mid-Reasoning Capability and Chain-of-Thought Emission in Qwen3.6-27B",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We train linear probes on residual-stream activations of Qwen3.6-27B and obtain two correlative findings (capability AUROC 0.83 at L43 pre_tool, CoT emission AUROC 0.85 at L55). Three intervention experiments show both are detection-only via two distinct mechanisms: softmax-temperature artifact (L43) and template-locked decision (L55). We contribute three sanity checks (random-K baseline, control-token normalization, structural-rigidity α-sweep) and ship agent-probe-guard, an Apache-2.0 SDK that markets the correlative finding without overclaiming. Cross-environment eval reveals probe weights are coupled to inference setup; v0.3.1 ships a refit() helper.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/two-forms-epiphenomenal-probes.pdf" },
      { label: "agent-probe-guard SDK (PyPI v0.3.1)", href: "https://pypi.org/project/openinterp/" },
      { label: "HF probe weights", href: "https://huggingface.co/datasets/caiovicentino1/agent-probe-guard-qwen36-27b" },
      { label: "Reproduction harness (GitHub)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Eval doc v6", href: "/research/papers/preflight-probe-eval-v6" },
    ],
    tags: ["linear probes", "code agents", "Qwen3.6-27B", "epiphenomenal", "methodology"],
  },
  {
    slug: "preflight-probe-eval-v6",
    title: "Pre-flight Probe Eval v6 — Phase 8 Template-Lock Verdict",
    subtitle: "Closing the L55 thinking-emission causality experiment",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "Internal eval document (companion to NeurIPS MI 2026 draft)",
    status: "published",
    date: "2026-05-08",
    abstract:
      "Phase 8 single-shot bidirectional steering with bf16 amplitude diagnostic delivers a structural-rigidity null that converges with Phase 7 on the higher-order claim: probes detect; mid-layer steering doesn't lever. Two epiphenomenal mechanisms documented (softmax-temp + template-lock), three methodology contributions consolidated (random-K baseline, control-token normalization, structural-rigidity α-sweep). Includes Phase 8 redux confirming structural lock isn't dilution.",
    tags: ["intervention experiments", "steering", "Qwen3.6-27B", "verdict"],
  },
  {
    slug: "six-diagnostics-six-walkbacks",
    title: "Six Diagnostics, Six Walk-Backs",
    subtitle:
      "An Operational Checklist for Causal Claims in Mechanistic Interpretability",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft v0.1)",
    status: "draft",
    date: "2026-05-19",
    abstract:
      "Mechanistic interpretability papers routinely make causal claims — that a linear probe is a causal lever, that a circuit mediates a behavior, that an SAE feature implements a concept — but rarely state the identification assumptions that make these claims falsifiable. A recent position paper (Bohnet et al., 2026) proposed a disclosure norm: state whether a claim is causal, name the identification strategy, enumerate assumptions, and demonstrate how conclusions shift if assumptions fail. We operationalize this norm as six diagnostics, each runnable in under one GPU-hour per probe, and demonstrate each on a published-or-near-published causal claim from our own prior work where the diagnostic would have falsified the claim if not run. One of the six — trace-length-controlled slope decomposition — has not previously been published as standalone methodology. We position the resulting checklist as the minimum-viable operational layer beneath theoretical frameworks for causal abstraction (Geiger et al., 2024) and causal scrubbing (Anthropic), and ship an open-source Python module, a Colab demonstration on a toy probe, and an integration with the ProbeBench leaderboard.",
    artifacts: [
      { label: "Paper PDF", href: "/papers/preflight-probe-eval-v6.pdf" },
      { label: "Colab demo notebook (6 toy diagnostics, ~3 min CPU)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/notebooks/nb_six_diagnostics_demo.ipynb" },
      { label: "Paper PDF (this repo)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/six_diagnostics_six_walkbacks.pdf" },
      { label: "Paper-MEGA (sibling: 12-site conditionally-causal map)", href: "/research/papers/conditionally-causal-probes" },
      { label: "κ_t paper (D6 case study source)", href: "/research/papers/kappa-t-coherence-buildup" },
      { label: "Two Forms Epiphenomenal Probes (D3 + D4 case study source)", href: "/research/papers/two-forms-epiphenomenal-probes" },
      { label: "Marginal-Fit Pathology PSAE (D2 case study source)", href: "/research/papers/marginal-fit-pathology-psae" },
      { label: "agent-probe-guard SDK (PyPI)", href: "https://pypi.org/project/openinterp/" },
      { label: "Position paper operationalized: Bohnet et al. 2026", href: "https://arxiv.org/abs/2605.08012" },
    ],
    tags: ["methodology checklist", "causal claims", "identification assumptions", "pre-registration", "walk-back-and-rescue", "random-feature baseline", "shuffled-source baseline", "control-token normalization", "structural-rigidity α-sweep", "whitespace-stripped flip", "trace-length-controlled slope", "operational disclosure", "Qwen3.6-27B", "mechanistic interpretability methodology"],
  },
  {
    slug: "wandering-l11-right-locus",
    title:
      "Causal Localization of Agent WANDERING to Edge-Layer L11: The Right Locus Is Still Not a Rescue Lever",
    subtitle:
      "Three causal nulls and a dose-dependent destabilization at WANDERING's strongest detector locus",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "Zenodo · CC-BY-4.0 · DOI 10.5281/zenodo.20490278",
    status: "published",
    date: "2026-06-01",
    abstract:
      "We report three causal tests of the Tool-Entropy WANDERING mechanism hypothesis (mid-layer verdict consolidated, edge-layer alignment fails) on Qwen3.6-27B SWE-bench Pro trajectories, and all three are null on rescuing WANDERING. A forced-finish counterfactual rules out silent success (Fisher p=0.71); always-on L55 SUCCESS-donor steering is behaviorally inert (p=1.00); and re-targeting the injection to L11 — the edge layer the companion classification paper flags as WANDERING's strongest discriminator — across a norm-matched magnitude sweep does not rescue either (paired McNemar p=0.73). The one robust effect is the opposite of a rescue: at high magnitude the L11 hook destabilizes the model into invalid tool calls (0/20 → 12/20). We also surface a load-bearing methodological finding: WANDERING is not run-stable at temperature 1.0 (the same instances flip finish 7/20 with no intervention), so every intervention test must be paired and the unpaired 0/20 baseline manufactures a false positive.",
    artifacts: [
      { label: "Paper PDF + permanent DOI (Zenodo, CC-BY-4.0)", href: "https://doi.org/10.5281/zenodo.20490278" },
      { label: "Code — SWE-bench harness (GitHub, Apache-2.0)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Arc PDFs mirror (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers" },
      { label: "Companion — Tool-Entropy Collapse (#1)", href: "https://doi.org/10.5281/zenodo.20368601" },
    ],
    tags: ["agent WANDERING", "causal localization", "activation steering", "honest negatives", "Qwen3.6-27B", "SWE-bench Pro", "run-instability"],
  },
  {
    slug: "multichannel-wandering-signatures",
    title:
      "Multi-Channel Mechanistic Signatures of Agent WANDERING: Classification, Causal Localization, and Behavior-Legible Response to Intervention",
    subtitle:
      "60 multi-channel features, a mid-to-edge mechanism, and a residual-blind / behavior-legible response signal",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "Zenodo · CC-BY-4.0 · DOI 10.5281/zenodo.20490284",
    status: "published",
    date: "2026-06-01",
    abstract:
      "WANDERING — an LLM agent stays internally confident it has solved a task yet never emits a termination action and exhausts its turn budget — is a 34% blind spot in probe-based agent monitoring. We characterize it mechanistically on N=99 Qwen3.6-27B SWE-bench Pro trajectories: 60 multi-channel features (text, tool-use, per-layer residual, temporal) classify SUCCESS/LOCKED/WANDERING at macro-F1 0.636 (z=5.88, p=0.001), after a transparent walk-back from a leaky 0.987 baseline. Stability selection independently recovers a mid-to-edge mechanism (LOCKED→L43, WANDERING→L11), and an LLM-judge bridge to a human taxonomy co-locates ≈60% of both LOCKED and WANDERING into one category, matching a mechanistically weak boundary (p=0.035). Finally, the residual signature does not predict which agents flip to finish under a companion L11 injection run (LOO-AUC 0.619), but tool-entropy collapse depth does (AUC 0.768): response to intervention is residual-blind but behavior-legible.",
    artifacts: [
      { label: "Paper PDF + permanent DOI (Zenodo, CC-BY-4.0)", href: "https://doi.org/10.5281/zenodo.20490284" },
      { label: "Code + 60-feature matrix + labels (GitHub, Apache-2.0)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Trajectories + residuals (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6" },
      { label: "Arc PDFs mirror (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers" },
    ],
    tags: ["agent WANDERING", "multi-channel classification", "stability selection", "human-taxonomy bridge", "tool-entropy", "Qwen3.6-27B", "SWE-bench Pro"],
  },
  {
    slug: "modality-matters-behavioral-interruption",
    title:
      "Modality Matters: A Transient Behavioral Interruption Rescues Agent WANDERING Where Residual Steering Does Not",
    subtitle:
      "The predictive signal is residual; the causal lever is behavioral — the first positive of the WANDERING arc",
    authors: "Caio Vicentino",
    orcid: CAIO_ORCID,
    venue: "Zenodo · CC-BY-4.0 · DOI 10.5281/zenodo.20490286",
    status: "published",
    date: "2026-06-01",
    abstract:
      "A multi-turn coding agent fails in a distinctive way we call WANDERING: it keeps acting but never emits the finish action, exhausting its turn budget. A companion line of work detects WANDERING from a residual-stream signature and a tool-entropy signal, but three pre-registered residual interventions (SUCCESS-direction injection at L55 and at L11) all fail to rescue it. We ask whether the missing lever is not the locus but the modality. On the same 20 WANDERING Qwen3.6-27B SWE-bench Pro trajectories, gated by the same live tool-entropy collapse detector, a transient behavioral interruption — one fresh user turn at the collapse point — roughly doubles finalization (30%→70%, paired McNemar p=0.021), while residual L11 injection stays inert (p=0.63). The lever is the interruption itself, not its content: a content-neutral message rescues as well as a re-plan (p=1.0). SWE-bench Pro Docker evaluation suggests the interruption also raises task solve-rate (~23%→50%, cross-session). For long-horizon agents the predictive signal lives in the residual stream but the causal lever lives in behavior.",
    artifacts: [
      { label: "Paper PDF + permanent DOI (Zenodo, CC-BY-4.0)", href: "https://doi.org/10.5281/zenodo.20490286" },
      { label: "Code — behavioral loop + 4-arm experiment (GitHub, Apache-2.0)", href: "https://github.com/OpenInterpretability/openinterp-swebench-harness" },
      { label: "Arc PDFs mirror (HF dataset)", href: "https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers" },
      { label: "Companion — The Right Locus null (#2)", href: "https://doi.org/10.5281/zenodo.20490278" },
    ],
    tags: ["agent WANDERING", "behavioral intervention", "course-correction", "detection-intervention asymmetry", "tool-entropy", "Qwen3.6-27B", "SWE-bench Pro"],
  },
];

export function getPaper(slug: string): PaperMeta | undefined {
  return papers.find((p) => p.slug === slug);
}

export const paperCount = papers.length;
