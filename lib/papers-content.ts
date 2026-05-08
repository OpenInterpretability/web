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
