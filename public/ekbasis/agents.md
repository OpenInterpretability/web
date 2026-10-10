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
| Price | $0.04 per 1M **input** tokens; output is never charged (nothing is generated) |
| Self-hosted | open weights (Apache-2.0); same API on your own server, e.g. `EKBASIS_URL=http://127.0.0.1:8000` |

Send a descriptive `User-Agent` (for example `my-agent/1.0`). The official client sends `ekbasis/<version>`.

## 3. The fastest path: the CLI guard (git and shell)

```bash
pip install "git+https://github.com/OpenInterpretability/ekbasis"
export EKBASIS_URL=https://openinterp.org/api/v1
export EKBASIS_API_KEY=ekb_...
ekbasis git-check -- "git reset --hard"        # reads the repo itself; you write no state
ekbasis shell-check -- "rm -r build/"          # prototype for shell lines
ekbasis git-check -- "git checkout main" && git checkout main   # run only if the guard passes
```

Exit codes: **0** no risk found · **2** RISKY (may lose work or file content) · **3** CANNOT FORESEE · **1** usage error.
**Treat 3 exactly like 2.** `--json` prints a machine-readable verdict (`risky`, `p_lost`, `p_fail`, `reasons`; when it cannot
foresee: `{"risky": true, "judged": false, "cannot_foresee": "<why>"}`).

For Claude Code: the hook (`ekbasis-claude-hook`, PreToolUse on Bash) asks the human when a command may lose work.
For any MCP client: `ekbasis-mcp` exposes `check_git_commands`, `predict_consequences` and `preflight_command`.
Setup: https://github.com/OpenInterpretability/ekbasis-cookbook

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

## 6. Decision rules for agents

| Answer | What to do |
|---|---|
| p(bad) ≥ 0.5, or verdict RISKY (exit 2) | Do not run it. Tell the human the reason in one line and propose the safer alternative (stash first, add WHERE, back up, use `--force-with-lease`, share a narrower link). Run only after explicit confirmation. |
| 0.2 ≤ p(bad) < 0.5 | Treat as risky in anything irreversible: ask, or take the safer route. |
| p(bad) < 0.2 | No warning from Ekbasis. **This is not proof of safety**: keep your normal confirmations, backups and the human's instructions. |
| Low confidence (≈ 0.5–0.85) | The state is ambiguous or missing a fact. Collect the missing fact (read the file, check `git status`, list the folder, read the policy) and ask again. Do not guess. |
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
| 429 / 5xx / timeout | rate limited or server unavailable | fail closed; retry later, do not run the action unchecked |

## 8. Telling us when it was wrong

Every hosted answer has a request id (`X-Ekbasis-Request-Id`). Report the outcome when you know it, at no charge:

```bash
curl -X POST https://openinterp.org/api/v1/feedback -H "Authorization: Bearer $EKBASIS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"request_id": "req_…", "verdict": "wrong", "note": "the file was in .gitignore"}'
```

`verdict`: `correct` · `wrong` · `prevented_harm` (it stopped a real mistake) · `false_alarm`. Request ids are kept
30 days. The content of requests is never stored; only metadata (time, account, path, status, tokens, latency).

## 9. Where it is strong and weak

- Strong: git work loss (8/8 classic losses flagged at 98–99%, 0 false alarms on 9 safe commands), states with explicit
  numbers and rules, recognising ambiguity. In pre-registered agent studies, harmful actions fell for every model
  tested; on real apps Claude Sonnet went from 25.0% to 4.2% (paper: https://doi.org/10.5281/zenodo.23197341).
- Weak: domains far from its training; command types it has never seen (git questions: 85.8% vs 95.8% on seen types);
  facts the state does not contain; obfuscated commands (`bash -c`, aliases, variables).
- `shell-check` is a prototype: `curl … | bash` and `kill -9 -1` currently pass.
- It is a warning layer that can be wrong, **not a security boundary**.

## Links

- Human guide with real examples: https://openinterp.org/ekbasis/start
- Pricing and console: https://openinterp.org/ekbasis/pricing · https://openinterp.org/console
- Client and hook: https://github.com/OpenInterpretability/ekbasis
- Cookbook (measured use cases, skill, studies): https://github.com/OpenInterpretability/ekbasis-cookbook
- Weights (27B · FP8 · INT4 · MLX): https://huggingface.co/caiovicentino1
