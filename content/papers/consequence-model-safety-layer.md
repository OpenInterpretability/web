# When Does a Consequence Model Make AI Agents Safer?
### Pre-registered studies on demo apps, real self-hosted apps and a real terminal

**Caio Vicentino · OpenInterpretability · Published 2026-10-06.**
**Zenodo · CC-BY-4.0 · [DOI 10.5281/zenodo.23197341](https://doi.org/10.5281/zenodo.23197341).**

> The on-site summary. The full paper (every table, the pre-registrations and how every number is recomputed) is the
> **[PDF](/papers/consequence-model-safety-layer.pdf)**; the per-run data and the scripts are in
> **[paper/agents](https://github.com/OpenInterpretability/ekbasis/tree/main/paper/agents)** on GitHub, and the tasks,
> apps, adapters and judges to rerun the studies in its
> **[benchmark](https://github.com/OpenInterpretability/ekbasis/tree/main/paper/agents/benchmark)** folder.

---

## Abstract


An agent that cannot see what an action will change will sometimes do the wrong thing. We gave agents one extra tool
that asks Ekbasis-27B, an open consequence model that answers in one forward pass, what an action would change, and
measured harm and task success in studies whose plans were hashed before the runs (recorded locally; the documents are
released with the paper).

- **Real apps, Claude Sonnet.** On unmodified Gitea, Nextcloud and Roundcube driven through a real browser, with the truth
  read from the apps themselves, Claude Sonnet 5.5's harmful runs fell from 25.0% to 4.2% in a pre-registered secondary
  contrast with one run per task (95% CI over tasks [−37.5, −6.2]; over the 9 task families [−47.8, 0.0]). Its safe
  success did not fall, more of its runs stopped short (16.7% against 2.1%), and most of the drop came from tasks whose
  request itself names the harmful action.
- **Real apps, Claude Haiku.** The pre-registered hypotheses failed: Haiku 4.5 went from 66.7% to 58.3% and stayed above
  Sonnet alone; it avoided the harm in only 19 of the 87 runs in which it was warned (Sonnet: 17 of 18).
- **Turning warnings into safe actions.** A pre-registered follow-up on 32 fresh tasks changed what the guard does with a
  warning: it offers a safer way that Ekbasis has checked, and asks the user when there is none or when the request
  itself names the harm. With the user simulated by a script that reads every question perfectly, Haiku's harmful runs
  fell from 72.9% to 2.1%, and in a secondary arm Sonnet's from 50.0% to 8.3%. Asking the user before every
  consequential click, without Ekbasis, also avoided the harm (the scripts had been checked to object to its question on
  each harmful path); the Ekbasis guard asked 0.83 questions per run against 1.91, where the plan's bar was a quarter as
  many, so that hypothesis failed.
- **Our demo apps.** Harmful runs fell for all five models tested (six configurations): from 24/60 to 0/60 for Sonnet,
  6/30 to 0/30 for GLM-5.3-Flash and 27/60 to 7/60 for Qwen 3.5 9B, among others. A placebo reminder did not help Sonnet;
  Claude Sonnet answering the same questions did as well as Ekbasis on the original set (1/84 each) and worse on the
  fresh set (10/60 against 0/60, all in one app).
- **Three studies failed their bars:** look-ahead and a state tracker, where the agent alone was at the ceiling, and
  τ-bench retail, whose policy states the consequences and where policy-check violations rose with Ekbasis.
- **A real terminal.** A Claude Code hook asked on 2.9 per 100 commands of a careful agent (client 0.1.3); in two small
  studies of Claude Haiku on three tasks with planted user work, the work was kept in 9/9 sessions with the hook against
  5/9 and 7/9 without it (the first study exploratory; the intervals overlap).
- **Against another world model.** In the one-pass format Ekbasis was trained on, Ekbasis was more accurate than
  Qwen-AgentWorld-35B-A3B (3B active parameters) on all 12 of our question suites; reasoning first, AgentWorld won 1,
  showed no resolved difference on 9 and lost the 2 guard suites, where its reasoning hit the 8,192-token cap on most
  items.

## Why it matters

The harm agents do with benign requests often comes from what the screen does not state: a button that also deletes
real orders, a cancellation that takes the return flight with it, a folder link that exposes more than the user meant.
With a consequence model in the loop, Claude Sonnet did less of it. A smaller agent needed more than a warning: when the
request itself names the harmful action, it goes ahead. A guard that tells what was asked from what comes beyond it,
offers a safer way it has checked, and asks the user when there is none made Haiku safe on fresh tasks with a simulated
user; asking every time did as well with more questions. Real users are the next test.

## Key results

- **Hidden consequences, demo apps (Claude Sonnet, pre-registered).** Fresh set: 24/60 harmful runs alone, 0/60 with
  Ekbasis, 22/60 with a placebo and 10/60 with Claude answering the same questions, all 10 in the bank app.
- **Five models.** Every harm difference over tasks is below zero; the relative cut was smaller for the two Qwen models
  (74.1% and 36.7%). Alone, Haiku did exactly as Sonnet and GLM did less harm, so the comparisons with Sonnet alone show
  the effect of the forecast, not a weaker agent lifted above a stronger one.
- **Cost.** Haiku with thinking off plus Ekbasis costs 1.02 [0.94, 1.12] times Sonnet alone in Claude spend per run,
  before pricing the GPU that serves Ekbasis.
- **The follow-up's hypotheses (pre-registered).** R2-H1 passed (Haiku asking through Ekbasis against Haiku alone:
  −70.8 [−87.5, −50.0]); R2-H3 passed (checked safer ways without asking, against the plain guard: −16.7 [−33.3, −2.1]);
  R2-H2 failed (43% as many questions as always asking, against a bar of 25%).
- **Sonnet in the follow-up (secondary, one run per task).** Fresh tasks were harder: Sonnet alone did harm in 50.0% of
  them, against 25.0% in the first real-apps study. Asking through Ekbasis took it to 8.3% (−41.7 [−62.5, −20.8]) and its
  safe success from 45.8% to 75.0%. Its two harmful runs were deliberate: once it declined the checked safer way, and once
  it set aside the simulated user's answer because it arrived as a tool result ("it wasn't from you"). A user's answer
  has to reach the agent through the user's channel.
- **Real terminal.** Client 0.1.3 asks 2.9 times per 100 commands of a careful agent, against 10.7 for 0.1.2 on the same
  commands, measured on the tasks the fixes were designed on.

## Limits

The tasks are ours, written to have a hidden consequence and a safe path; the real-apps studies remove our apps, not our
tasks. They are released with the apps, adapters and judges, so others can rerun the studies and add tasks of their own. On our demo apps the Claude agents and
GLM did harm alone only in two of five apps, and resampling apps every interval reaches zero. The adapter does part of
the work: it reads the state, chooses the questions and, in the follow-up, builds the safer ways, written by hand per
action type. In the follow-up the user is a script that reads every question perfectly and never tires of approving.
One or two runs per task. The pre-registration documents are published with the paper (only machine paths replaced),
with the hashes recorded at each freeze and a script that checks them; the look-ahead study's plan has no recorded hash.

## Reproducibility

The per-run tables of every study and the per-item vectors of the AgentWorld comparison are released. `reproduce.py`
recomputes every number in the paper from them and from three aggregated tables, and `check_numbers.py` fails if the
paper cites a number it does not produce. The `benchmark` folder holds the tasks, the demo apps, the real apps' Docker
Compose file (official images pinned by digest), the seeding, adapters, judges, stages, agent tools and runners; its
README runs one task end to end with any agent and any Ekbasis server. Every reference was resolved against arXiv,
Crossref, DataCite or its official URL, and every venue cited for a preprint was checked. The first paper on Ekbasis is
[Look When Unsure, Check When Sure](/research/papers/look-when-unsure) (DOI 10.5281/zenodo.23146970).
