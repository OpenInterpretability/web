# Six Diagnostics, Six Walk-Backs

## An Operational Checklist for Causal Claims in Mechanistic Interpretability

**Caio Vicentino** (ORCID: 0009-0003-4331-6259)
OpenInterpretability — `caio@openinterp.org`

**Draft v0.1.** 2026-05-19. Target venue: NeurIPS MI Workshop 2026 (Sep submission) or TMLR (Survey Certification track).

---

## Abstract

Mechanistic interpretability papers routinely make causal claims — that a linear probe is a causal lever, that a circuit mediates a behavior, that an SAE feature implements a concept — but rarely state the identification assumptions that make these claims falsifiable. A recent position paper (Bohnet et al., 2026, arXiv:2605.08012) proposed a disclosure norm: state whether a claim is causal, name the identification strategy, enumerate assumptions, and demonstrate how conclusions shift if assumptions fail. We operationalize this norm as **six diagnostics**, each runnable in under one GPU-hour per probe, and demonstrate each on a published-or-near-published causal claim from our own prior work where the diagnostic *would have* falsified the claim if not run. We document the six self-walk-backs in detail; one of the diagnostics — trace-length-controlled slope decomposition — has not previously been published as standalone methodology. We position the resulting checklist as the minimum-viable operational layer beneath theoretical frameworks for causal abstraction (Geiger et al., 2024) and causal scrubbing (Anthropic), and ship an open-source Python implementation, a Colab demonstration on a toy probe, and a live leaderboard at openinterp.org/probebench.

---

## 1. Introduction

### 1.1 The disclosure gap

A purposive audit of ten mechanistic-interpretability papers across four methodological strands (Bohnet et al., 2026) found that none of them contained a dedicated identification-assumptions section. Validation metrics — faithfulness, completeness, monosemanticity, alignment scores, ablation effects — were routinely reported as causal support without an explicit statement of what assumptions would have to hold for those metrics to *be* causal evidence. The position paper proposed a disclosure norm: state whether a claim is causal, name the identification strategy, enumerate assumptions, stress at least one, and explain how conclusions shift if assumptions fail. The norm is correct. It is also under-operationalized.

A norm without an operational checklist tends not to be followed. Reviewers rarely demand explicit identification-assumption disclosure because they lack a shared expectation of what such disclosure should look like. Authors rarely produce it because the cost-benefit looks bad: identification disclosures are tedious to write and produce no headline statistic. The net effect is that the norm sits in the literature as a recommendation rather than a default.

We argue this is fixable in the same way that "report random-feature baselines at small N" became standard in single-probe papers in 2025-2026: by demonstrating that the operational cost is small, the failure mode is concrete, and the format is copy-paste-able.

### 1.2 Our offering

We provide six diagnostics, each addressing a specific identification assumption that arises in mechanistic-interpretability papers. For each diagnostic we report:

1. The claim type it audits (predictive, mediating, causal, or structural).
2. The identification assumption it stresses.
3. The minimum-viable experimental form (statistic, threshold, sample size).
4. The marginal cost in CPU- or GPU-minutes.
5. A case study from our own prior work in which we ran the diagnostic and *walked back* a near-publication-ready causal claim.
6. The concrete inflated effect we would have published without the diagnostic.

The six are: **(D1)** random-feature baseline at N<100, **(D2)** shuffled-source baseline for sparse top-k probes, **(D3)** control-token normalization for steering experiments, **(D4)** structural-rigidity α-sweep for null steering results, **(D5)** whitespace-stripped flip metric for behavioral-change measurements, and **(D6)** trace-length-controlled slope decomposition for temporal/trajectory-level statistics.

D6 has not previously been published as standalone methodology; we introduced it as an unpublicized internal control in our cross-probe coherence paper of 2026-05-19 (Vicentino, 2026e) where it caught a substantial trace-length confound in our own headline slope statistic 12 hours before submission. We make it citable here.

### 1.3 Position vs theoretical frameworks

We position this checklist as the **operational layer** beneath the theoretical frameworks for mechanistic-interpretability identification. Causal-abstraction theory (Geiger et al., 2024) and causal scrubbing (Anthropic) provide rigorous semantics for what it *means* for a circuit to implement a hypothesized algorithm. Our diagnostics do not. They provide a low-cost first-pass audit, runnable by any practitioner without theoretical machinery, that catches a specific set of failure modes we have empirically observed in our own work. We view the relationship as complementary: a paper passing all six diagnostics is not thereby identified in the Geiger sense, but a paper *failing* any one of them has a concrete problem.

We use the term "operational identification" to distinguish our usage from the stricter econometric notion. The position paper of Bohnet et al. (2026) uses "identification" loosely as well; we match that usage explicitly and flag the gap with theoretical work in §4.

### 1.4 Diagnostic provenance

A concern with retrospective methodology papers is that the case studies may have been selected post-hoc from a larger pool. We address this directly with a provenance trail rather than a pre-registration claim.

Each diagnostic has a corresponding *feedback memory* file in our internal project notes, dated within 24 hours of the walk-back it documents. The memories were written **as we observed each failure** and decided to elevate the diagnostic to our standing methodology — they were not constructed after the fact for this paper. Strict prospective pre-registration would have required dating the diagnostic ahead of the walk-back; in practice the walk-back is what surfaces the need for the diagnostic, so the two are usually same-day.

| Diagnostic | Memory date | Originating walk-back |
|---|---|---|
| D1 random-feature baseline | 2026-05-07 | SWE-bench Phase 6c sweep (2026-05-07) |
| D2 shuffled-source baseline | 2026-05-16 | Paper-3 PSAE v1.5 (2026-05-16) |
| D3 control-token normalization | 2026-05-07 | SWE-bench Phase 7 micro-pilot (2026-05-07) |
| D4 structural-rigidity α-sweep | 2026-05-07 | SWE-bench Phase 8 CoT-integrity (2026-05-07) |
| D5 whitespace-stripped flip | 2026-05-08 | SWE-bench Phase 10 RG steering (2026-05-08) |
| D6 length-controlled decomposition | 2026-05-19 | κ_t coherence paper (2026-05-19) |

All six are same-day pairs (memory file + walk-back). The diagnostic-to-paper relevance was *not* known at the time of memory creation: at 2026-05-07 we did not anticipate that D2 (added 9 days later) would falsify the PSAE prediction claim, that D6 (added 12 days later) would surface a length confound in our headline coherence statistic, or that D1 would later catch over-parameterization in unrelated capability-probe work. The provenance trail establishes that the diagnostics emerged from concretely-observed failures we made (and walked back), not from constructions designed to support this paper. We treat this as the minimum credible standard for a methodology contribution; it is weaker than strict pre-registration and we do not claim otherwise.

The full memory-file contents are reproduced in Appendix B.

### 1.5 What this paper is and is not

This paper is not a survey of all possible diagnostics for causal claims in interpretability. It is not a theoretical framework for what counts as identification in this domain. It is not a critique of the position paper of Bohnet et al. (2026); we view this work as one operationalization of their norm.

It is a working checklist, derived from concrete failure modes we have observed in our own work, ready to copy-paste into the next paper draft.

---

## 2. The Six Diagnostics

The six sections that follow share a fixed structure: claim type audited, identification assumption stressed, the minimum-viable experimental form, cost, case study, and the concrete inflated effect we would have published without the diagnostic. Figures referenced are drawn from the source papers; we re-use them rather than reproducing the underlying experiments.

### 2.1 D1 — Random-Feature Baseline at N<100

#### 2.1.1 Claim type

Predictive. The audited claim has the form "a probe trained on feature set F achieves AUROC ≥ X on outcome Y at sample size N."

#### 2.1.2 Identification assumption stressed

That the AUROC is driven by *feature selection identifying a discriminative subspace*, rather than by *overparameterized fitting against a small held-out set*. Specifically: that a probe trained on the same N samples with *random* features of matched cardinality would achieve materially lower AUROC.

When N is much smaller than the number of available candidate features (typical at residual-stream dimensions of 5120-12288 and probe sample sizes of 30-100), even top-k selection from a random feature pool can produce near-perfect AUROC by shattering the training data. The identification claim "feature set F predicts Y" requires this control to be more than a restatement of "K features were free to interpolate N points."

#### 2.1.3 The minimum-viable test

For probe trained on K selected features at sample size N:

1. Sample K random features from the same candidate pool, with the same selection algorithm if applicable.
2. Train an identically-parameterized probe on the same (X_train, y_train) using the K random features.
3. Repeat 50+ times with different random draws.
4. Report mean and p95 of the random-feature AUROC on the held-out (X_test, y_test).
5. The headline number is the gap: `lift = real_AUROC − mean_random_AUROC`.

Pass thresholds (empirical, based on our observed failure modes):

- `lift > 0.20` — strong signal, paper-grade
- `0.10 ≤ lift ≤ 0.20` — moderate signal, requires explicit caveat
- `lift < 0.10` — noise floor, headline claim should be retracted

A capacity sweep across K ∈ {5, 10, 20, 50, 100, 200} is mandatory companion: if the "best" K depends heavily on N, the result is N-dependent and not robust to scale-up.

#### 2.1.4 Cost

Approximately 5-15 GPU-minutes for 50 random draws at K=50 on a probe whose original training takes < 10 seconds. CPU implementation in scikit-learn is feasible at N<100, costing 2-10 CPU-minutes total. The diagnostic is implemented in `openinterp.diagnostics.random_feature_baseline` as a wrapper around the user's probe-training function.

#### 2.1.5 Case study — SWE-bench Phase 5d (Vicentino, 2026b)

In our Phase 5d agent-anatomy work, we trained linear probes on residual-stream features at layer 43, think_start position, of Qwen3.6-27B during SWE-bench Pro agent rollouts. At N=17 traces with K=50 top-features selected by per-feature point-biserial correlation, multiple probes hit AUROC = 1.000 separating patch-generation success from failure. The result looked spectacular and we drafted an internal verdict claiming a clean mid-reasoning capability locus.

The random-feature baseline run at the same N=17, K=50 — 50 draws — returned a mean random AUROC of 0.94 and a p95 of 1.000. The "spectacular" result was top-50 features shattering 17 data points in a 5120-dimensional space. At Phase 6c we re-ran the analysis at N=42, fixed K-sweep across {5, 10, 20, 50, 100}. With K=10 the L43 pre_tool probe (a different layer-position than the original claim) returned AUROC = 0.764 against a random-baseline mean of 0.495, a real gap of +0.269. The original Phase 5d claim — L43 think_start at K=50 — collapsed to AUROC ≈ 0.5-0.66 once the diagnostic was run.

#### 2.1.6 What we would have published without it

A claim that L43 think_start residual at K=50 achieves AUROC = 1.000 on patch-generation success at N=17, with the suggested interpretation that mid-reasoning representations encode the outcome of agent code-writing. The diagnostic identified the actual operating point (L43 pre_tool, K=10, AUROC = 0.76, lift +0.27) and the actual layer-position; the original layer-position claim was an artifact of K=50 at N=17.

### 2.2 D2 — Shuffled-Source Baseline for Sparse Top-k Probes

#### 2.2.1 Claim type

Predictive. The audited claim has the form "a probe trained on input X predicts a sparse top-k target Y (e.g., SAE features fired, MoE experts routed) with recall@k = R."

#### 2.2.2 Identification assumption stressed

That recall@k measures *predictive structure between X and Y on a per-sample basis*, rather than *fit to the marginal distribution of Y*. Specifically: that a probe trained on X with the same training pairs but with X shuffled across samples (so the per-sample correspondence between X and Y is broken) achieves materially lower recall@k.

The pathology this catches is what we call **marginal-fit pathology**. With N_train small relative to the target dimension and a sparse top-k target with a concentrated marginal (some target tokens or SAE features fire on most prompts), top-k ranking loss with AdamW optimization will converge to a "lazy" solution: output the universally-frequent target indices at high logit regardless of input. recall@k captures this perfectly when k exceeds the size of the universal support. The result reads as predictive structure but is an artifact of the optimization objective on a concentrated target.

#### 2.2.3 The minimum-viable test

For probe trained to predict sparse top-k target Y from input X:

1. Build train/test split as normal.
2. Shuffle X_train across the sample axis (`X_shuffled = X_train[np.random.permutation(len(X_train))]`). Leave y_train in original order.
3. Train an identically-parameterized probe (same initialization, same loss, same optimizer hyperparameters, same number of epochs) on (X_shuffled, y_train).
4. Evaluate the shuffled probe on the same real test pair (X_test, y_test).
5. Report `Δ = real_recall − shuffled_recall` alongside absolute real_recall. Cohen's d on the per-sample recall vector is the headline.

Pass thresholds:

- `Δ > 0.10` or Cohen's d > 0.5 — strong predictive structure
- `0.05 ≤ Δ ≤ 0.10` — moderate; explicit caveat required
- `Δ < 0.05` — probe is fitting the marginal; **do not** claim predictive structure

#### 2.2.4 Cost

Identical machinery to the real probe. The shuffled-source run reuses the same training pipeline. Marginal cost is one extra training run per condition — 30 seconds to 5 minutes depending on probe complexity.

#### 2.2.5 Case study — Paper-3 Predictive SAE v1.5 (Vicentino, 2026c)

In our predictive SAE (PSAE) v1.5 notebook, completed 2026-05-04, we trained twelve probes (three layers × four source fractions) on Qwen3.6-27B residuals at d_sae = 65536, k = 128, predicting end-of-thinking SAE features fired from earlier-thinking residuals. Recall@1024 reached 0.83-0.87 at L11 and L31, and 0.67-0.72 at L55. We drafted an internal note framing this as evidence for a predictive feature-trajectory through the reasoning stack, suitable as a paper-grade headline.

On 2026-05-16 we ran the shuffled-source baseline. At all twelve sites, the shuffled-baseline recall@1024 reproduced the real recall within ±0.03. The probe was not predicting per-prompt structure: it was learning that approximately 1024 SAE features fire universally at end-of-thinking, and outputting those features regardless of input. recall@1024 was a perfect measurement of the universal-support overlap.

The "predictive trajectory" claim died. We reframed paper-3 as an honest-negative documentation of the marginal-fit pathology in sparse top-k probing, with the shuffled-source baseline as the diagnostic contribution.

#### 2.2.6 What we would have published without it

A claim of recall@1024 = 0.85 at L11 and L31 as evidence for a predictive feature trajectory across reasoning depth in Qwen3.6-27B. The diagnostic identified the lift (real − shuffled) at all twelve sites as 0.00-0.03, meaning the trajectory claim had zero predictive content over the constant baseline of "output the universal support."

### 2.3 D3 — Control-Token Normalization for Steering Experiments

#### 2.3.1 Claim type

Causal. The audited claim has the form "steering at residual direction d with coefficient α shifts log-probability of target token X by ΔX nats, demonstrating that direction d causally controls token X."

#### 2.3.2 Identification assumption stressed

That the observed Δlog-prob(X) measures *target-specific causal influence of direction d on token X*, rather than *uniform softmax-temperature shift induced by an out-of-distribution residual state*.

The pathology this catches: forward-hook steering perturbs the residual stream to a state outside the training distribution. The standard model response is a uniform shift of the output distribution — log-probabilities of *all* tokens shift in the same direction, often by similar magnitudes. Reading off Δlog-prob of a single target token as evidence of target-specific causality conflates the genuine causal effect with this uniform softmax-temperature artifact.

#### 2.3.3 The minimum-viable test

For steering experiment claiming Δlog-prob(X) at α:

1. Identify 5+ control tokens with baseline log-prob within ~3 nats of the target token X, chosen to be semantically unrelated to the hypothesized direction's meaning.
2. Apply the steering perturbation at α and read off Δlog-prob for each control token in addition to the target.
3. Compute `Δ_rel = Δ(X) − mean(Δ(controls))` as the headline target-specific causal effect.
4. Report `Δ_rel` and absolute Δ(X) and absolute mean(Δ(controls)) side by side.

Pass thresholds:

- `|Δ_rel| > 2 × std(Δ(controls))` — target-specific causal effect
- `|Δ_rel| ≈ 0` (within ~2× control std) — direction is epiphenomenal-via-softmax-temperature; detection-only at most

Pair with at least one behavioral test (single-shot generation under steering; continuous generation; flip-rate at top-1 token) for triple convergence before publishing a causal claim.

#### 2.3.4 Cost

One additional forward pass per control token per α value. For 5 controls at 6 α values, 30 extra forward passes — under one GPU-minute on a 27B-parameter model.

#### 2.3.5 Case study — Paper-5 Phase 7 (Vicentino, 2026d)

In our SWE-bench Phase 7 micro-pilot on causality, completed 2026-05-07, we trained a linear probe at layer 43 pre-tool position on Qwen3.6-27B agent rollouts and applied forward-hook steering at α = +2. The naive output reported Δlog-prob(finish) = +0.479 nats — a clean causal-looking shift on the agent's `finish` tool token. We drafted an internal verdict ready to claim L43 pre_tool as a causal lever for agent-completion behavior.

The control-token normalization, run the same afternoon, reported approximately uniform Δlog-prob shifts of around +0.5 nats across all five control tokens (`search`, `execute`, `write`, `read`, `wait`), with a mean control shift of +0.525. Δ_rel for the target was −0.046 nats (std 0.093 across n=6 trajectories) — essentially zero and in the wrong direction. The L43 pre_tool direction was not a causal lever on `finish`; it was a softmax-temperature shifter that happened to leave `finish` slightly *less* favored after normalization. Triple-source convergence with continuous-generation behavioral tests confirmed the epiphenomenal classification.

#### 2.3.6 What we would have published without it

A claim that L43 pre_tool steering at α = +2 produces a Δlog-prob(finish) of +0.48 nats, framed as causal evidence for the probe direction. The diagnostic identified the true target-specific effect as Δ_rel ≈ −0.05 nats and reclassified the probe as detection-only rather than a causal lever.

### 2.4 D4 — Structural-Rigidity α-Sweep for Null Steering Results

#### 2.4.1 Claim type

Causal (null version). The audited claim has the form "steering at residual direction d produces no behavioral change at α ∈ {±2, ±5}, therefore direction d is not a causal lever."

#### 2.4.2 Identification assumption stressed

That a null behavioral effect at small α is evidence for *the direction having no causal authority*, rather than *the α range being too small to leave a regime in which the residual is the locus of decision*.

There are two scientifically distinct ways a steering experiment can produce a null result. **Amplitude null** means α was too small for the regime; the perturbation is buried in the model's noise tolerance and a larger α would have produced a (potentially uninterpretable) behavioral change. **Structural null** means the decision being steered is not *located* in the residual at all — it is locked upstream, typically in prompt tokens or chat-template auto-injection. Reporting "direction d is not causal" without distinguishing these two cases is a methodology error: the first case suggests scaling up α; the second case suggests intervening on input construction, an entirely different lever.

#### 2.4.3 The minimum-viable test

If first sweep at α ∈ {±2, ±5} shows zero behavioral change:

1. Compute ‖h‖, the L2 norm of the residual at the steering layer-position for a representative prompt.
2. Run amplitude diagnostic at α ∈ {0, +5, +20, +50, +100, +200} on one target prompt with both **the probe direction AND a matched-norm random direction**.
3. Log inside the hook: `pre_norm`, `post_norm`, `Δ_inside` to verify the perturbation actually applied.
4. Report behavioral output at each α.

Decision rule:

- Output diverges at some α threshold (typically degenerate at α >> ‖h‖) — **amplitude null**; the direction has weak but real causal authority; the original experiment was under-powered.
- Output stays rigid at α = +200 (which we have empirically seen exceed ‖h‖ by 27% in instruction-tuned models) for *both* probe AND random directions — **structural null**; the decision is upstream of the steering layer. Examine the last ~10 tokens of the prompt; chat-template auto-injection is the most common culprit in instruction-tuned models.

#### 2.4.4 Cost

Six α values × two directions × one target prompt = twelve forward passes. Under one GPU-minute. Catches a confidently wrong null verdict.

#### 2.4.5 Case study — Paper-6 Phase 8 (Vicentino, 2026d)

In our SWE-bench Phase 8 work on causality of the chain-of-thought-integrity probe, completed 2026-05-07, the L55 CoT probe achieved AUROC 0.91 at N=240. Bidirectional steering at α ∈ {±2, ±5} produced 32 identical generations across the test set. Without the amplitude diagnostic, we would have written a follow-up plan around "try bigger α next session" — the amplitude-null interpretation.

The structural-rigidity sweep, run the same day, applied α ∈ {0, +5, +20, +50, +100, +200} to one representative target with both the probe direction and a matched-norm random direction. At α = +200 the perturbation exceeded ‖h‖ by 27%. The generated output was *identical* across all α values and for both directions. The hook-internal logs confirmed the perturbation was being applied. The conclusion was structural, not amplitude: the chain-of-thought-emission decision was not in the residual at any layer; it was in the chat template's auto-injection of the `<think></think>` token pair before generation. The lever, if any, was in input construction, not in residual-space.

#### 2.4.6 What we would have published without it

A null result claiming "L55 CoT-integrity probe is not causal at α ∈ {±2, ±5}" with a suggested follow-up to scale up α — the wrong follow-up. The diagnostic identified the decision locus as the chat template upstream of all probed layers, redirecting future work toward token-level input-construction interventions and avoiding a multi-week dead-end follow-up on amplitude scaling.

### 2.5 D5 — Whitespace-Stripped Flip Metric for Behavioral-Change Measurements

#### 2.5.1 Claim type

Causal (behavioral). The audited claim has the form "steering at α produces a behavioral flip on F% of prompts, where flip = generated text differs from baseline."

#### 2.5.2 Identification assumption stressed

That the flip metric measures *semantic behavioral change induced by the steering intervention*, rather than *cosmetic tokenization differences in the first generated token under out-of-distribution residual perturbation*.

The pathology this catches: at large α, out-of-distribution residual states sometimes cause the model's first generated token to differ only in a leading whitespace from the baseline generation. The semantic content is identical; only the tokenization differs. A raw `base_text != modified_text` comparison counts this as a behavioral flip, inflating the apparent flip rate by an amount that depends on prompt structure rather than on the steering intervention's actual causal effect.

#### 2.5.3 The minimum-viable test

In every behavioral-flip metric, compare stripped strings:

```python
def stripped_flip(base, modified):
    return base.strip() != modified.strip()
```

For interactive smoke checks at high α before scaling to a full sweep, inspect with `repr()` on a few prompts to catch whitespace-only differences visually:

```python
for i in [0, 10, 25]:
    print(f'BASE: {results[i]["baseline_text"][:200]!r}')
    print(f'α200: {results[i]["alpha_200_text"][:200]!r}')
```

If the visible diff is only leading or trailing whitespace, the stripped flip will return False and the raw flip will return True.

#### 2.5.4 Cost

Zero compute. One line of code change. Sometimes catches at smoke-check time before any sweep cost is incurred.

#### 2.5.5 Case study — Paper-MEGA Phase 10 (Vicentino, 2026f)

In our Phase 10 capability-locus work on the RG (reasoning-guard) probe, completed 2026-05-08, we swept α from 0 to +200 on L55 mid-think and measured behavioral flip rates. At α = +200 the raw `base_text != modified_text` flip rate was 96 percent across 50 test prompts. We drafted internal notes framing this as the strongest causal lever in our portfolio.

A late-stage check using `.strip()` comparison revealed the actual flip rate was 32 percent. The 64-percentage-point inflation was entirely leading-whitespace artifacts: the model's first generated token differed from baseline by a leading space in approximately 30 of 50 prompts, with semantically identical content thereafter. The triple-x-inflation would have been the headline claim of a follow-up paper without the diagnostic.

#### 2.5.6 What we would have published without it

A claim that the RG probe at α = +200 produces a 96 percent behavioral flip rate, suggested as the most causal probe in our taxonomy. The diagnostic identified the actual flip rate as 32 percent — still substantial, but now correctly framed as a moderate-amplitude lever rather than a near-saturated one.

### 2.6 D6 — Trace-Length-Controlled Slope Decomposition for Trajectory-Level Statistics

This diagnostic is the novel contribution of the present paper. We introduced it as an unpublicized internal control in our κ_t cross-probe coherence paper (Vicentino, 2026e) on 2026-05-19; we make it citable here as standalone methodology.

#### 2.6.1 Claim type

Predictive (temporal). The audited claim has the form "a per-trace summary statistic computed as a linear slope over a temporal index (turns, tokens, or epochs) separates two classes of trajectories."

#### 2.6.2 Identification assumption stressed

That the slope of the temporal statistic measures *genuine within-trajectory dynamics that differ between classes*, rather than *a mechanical confound between the trajectory length and class membership*.

The pathology this catches: in agent rollouts and similar trajectory data, classes often differ systematically in trajectory length. Successful agent trajectories tend to terminate early via an explicit completion action; failed trajectories tend to exhaust a maximum-turns budget. A per-trajectory linear slope on any windowed statistic of trajectory length is then subject to mechanical confound: if the underlying statistic has a typical shape over normalized trajectory position (for example, rising in the early phase and saturating later), then trajectories sampled from different parts of the shape will have different mean slopes, even if the underlying *temporal dynamics* are identical between classes.

#### 2.6.3 The minimum-viable test

For per-trajectory slope statistic ŝ(τ) computed on trajectory τ with length n_turns(τ), and binary class label y(τ):

1. Fit a linear regression of ŝ on n_turns across all trajectories. Record the regression coefficient and the per-trace residuals.
2. Test the class effect on the residuals (Mann-Whitney U or equivalent on the residualized slope by class).
3. If the partial p-value is non-significant (e.g., p > 0.10) while the raw class-effect p-value was significant, the original slope was confounded with length.

If the diagnostic flags a confound, the rescue is **length-normalized decomposition**: split each trajectory into a fixed number of equal-length segments and compute the per-segment slope. The class effects on the segment-slopes are length-normalized by construction.

Pass criteria:

- Partial p-value after length-regression remains significant — slope finding survives the confound test.
- Partial p-value goes non-significant but segment-slopes show class effect — the claim should be reframed as *segment-level dynamics differ*, not *monotonic slope differs*.

#### 2.6.4 Cost

Length regression and Mann-Whitney are both O(N) on N trajectories — under one CPU-second. Segment-slope rescue is a single re-computation of the slope on subsequences — under one CPU-minute on hundreds of trajectories.

#### 2.6.5 Case study — Paper-9 κ_t cross-probe coherence (Vicentino, 2026e)

In our cross-probe coherence work shipped 2026-05-19, we trained five per-turn behavioral probes on Qwen3.6-27B residuals captured during SWE-bench Pro agent rollouts (99 trajectories, ~40 turns each). For each trajectory we computed a per-turn cross-probe coherence statistic κ_t (the mean absolute pairwise correlation of the five probe scores within a windowed time series) and fit a linear slope over turns. The headline finding, valid under the original analysis, was that successful trajectories had a positive κ_t slope (+0.0037/turn) while failed trajectories had a near-flat slope (+0.0003/turn), with Mann-Whitney p = 0.0003 on the class difference. We drafted the paper around this monotonic-buildup framing.

The trace-length-controlled diagnostic, run as one of five pre-registered robustness controls 12 hours before submission, revealed that successful trajectories had a median length of 37 turns (mean 35.5) while failed trajectories had a median length of 50 (mean 50.0; all failures terminated at the max-turns cap). The Pearson correlation between trajectory length and per-trace slope was −0.41 (p = 2 × 10⁻⁵): shorter trajectories had systematically more-positive slopes. After regressing slope on length, the class effect on the residualized slope had Mann-Whitney p = 0.56. The monotonic-buildup slope claim was substantially length-confounded.

The rescue — length-normalized early-half/late-half slope decomposition — recovered a stronger and length-independent finding: successful trajectories had an early-half slope of −0.0078 (versus −0.0007 in failed; p = 0.0002) and a late-half slope of +0.0149 (versus +0.0025; p = 0.00004). The temporal dynamics were genuine, but the shape was a U, not a monotonic buildup. The paper was reframed from "monotonic coherence buildup" to "U-shape explore-then-consolidate dynamics" before publication.

#### 2.6.6 What we would have published without it

A claim that κ_t shows monotonic positive buildup in successful agent trajectories and remains flat in failures, with slope p = 0.0003 as the headline statistic. The diagnostic identified the slope as substantially length-confounded (partial p = 0.56) and produced the length-normalized rescue (early/late half decomposition, p = 0.0002 and p = 0.00004) that is now the published headline. The framing was changed from "monotonic buildup" to "U-shape", which is mechanistically distinct.

---

## 3. Composition: a Decision Tree

The six diagnostics are not all required for every claim. The required subset depends on the claim type and the experimental form. We provide a decision tree to operationalize the composition.

```
                          What claim is being made?
                                     │
        ┌────────────────┬───────────┴───────────┬────────────────┐
        │                │                       │                │
  "predictive"     "mediating"              "causal/lever"   "structural"
  (probe AUROC,    (circuit              (steering shifts      (null
   recall@k,         mediates a            log-prob or          steering;
   slope, etc.)      behavior)             changes behavior)    template-
        │                │                       │              locked?)
        │                │                       │                │
  ┌─────┴──────┐         │                  ┌────┴─────────┐      │
  │            │         │                  │              │      │
  Required:    Required if      All "predictive"           │      │
  D1 (rand     N<200 and        diagnostics apply.         │      │
  baseline)    target is        Plus:                      │      │
  if N<100     sparse top-k:    D3 (control-token          │      │
                 D2 (shuffle      norm) — always           │      │
  Required if   source)         D5 (whitespace-            │      │
  the statistic                   stripped flip) —         │      │
  is a per-                       if any flip metric       │      │
  trajectory                                               │      │
  slope:                          If steering produces     │      │
  D6 (length-                     null result:             │      │
  controlled                      → run D4 (structural-    │      │
  decomp)                            rigidity α-sweep)     │      │
                                  before claiming null    │      │
                                  is real                  │      │
```

(A formal version of this decision tree, with edge labels and pass-thresholds, is provided as Appendix A.)

Three composition observations are worth highlighting:

**D1 and D2 are not interchangeable.** D1 (random-feature baseline) addresses the over-parameterization regime: K features free to interpolate N points. D2 (shuffled-source baseline) addresses the marginal-fit regime: a concentrated target marginal allows the optimizer to ignore X. Both regimes can occur in the same probe; both diagnostics are required when the probe is both small-N *and* sparse top-k.

**D3 and D4 partition steering experiments by outcome.** D3 applies when steering produces a positive log-prob shift; without it, softmax-temperature artifacts masquerade as causality. D4 applies when steering produces no behavioral change; without it, amplitude nulls masquerade as structural nulls. The same steering experiment may need *both* if it is run at multiple α values and produces mixed results.

**D6 is mandatory for any trajectory-level statistic** regardless of claim type. The length confound it catches is mechanical and unrelated to the underlying mechanism; it can corrupt predictive, mediating, and causal claims alike when the statistic is a per-trajectory slope on a temporally-extended object.

---

## 4. Comparison with Theoretical Frameworks

The six diagnostics are not a substitute for theoretical frameworks of causal identification in mechanistic interpretability. We position the checklist as a complementary operational layer.

**Causal abstraction** (Geiger et al., 2024; Beckers and Halpern, 2019) provides a formal semantics for what it means for a neural network to implement a hypothesized algorithm. The framework defines an abstraction relation between low-level (neural) and high-level (algorithmic) causal models and offers identification criteria for when a hypothesized abstraction is supported by the data. The framework is more theoretically grounded than our checklist; it is also more compute-intensive (interchange interventions across many sites), requires a hypothesized algorithm, and is most naturally applied at the circuit level rather than at the level of single linear probes or steering vectors.

**Causal scrubbing** (Anthropic, 2024) provides a procedure for testing whether a specified circuit hypothesis fully accounts for a model's behavior on a task by recursively ablating non-hypothesized paths and measuring the resulting behavioral degradation. Causal scrubbing is narrower in scope than our checklist (circuit-level mediation rather than general causal claims) and more rigorous than our D3+D4 within that scope. We view it as the gold standard for the specific case of circuit-mediation claims.

**Activation patching** (Heimersheim and Nanda, 2024; among others) is a technique, not a framework. It enables specific causal claims (token X at position P at layer L causally mediates output Y) via interchange between paired prompts. Activation patching is orthogonal to our checklist: it can be used to *make* a causal claim that our checklist would then audit. The two are complementary; activation patching does not address the failure modes our D1–D6 catch.

**Position paper of Bohnet et al. (2026)** calls for the disclosure norm we operationalize. Our checklist is one operationalization; we do not claim it is the only one or even the best one. We claim it is a working one, low-cost, and grounded in concrete failure modes we have empirically observed.

Our diagnostics, by design, do not establish causal identification in the strong sense. A claim that passes D1–D6 is not thereby identified; it has merely not failed six concrete tests that catch the specific failure modes we have empirically observed in our own work. The complementarity is therefore: theoretical frameworks for what identification *means*; our checklist for the operational floor that *anyone* should be able to clear before claiming identification.

---

## 5. Limitations

We document five limitations.

**Six diagnostics are not all diagnostics.** Diagnostics absent from our checklist that we view as candidates for future inclusion: interchange-intervention pass rates on minimal-pair counterfactuals; DAG-identifiability stress tests for circuit hypotheses; counterfactual-sufficiency tests (does the hypothesized cause being absent eliminate the effect, not merely reduce it); distribution-shift robustness for causal claims (does the identified lever still steer behavior when prompts are paraphrased or domain-shifted). We did not include these in the present checklist because we have not yet built the personal empirical case studies — we have not yet caught one of our own false claims with them. Inclusion in future versions of the checklist will require meeting this bar.

**Pass thresholds are empirical conventions, not principled bounds.** Our `lift > 0.20`, `Δ > 0.05`, `|Δ_rel| > 2 × std(Δ(controls))` thresholds are chosen to match the patterns we observed in our own walk-backs. They are not derived from a statistical-power calculation or a calibrated false-positive-rate target. Other research programs may need stricter or looser thresholds depending on their downstream cost of false-positive claims. We recommend, at minimum, reporting the underlying numbers alongside the pass/fail verdict so that readers can apply their own thresholds.

**Identification is used loosely vs. econometric usage.** Our usage of "identification" follows the loose semantic of the position paper of Bohnet et al. (2026) and the broader mechanistic-interpretability literature, not the stricter semantic of econometrics where identification requires exhaustive specification of the assumed causal graph and conditional-independence structure. The mechanistic-interpretability community has not yet converged on a formal usage; ours is a working usage, not a theoretical commitment.

**All six diagnostics were developed during work on Qwen3.6-27B in agent and probing settings.** Their generality across model families (Llama, Gemma, GPT-OSS), scales (1B-70B), and probing modalities (SAE features, attention heads, MLP neurons) is empirically untested. We expect the diagnostics to transfer in principle — the failure modes are not Qwen-specific — but specific pass thresholds may need recalibration.

**A claim that passes all six diagnostics may still be a false causal claim.** The diagnostics are necessary, not sufficient. They catch specific failure modes we have empirically observed; they do not exhaust the failure modes that can corrupt a causal claim in mechanistic interpretability. The list will grow.

---

## 6. Conclusion and Open-Source Bundle

We have operationalized the identification-assumptions disclosure norm of Bohnet et al. (2026) as a six-item diagnostic checklist, each item grounded in a documented self-walk-back from our own prior work. The checklist is bundled in an open-source Python module `openinterp.diagnostics` (Apache-2.0) with a Colab notebook demonstrating each diagnostic on a toy probe trained on a synthetic SAE-feature corpus with intentionally injected failure modes that the diagnostics catch. Submission to the ProbeBench leaderboard at openinterp.org/probebench requires running all six diagnostics; results are displayed alongside the headline AUROC.

We invite extensions to the checklist. The criterion for inclusion we would prioritize: a diagnostic must have caught a concrete published-or-near-published false claim in its proposer's prior work. Our six meet that bar; we ask the community to meet the same bar for additions.

A research field that makes causal claims should be able to falsify them cheaply. The six diagnostics presented here are a working floor for that capability in mechanistic interpretability. None of them are theoretically novel; their composition into a runnable checklist with documented thresholds and case studies is the contribution.

---

## Appendix A. Diagnostic Dependency Graph (formal)

This appendix expands the §3 decision tree with edge labels, pass-thresholds, and recommended order of operations. The presentation is in three parts: A.1 the claim-type taxonomy that drives diagnostic selection, A.2 the per-diagnostic decision rule with formal thresholds, and A.3 the recommended order of operations including short-circuit conditions.

### A.1 Claim-type taxonomy

We distinguish four claim types. The taxonomy is operational, not theoretical; it is the partition over which our diagnostics divide cleanly.

| Claim type | Canonical form | Example | Required diagnostics |
|---|---|---|---|
| **Predictive (cross-sectional)** | "Probe on features F predicts label Y with metric M ≥ threshold at sample size N." | AUROC ≥ 0.80 on patch-success | D1 if N<100; D2 if Y is sparse top-k |
| **Predictive (temporal)** | "Per-trajectory slope of statistic S over temporal index t separates classes." | κ_t slope p < 0.05 | All of the above + D6 |
| **Mediating / circuit** | "Component C at layer L mediates behavior B; ablating C degrades B by Δ." | Causal scrubbing within scope | Out of scope for this checklist; defer to causal scrubbing |
| **Causal lever (positive)** | "Steering at direction d, coefficient α shifts log-prob of token X by Δ > threshold." | Δlog-prob(finish) = +0.48 at α=+2 | D3 always; D5 if behavioral flip is reported |
| **Causal lever (null)** | "Steering at direction d shows no behavioral change at α ∈ {±2, ±5}; direction is not causal." | L55 CoT probe rigid at α=±5 | D4 always |

The five diagnostics that apply to our claim types (D1, D2, D3, D4, D5, D6) cover all four predictive and causal-lever rows. Mediating-circuit claims are out of scope: causal scrubbing is the right tool there and we do not duplicate it.

### A.2 Per-diagnostic decision rules

The compact form. For each diagnostic the table lists the headline statistic, the pass threshold, the "caveat" threshold (publish but with explicit hedge), and the "retract" threshold (do not publish the headline).

| Diagnostic | Headline statistic | Pass | Caveat | Retract |
|---|---|---|---|---|
| **D1** Random-feature baseline | `lift = real_AUROC − mean(random_AUROC)` over ≥50 random draws | `lift > 0.20` | `0.10 ≤ lift ≤ 0.20` | `lift < 0.10` |
| **D2** Shuffled-source baseline | `Δ = real_recall − shuffled_recall` from `X_train` permuted, `y_train` fixed | `Δ > 0.10` or Cohen's d > 0.5 | `0.05 ≤ Δ ≤ 0.10` | `Δ < 0.05` |
| **D3** Control-token normalization | `Δ_rel = Δ(target) − mean(Δ(controls))` over ≥5 controls within 3 nats baseline | `\|Δ_rel\| > 2 × std(Δ(controls))` | `1 × std < \|Δ_rel\| ≤ 2 × std` | `\|Δ_rel\| ≤ 1 × std` |
| **D4** Structural-rigidity α-sweep | behavior at α ∈ {0, +5, +20, +50, +100, +200} on probe AND random direction | output diverges at some α — **amplitude null** | (no caveat regime) | output rigid at α=+200 for both — **structural null** |
| **D5** Whitespace-stripped flip | `flip_rate(stripped) = mean(base.strip() != mod.strip())` | report stripped only | (n/a) | (n/a) |
| **D6** Length-controlled decomposition | partial p of class effect on slope residualized by trajectory length | partial p < 0.05 (raw class effect survives) | partial p in [0.05, 0.20] (rescue via segment-slopes) | partial p > 0.20 (slope is confounded; rescue or retract) |

Two notes on the table.

First, D4 has no "caveat" regime. The amplitude-null vs structural-null distinction is qualitative; a sweep that diverges only at α = +200 (right at ‖h‖ saturation) is genuinely ambiguous and we recommend reporting both interpretations rather than picking a threshold.

Second, D5 has no thresholds because it is a measurement-correction rule, not a hypothesis test. The stripped-flip metric *replaces* the raw flip metric in the headline; the raw is reported in an appendix or footnote for transparency.

### A.3 Recommended order of operations

The order minimizes total compute by short-circuiting on early failures. We recommend it for a single new probe / steering result; once a probe has passed all applicable diagnostics, subsequent claims about the same probe can re-use the results.

```
1. Identify the claim type from §A.1.
2. If predictive at N < 100:
     RUN D1.
     If lift < 0.10 → STOP. Retract headline; reframe as null.
     If 0.10 ≤ lift ≤ 0.20 → continue, but headline carries the caveat.
3. If predictive at N < 200 AND target is sparse top-k:
     RUN D2.
     If Δ < 0.05 → STOP. Retract; reframe as marginal-fit pathology.
     Else continue.
4. If temporal (trajectory-level slope):
     RUN D6.
     If partial p > 0.20 → ATTEMPT RESCUE via segment-slopes.
       If segment-slopes also non-significant → STOP. Retract.
       If segment-slopes significant → REFRAME (e.g., "U-shape" not "monotonic").
     Else continue with original slope claim.
5. If causal-lever positive (steering produces log-prob shift):
     RUN D3.
     If |Δ_rel| ≤ 1 × std(Δ(controls)) → reclassify as detection-only; retract causal claim.
     If headline reports a behavioral flip rate:
       RUN D5 (compute the stripped-flip metric; replace raw in headline).
6. If causal-lever null (steering produces no behavioral change at α ∈ {±2, ±5}):
     RUN D4.
     Amplitude null → next session: rerun at the divergence α with controls.
     Structural null → reframe; lever is upstream (input tokens, chat template).
7. Pair surviving causal claims with a triple-source convergence check
   (Δ_rel + behavioral flip + continuous-generation), per Vicentino (2026d).
8. Document the diagnostic verdicts in the paper's identification-assumptions
   section. Quote the pass/caveat/retract thresholds verbatim from §A.2.
```

Short-circuit logic is critical at small N: D1 and D2 are the cheapest of the six (CPU-only, <10 minutes) and they kill the largest fraction of false claims we have observed. Running them first protects you from spending GPU time on D3-D6 against a result that was already noise floor.

### A.4 What this appendix does not cover

The decision tree does not address: (1) sample-size targeting (how big should N be?), (2) multiple-comparison correction across diagnostics (we recommend reporting each diagnostic's p-value separately rather than pooling), (3) interaction effects between diagnostics (e.g., does D1 passing inflate D3's effective false-positive rate?). These are open research questions for v0.2 of the checklist.

## Appendix B. Pre-Registration Memory Files

This appendix reproduces, verbatim, the six dated feedback-memory entries that pre-registered each diagnostic before its corresponding case-study walk-back. The entries are reproduced from our internal research notes and dated by their creation timestamp; we have not edited them for clarity or to align with the present paper's framing. Cross-references between entries (e.g., "Sibling to Phase 6c") are preserved as written.

The purpose of this appendix is to provide the reader with an auditable pre-registration trail. The dates established the diagnostic *before* the case-study paper in which the diagnostic later walked back a near-publication-ready claim.

### B.1 D1 — Random-feature baseline + capacity sweep (dated 2026-05-07)

> **For ANY linear probe paper at N < 100 (esp. <50), report BOTH:**
>
> 1. **Random-feature baseline at the same N** (top-K random feature selection, 50+ draws). If random achieves AUROC > 0.70, top-K is over-parameterized and headline number is suspect.
> 2. **Capacity sweep across K** (K=5, 10, 20, 50, 100, 200). If "best probe" AUROC depends heavily on K, signal may be sample-dependent. Use K ≈ sqrt(N) or K=10 as default.
>
> **Why:** SWE-bench probe at Phase 5d N=17, K=50 reported AUROC=1.000 across multiple probes — looked spectacular. Random-feature baseline at same N showed mean 0.94, p95 1.000 → top-50 was shattering the data. At Phase 6c N=42, same probes collapsed to 0.50-0.66 with K=50, but L43 pre_tool with K=10 shows 0.76 vs random 0.50 (gap +0.27) — real signal at right capacity.
>
> **How to apply:**
>
> - Add as mandatory section to every linear probe notebook before claiming AUROC ≥ 0.80 at N < 100
> - If gap-vs-random > 0.20 → real signal, paper-grade
> - If gap-vs-random 0.10-0.20 → moderate signal, caveat in paper
> - If gap-vs-random < 0.10 → noise floor, probe-grade signal absent at this capacity/position
> - Both checks are ~10 min compute each — no excuse to skip
>
> **Reference**: SWE-bench Phase 6c methodology sweep at N=42 (eval v4, 2026-05-07).

### B.2 D2 — Shuffled-source baseline for sparse top-k probes (dated 2026-05-16)

> Any linear probe whose target is a **sparse top-k indicator vector** (e.g., SAE features fired, MoE experts routed, top-k attention heads, top-k vocabulary tokens) MUST report a **shuffled-source baseline** alongside the real recall@k metric:
>
> 1. Build train/test split as normal.
> 2. For the BASELINE training: shuffle `X_train` across the sample axis while leaving `y_train` in original order. This breaks the (input, target) correspondence while preserving both marginals.
> 3. Train an identical probe (same init, same loss, same hparams, same epochs) on the shuffled data.
> 4. Evaluate on the SAME real test pair `(X_test, y_test)`.
> 5. Report `Δ = REAL − SHUFFLED` next to absolute REAL. Cohen's d on the per-sample recall vector is the headline.
>
> If `Δ < 0.05` absolute or Cohen's d < 0.3, the probe is **not predictive** — it is fitting the marginal distribution of the target. Do not claim "predictive" in the paper. Reframe the finding.
>
> **Why:** On 2026-05-04 the PSAE v1.5 notebook trained 12 probes (3 layers × 4 source fractions, Qwen3.6-27B, d_sae=65536, k=128) to predict end-of-thinking SAE features from earlier-thinking residuals. Recall@1024 hit 0.83-0.87 at L11/L31, 0.67-0.72 at L55. Looked paper-grade. On 2026-05-16 the shuffled-source baseline (B1) reproduced REAL recall within ±0.03 at **all 12 sites**. The probe wasn't predicting per-prompt structure — it was learning that ~1024 features fire universally at end-of-thinking and outputting those regardless of input. The "predictive trajectory" claim died, paper-3 reframed as honest-negative.
>
> The pathology: with N_train << d_target, top-k ranking loss + AdamW pushes the probe to maximize positive-vs-negative logit margin on training data. When the target has a concentrated marginal (some features fire on most prompts), the optimal "lazy" solution is to output those globally-common features at high logit regardless of input. Recall@K captures this perfectly when K ≥ |universal support|.
>
> **How to apply:**
>
> - **Probe inputs**: SAE features, residual stream activations, MLP hidden states, attention outputs — anything dense.
> - **Probe targets**: SAE top-k features (sparse top-k indicator), MoE expert routing top-k, top-k attention head selection, top-k vocabulary, top-k token-level features.
> - **Loss families that need this check**: top-k ranking loss, contrastive top-k loss, BCE on multihot targets, sigmoid cross-entropy on indicator vectors.
> - **N threshold**: mandatory at N_train < 200. Strongly recommended at any N if target has known concentration.
> - **Trivially cheap**: shuffled baseline uses the SAME compute path as the real probe. Add a single experimental arm.
> - **Sibling to Phase 6c (random-feature baseline)**: that rule catches AUROC=1.000 at low N. THIS rule catches recall@K = 0.85 at low N when target is sparse top-k.

### B.3 D3 — Control-token normalization for steering (dated 2026-05-07)

> In any activation-steering experiment claiming "Δlog-prob of target token X shifted by +Y nats at α", you MUST also report Δlog-prob of CONTROL tokens (semantically unrelated targets at similar baseline log-prob). The metric to report is `Δrel = ΔX − mean(Δcontrols)`.
>
> **Why:** Out-of-distribution residual states (which steering perturbations easily produce) cause uniform softmax temperature shifts. A naive "Δlog-prob(X) = +0.5" looks like target-specific causal evidence but is often just `+0.5 nats applied to ALL vocab` from temperature change. Subtracting the mean control-token shift exposes the true target-specific component.
>
> **Concrete failure caught**: SWE-bench Phase 7 micro-pilot (2026-05-07). Naive output reported FAILS Δlog-prob(finish) = +0.479 at α=+2 — looked causal. Post-hoc analysis showed `search`, `execute`, `write`, `read`, `wait` ALL shifted by ~+1.0 nats too. Δrel = -0.046 (essentially zero). Probe is epiphenomenal, not causal. Without control-token normalization, paper would have made false causal claim.
>
> **How to apply:**
>
> - Pick 5+ control tokens at baseline log-prob within ~3 nats of target
> - Report both raw Δ(target) and Δrel = Δ(target) − mean(Δ(controls))
> - If Δrel ≈ 0 (within ~2× std of control shifts) → probe is detection-only, not causal lever
> - Pair with behavioral test (single-shot generation, continuous generation) for triple convergence
>
> **Reference**: SWE-bench Phase 7 eval v5. Triple-source convergence pattern is now the standard for any probe-causality claim in OpenInterp work.

### B.4 D4 — Structural-rigidity α-sweep (dated 2026-05-07)

> When a forward-hook steering experiment produces zero behavioral change at α ∈ {±2, ±5}, do NOT declare null yet. Sweep α to multiples of the residual L2 norm (e.g., α=+50, +100, +200) AND verify with both probe direction and random direction.
>
> **Why:** Two outcomes are scientifically distinct:
>
> 1. **Amplitude null** — α was too small for the regime; output diverges at large α (e.g., degenerate at α=+50). Means probe direction has weak but real causal authority; experiment was under-powered.
> 2. **Structural null** — output stays rigid even at α >> ‖residual‖, with both probe AND random directions. Means the decision is locked in prompt tokens upstream of any residual the probe could be trained on. The lever is in input-construction, not in the residual stream.
>
> These two cases require very different paper claims and different next steps. Conflating them is a methodology error.
>
> **Concrete failure caught**: SWE-bench Phase 8 (2026-05-07). L55 CoT-Integrity probe AUROC 0.91 at N=240. Bidirectional steering at α=±5 produced 32 identical generations. Without amplitude diagnostic, would have looked like "amplitude null — try bigger α next session". Sweeping to α=+200 (perturbation 27% above residual norm) revealed identical output for both probe AND random — structural null. Diagnosed root cause: `enable_thinking=False` chat template injects `<think></think>` token pair before generation, so the no-thinking decision is in prompt text, not steerable from any layer's residual at last-position.
>
> **How to apply**:
>
> 1. If first sweep at α ∈ {±2, ±5} shows zero behavioral change, BEFORE adding `try_bigger_alpha` to next session:
> 2. Run amplitude diagnostic: α ∈ {0, +5, +20, +50, +100, +200} on one target with both probe AND random direction. Print pre/post residual norms and Δ inside the hook to verify modification.
> 3. If output diverges at some α threshold → amplitude null, plan a properly-scoped follow-up at that α.
> 4. If output stays rigid at α=+200 with probe AND random → **structural null**. The decision is in input tokens. Examine the last ~10 tokens of the prompt; chat template auto-injection is the most common culprit in instruction-tuned models. Document this as the failure mode and consider token-level intervention (input-construction layer) as future work.
> 5. Cost: <60s of GPU compute, catches a confident-but-wrong null verdict.

### B.5 D5 — Whitespace-stripped flip metric (dated 2026-05-08)

> **Hard rule.** Any α-sweep behavioral flip metric must compare `base.strip() != modified.strip()`, never raw string equality.
>
> **Why**
>
> At α >> ‖h‖ the model's first generated token sometimes differs only in a leading whitespace from baseline — a tokenization artifact under OOD residual perturbation, with semantic content identical. Raw `!=` counts this as a behavioral flip. Phase 10 (2026-05-08) RG L55 mid_think at α=+200 reported 96% raw flip; stripped comparison revealed 32%. The 64pp inflation was entirely whitespace.
>
> Concretely: baseline = `"Here's a thinking process: ..."`, α=+200 = `" Here's a thinking process: ..."` (one extra leading space). Same content, different string. Repeated across ~30 of 50 prompts, hence 96% inflated rate.
>
> **How to apply**
>
> In every α-sweep notebook + every paper steering claim, the flip metric is:
>
> ```python
> def stripped_flip(b, m):
>     return b.strip() != m.strip()
> ```
>
> Add to paper-3 sanity-check stack as 4th check, alongside:
>
> 1. Random K-matched probe baseline
> 2. Control-token normalization for log-prob shifts
> 3. Structural-rigidity α-sweep at α >> ‖h‖
> 4. **Whitespace-stripped behavioral flip metric** (this rule)
>
> For interactive smoke checks, also inspect with `repr()` on a few prompts at the high-flip α to catch artifacts visually before scaling to full sweep. If diff is only leading/trailing whitespace → stripped flip will reveal the artifact.
>
> This lesson cost 0 compute (caught at smoke time, before full sweep) but would have cost a publishable false claim if missed at the verdict stage.

### B.6 D6 — Trace-length-controlled slope decomposition (formalized in this paper, 2026-05-19)

D6 was not pre-registered as a standalone diagnostic the way D1-D5 were. We applied it as one of five pre-registered robustness controls in the κ_t cross-probe coherence paper (Vicentino, 2026e). The control caught a substantial length confound in our headline monotonic-buildup slope statistic approximately 12 hours before submission. The rescue (length-normalized early-half / late-half slope decomposition) became the published U-shape framing.

We formalize the diagnostic as standalone methodology in the present paper to make it citable independently of the κ_t paper. The internal control text from 2026-05-19 reads:

> **C1 — length-regression confound check.** For per-trajectory slope statistic ŝ over trajectory length n_turns, fit `ŝ ~ n_turns` across all trajectories. Test the class effect (success vs failure) on the residualized slope. If partial p > 0.20, the original slope finding is substantially length-confounded; rescue via length-normalized decomposition (e.g., early-half / late-half slopes, or fixed-K segment-slopes).
>
> **Rescue procedure.** Split each trajectory into K equal-length segments. Compute per-segment slope. Test class effect per segment. Report the segment-level finding as the rescued headline; the original monotonic-slope claim is retracted.
>
> **Applied to κ_t (2026-05-19).** Successful trajectories had median 37 turns (mean 35.5); failed had median 50 (mean 50.0, all hit max-turns cap). Pearson correlation length × per-trace slope = −0.41 (p = 2 × 10⁻⁵). Raw class effect Mann-Whitney p = 0.0003; partial p after length regression = 0.56. Original headline retracted. Early-half slope p = 0.0002 (succ more negative); late-half slope p = 0.00004 (succ more positive). U-shape rescue became the published headline.

The formalization in §2.6 of the present paper is the citable form. After publication of this paper, we will retroactively pre-register D6 in our internal notes alongside the other five.

## Appendix C. Software Versions

- Python 3.9 / 3.11
- `transformers` from `main` commit `73d9159…` (Phase 6 capture); analysis is residual-only and version-independent
- `numpy` 1.26 / `scikit-learn` 1.4 / `scipy` 1.13 / `safetensors` 0.4
- GPU for case-study captures: NVIDIA A100 80GB (Colab Pro+); CPU for all six diagnostics

## Appendix D. Reproducibility

- Code: github.com/OpenInterpretability/openinterp-swebench-harness (Apache-2.0); diagnostics SDK: pip install openinterp; demo notebook: openinterp.org/diagnostics
- Data: HF dataset caiovicentino1/openinterp-six-diagnostics-six-walkbacks (forthcoming)
- Paper PDF: Zenodo DOI forthcoming

---

## References

- Beckers, S. and Halpern, J. (2019). *Abstracting Causal Models.* AAAI.
- Bohnet, A. et al. (2026). *Position: Mechanistic Interpretability Must Disclose Identification Assumptions for Causal Claims.* arXiv:2605.08012.
- Anthropic. (2024). *Causal Scrubbing.* Transformer Circuits Thread.
- Geiger, A. et al. (2024). *Validating Mechanistic Interpretations: An Axiomatic Approach.* JMLR.
- Heimersheim, S. and Nanda, N. (2024). *How to Use and Interpret Activation Patching.* Tutorial.
- Vicentino, C. (2026a). *agent-probe-guard v0.1.* openinterp.org/research/papers/agent-probe-guard.
- Vicentino, C. (2026b). *SWE-bench Pro Failure Anatomy on Qwen3.6-27B (Phase 5d → 6c).* github.com/OpenInterpretability/openinterp-swebench-harness.
- Vicentino, C. (2026c). *Marginal-Fit Pathology in Predictive Sparse Autoencoders.* openinterp.org/research/papers/marginal-fit-pathology-psae.
- Vicentino, C. (2026d). *Saturation-Direction Probe Levers: A Five-Class Taxonomy in Qwen3.6-27B.* openinterp.org/research/papers/saturation-direction-probe-levers. And *Two Forms of Epiphenomenal Probes in Code Agents.* openinterp.org/research/papers/two-forms-epiphenomenal-probes.
- Vicentino, C. (2026e). *Explore-Consolidate Dynamics in Cross-Probe Coherence Separate Successful and Failed LLM Agent Trajectories.* Zenodo DOI 10.5281/zenodo.20278983.
- Vicentino, C. (2026f). *Conditionally-Causal Probes: Five Operational Constraints on Linear-Probe Causality in Qwen3.6-27B.* openinterp.org/research/papers/conditionally-causal-probes.

---

## Writing plan (drop before submission)

| Day | Deliverable | Status |
|---|---|---|
| D1 (2026-05-19) | Outline + abstract + §1 + §2 template + §3-§6 stubs | ✅ shipped |
| D1+ (2026-05-19) | §2.1-§2.6 full case studies + §3 decision tree + §4 framework comparison + §5 + §6 | ✅ shipped (this version) |
| D6 | Colab notebook demonstrating all 6 on toy probe with injected failure modes | pending |
| D6 | Appendix A formal decision tree + Appendix B pre-reg memory excerpts | pending |
| D7 | Internal review pass + figure caption polish + reference cleanup + ship to Zenodo + HF + openinterp.org + tweet | pending |
