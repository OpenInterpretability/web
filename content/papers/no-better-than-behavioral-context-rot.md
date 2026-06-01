# No Better Than Behavioral
### A Residual Velocity-Freezing Fingerprint Predicts Agent WANDERING No Better Than the Cheap Tool-Entropy Detector

**Caio Vicentino · OpenInterpretability · Published 2026-06-01.**
**Companion note to the WANDERING arc · CC-BY-4.0 · [Note PDF + pre-registration + code (GitHub)](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/context_rot).**

> A pre-registered negative attached to the four-paper WANDERING arc. The full note (with both result tables and the pre-registration) is the **[PDF on GitHub](https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/context_rot/no_better_than_behavioral.pdf)** — this page is the on-site summary.

---

## The question

The WANDERING arc detects a long-horizon agent failure — an agent that keeps acting but never finalizes — from a **probe-free behavioral signal** (tool-call entropy collapse), and shows that residual steering cannot rescue it while a behavioral interruption can. A skeptic's next question, sharpened by the *context-rot* literature (long-context degradation is **representational, not retrieval** — [arXiv:2510.05381](https://arxiv.org/abs/2510.05381)): does the residual stream carry an **earlier or better detector** than the cheap behavioral one? Does the geometry rot before the behavior does? If yes, activation capture earns its cost. If no, the cheap signal is not just convenient — it's sufficient. We pre-registered the test before looking.

## What we found

**Stage 1 — a real but weak fingerprint exists.** On the same 99 Qwen3.6-27B SWE-bench Pro trajectories, raw residual geometry (no SAE) surfaces one signal: **representational velocity-freezing**. Trajectories that will WANDER show a smaller per-turn change in their residual state early on — they settle toward an attractor sooner. The direction is consistent across **all five layers** (4/5 raw *p*<0.05, length-controlled), and one mid-network layer (L31) clears a pre-registered trend-and-divergence conjunction (*p*=0.015). But **nothing survives multiple-comparison correction** over the 4×5 metric–layer grid.

**Stage 2 — the fingerprint adds nothing over the cheap detector.** This is the decisive, pre-registered test:

- Early-window velocity at L31 reaches **AUROC 0.695** — statistically **indistinguishable** from the fair early behavioral baseline `tool_entropy_first10` (**0.688**; paired bootstrap Δ=+0.008, 95% CI **[−0.170, +0.211]**, straddles zero).
- It loses to the deployed late detector `tool_entropy_last10` (**0.888**) and to trajectory length (**1.000**, postdictive).
- As a sharp alarm calibrated to **≤5% false-positive** on successes, velocity catches only **1–3 of 20** WANDERING trajectories — **far fewer** than the deployed detector, with too few overlapping detections to even measure a lead-time advantage.

## Why it matters

The pre-registered gate returns **NO-GO** on three independent grounds, so we stop — we do not spend SAE compute or causal compute on a signal with no operational value. The contribution is the negative itself: context rot **does** leave a faint, directionally-coherent residual trace, but **at the granularity a cheap deployable monitor would use, that trace carries no predictive information beyond the probe-free behavioral signal it would replace.** The residual geometry is downstream-redundant.

This **strengthens** the arc rather than undermining it: across four papers the deployed signal has been the cheap behavioral one, and here we show that choice is not merely convenient — for this failure mode, watching the behavior is as good as or better than reading the residual stream. *"Just watch the geometry"* is ruled out as a better detector.

## Honest scope

Single model (*n*=99, Qwen3.6-27B), single task family (SWE-bench Pro), **raw** geometry only (a richer SAE-feature or attention-level representation was gated off by the predictive null, by design). And this is a statement about **prediction and redundancy, not causation** — a predictive-redundancy null does not exclude that the frozen geometry lies on the causal path of the behavioral rescue; that would be a separate, re-pre-registered question.

## Code & data

- Note PDF + pre-registration + Stage 1/2 results + analysis code (CC-BY-4.0 / Apache-2.0): [paper/context_rot](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/context_rot)
- Arc PDFs mirror (HF dataset): [caiovicentino1/wandering-arc-papers](https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers)
- The four arc papers: [#1 Tool-Entropy](https://doi.org/10.5281/zenodo.20368601) · [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286)
