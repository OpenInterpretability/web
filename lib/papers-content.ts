// Paper registry — full markdown content hosted on the site.
// Each entry corresponds to a file in /content/papers/<slug>.md.

export interface PaperMeta {
  slug: string;
  title: string;
  subtitle?: string;
  authors: string;
  venue: string;
  status: "draft" | "in-review" | "submitted" | "published";
  date: string; // ISO yyyy-mm-dd
  abstract: string;
  artifacts?: { label: string; href: string }[];
  tags?: string[];
}

export const papers: PaperMeta[] = [
  {
    slug: "nla-two-tier-verbalization",
    title: "Reconstruction Without Recall",
    subtitle:
      "Two-Tier Verbalization in Natural Language Autoencoders — Three-Model Differential Scaling on Qwen2.5-7B, Gemma-3-12B, and Gemma-3-27B",
    authors: "Caio Vicentino",
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Natural Language Autoencoders (Fraser-Taliente et al. 2026) train an activation-verbalizer (AV) and an activation-reconstructor (AR) end-to-end with GRPO so that round-trip MSE between original and AR-reconstructed activations serves as a learnable explanation-quality reward. We replicate the canonical recipe on three NLA pairs from the kitft release spanning two model families and three scales — kitft/nla-qwen2.5-7b-L20, kitft/nla-gemma3-12b-L32, and kitft/nla-gemma3-27b-L41 — and show that the headline metric, fve_nrm, decouples from semantic content fidelity across all three models, with three differential scaling axes that sharpen the methodological position. On a 50-prompt corpus across 4 categories (chat / code / agent / reasoning) at K=3 samples (N=150 per model), fve_nrm is uniform at high absolute level (Qwen 0.880 / Gemma-12B 0.992 / Gemma-27B 0.982; spreads 0.017 / 0.005 / 0.010) while keyword recall varies 6.5–8.8× across categories (Qwen spread 0.490 → Gemma-12B 0.649 → Gemma-27B 0.654). The trajectory reveals: (a) overall content-fidelity signal-above-floor grows monotonically with NLA training quality (permutation gap +0.27 → +0.38 → +0.43, no ceiling visible); (b) per-category recall spread saturates between 12B and 27B at a training-distribution-imbalance ceiling; (c) Tier 1 fve_nrm peaks at moderate model size then slight regression at 27B, suggesting layer-extraction-dependent quality. Three controls validate on all three: permutation, random Gaussian (collapse to fve_nrm = −0.949 → −0.992 → −1.000 with exact orthogonal cosine, while AV produces increasingly contracted format templates from heterogeneous formats to single 'Educational article' hyper-template attractor), and direction-injection (4/4, 3/4, 3/4 self-category alignment with negation symmetry — agent failure mode model-specific: Gemma-12B agent → code, Gemma-27B agent → chat under format-prior contraction). Two-tier thesis: Tier 1 (format/category) is direction-modulated and what fve_nrm measures; Tier 2 (specific content) is largely unencoded. Better NLA training makes fve_nrm less, not more, informative about per-category Tier 2 quality.",
    artifacts: [
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
    venue: "Position paper, May 2026",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Chain-of-thought monitoring has emerged as a leading candidate for scalable AI safety oversight: if a long, serial reasoning process must pass through a textual trace, then reading that trace should reveal what the model is thinking. We argue this view is structurally incomplete in instruction-tuned reasoning models. The chat template that activates thinking mode in Qwen3.6-27B injects a fixed <think></think> token pair into the input itself; the decision to think at all is encoded in the prompt before the residual stream encodes anything else. We document this template-lock experimentally (bidirectional α-sweep up to ±200 in the L55 thinking probe direction produces zero behavioral change) and contrast it with three other reasoning loci where decisions are residual-stream-encoded and steerable: capability deployment (+33-40pp pushdown gap across distributions at α=−100), persona (+60pp pushdown at α=−200), and mid-reasoning quality (+30pp pushup at α=+200). We use this evidence to argue for an activation-derived monitorability bound: text-only CoT monitoring cannot, by construction, observe decisions made before the residual stream encodes them. Activation-derived monitoring is the structurally complementary half of any complete monitoring strategy. We discuss implications for the Frontier Model Forum's January 2026 issue brief and Anthropic's 2027 detection goal.",
    artifacts: [
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
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-09",
    abstract:
      "Linear probes routinely achieve high predictive AUROC, yet their causal authority — whether their direction levers downstream behavior — has been only sparsely tested at frontier scale. We map probe causality across 8 probes (5 layers, 5 positions, 3 training-objective classes) on Qwen3.6-27B using a unified protocol combining bidirectional α-sweep up to α=±200, random K-matched control direction, control-token-normalized log-prob shifts, structural-rigidity diagnostic, and whitespace-stripped behavioral flip metric. We document five empirical classes of probe-causality regime and identify a single unifying principle — probes lever in the saturation direction of the baseline residual — that explains all observed asymmetric-lever cases including a falsified prediction. The classes are: (1) surface softmax-temperature artifact (L43 capability), (2) template-locked categorical decision (L55 thinking emission, L31 fabrication-detection), (3) structural fragility at fragile layers (L11/L43 think_start), (4a) pushup-asymmetric lever for reasoning quality at high amplitude (RG L55 mid_think, +30pp gap), and (4b) pushdown-asymmetric lever for capability and persona at high amplitude (5 sites, +30 to +60pp gap). We falsify the naive prediction that continuous-gradient probes lever in the pushup direction by demonstrating that persona — a continuous gradient — levers in the pushdown direction when the test prompt's baseline is in the helpful saturation region.",
    artifacts: [
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
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We provide the first per-feature empirical measurement of the gap between decoder cosine universality and causal-equivalence in cross-model crosscoders. Training a paper-grade BatchTopK crosscoder (73,728 latents, k=100) on Gemma-2-2B base/IT at layer 13, we measure Pearson correlation between two-model KL trajectories under per-feature ablation across 256 probes. Median decoder cosine 0.965 vs median Pearson_CE 0.616, with 38.24% of shared features having cosine > 0.7 yet CE < 0.5. Outliers in both tails — anti-aligned decoders with equivalent causal effect, and aligned decoders with opposite causal effect — show that cosine is neither necessary nor sufficient for causal equivalence. We propose Pearson_CE as a mandatory complementary diagnostic for crosscoder universality claims and release all artifacts under Apache-2.0.",
    artifacts: [
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
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We report a phase-transition-like dynamic in multi-probe Direct Preference Optimization on a 27B-parameter reasoning model, observable only through fresh probes trained after the fact. Original probes (FabricationGuard at L31, ReasoningGuard at L55) used as the joint preference signal remain invariant across training (variance 7×10⁻⁸, ~40× below within-step noise) despite a 0.234 DPO loss descent and 0.654 logit-difference. A fresh probe re-trained on each checkpoint reveals a smooth, accelerating progression in AUROC from 0.472 → 0.528 with a late-half-to-early-half slope ratio of 2.60 — the construct-then-compress signature of grokking dynamics, but with a compression target orthogonal to the original probes. We argue this is a structural Goodhart phenomenon specific to probe-derived rewards, propose fresh-probe AUROC progression as a complementary safety evaluation, and release training checkpoints, probes, and reproducer code under Apache-2.0.",
    artifacts: [
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
    venue: "NeurIPS 2026 Mechanistic Interpretability Workshop (draft)",
    status: "draft",
    date: "2026-05-08",
    abstract:
      "We train linear probes on residual-stream activations of Qwen3.6-27B and obtain two correlative findings (capability AUROC 0.83 at L43 pre_tool, CoT emission AUROC 0.85 at L55). Three intervention experiments show both are detection-only via two distinct mechanisms: softmax-temperature artifact (L43) and template-locked decision (L55). We contribute three sanity checks (random-K baseline, control-token normalization, structural-rigidity α-sweep) and ship agent-probe-guard, an Apache-2.0 SDK that markets the correlative finding without overclaiming. Cross-environment eval reveals probe weights are coupled to inference setup; v0.3.1 ships a refit() helper.",
    artifacts: [
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
    venue: "Internal eval document (companion to NeurIPS MI 2026 draft)",
    status: "published",
    date: "2026-05-08",
    abstract:
      "Phase 8 single-shot bidirectional steering with bf16 amplitude diagnostic delivers a structural-rigidity null that converges with Phase 7 on the higher-order claim: probes detect; mid-layer steering doesn't lever. Two epiphenomenal mechanisms documented (softmax-temp + template-lock), three methodology contributions consolidated (random-K baseline, control-token normalization, structural-rigidity α-sweep). Includes Phase 8 redux confirming structural lock isn't dilution.",
    tags: ["intervention experiments", "steering", "Qwen3.6-27B", "verdict"],
  },
];

export function getPaper(slug: string): PaperMeta | undefined {
  return papers.find((p) => p.slug === slug);
}

export const paperCount = papers.length;
