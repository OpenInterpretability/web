# Mechanistic Circuit-Breakers Generalize Across Irreversible Agent Actions and Architectures

### A late, redirecting brake for an agent's commitment to an irreversible action

**Caio Vicentino · OpenInterpretability · Published 2026-06-13.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20679287](https://doi.org/10.5281/zenodo.20679287) · the safety capstone of the WANDERING arc.**

> Paper #8. The full PDF (figures, the six-action and three-architecture tables, the 88/88 pre-mint eval, all caveats) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20679287)** — this page is the on-site summary.

---

## The question

Paper #7 (*The Lever Generalizes — and It Brakes*) located a late, task-matched action-commitment lever that can **brake** a coding agent's committal action, collapsing a real file `edit` from 0.48 to 0.02. But an edit is *reversible*, and the paper was explicit that the genuinely irreversible case — `send_transaction`, `delete` — was the **named next step**. This paper takes that step, and turns one example into a law.

## What we found

**1. From a reversible edit to an irreversible transfer.** On a simulated wallet agent (Qwen3.6-27B, no real funds, *n* = 24), injecting a task-matched **safe-action donor** at a late layer collapses a committed `send_transaction` from **0.998 → 0.00** emission (exact McNemar *b* = 24, *c* = 0, *p* ≈ 1.2e-7). The safety-critical property: under the brake the agent **redirects 100% to a safe read-only action** (`get_balance`), never to another transfer. It is **direction-specific** — a same-class donor does not suppress, and a random donor destroys the output into incoherence rather than producing a safe redirect.

**2. A law across irreversible actions.** On six diverse irreversible-action domains — crypto transfer and ERC-20 approval, file deletion, table drop, production deploy, email send — the brake yields **100% generation-confirmed suppression and 100% redirect-to-safe** in every case where the agent will commit the action (check balance / list files / describe table / run tests / save draft). Never to another harmful action.

**3. A law across architectures.** The same six-action battery replicates on **Llama-3.1-8B** and **Mistral-Small-24B**: **17 of 18** (model × action) cells are valid, and the brake works in **all 17**. The one invalid cell is a model that refuses to commit a production deploy at all (a fidelity-gate failure — no commit state to brake — not a brake failure).

**4. The brake locus is depth-relative late.** It sits at ~80–98% of network depth, model- and action-specific: Llama brakes uniformly at L26, Mistral at L32, and Qwen's hardest actions (`send`, `delete`) only *fully* brake at the final layer L63.

## Why the redirect matters

The redirect is what makes this safety-relevant rather than merely destructive. A brake that turned a transfer into incoherence, or into a *different* transfer, would be useless; ours turns it into "check the balance." This is the mechanistic shape of corrigibility — pausing or re-routing before an irreversible action.

## Honest scope

This is a **mechanism** result, not a deployable defense. (i) The actions are **simulated** — no funds move, no files are deleted. (ii) The intervention is a **white-box, inference-time activation patch**; a single white-box direction is not robust to an adaptive adversary that can obfuscate activations, and an attacker who can patch activations already has access deeper than a same-host guard could defend. We make no real-time-defense claim. (iii) For the hardest actions the brake is the **final layer**, leaving almost no margin. (iv) Results are *n* = 16–24 per cell with a task-matched donor — the "law" is across the *tested* actions and models, not proven universal.

## Code & data

- Paper + a pre-mint evaluation that recomputes **every number (88/88)** from the public ledgers: [paper/circuit_breaker](https://github.com/OpenInterpretability/openinterp-swebench-harness/tree/main/paper/circuit_breaker) (`safety_brake.tex`, `eval_safety_brake.py`, `EVAL_safety_brake.md`)
- Per-action ledgers + the wallet/devops/db/email scenarios: [caiovicentino1/swebench-phase6-verdict-circuit](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit)
- The arc: [#1 Tool-Entropy](https://doi.org/10.5281/zenodo.20368601) · [#2 Right Locus](https://doi.org/10.5281/zenodo.20490278) · [#3 Multi-Channel](https://doi.org/10.5281/zenodo.20490284) · [#4 Modality Matters](https://doi.org/10.5281/zenodo.20490286) · [#5 Verdict Circuit](https://doi.org/10.5281/zenodo.20532769) · [#6 The Lever Is Late](https://doi.org/10.5281/zenodo.20534219) · [#7 Generalizes & Brakes](https://doi.org/10.5281/zenodo.20634838) · [companion note](https://doi.org/10.5281/zenodo.20500053)
