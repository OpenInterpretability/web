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
