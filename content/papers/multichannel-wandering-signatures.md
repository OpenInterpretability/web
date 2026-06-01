# Multi-Channel Mechanistic Signatures of Agent WANDERING
### Classification, Causal Localization, and Behavior-Legible Response to Intervention

**Caio Vicentino · OpenInterpretability · Published 2026-06-01.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20490284](https://doi.org/10.5281/zenodo.20490284).**

> Paper #3 of the WANDERING arc. The full PDF is the **[Zenodo record](https://doi.org/10.5281/zenodo.20490284)** — this page is the on-site summary.

---

## Abstract

WANDERING — an LLM agent stays internally confident it has solved a task yet never emits a termination action and exhausts its turn budget — is a 34% blind spot in probe-based agent monitoring. We characterize it mechanistically on N=99 Qwen3.6-27B SWE-bench Pro trajectories: 60 multi-channel features (text, tool-use, per-layer residual, temporal) classify SUCCESS/LOCKED/WANDERING at **macro-F1 0.636** (*z*=5.88, *p*=0.001), after a transparent walk-back from a leaky 0.987 baseline. Stability selection independently recovers a **mid-to-edge mechanism** (LOCKED→L43 mid-layer convergence, WANDERING→L11 edge-layer drift), and an LLM-judge bridge to a human taxonomy co-locates ≈60% of both LOCKED and WANDERING into one category, matching a mechanistically weak boundary (*p*=0.035). Finally, the residual signature does **not** predict which agents flip to finish under a companion L11 injection run (LOO-AUC 0.619), but **tool-entropy collapse depth does** (AUC 0.768): response to intervention is residual-blind but behavior-legible.

## Key results

- **3-way classifier:** macro-F1 0.636 ± 0.035 (*z*=+5.88, *p*=0.001 vs a 1000-permutation null). SUCCESS is cleanly separable (AUROC 1.0, tool diversity); the LOCKED–WANDERING boundary is mechanistically weak (*p*=0.035).
- **Honest walk-back:** an initial leaky baseline hit F1=0.987 using definitional / termination-proxy features; we report both and explain the leakage.
- **Independent mechanism confirmation:** stability selection — using none of the companion paper's detector designs — recovers L43-for-LOCKED and L11-for-WANDERING. Effect sizes are robust but small (2–3 percentage points in cosine).
- **Human-taxonomy bridge:** ≈60% of both LOCKED and WANDERING map to one text category ("Non-Progressive Iteration") — a text-based taxonomy can't separate what the internals say is a continuum.
- **Behavior-legible response:** the residual signature does not predict which agents flip under a companion L11 injection (LOO-AUC 0.619, *p*=0.16); tool-entropy collapse depth does (AUC 0.768, *p*≈0.06). The cheaper, behavioral channel is the one that indexes who responds.

## Code & data

- Code + 60-feature matrix + labels (Apache-2.0): [openinterp-swebench-harness](https://github.com/OpenInterpretability/openinterp-swebench-harness)
- Trajectories + residuals: [caiovicentino1/swebench-pro-qwen36-27b-phase6](https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6)
- Arc PDFs: [caiovicentino1/wandering-arc-papers](https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers)
- Companion #1 — Tool-Entropy Collapse: [DOI 10.5281/zenodo.20368601](https://doi.org/10.5281/zenodo.20368601)
