# Ekbasis real-users study: the EKBASIS100 cohort

**Pre-registration protocol, version 1 (DRAFT, NOT FROZEN).**
Owner: Caio Vicentino (OpenInterpretability). Drafted 2026-10-10.

The paper *When Does a Consequence Model Make AI Agents Safer?* (`content/papers/consequence-model-safety-layer.md`,
DOI 10.5281/zenodo.23197341) ends with "Real users are the next test." This document fixes, before any outcome data
from the cohort is analysed, what we will measure on the first real users of the hosted Ekbasis API, how each number
is computed from our telemetry, and what result counts as success or failure. Everything below is observational: we
change nothing in the product for the cohort, assign no treatment and make no causal claim.

---

## 1. Questions

| # | Question | Kind |
|---|---|---|
| Q1 | **Adoption.** Do people who redeem the launch coupon create an API key and make calls? | primary |
| Q2 | **Retention.** Of those who make a call, how many are still calling on day 1, in week 2 and a month later? | primary |
| Q3 | **Usage patterns.** Which endpoints and client surfaces are used, how many input tokens per call, how often calls fail and why? | descriptive |
| Q4 | **Outcome quality.** When users tell us, how often was the prediction correct? | primary (conditional on enough feedback, §6.3) |
| Q5 | **Safety value.** How often do users report that Ekbasis stopped them from doing something bad, against how often it raised a false alarm? | secondary, descriptive |

Out of scope: whether Ekbasis *causes* fewer harmful actions for these users (there is no control condition and we
never see what the user did next); revenue; anything that needs the contents of a request.

## 2. Design

- **Type.** Prospective observational cohort with a contemporaneous comparison group, analysed once at the end of the
  observation window (§5). The live admin view (`/console/admin`, tab *Study*) shows the numbers as they accrue; looking
  at it is allowed, but no success/failure call is made, and no criterion in §6 is changed, before the final analysis.
- **Cohort (C).** Every account that redeemed the coupon `EKBASIS100` (public launch coupon: $1 = 25M input tokens,
  limited to the first 100 accounts). Source: `cpn:log:EKBASIS100` (one entry per redemption; the redemption time is
  the entry's `t`; one redemption per account is enforced by `cpn:red:EKBASIS100:<uid>`).
- **Comparison group (G).** Accounts that signed up on or after the coupon's `createdAt` and did not redeem it
  (paid users and users who signed up but did not redeem). It is not a control: these people chose differently, and
  the comparison is descriptive.
- **Exclusions (both groups), applied before any number is computed:**
  1. accounts marked internal: Hexclave `serverMetadata.internal === true` (set in *Admin → Users → user → Internal
     account*; every change is in the audit log as `user.update`);
  2. the admin accounts (emails in `ADMIN_EMAILS`);
  3. accounts deleted before the analysis (their activity is no longer attributable).
  Every account we, our collaborators or our test harnesses use **must be marked internal before the freeze**. An
  account marked internal after the freeze is a deviation (§9) and is reported.
- **Anchor (day 0).** For C, the UTC day of redemption. For G, the UTC day of sign-up.

## 3. Data sources (all in Upstash Redis, written by the gateway after the response; metadata only)

| Key | Content | Kept |
|---|---|---|
| `tel:stream` | one JSON event per gateway request (`t, uid, email, key[last 4], path, status, tok, ms, ip, country, err, rid, cl, sf`) | ~20k most recent |
| `tel:u:<uid>` | lifetime counters: `req`, `tok`, `err`, `last`, `firstOk` | no expiry |
| `tel:ulog:<uid>` | that user's last 200 events (same shape as the stream) | last 200 |
| `tel:uact:<uid>` | hash UTC day (`YYYYMMDD`) → number of 2xx calls that day | 400 days |
| `tel:ucalls:<uid>` | compact call records `{t, rid, p, s, tok, ms, sf, cl}`: **no IP, no email** | last 10,000, 400 days |
| `fb:rid:<rid>` | owner of a request id `{u, t, p, s}`, so feedback can be checked against its caller | 30 days |
| `fb:stream`, `fb:user:<uid>`, `fb:u:<uid>`, `fb:d:<day>`, `fb:total` | feedback entries and counters by verdict | ~100k / last 1000 / 400 d |
| `cpn:log:EKBASIS100`, `cpn:user:<uid>` | redemptions | last 500 / last 100 |
| Hexclave | account: sign-up time, API keys (creation times), `serverMetadata.internal` | — |

**Instrumentation date (T_inst).** `rid`, `cl`, `sf`, `tel:uact`, `tel:ucalls` and the feedback endpoint exist only
from the deployment of this instrumentation. For activity before T_inst, active days and first call come from
`tel:ulog` (last 200 events per user), which is exact for any user with fewer than 200 requests before T_inst. T_inst
is recorded in §10 at deployment, and every redeemer whose pre-T_inst requests exceed 200 is listed as a limitation.

## 4. Metrics (exact definitions)

Definitions are implemented once, in `lib/study.ts`, and both the admin view and the export use them.

- **Call.** A gateway request attributed to the user (valid API key) whose response status is 2xx.
  `/health` is never a call (no key, not recorded). Feedback requests are not calls (they do not reach the gateway's
  telemetry).
- **Attempt.** Any gateway request attributed to the user, any status (`tel:u.req`).
- **Active day.** A UTC day with ≥ 1 call: the keys of `tel:uact:<uid>` with value > 0, united with the UTC days of
  2xx events in `tel:ulog:<uid>`.
- **Created a key.** The account has ≥ 1 API key in Hexclave (valid, revoked or expired), regardless of when it was
  created. Reported alongside: share whose first key was created *after* the anchor.

**M1 — funnel (Q1).** Strict stages, each a subset of the previous one: (1) entered (C: redeemed; G: signed up), after
exclusions; (2) created a key; (3) ≥ 1 call; (4) active on ≥ 3 distinct days. Reported as counts, share of (1), and
share of the previous stage.

**M2 — adoption (primary for Q1).** Share of C whose first call happened at or before redemption + 14 × 24 h (a
call before redemption counts). First call time = the earlier of `tel:u.firstOk` (set on the first 2xx after T_inst)
and the earliest 2xx event in `tel:ulog`. Denominator: all non-excluded redeemers whose 14-day window has closed.

**M3 — retention (Q2).** Among users of the group with ≥ 1 call, with day 0 = anchor:
- **D1** = active on day 0 + 1;
- **D7** = active on any day in 0 + 7 … 0 + 13;
- **D30** = active on any day in 0 + 30 … 0 + 36.
A user is eligible for a window only once its last day has ended (UTC); before that the value is *censored* and the
user is left out of that denominator. **Primary: D7 for C.**

**M4 — usage patterns (Q3), over all calls and attempts of non-excluded C users in the window:**
- calls per `path` (e.g. `/v1/systemone`, `/v1/evaluate`) and per `sf` (client surface, e.g. `git-check`,
  `shell-check`, `preflight`, `mcp`, `hook`; `null` when the client does not send `X-Ekbasis-Surface`);
- client versions from `cl` (User-Agent, first 80 characters);
- input tokens per call (`tok` of 2xx calls): median, p10, p90, per user and pooled;
- error rate = non-2xx attempts / attempts, by status (401, 402, 403, 4xx, 503, other 5xx); 402 (out of credit) is
  reported apart, since it measures exhaustion of the coupon, not a failure;
- calls per active day per user (median);
- gateway latency `ms` of calls: median and p90;
- tokens consumed / 25M granted (coupon exhaustion), per user.

**M5 — reported correctness (Q4).** Feedback arrives through `POST /api/v1/feedback` with `verdict ∈ {correct, wrong,
prevented_harm, false_alarm}`; one feedback per request id, only from the request's owner (§7). A *rated call* is a
feedback with verdict `correct`, `wrong`, `prevented_harm` (the prediction warned and was right) or `false_alarm` (it
warned and was wrong). Reported correctness = (`correct` + `prevented_harm`) / all rated calls.
Primary estimate: the pooled share with a 95% CI from a cluster bootstrap over users (10,000 resamples, seed
20261010). Also reported: the per-user mean (each user weighted equally) and the share of feedback that came from the
three heaviest feedback givers.

**M6 — safety value (Q5).** Count of `prevented_harm`; number of distinct users with ≥ 1; and the **warning precision**
= `prevented_harm` / (`prevented_harm` + `false_alarm`), with a Wilson 95% CI at the call level and the bootstrap CI as
in M5. Notes attached to `prevented_harm` are read and classified by hand into categories fixed *after* reading
(exploratory; the categories are reported as such).

**M7 — comparison (C vs G).** M1 stages, M2 (G: ≥ 1 call within 14 days of sign-up) and D7, with the difference in
proportions and a Newcombe 95% CI. Descriptive only.

## 5. Observation window and analysis time

- Starts at the freeze (§10). Redemptions before the freeze are included (the coupon launched earlier; their activity
  before T_inst is read from `tel:ulog`, §3).
- Ends at **T_end = the earlier of** (a) 37 days after the 100th redemption, so every member's D30 window has closed;
  (b) 120 days after the freeze. Members whose windows are still open at T_end are censored for those metrics.
- The final analysis runs once at T_end on the export of `GET /api/admin/study/export` taken that day (its JSON is
  hashed with sha256 and the hash is reported).
- One **interim descriptive report** may be published at freeze + 30 days with M1, M3 (D1 only) and M4. It states no
  success or failure.

## 6. Analysis plan and success criteria

All proportions carry a 95% CI (Wilson for user-level shares; cluster bootstrap over users for call-level shares).
There is no hypothesis test beyond the criteria below, and no correction is needed because each criterion is judged
on its own and reported whatever its outcome.

### 6.1 Adoption (M2, primary)
- **Success:** M2 ≥ 50%.
- **Failure:** M2 < 25%.
- Between the two: *weak adoption*. The funnel stage where most users stop is reported in every case.

### 6.2 Retention (M3 D7 in C, primary)
- **Success:** D7 ≥ 25% of users with ≥ 1 call.
- **Failure:** D7 < 10%.
- Between: *weak retention*. D1 and D30 are reported, not judged.

### 6.3 Outcome quality (M5, primary when there is enough feedback)
- **Enough feedback:** ≥ 50 rated calls from ≥ 10 distinct users. If not reached, the result is *"not enough feedback"*,
  which is itself reported as a finding about the feedback channel, and no quality claim is made.
- **Success:** pooled reported correctness ≥ 80% **and** the lower bound of its bootstrap CI ≥ 70%.
- **Failure:** pooled reported correctness < 70%.
- Between: *inconclusive*.
- Caveat stated with the result: feedback is volunteered, so it over-represents memorable calls (surprises and saves);
  it measures what users report, not ground truth.

### 6.4 Safety value (M6, secondary)
- **Signal:** ≥ 5 `prevented_harm` reports from ≥ 3 distinct users **and** warning precision ≥ 50%.
- **No signal:** fewer than 5 reports, or fewer than 3 users.
- **Noisy guard:** warning precision < 50% with ≥ 10 warnings rated (`prevented_harm` + `false_alarm`).
- No causal claim: "prevented harm" is the user's account, not an observed counterfactual.

### 6.5 Comparison (M7)
Descriptive. We will not say the coupon caused any difference, since redeemers chose to redeem.

### 6.6 What we will write
A short report (on openinterp.org, linked from the paper's page) with every metric in §4, each criterion's outcome
in §6 (including failures), the deviations in §9, and the hashes of this protocol and of the export.

## 7. Privacy

- **We never store request or response contents.** The gateway reads the body only to forward it to the model and
  stores, per request, metadata: time, user id, email, last 4 characters of the key, path, status, metered input
  tokens, latency, IP (first `X-Forwarded-For` hop), country, error string, request id, User-Agent (truncated to 80) and
  the client surface (a validated token from `X-Ekbasis-Surface`). These fields predate the study (except the last
  three) and exist to operate and protect the service.
- **The study uses less than that.** The analysis export drops email and IP, drops request ids, and replaces user ids
  with an HMAC-SHA256 pseudonym (`STUDY_EXPORT_SECRET`, 16 hex chars). Country is not used.
- **Feedback is opt-in.** A user sends it explicitly with their own key, about their own call. The optional `note`
  (≤ 500 characters, control characters stripped) is free text the user wrote; it is excluded from the export unless
  `?notes=1` is passed (the export is audited as `study.export`). A note is quoted publicly only with the user's
  written permission; otherwise it is only counted and categorised.
- **Ownership check.** Feedback is accepted only for a request id the same account made in the last 30 days;
  anyone else's id, or an unknown one, gets the same 404, so ids cannot be probed. Ids are 96 random bits.
- **Rate limit.** 200 feedback attempts per account per UTC day (valid or not).
- **Retention.** `fb:rid` 30 days; per-day counters, `tel:uact`, `tel:ucalls` 400 days; streams are capped.
- **Deletion.** On request, delete `tel:u:<uid>`, `tel:ulog:<uid>`, `tel:uact:<uid>`, `tel:ucalls:<uid>`,
  `fb:user:<uid>`, `fb:u:<uid>`, `cpn:user:<uid>` and the user's entries are excluded from the analysis as "deleted";
  aggregate counters (`tel:d:*`, `fb:d:*`) hold no identifiers and are kept.
- **Publication.** Only aggregates; any breakdown cell with fewer than 5 users is merged or suppressed.

## 8. Ethics and consent

- This is analysis of service telemetry the service already records, plus feedback users choose to send. There is no
  intervention, deception or randomisation, and users are not paid or rewarded for feedback (to avoid biasing it).
- **Notice.** Before the freeze, the console and the Ekbasis pricing page must state, in plain words: what the gateway
  records per request (metadata only, never contents), that aggregate and pseudonymous usage may be published in
  research about Ekbasis, and how to send feedback and to ask for deletion. The launch announcement for the coupon
  links to that notice. (Decision pending: §10.)
- **Opting out.** Any user can ask to be excluded; their rows are then excluded as "deleted" whether or not they keep
  using the service.
- **Asking for feedback.** We may ask the cohort for feedback once by email (the same message to everyone, recorded in
  §9 with its date), and the client may offer the command after a warning. We do not contact users individually
  based on their usage.
- The study involves adults using a developer API; no sensitive categories of data are collected. No ethics board
  review is planned; if the report is submitted to a venue that requires one, this protocol and the notice are what
  we would submit.

## 9. Deviations

Any change after the freeze (to definitions, exclusions, thresholds, windows, or the instrumentation) is appended here
with its date and reason, and the report lists every one. Accounts marked internal after the freeze are listed here.

| Date | Change | Reason |
|---|---|---|
| — | — | — |

## 10. Freeze record

Filled in at freeze time.

- Protocol version: 1
- T_inst (deployment of the instrumentation commit): `____-__-__ __:__ UTC`, commit `_______`
- Freeze: `____-__-__ __:__ UTC`
- Redemptions of EKBASIS100 at freeze: `___`
- Notice published at: `________`
- Internal accounts marked before freeze: `___`
- sha256 of this file at freeze: recorded in `docs/STUDY_REAL_USERS.md.sha256` (not here, see below)

### How the freeze hash is computed

The hash cannot live inside the file it hashes, so it is recorded next to it. At freeze time, after filling in §10
except the hash line and committing:

```bash
shasum -a 256 docs/STUDY_REAL_USERS.md | tee docs/STUDY_REAL_USERS.md.sha256
git add docs/STUDY_REAL_USERS.md.sha256
git commit -m "Freeze STUDY_REAL_USERS v1 (sha256 $(cut -c1-12 docs/STUDY_REAL_USERS.md.sha256))"
git tag study-real-users-v1
```

The hash is of the exact bytes of this file in that commit (UTF-8, LF line endings as stored in git). Anyone can check
it with `git show study-real-users-v1:docs/STUDY_REAL_USERS.md | shasum -a 256` and compare with the `.sha256` file.
Later edits go only to §9 (deviations) and produce a new hash, recorded the same way with the next tag
(`study-real-users-v1.1`, …); the report cites the hash of v1 and of the version in force at T_end.
