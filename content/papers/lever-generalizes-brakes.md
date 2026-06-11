# The Lever Generalizes — and It Brakes

### A late, bidirectional action-commitment lever across agent decisions and architectures

**Caio Vicentino · OpenInterpretability · Published 2026-06-10.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20634838](https://doi.org/10.5281/zenodo.20634838) · the circuit-breaker capstone of the WANDERING arc.**

> Paper #7, the circuit-breaker capstone. The full PDF (4 figures, the scale-matched cross-model table, the pre-mint eval, all caveats) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20634838)** — this page is the on-site summary. Prepared for submission to **BlackboxNLP 2026 (EMNLP)**.

---

## The question

Paper #6 (*The Lever Is Late*) showed that control of a coding agent's `finish` decision lives not at the mid-layer "task-is-done" verdict but in a **late, task-matched action-commitment block** ~30 layers downstream. That left two questions open. Is the late lever **specific to termination**, or a property of the action-commitment channel? And can it **brake** an action — not just elicit one — the mechanism a safety circuit-breaker would need?

## What we found

On Qwen3.6-27B over 99 SWE-bench Pro trajectories, using a second decision in the same data — commit a file edit (`str_replace_editor`) versus continue reversible exploration (`bash`) — with *n* = 60 deterministic decision points per condition, prefill-only patching, and generation-confirmed outcomes:

1. **It generalizes (elicit).** At an *explore* decision, injecting a task-matched **edit**-donor into the late block makes the agent emit a real edit call: **0.23 → 0.77** at L59 (position control 0.08, cross-task control 0.48).
2. **It brakes (suppress).** At a *commit* decision, injecting an **explore**-donor collapses the real edit rate **0.48 → 0.02** (96% suppression) at L55 — a same-class control stays intact (0.55) and the opposite-direction donor boosts to 0.92.
3. **The mechanism is monotonic and bidirectional.** Exact paired McNemar on all 14 per-point conditions yields seven contrasts surviving Holm–Bonferroni (worst *p* = 7.6e-5). The discordance structure is the headline: elicit has **c = 0** (the edit-donor only turns commits *on*, never silences one) and the brake has **b = 0** (the explore-donor only turns them *off*, never lights one). The late lever moves exactly in the donor's direction with ~zero off-direction noise.
4. **It is architectural, not a Qwen artifact.** The late-commitment geometry and donor-specific writability replicate across **two model families and two scales** (Mistral-7B and the scale-matched **Mistral-Small-24B**, where the mid-inert / late-write dissociation is cleanest: fidelity 0.955 vs 0.007).

## The circuit-breaker

The bidirectional late lever is the mechanism a safety **circuit-breaker** requires: a single late-layer intervention that blocks an action at its commit point. The brake re-routes the suppressed decision to reversible exploration (bash +0.17 above its no-brake floor of 0.43), and the elicit/brake lift survives a full valid-tool-call re-parse (0.23→0.37 elicit, 0.40→0.07 brake) — not just the tool-token onset. The method ships in **[`decision-locator`](https://github.com/OpenInterpretability/decision-locator)**, the model-agnostic locate/sweep/steer tool from paper #6.

## Honest scope

Generalization here is an **existence proof, not a universal law** — it holds for `finish` and one second action, on one model and one task family, plus a cross-family geometry/writability replication. The proxy is **semi-irreversible**: `str_replace_editor` mutates state but is undoable. The genuinely irreversible case (`send_transaction`, `delete`) is **untested** and is the named next step — the circuit-breaker is demonstrated *on a proxy*. The cross-model lite tests use LOCATE + one-token ΔP, not generation-confirmed brakes.

## Code & data

- Paper + pre-registrations + per-point data + exact-statistics script + the pre-mint eval: [paper/circuit_breaker](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/circuit_breaker) and [tools/decision_locator](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/tools/decision_locator)
- Decision-point state + residuals + strengthener data: [caiovicentino1/swebench-phase6-verdict-circuit](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit)
- The full arc: [#1 Tool-Entropy](https://doi.org/10.5281/zenodo.20368601) · [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286) · [#5 Verdict Circuit](https://doi.org/10.5281/zenodo.20532769) · [#6 The Lever Is Late](https://doi.org/10.5281/zenodo.20534219) · [companion note](https://doi.org/10.5281/zenodo.20500053)
