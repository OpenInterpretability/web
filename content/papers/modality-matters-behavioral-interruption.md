# Modality Matters
### A Transient Behavioral Interruption Rescues Agent WANDERING Where Residual Steering Does Not

**Caio Vicentino · OpenInterpretability · Published 2026-06-01.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20490286](https://doi.org/10.5281/zenodo.20490286).**

> Paper #4 of the WANDERING arc — the **first positive result**. The full PDF is the **[Zenodo record](https://doi.org/10.5281/zenodo.20490286)** — this page is the on-site summary.

---

## Abstract

A multi-turn coding agent fails in a distinctive way we call WANDERING: it keeps acting but never emits the finish action, exhausting its turn budget. A companion line of work detects WANDERING from a residual-stream signature and a tool-entropy signal, but three pre-registered residual interventions (SUCCESS-direction injection at L55 and at L11) all fail to rescue it. We ask whether the missing lever is **not the locus but the modality**. On the same 20 WANDERING Qwen3.6-27B SWE-bench Pro trajectories, gated by the same live tool-entropy collapse detector, a transient behavioral interruption — one fresh `user` turn at the collapse point — roughly **doubles finalization (30%→70%, paired McNemar *p*=0.021)**, while residual L11 injection stays inert (*p*=0.63). The lever is the **interruption itself, not its content**: a content-neutral message rescues as well as a re-plan (*p*=1.0). SWE-bench Pro Docker evaluation suggests the interruption also raises task solve-rate (~23%→50%, cross-session). For long-horizon agents the predictive signal lives in the residual stream but the **causal lever lives in behavior**.

## Why it matters

This completes a four-paper arc: **detect** (Tool-Entropy, #1) → **localize** (#3) → **residual fails / three nulls** (#2) → **behavioral works** (#4). The detection-intervention asymmetry that the field has named for single-forward-pass settings gets a constructive resolution for long-horizon agents: detection does not imply a steerable *direction*, but it does point to a steerable *action*.

## Key results

- **Finalization (paired, same 20 trajectories):** no-intervention 30%, residual L11 40%, behavioral-neutral 70%, behavioral-replan 70%. **H1** (behavioral vs none): McNemar *p*=0.021. **H2** (behavioral vs residual): *p*=0.031. **H3** (neutral vs re-plan): *p*=1.0 — the interruption, not the content.
- **Residual is inert:** Arm A (L11 injection) vs none, *p*=0.63 — replicates the companion nulls.
- **Solve-rate (suggestive, cross-session):** behavioral interruption resolves 10/20 = 50% vs two independent no-intervention baselines at ~23% (paired 5–0, McNemar *p*=0.062). Labeled suggestive with a transparent cross-session caveat; the resolving diffs are substantial (3.5–23 KB, none empty).
- **No destabilization:** unlike the high-magnitude residual hook, the behavioral nudge produces zero invalid tool calls.

## Code & data

- Code — behavioral loop + 4-arm experiment (Apache-2.0): [openinterp-swebench-harness](https://github.com/OpenInterpretability/openinterp-swebench-harness)
- Arc PDFs: [caiovicentino1/wandering-arc-papers](https://huggingface.co/datasets/caiovicentino1/wandering-arc-papers)
- Companion #2 — The Right Locus null: [DOI 10.5281/zenodo.20490278](https://doi.org/10.5281/zenodo.20490278)
- Companion #1 — Tool-Entropy Collapse: [DOI 10.5281/zenodo.20368601](https://doi.org/10.5281/zenodo.20368601)
