# Tool-Entropy Collapse
### A cross-architecture signature of agent WANDERING failure

**Caio Vicentino · OpenInterpretability · Published 2026-05-24.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20368601](https://doi.org/10.5281/zenodo.20368601) · the foundation of the WANDERING arc.**

> Paper #1, the paper that names WANDERING and gives the arc its detector. The full PDF (all six detectors, the three tiers, the cross-architecture and cross-task tests) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20368601)** — this page is the on-site summary.

---

## The failure mode

Give a capable model a real software issue, a shell, and a fixed turn budget. Most runs end by submitting a patch via a `finish` tool (SUCCESS) or by giving up early (LOCKED). A third, quieter failure is **WANDERING**: the agent stays internally confident it has solved the task but **never emits a termination action**, burning the whole budget. It is a ~34% blind spot for probe-based agent monitoring — the agent looks fine internally, so a probe doesn't fire.

## What we found

On Qwen3.6-27B SWE-bench Pro trajectories we test **six detector designs across three signal channels**. The load-bearing, **probe-free** signal is **tool-use entropy collapse** — in its final turns the agent cycles the same tool calls instead of finishing. It supports three deployment tiers:

| Tier | Detector | Recall / FP |
|---|---|---|
| **Forensic** | residual signature (v1) | 35% / **0%** |
| **Advisory** | cross-layer (v1 ∪ v4) | 80% / 30%, ~15-turn lead |
| **Autonomous** | tool-entropy (v1 ∪ v5) | **70% / 5%** |

**Cross-architecture (within SWE-bench):** the collapse signature holds beyond Qwen — **Llama-70B** (collapse ratio 0.41, *p* < 1e-15) and a **GPT-5** router (0.71, *p* = 8.9e-35) match it. **Cross-task is null:** on METR MALT the ratio is 1.007 (*p* = 0.81), so we honestly scope the claim to **multi-turn code-execution agent tasks with rich action spaces**.

## The mechanism (§13) — and why the arc exists

The paper's §13 advances the mechanism the rest of the arc tests: the **mid-layer "task is done" verdict is consolidated**, while the **edge layers (L11/L55) fail to translate it into the `finish` action** — producing the final-turn tool loop. That hypothesis is the seed of everything downstream:

- the verdict locus is real but [**not a rescue lever** (#2)](https://doi.org/10.5281/zenodo.20490278);
- the signature is [**behavior-legible but residual-blind** (#3)](https://doi.org/10.5281/zenodo.20490284);
- the only thing that rescues WANDERING is a [**behavioral interruption** (#4)](https://doi.org/10.5281/zenodo.20490286);
- the verdict is even an interpretable feature that [**predicts but does not cause** finishing (#5)](https://doi.org/10.5281/zenodo.20532769);
- and control finally turns out to live [**late, ~30 layers downstream** (#6, the first positive)](https://doi.org/10.5281/zenodo.20534219).

## Code & data

- Paper + harness + reproducible code: [openinterp-swebench-harness](https://github.com/OpenInterpretability/openinterp-swebench-harness)
- As an Inspect eval (UK AISI `inspect_evals` submission): [inspect-tool-entropy-collapse](https://github.com/OpenInterpretability/inspect-tool-entropy-collapse)
- The full arc: [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286) · [#5 Verdict Circuit](https://doi.org/10.5281/zenodo.20532769) · [#6 The Lever Is Late](https://doi.org/10.5281/zenodo.20534219) · [companion note](https://doi.org/10.5281/zenodo.20500053)
