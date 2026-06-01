# Causal Localization of Agent WANDERING to Edge-Layer L11
### The Right Locus Is Still Not a Rescue Lever

**Caio Vicentino · OpenInterpretability · Published 2026-06-01.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20490278](https://doi.org/10.5281/zenodo.20490278).**

> Paper #2 of the WANDERING arc. The full PDF (with all tables, the per-instance appendices, and the compute budget) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20490278)** — this page is the on-site summary.

---

## Abstract

We report three causal tests of the Tool-Entropy WANDERING mechanism hypothesis (mid-layer verdict consolidated, edge-layer alignment fails) on Qwen3.6-27B SWE-bench Pro trajectories, and **all three are null on rescuing WANDERING**. A forced-finish counterfactual rules out silent success (Fisher *p*=0.71); always-on L55 SUCCESS-donor steering is behaviorally inert (*p*=1.00); and re-targeting the injection to **L11** — the edge layer the companion classification paper flags as WANDERING's strongest *discriminator* — across a norm-matched magnitude sweep does not rescue either (paired McNemar *p*=0.73). The one robust effect is the opposite of a rescue: at high magnitude the L11 hook destabilizes the model into invalid tool calls (0/20 → 12/20). We also surface a load-bearing methodological finding: WANDERING is **not run-stable** at temperature 1.0 — the same instances flip `finish_tool` 7/20 with no intervention — so every intervention test must be paired and the unpaired 0/20 baseline manufactures a false positive.

## Why it matters

The companion **Tool-Entropy Collapse** paper showed WANDERING is *detectable* at the residual stream. The natural next hope is that the detector locus is also a *lever* — fix the layer where the signal is strongest and you fix the failure. This paper closes that door at both edge layers tested: the SUCCESS direction **detects** WANDERING without being able to **fix** it, even at the layer where detection is strongest. Correcting the locus did not convert the null.

## Key results

- **Exp D — forced-finish counterfactual:** WANDERING agent-patch pass 21.1% (4/19) vs SUCCESS 15.4% (6/39); OR 1.47, Fisher *p*=0.71. Rules out "silent success."
- **Exp B — always-on L55 SUCCESS-donor steering:** primary 6/20 vs paired no-hook 7/20; Fisher *p*=1.00, paired McNemar *p*=1.00 (point estimate slightly favors the baseline).
- **Exp L11 — norm-matched α-sweep at the strongest detector locus:** paired McNemar *p*=0.73 (null). A naive Fisher against the *definitional* 0/20 baseline reads *p*=0.02 — **the wrong test**, invalidated by run-instability.
- **The one robust effect** is a dose-dependent destabilization: `invalid_tools` 0/20 at α=0.70 → 12/20 (60%) at α=1.15. L11 injection plainly *reaches* behavior — but pushes toward incoherence, not completion.
- **Methodological:** under temperature 1.0, WANDERING labels are not run-stable; pairing is mandatory.

## Code & data

- Code (Apache-2.0): [openinterp-swebench-harness](https://github.com/OpenInterpretability/openinterp-swebench-harness)
- Trajectories + residuals: [caiovicentino1/swebench-pro-qwen36-27b-phase6](https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6)
- Arc PDFs: [caiovicentino1/wandering-arc-papers](https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers)
- Companion #1 — Tool-Entropy Collapse: [DOI 10.5281/zenodo.20368601](https://doi.org/10.5281/zenodo.20368601)
