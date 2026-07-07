# Located, Not Secured
### Principled Limits of Interpretability-Based Control over Agent Actions

**Caio Vicentino · OpenInterpretability · Published 2026-06-19.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20764857](https://doi.org/10.5281/zenodo.20764857).**

> The synthesis of the arc. The full PDF is the **[Zenodo record](https://doi.org/10.5281/zenodo.20764857)** — this page is the on-site summary.

---

## Abstract

Across fifteen studies on long-horizon tool-using agents, mechanistic interpretability **locates** a real, causal control surface — the late action-commitment band (L51–63 in Qwen3.6-27B) — but does not **secure** it. Five orthogonal limits, each established by pre-registered experiments in the arc: **detect ≠ control** (a perfect verdict feature does not cause termination); **felt ≠ granted** (internal authorization monitors inherit the model's judgment error); **form ≠ granted**; **control ≠ robust control** (the late brake collapses under an adaptive white-box attack, ASR 0→1.0); and **intervention is easy exactly where it is unneeded**. Locating where behavior is decided is necessary but nowhere near sufficient for securing it.

## Why it matters

This is the regime split that defines the lab's agenda: interpretability **loses** the adversarial control game (an adversary optimizing against a known locus defeats it) but **wins** the audit game (understanding, monitoring, and auditing a fixed model in a non-adversarial regime). Use interpretability to audit and monitor — not to defend. Beat 10 of the arc extends this from "audit the fixed model" to "audit the transformation".

## The five limits, in one line each

1. **Detect ≠ control** — prediction at AUROC 0.91 with zero causal leverage (the verdict feature).
2. **Felt ≠ granted** — the internal monitor reads the model's belief, not the user's grant.
3. **Form ≠ granted** — surface form of authorization does not confer it.
4. **Control ≠ robust control** — the brake collapses under adaptive white-box attack (ε=4).
5. **Easy where unneeded** — intervention strength concentrates where the agent was already safe (30/32).
