# Felt, Not Granted
### An Internal Authorization Probe Inherits the Agent's Judgment Error

**Caio Vicentino · OpenInterpretability · Published 2026-06-14.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20685263](https://doi.org/10.5281/zenodo.20685263).**

> The limit paper for internal authorization monitors. The full PDF is the **[Zenodo record](https://doi.org/10.5281/zenodo.20685263)** — this page is the on-site summary.

---

## Abstract

The authorization direction (paper #9) detects and controls an agent's commitment to unauthorized irreversible actions at AUROC ~1.0. This paper asks what that internal monitor actually **reads** — and shows it reads the authorization the model *feels*, not the one the user *granted*. On 21 realistic over-reach scenarios — where the agent in good faith commits an irreversible action the task did not authorize — the internal probe allows **100%** of them (CI [0.845, 1.0]); a simple external task-grounded check catches all. Internal monitors inherit the model's own judgment error: they are structurally blind to the over-reach the model itself does not represent as unauthorized.

## Why it matters

If your safety monitor is a probe on the model's internals, its ceiling is the model's own judgment. The over-reach that matters in practice — the agent doing something *plausible but ungranted*, in good faith — is exactly what the internal signal cannot see, because the model never represents it as unauthorized. Felt ≠ granted: authorization is a fact about the task, not a feeling inside the model. The constructive implication is architectural: ground authorization checks in the trusted task specification, outside the model.

## Key results

- Internal authorization probe (AUROC ~1.0 on explicit violations) allows **21/21 realistic good-faith over-reaches**.
- An external task-grounded check catches all 21 — the information was never in the activations, it was in the task.
- Sharpen of the arc's refrain: detection at the late locus is real, but it detects the model's *belief* about authorization.
