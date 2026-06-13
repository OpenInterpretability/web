# The Authorization Direction

### A late-layer direction that detects *and* controls an agent's commitment to unauthorized irreversible actions, across architectures

**Caio Vicentino · OpenInterpretability · Published 2026-06-13.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.20683623](https://doi.org/10.5281/zenodo.20683623) · paper #9 of the WANDERING arc.**

> The full PDF (4 figures, the cross-model tables, the 35/35 pre-mint eval, all caveats) is the **[Zenodo record](https://doi.org/10.5281/zenodo.20683623)** — this page is the on-site summary.

---

## The question

The circuit-breaker line gave a **brake** (an actuator): a late patch that suppresses an irreversible action and redirects it to a safe one ([#8](https://doi.org/10.5281/zenodo.20679287)). A deployable safety layer also needs a **detector**: at the commit point, is the irreversible action the agent is about to take actually *authorized* by the trusted task? We find that authorization is linearly decodable at a late layer — and that **the very direction that decodes it also controls the commit.**

## What we found

**1. Detection — and it is not a capacity artifact.** A linear probe separates *authorized* from *unauthorized* irreversible-action commits at **AUROC ≈ 1.0** on Qwen3.6-27B. The number alone is uninformative (5120 dimensions ≫ n), so we rule out capacity four ways, on commit-state-matched data: a **one-dimensional difference-of-means** probe (cannot overfit) = 1.0; a **regularization sweep** flat at 1.0; **PCA to 32 dims** = 1.0; shuffled-label ≈ 0.5; and a **random direction is at chance only at the deep locus** (L61, ~95% depth), where the probe−random gap peaks. The direction is **domain-general** (train on five actions, detect the held-out sixth at 1.0) and **origin-robust** (train on prompt-injection cases, detect held-out model-internal cases at 0.89).

**2. Control — the same direction.** Steering along `d = mean(authorized) − mean(unauthorized)` **monotonically moves the commit**: averaged over actions the emit range is **0.67 vs 0.03** for a random direction of equal norm. `send_email` is the clean bidirectional case (−d: 0.42→0.00; +d: 0.42→1.00; random flat). **The same late-layer direction detects authorization and controls the commit.**

**3. Across architectures.** The full result replicates on **gpt-oss-20b** (a mixture-of-experts model from a different family): detection AUROC 1.0 (random-dir at chance), cross-action transfer 1.0, steering range **0.65 vs −0.25**. Both place the locus at depth-relative late (92–95%).

**4. A behavioral finding.** Both models **obey explicit prohibition** (commit rate 0.00 when told "do not") but **self-commit irreversible actions from a benign task**. The residual risk a detector must catch is *unprompted over-eagerness*, not defiance — the model-origin failure no input-provenance or text filter can see, and it is *worse* on the more capable-looking MoE.

## Why it matters

The arc's refrain is that prediction and control come apart — a mid-layer "verdict" feature predicts an agent's action but does **not** cause it ([#5](https://doi.org/10.5281/zenodo.20532769)). Here, at the late action-commitment locus, **they coincide.** For a defense-in-depth agent firewall ([AgentGuard](https://openinterp.org/agentguard)), the model-origin detector and the actuator can be the same late-layer object.

## Honest scope

AUROC = 1.0 is a ceiling; its *capacity* origin is ruled out, but the commit-matched unauthorized set is dominated by model-origin (which carries a brief self-justifying trace), so a residual *lexical* component the cross-origin transfer (0.89) and the trace-free ambiguous cell (1.0) only partly remove — a minimal-pair surface isolation is the remaining tightening. Actions are simulated; the method is white-box (defender-owned weights), not robust to a white-box activation-space adversary; Llama-3.1 and Mistral are gated and were run for the actuator in [#8](https://doi.org/10.5281/zenodo.20679287). The two-family replication is the cross-architecture evidence.

## Code & data

- Pre-registrations, per-run ledgers, figures, the model-agnostic runner, and an adversarial evaluation that **recomputes every number (35/35)**: [github.com/OpenInterpretability/agentguard](https://github.com/OpenInterpretability/agentguard/tree/main/paper)
- Per-run activation ledgers: [caiovicentino1/swebench-phase6-verdict-circuit](https://huggingface.co/datasets/caiovicentino1/swebench-phase6-verdict-circuit)
- The arc: [#5 Verdict Is Not the Lever](https://doi.org/10.5281/zenodo.20532769) · [#6 Lever Is Late](https://doi.org/10.5281/zenodo.20534219) · [#7 Generalizes & Brakes](https://doi.org/10.5281/zenodo.20634838) · [#8 Circuit-Breakers / Irreversible Actions](https://doi.org/10.5281/zenodo.20679287)
