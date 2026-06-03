# The Verdict Is Not the Lever
### An interpretable task-completion feature predicts but does not cause long-horizon agent termination

**Caio Vicentino · OpenInterpretability · Published 2026-06-03.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20532769](https://doi.org/10.5281/zenodo.20532769) · the mechanistic capstone of the WANDERING arc.**

> Paper #5, the capstone of the five-piece WANDERING arc. The full PDF (figures, both tables, all caveats) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20532769)** — this page is the on-site summary.

---

## The question

A long-horizon coding agent fails by **WANDERING** — acting indefinitely without ever emitting the `finish` action. The arc detects this behaviorally, shows residual steering can't rescue it, and shows a behavioral interruption can. The deepest mechanistic version: does the agent **internally represent** a "the task is done" verdict, and if so, is that representation the **causal lever** for termination?

## What we found (four stages, CPU-only except the causal test)

Using a full-stack sparse autoencoder on Qwen3.6-27B over 99 SWE-bench Pro trajectories:

1. **The verdict feature exists.** An SAE feature at layer 23 (#22358), selected anti-circularly *from SUCCESS only*, is present at the WANDERING final turn but **not** at LOCKED (WANDERING-vs-LOCKED **AUROC 0.81**, length-controlled, partial-r 0.55). WANDERING — which never terminates — *holds* the verdict; LOCKED — which gave up — does not.
2. **It is interpretable.** Reading the transcripts where it fires hardest: "All 157 tests pass", "the implementation is complete and tested", "the refactoring is complete". It is a **"subtask completed and verified"** feature (completion-language enrichment **50% vs 6%** baseline).
3. **It predicts the action.** Against ground-truth tool calls, the feature predicts whether the next action is `finish` with **AUROC 0.91**.
4. **It is not the lever.** Clamping it to the SUCCESS level at the WANDERING decision point changes P(finish) by **−0.001** — indistinguishable from clamping a *random* feature (+0.002). Ablating it in SUCCESS does not significantly reduce finishing (−0.008, n.s.).

## Why it matters

The agent represents "I'm done" as a clean, interpretable, predictive feature — **but that representation is not what makes it stop.** This extends the detection-vs-control asymmetry (the knowledge–action gap, the predict/control discrepancy) to the level of a **single, named, interpretable feature** representing a specific decision. It sharpens the arc's three residual nulls one level deeper: not "we steered the wrong direction," but "the right, named, interpretable verdict feature is still not a lever." WANDERING does not fail to *form* the verdict — it forms it repeatedly — it fails to *treat it as terminal*. The only known WANDERING rescue remains a **behavioral** interruption: the predictive signal lives in the representation, the causal lever lives in behavior.

## Honest scope

Single model (*n*=99, Qwen3.6-27B), single task family (SWE-bench Pro). Stage 0 is uncorrected/single-layer-clean (the claim rests on convergence across stages, not one p-value). The in-domain interpretation is decisive (a strict general-corpus semantic gate failed — the feature is domain-specific). The causal test is the load-bearing negative and is modest in power: *n*=10/class, a single layer and a single token position, behavioral-fidelity-gated, prompts truncated to 4000 tokens. It rules out L23 #22358 as a single-position lever; it does not prove no verdict locus anywhere is a lever.

## Code & data

- Paper + pre-registrations + all-stage results + the causal-test notebook (CC-BY-4.0 / Apache-2.0): [paper/verdict_circuit](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/verdict_circuit)
- Transcripts + labels + fidelity residuals: [caiovicentino1/swebench-phase6-verdict-circuit](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit)
- The full arc: [#1 Tool-Entropy](https://doi.org/10.5281/zenodo.20368601) · [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286) · [companion note](https://doi.org/10.5281/zenodo.20500053)
