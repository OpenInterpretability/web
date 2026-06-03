# The Lever Is Late
### Causal control of long-horizon agent termination lives in a task-matched, late action-commitment block

**Caio Vicentino · OpenInterpretability · Published 2026-06-03.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20534219](https://doi.org/10.5281/zenodo.20534219) · the first positive of the WANDERING arc.**

> Paper #6, the first positive of the six-piece WANDERING arc. The full PDF (3 figures, 2 tables, the pre-mint eval, all caveats) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20534219)** — this page is the on-site summary.

---

## The question

A long-horizon coding agent fails by **WANDERING** — acting indefinitely without ever emitting the `finish` action. Five papers established where control over termination is **not**: not the residual stream, not the best-detecting locus, not even the exact, named, interpretable "task-done" SAE feature (which predicts the finish action at AUROC 0.91 yet, clamped, moves P(finish) by −0.001). After five places where the lever isn't, this paper asks the dual question: **where is it?**

## What we found

On 99 Qwen3.6-27B SWE-bench Pro trajectories, reconstructed faithfully at the decision point and gated for behavioral fidelity (P(finish): SUCCESS 0.59 ≫ WANDERING 0.07 ≫ LOCKED 0.005):

1. **The decision is computed late.** A layer-resolved logit-lens shows the `finish` decision is invisible through layer 31 — and **flat at the verdict layer (L23)** — then explodes in the last ~12 of 64 layers (L51–L63). The decision becomes readable **~30 layers downstream** of where the "task-done" verdict is represented.
2. **The internal lever is late and donor-specific.** Injecting the SUCCESS late-block state into a WANDERING agent at its decision point raises P(finish) (**+0.13 at L55, +0.15 at L59**); the LOCKED-donor control moves it the *other* way. Every mid-layer and verdict-feature intervention is inert.
3. **It survives a real generation — but only task-matched.** Patching the late block at the decision point alone makes the agent emit a well-formed `<function=finish>` call in **42% of WANDERING decision points** (5/12; exact one-sided McNemar **p = 0.031** vs a 0/12 baseline and a 0/12 LOCKED-donor null) — but only when the donor is **task-matched**; a coarse class-mean donor is not significant (25%, p = 0.125).

## The law

**The knowledge–action gap on agents is a *layer* gap.** The termination decision is *known* mid-stream (the verdict, AUROC 0.91 to detect, 0% to control) but only *writable* late (the task-matched residual, 42%). The verdict-null → late-lever jump is a controlled, same-experiment contrast; a separate behavioral interruption gives a comparable lift (30%→70%, paper #4). Control over an agent decision rises with proximity to the action channel — and the gap closes in exactly one place: late, task-matched, near the action. This is the first internal causal lever of the arc, and it explains all five prior nulls as wrong-layer / wrong-donor / wrong-channel.

## The tool

The method ships as **[`decision-locator`](https://github.com/OpenInterpretability/decision-locator)** — a small, pip-installable, model-agnostic tool that, for any tool-calling decision on any open-weight model, (1) locates the layer where the decision becomes readable, (2) sweeps activation patching to find where it is writable, and (3) steers a real generation by patching the commitment layer. `pip install git+https://github.com/OpenInterpretability/decision-locator`, then `decision-locator demo --model gpt2`. CPU self-test + Colab included.

## Honest scope

Single model (Qwen3.6-27B), single task family (SWE-bench Pro), *n* = 12 per class. The positive headline **depends on the task-matched donor** — the coarse class mean is not significant. The effect is partial (42%). L63's large patching effect is near the output and partly trivial; the load-bearing patching evidence is L51–L59. The per-pair donor's edge over the mean may reflect task-conditioning *or* single-vs-averaged geometry; we do not separate these. The three-site ordering (verdict / late / behavioral) synthesizes three experiments with different baselines — only the verdict-null → late-lever jump is a controlled contrast.

## Code & data

- Paper + pre-registration + figure code + notebooks + the pre-mint eval + the released tool: [paper/breakthrough](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/breakthrough) and [tools/decision_locator](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/tools/decision_locator)
- Transcripts + labels + residual bundle: [caiovicentino1/swebench-phase6-verdict-circuit](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit)
- The full arc: [#1 Tool-Entropy](https://doi.org/10.5281/zenodo.20368601) · [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286) · [#5 Verdict Circuit](https://doi.org/10.5281/zenodo.20532769) · [companion note](https://doi.org/10.5281/zenodo.20500053)
