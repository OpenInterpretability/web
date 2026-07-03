# The Criterion Cannot See What It Does Not Measure
### Auditing Capability-Guided Attention Hybridization Against a Named Agent-Commitment Circuit

**Caio Vicentino · OpenInterpretability · Published 2026-07-03.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.21175758](https://doi.org/10.5281/zenodo.21175758).**

> The first executed instance of interpretability-as-audit applied to a model **transformation**. The full PDF (3 figures, all controls, the eval record) is the **[Zenodo record](https://doi.org/10.5281/zenodo.21175758)** — this page is the on-site summary.

---

## Abstract

Efficiency-driven model transformations increasingly decide *which internal components to keep* using causal, capability-guided criteria. HydraHead (arXiv:2606.20097) selects which attention heads retain full attention (FA) vs. linear attention via activation-patching importance on a capability set C = {long-context retrieval, general ability}. We audit this criterion class against the **named, causally-verified commitment circuit** of Qwen3.6-27B (writers h8/h6/h3 at L59). Retrieval-criticality and commitment-writing are **anti-aligned**: the commit writers carry zero retrieval criticality (κ=0, stable under doubled probe samples), while the layer's strongest retrieval heads — global ranks 2 and 4 of the model — are the circuit's *opposers*. Ablating the criterion's non-retained late-band heads collapses task-appropriate commitment (P(edit) 0.474→0.167; 18/0 monotonic flips, exact McNemar p=7.6×10⁻⁶) — **worse than all five size-matched random selections** — while the capability probes that define the criterion register nothing (and, having failed their positive control, could not have). Restoring just the two named writer heads (0.5% of FA heads) recovers baseline exactly; two random heads at identical severity do not (p=1.5×10⁻⁵).

## Why it matters

The models the world actually runs are not the models that were evaluated — they are compressed, hybridized, distilled versions, validated by benchmarks. This audit shows a state-of-the-art selection criterion, *built from the same causal toolbox interpretability uses*, is structurally blind to an agent's action-commitment circuit: capability-causal ≠ safety-causal. The constructive fix is cheap (a two-head safety term the criterion itself scores at zero), but finding those heads required circuit analysis — the criterion cannot see what it does not measure, and neither can its benchmarks. This extends the *Located, Not Secured* program from "audit the fixed model" to **audit the transformation**.

## Key results

- **Anti-alignment at L59:** commit writers h8/h6 = zero retrieval criticality (dropped at ANY FA budget); top-2 and top-4 retrieval heads of the entire model are the circuit's opposers.
- **Two-sided collapse:** commitment 0.48→0.18 under the criterion's keep-set (worse than all 5 random draws of equal budget) while NIAH stays at ceiling — and the probe's failed positive control shows that pass is uninformative.
- **Head-specific rescue:** keep {h8,h6} (0.5% of budget) → baseline exactly, zero flips; keep 2 random heads at identical severity → still collapsed (17/0, p=1.5×10⁻⁵).
- **Honesty ledger:** pre-registered primary scope was null (disclosed); the declared stability gate failed and is owned; capability preservation is *untested*, not "passed".

## Reproducibility

Every number recomputes from the public ledger in ~2 minutes: `python3 scripts/eval_hydra_audit.py` (59/59 checks) against [`swebench-phase6-verdict-circuit`](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit). Experiment, figures, PREREG→RESULTS→EVAL chain: [openinterp-swebench-harness](https://github.com/OpenInterpretability/openinterp-swebench-harness). Under 6 GPU-hours total.
