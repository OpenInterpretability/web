# Ekbasis for AI agents

> Read this before using Ekbasis from an agent. It is written for language models and agent frameworks: exact
> formats, decision rules, failure handling. Human guide: https://openinterp.org/ekbasis/start

Ekbasis is a **consequence model**. You give it a **state** (the facts of the world now) and the **action** you are
about to take, plus **typed questions**; it returns **calibrated probabilities** in one forward pass. It does not
write text, explain, plan or decide. It forecasts what an action will do. You (or the human) decide what to do with
the forecast.

Use it to look before you leap: before an action that is hard to undo, ask what it will do in *this* state.

## 1. When to consult it

Consult **before** an action that is hard to undo or whose effect you cannot see:

- **git**: `reset --hard`, `checkout -f`, `checkout -- <path>`, `restore`, `clean -fd`, `branch -D`, `stash drop/clear`,
  `push --force`, history rewrites, anything touching uncommitted work or commits only one side has.
- **files**: `rm`, `mv`, `>` redirection over data that is not in git or backed up; globs; folders you did not create.
- **databases**: `DROP`, `TRUNCATE`, `DELETE`/`UPDATE` without a narrow `WHERE`, migrations on real data.
- **processes / infra**: killing a PID you did not start, deleting namespaces/volumes/secrets, scaling down,
  applying to the wrong context.
- **apps and messages**: payments and transfers, cancellations, sharing links, deleting cloud files, sending to many
  people or outside the original circle, calendar changes with recurring events.

Skip it for actions that only read, create new things, or are trivially undoable. Asking about everything trains the
human to click through warnings.

## 2. Endpoint and auth

| | value |
|---|---|
| Hosted API base | `https://openinterp.org/api/v1` (env `EKBASIS_URL`) |
| Auth | `Authorization: Bearer ekb_…` (env `EKBASIS_API_KEY`); keys at https://openinterp.org/console |
| Decision endpoint | `POST {EKBASIS_URL}/v1/systemone` |
| Health | `GET {EKBASIS_URL}/health` (no key needed) |
| Served model | `GET {EKBASIS_URL}/v1/models`; every answer carries `X-Ekbasis-Model` |
| Spec | OpenAPI 3.1: `GET {EKBASIS_URL}/openapi.json` |
| Limits, data kept | https://openinterp.org/ekbasis/api-policies · live status: https://openinterp.org/ekbasis/status |
| Price | $0.30 per 1M **input** tokens; output is never charged (nothing is generated) |
| Self-hosted | open weights (Apache-2.0); same API on your own server, e.g. `EKBASIS_URL=http://127.0.0.1:8000` |

Send a descriptive `User-Agent` (for example `my-agent/1.0`). The official client sends `ekbasis/<version>`.

## 3. The fastest path: the CLI guard (git and shell)

```bash
pip install ekbasis
export EKBASIS_URL=https://openinterp.org/api/v1
export EKBASIS_API_KEY=ekb_...
ekbasis git-check -- "git reset --hard"        # reads the repo itself; you write no state
ekbasis shell-check -- "rm -r build/"          # prototype for shell lines
ekbasis git-check -- "git checkout main" && git checkout main   # run only if the guard passes
```

Exit codes: **0** no risk found · **2** RISKY (may lose work or file content) · **3** CANNOT FORESEE · **1** usage error.
**Treat 3 exactly like 2.** `--json` prints a machine-readable verdict (`risky`, `p_lost`, `p_fail`, `reasons`; when it cannot
foresee: `{"risky": true, "judged": false, "cannot_foresee": "<why>"}`).

For Claude Code: the plugin bundles the hook (PreToolUse on Bash: asks the human when a command may lose work), this
guidance as a skill and the MCP server — `claude plugin marketplace add OpenInterpretability/ekbasis --sparse .claude-plugin plugins`
then `claude plugin install ekbasis@ekbasis`, and set `EKBASIS_API_KEY`. Or wire `ekbasis-claude-hook` by hand.
For any MCP client: `ekbasis-mcp` exposes `check_git_commands`, `predict_consequences` and `preflight_command`.
Setup: https://github.com/OpenInterpretability/ekbasis-cookbook

**Database migrations (client 0.1.12+):** `ekbasis migrate-check --base origin/main` forecasts whether new PostgreSQL
migrations fail or lose data, from the schema built out of the base branch's migrations (and, optionally, planner
statistics of a read-only replica); same exit codes. As a GitHub Action: https://openinterp.org/ekbasis/migration-guard
(pre-registered on 184 new migrations: verdict right 87.5%, false alarms on safe ones 15.6%).

**Batches of actions (client 0.1.28+, npm 0.2+):** before running several actions at once (a few tool calls, a
script, a pipeline), check the whole batch. `ekbasis plan-check --rules @rules.txt --state @state.txt --request
"<the user's words>" "step 1" "step 2" ...` exits **0** (run every step), **2** (run only the first N, given in the
output; then read the real state again and check the remaining steps) or **3** (cannot foresee: treat as risky).
`--json` gives `ok`, `safe` (N), `step`, `reason` (`flagged` or `unsure`) and every step's probabilities. In code:
`check_plan(client, rules, state, actions, harms(), request=...)` (Python) or `checkPlan(...)` (TypeScript,
`npm install ekbasis`). `harms()` are four yes/no questions (data lost, outage, deletes not asked for, breaks later)
about harm the user's request does **not** ask for, so always pass the request. Never run a step that is still
flagged on the real state without the human. For a whole task, `run_plan(client, rules, actions, harms(), observe,
execute, request=...)` (TypeScript `runPlan`) runs this loop for you: check every step from the real state, run the
safe ones, read the state again, check the rest, stop before a step still flagged. This is "look when unsure" for a
chain: do not forecast a long chain blind, and do not stop after every step; look only where the forecast is flagged or
its confidence is below 0.9. Recipe:
https://github.com/OpenInterpretability/ekbasis-cookbook/tree/main/recipes/check-a-plan

**Agent steps (experimental):** `ekbasis.intent_check(user_request, events, action)` asks whether the next tool call
serves the user or follows instructions from content the agent read. Use it to ask a person, not to block
(https://github.com/OpenInterpretability/ekbasis/blob/main/docs/INTENT_CHECK.md).

## 4. The raw API (anything that is not a shell command)

Request:

```json
{
  "state": "Checking account available balance: $180.20. About to: transfer $250.00 to savings.",
  "questions": {
    "outcome": {"type": "choice", "instructions": "What happens with the transfer?",
                "options": ["transfer succeeds", "transfer fails: insufficient funds"]},
    "loss":    {"type": "noul", "instructions": "Is any money lost or charged as a fee?",
                "criteria": {"true": "money is lost or a fee is charged", "false": "no money is lost"}}
  }
}
```

- `state` (string): the facts **and** the action, in plain language. Put the numbers in.
- `questions` (object): your own names → question objects. Several questions about one state go in **one** request.
- `read_once` (bool, optional): the state is read once and shared by all questions, so you pay for it once
  (measured: 3 questions on one state = 261 input tokens with it, 420 without). It costs 0.9–3.1 points of accuracy
  on the answers an action changes (client README, "Read-once"). Use it to screen several questions cheaply; send the
  one question that decides an irreversible action without it.

Question types and the exact answer shapes (real responses):

```json
// choice: pick among outcomes you list (2 or more; list the bad outcome explicitly)
{"type": "choice", "instructions": "What happens with the transfer?",
 "options": ["transfer succeeds", "transfer fails: insufficient funds"]}
→ {"type": "choice", "choice": "transfer fails: insufficient funds",
   "probabilities": {"transfer succeeds": 0.035, "transfer fails: insufficient funds": 0.965}, "confidence": 0.965}

// noul: yes/no with written criteria; "probability" is P(true)
{"type": "noul", "instructions": "Will uncommitted work be lost?",
 "criteria": {"true": "uncommitted changes are gone", "false": "nothing is lost"}}
→ {"type": "noul", "noul": 0.985, "probability": 0.985, "value": true, "confidence": 0.985}

// score: a count or level with each value described
{"type": "score", "instructions": "How many of the 3 modified files keep their changes?",
 "criteria": {"0": "none", "1": "one", "2": "two", "3": "all three"}}
→ {"type": "score", "score": 0, "expected": 0.053,
   "probabilities": {"0": 0.974, "1": 0.009, "2": 0.007, "3": 0.010}, "confidence": 0.974}
```

Response envelope: `{"model": "...", "answers": {<name>: <answer>}, "usage": {"input_tokens": N, "output_tokens": 0},
"latency_s": ...}`. The hosted API also returns the header `X-Ekbasis-Request-Id: req_…` and
`X-Ekbasis-Metered-Tokens`.

## 5. Writing a state it can use

The model only knows what the state says. Most wrong answers come from a state that leaves out the fact that decides
the outcome.

1. **Name the action explicitly**: end with `About to: <exact command or click>`.
2. **Put the numbers in**: balances, sizes, counts, limits, dates and times with time zones. "Balance a bit low"
   gave 75.5% on the right answer; the same state with "$180.20" and "$250.00" gave 96.5%.
3. **State the hidden consequences you know of**: "the folder link also exposes the subfolder Contracts/",
   "cancelling the outbound flight cancels the return on this fare", "a backup of orders.db exists at
   /backups/orders-0610.db". Without the backup line the model said "lost" (93.6%); with it, "recoverable" (94.7%).
4. **Include the rules that apply** (fare rules, retention policy, branch protection) as sentences, and repeat the
   decisive rule right before the question if the state is long.
5. **Describe what is, not what you hope**: say "untracked: config.yaml", not "config is safe".
6. **Keep it to the facts the action touches**; you do not need the whole world.

For git, let the CLI build the state from the repository: it reads it with read-only git commands.

### 5b. Where hidden consequences live: what to read before you write the state

You cannot state a hidden consequence you have not looked for. The harm an agent causes is usually in something the
command text does not show. Before a batch that changes data, **run these read-only checks** for every object the
batch touches, and put what you find in the state as plain sentences (with the numbers). Then check the batch with
`ekbasis plan-check` (or `check_plan` / `checkPlan`) and follow its answer.

**PostgreSQL** (for each table a DELETE, UPDATE, TRUNCATE, DROP or ALTER touches; `T` is the table):

| Look for | Query (read-only) | Why |
|---|---|---|
| Is it a table or a view? Its comment | `SELECT relkind, obj_description(oid) FROM pg_class WHERE relname = 'T';` and, for a view, `SELECT pg_get_viewdef('T'::regclass);` | a DELETE on a view deletes the rows of its base table; comments often say who still uses the table |
| Foreign keys pointing at it, and what they do | `SELECT conrelid::regclass, confdeltype FROM pg_constraint WHERE contype = 'f' AND confrelid = 'T'::regclass;` (c = CASCADE, n = SET NULL, a/r = fail), then count the dependent rows the statement would reach | CASCADE deletes rows in other tables; SET NULL erases references; TRUNCATE ... CASCADE empties every referencing table |
| Triggers and what their functions do | `SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'T'::regclass AND NOT tgisinternal;` then `SELECT pg_get_functiondef(tgfoid) ...` | a trigger can change or delete rows elsewhere |
| Child tables (inheritance or partitions) | `SELECT inhrelid::regclass FROM pg_inherits WHERE inhparent = 'T'::regclass;` | DELETE/UPDATE without ONLY also act on the children |
| How many rows the WHERE matches, and which | `SELECT count(*) FROM T WHERE <the same condition>;` plus a breakdown of the columns that matter (e.g. `count(*) FILTER (WHERE auto_renew)`) | a WHERE broader than the request is the most common harm |
| Data in a column you will drop or shorten | `SELECT count(*) FROM T WHERE col IS NOT NULL;` / `SELECT count(*) FROM T WHERE length(col) > N;` | the user may believe it is empty or short |

Add the PostgreSQL rules the outcome depends on (autocommit per statement, no undo) to the rules.

**Kubernetes** (for each object the batch deletes, scales, relabels or replaces):

| Look for | Command (read-only) | Why |
|---|---|---|
| Volumes behind a claim and their reclaim policy | `kubectl get pvc -n NS -o wide` and `kubectl get pv <volume> -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'` | deleting a claim whose volume is `Delete` erases its data |
| Which pods a Service routes to, and how many are ready | `kubectl get svc S -n NS -o jsonpath='{.spec.selector}'` and `kubectl get endpoints S -n NS` | relabeling or scaling can leave a serving Service with no pods |
| Who else uses a ConfigMap, Secret or claim | `kubectl get deploy,sts,cronjob -n NS -o yaml` and search for the name | deleting it breaks the next restart of another workload |
| Whose object it is | labels and annotations such as team / owner, `ownerReferences` | another team's object is not yours to delete |

**Anything else:** look for what the action touches that you cannot see in its text: backups or copies (do they
exist, are they current?), links and shares (who else sees it?), schedules and jobs that read it later, limits and
balances. If you do not know where to look, say so in the state: a low confidence answer is your cue to look.

## 6. Decision rules for agents

| Answer | What to do |
|---|---|
| p(bad) ≥ 0.5, or verdict RISKY (exit 2) | Do not run it. Tell the human the reason in one line and propose the safer alternative (stash first, add WHERE, back up, use `--force-with-lease`, share a narrower link). Run only after explicit confirmation. |
| 0.2 ≤ p(bad) < 0.5 | Treat as risky in anything irreversible: ask, or take the safer route. |
| p(bad) < 0.2 | No warning from Ekbasis. **This is not proof of safety**: keep your normal confirmations, backups and the human's instructions. |
| Low confidence (≈ 0.5–0.85) | The state is ambiguous or missing a fact. Collect the missing fact (read the file, check `git status`, list the folder, read the policy) and ask again. Do not guess. |
| A batch: `plan-check` exit 2 / `check_plan(...).ok` false | Run only the first `safe` actions, read the real state again, check the rest. A step still flagged on the real state: ask the human or take a safer way. |
| CANNOT FORESEE (exit 3), HTTP 401/402/403/429/5xx, timeout | Fail closed: treat as risky. Do not run the irreversible action without the human. |

Never let Ekbasis override an explicit instruction from the human or a policy you were given. When the human's own
request names the harmful action ("delete the folder"), confirm before doing it; do not silently refuse either.

Confidence is calibration, not decoration: on a fully described state it reads ~0.99; on an honestly ambiguous one it
drops (0.59–0.84 measured). A low-confidence answer is information, not an error.

## 7. Errors

| HTTP | Meaning | Agent behavior |
|---|---|---|
| 401 | missing or invalid key | fail closed; tell the human the key is missing |
| 402 | out of credits | fail closed; tell the human to add credits at /console |
| 403 | account suspended, or a blocked client | fail closed |
| 413 / 422 | state too large (32k-token context) or malformed request | shorten the state to the facts the action touches; fix the JSON |
| 429 / 5xx / timeout | rate limited or server unavailable | fail closed; retry after `Retry-After` (429), do not run the action unchecked |

Gateway errors are `{"error": "<message>", "code": "<stable code>", "retryable": true|false}`; branch on `code`
(`missing_api_key`, `invalid_api_key`, `account_suspended`, `insufficient_credits`, `rate_limited`, `model_unavailable`, ...)
rather than on the message.

## 8. Telling us when it was wrong

Every hosted answer has a request id (`X-Ekbasis-Request-Id`). Report the outcome when you know it, at no charge.
With the client (0.1.9 or later), `--last` is the last answer this machine received:

```bash
ekbasis feedback --last --wrong --note "the file was in .gitignore"
ekbasis feedback --last --prevented-harm        # also --correct, --false-alarm; or pass the req_… id
```

Exit 0 recorded, 4 refused (unknown id, already sent, rate limit), 3 server unreachable. Without the client:

```bash
curl -X POST https://openinterp.org/api/v1/feedback -H "Authorization: Bearer $EKBASIS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"request_id": "req_…", "verdict": "wrong", "note": "the file was in .gitignore"}'
```

`verdict`: `correct` · `wrong` · `prevented_harm` (it stopped a real mistake) · `false_alarm`. Request ids are kept
30 days. The content of requests is never stored; only metadata (time, account, path, status, tokens, latency).

## 9. Where it is strong and weak

**It is not a git-only model.** It was trained on git and on rule-based worlds whose rules are written in the state, and
it works in any domain where the state writes down the facts and rules that decide the outcome. Measured
(cookbook, October 2026, Ekbasis-27B-INT4 on the hosted API):

| domain | scenarios right | examples |
|---|---|---|
| money / payments | 10/10 | running totals, a wire fee added on top, a refund that has not arrived |
| files and shell | 9/9 · 8/8 | `mv` overwrite, `>` truncation, `rm -rf "$UNSET/"*`, stale-PID kill, `crontab -r` |
| databases / SQL | 8/8 | DELETE without WHERE, migration downgrade, ROLLBACK, backup before DROP |
| email and messages | 8/8 | reply-all leak, autocomplete to the wrong person, BCC stays hidden |
| calendar | 7/7 | time zones, one vs all occurrences of a recurring event |
| cloud / Kubernetes | 9/9 | namespace, PVC and secret deletion, apply in the wrong context |
| cloud storage | 9/9 | bucket `--force`, versioning keeps old objects, AMI needs its snapshot |
| docker | 10/10 | `compose down -v` and prune destroy data, hot patch lost on rebuild |
| deploy / CI and pipelines | 7/7 · 8/8 | canary vs all, secrets echoed in public logs, `pull_request_target` |
| identity / access, network, org | 10/10 · 9/9 · 8/8 | committed secrets survive removal, `ufw reset`, SSO lockout |
| data pipelines, ML ops, jobs | 8/8 · 7/7 · 8/8 | partial overwrite, backfill duplicates, eval leakage, cron time zones |
| numbers and plans | 8/8 · 5/5 | MB↔GB, rounding with tax, exact deadlines, a step that breaks a later one |
| git (trained) | 8/8 classic losses at 98–99%, 0 false alarms on 9 safe commands | plus 9/9 harder cases (rebase of a shared branch, `clean -fdx`) |

171 scenarios in 21 domains: 168 of 168 scored right, 3 ambiguous ones answered with honestly low confidence
(0.59–0.84). Full tables: https://github.com/OpenInterpretability/ekbasis-cookbook/blob/main/examples/results.md

With agents, in pre-registered studies: harmful actions fell on our demo apps (everyday web apps
such as a bank and file storage, built for the study) for Claude Sonnet, Claude Haiku and Qwen 9B, and for GLM and Qwen 4B
not conclusively (paper erratum, v2); on unmodified Gitea, Nextcloud and Roundcube, Claude Sonnet went from 6/24 to 1/24
harmful tasks; on a real Kubernetes cluster, Claude Haiku went from 24/36 to 2/36 harmful runs
(paper: https://doi.org/10.5281/zenodo.23197341; Kubernetes study in the cookbook).

**Read these numbers correctly:** the scenarios were written by us and put the deciding facts in the state; they are
not an independent benchmark. Real states that leave facts out do worse, and so do things it has never seen (git
command types never seen in training: 85.8% vs 95.8%).

**Third-party benchmark (TS-Bench, pre-registered, October 2026):** on AgentDojo prompt injections F1 97.5 (95% CI
96.1–98.6) vs GPT-4o's published 56.6; rewriting the injections changed none of 301 decisions. On AgentHarm and ASB it
was weak (F1 54.6 and 64.3, below labelling every step unsafe), missing most unsafe steps; where it flags a step it is
usually right (precision 87–97%). Its probabilities are calibrated where the question is the step's consequence, not
everywhere: a calibrator fitted on two subsets made the third worse. Study: https://github.com/OpenInterpretability/ekbasis-cookbook/tree/main/studies/tsbench

Weak: probably labels about a request's intent or a tool's origin rather than what the step does (above; our reading); facts the state does not contain; command types and domains far from anything above; obfuscated commands
(`bash -c`, aliases, variables). `shell-check` is a prototype: `curl … | bash` and `kill -9 -1` currently pass. It is a
warning layer that can be wrong, **not a security boundary**.

## Links

- Human guide with real examples: https://openinterp.org/ekbasis/start
- Pricing and console: https://openinterp.org/ekbasis/pricing · https://openinterp.org/console
- Client and hook: https://github.com/OpenInterpretability/ekbasis (Python: `pip install ekbasis`; TypeScript: `npm install ekbasis`)
- API: OpenAPI https://openinterp.org/api/v1/openapi.json · status https://openinterp.org/ekbasis/status
- Cookbook (measured use cases, skill, studies): https://github.com/OpenInterpretability/ekbasis-cookbook
- Weights (27B · FP8 · INT4 · MLX): https://huggingface.co/caiovicentino1
