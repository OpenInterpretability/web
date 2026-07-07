# The Late Channel
### Chain-of-Thought Becomes Causal and Decodable Only Late in a 27B Reasoning Agent

**Caio Vicentino · OpenInterpretability · Published 2026-06-18.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20752895](https://doi.org/10.5281/zenodo.20752895).**

> The first paper of the interpretability-as-audit phase of the arc. The full PDF (3 figures, logit-lens control, 37/37 eval) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20752895)** — this page is the on-site summary.

---

## Abstract

In a 27B reasoning agent (Qwen3.6-27B), chain-of-thought is **causal** for the answer — and for the agent's downstream action — *only when the reasoning changes the outcome*; when the model already knows the answer, the CoT is performative (44/60 Tier-A cases). The causal content of the reasoning consolidates in the same late layer band (**L51–63**) that carries action commitment, with the largest reasoning→answer transfer at L59 (+2.72), confirmed against a logit-lens control that rules out mere output-format consolidation. Faithfulness is **conditional**, and the late state is a readable, causal locus for monitoring reasoning agents.

## Why it matters

CoT monitoring is the leading practical hope for overseeing reasoning agents — but it inherits an assumption: that the visible reasoning *is* the computation. This paper shows the assumption holds exactly when the reasoning is load-bearing, and fails when it is not — and gives the monitoring alternative: the late internal band where the causal content actually consolidates, for answers and for agent actions alike.

## Key results

- Tier-A (n=60): reasoning→answer transfer peaks late (+2.72 @L59); performative in 44/60 already-known cases.
- Tier-B (n=32): the same late band carries reasoning→**agent action** transfer.
- Logit-lens control closes the "late = output formatting" alternative.
- Every number recomputes from public ledgers (37/37 checks).
