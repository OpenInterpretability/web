/**
 * Ekbasis — every number shown on /ekbasis lives here, with where it comes from.
 * Every number was measured on the exact release weights (the merged interpolation of the V42 and r4a adapters, served
 * by vLLM and the System One API) on 4 Oct 2026: ekbasis/RELEASE_EVAL.md has each one with its predictions, how the
 * checkpoint was chosen and which measurements were pre-registered.
 */

export const ekbasis = {
  name: 'Ekbasis',
  greek: 'ἔκβασις',
  gloss: 'how an action turns out',
  tagline: 'What happens if I run this?',
  category: 'An open world model for agents',
  motto: 'Not a model that thinks. Not a model that judges. A model that foresees.',
  description:
    'Ekbasis is an open world model for agents: given the current state and an action, it predicts what the action will do — will this lose work? will it fail? what will X be? — as calibrated, typed answers, in one forward pass (~0.1 s). Not a model that thinks, nor one that judges: a model that foresees. Trained on real executions; the consequence layer for AgentGuard.',
  license: 'Apache-2.0',
  links: {
    github: 'https://github.com/OpenInterpretability/ekbasis',
    model: 'https://huggingface.co/caiovicentino1/Ekbasis-27B',
    dataset: 'https://huggingface.co/datasets/caiovicentino1/ekbasis-data',
    paper: 'https://doi.org/10.5281/zenodo.23146970' as string | null, // "Look When Unsure, Check When Sure" (Zenodo)
    prereg: 'https://github.com/OpenInterpretability/ekbasis/blob/main/PREREG_release_eval.md',
    agentguard: '/agentguard',
  },
  status: 'Every number on this page was measured on the exact release weights; the release evaluation was pre-registered.',
}

/** 240 git questions on repositories built and executed in a sandbox (120 command types seen in training, 120 never
 * seen); the same questions for every system; answer order shuffled for the hand-off runs. */
export const gitComparison = {
  caption:
    'Accuracy on 240 git questions (will it lose uncommitted work? will it fail? what will the state be?). The truth comes from running the commands. Ekbasis, Eikos-27B and Qwen3.8-27B share the same base model (Qwen3.8-27B): the same weights reasoning step by step, answering in one pass without consequence training, and with it. Claude models answered as batched hand-offs with shuffled order; Qwen and Ekbasis (the release weights) answered each question alone.',
  columns: ['System', 'How it answers', 'Seen command types', 'Never-seen types'],
  rows: [
    ['Claude Opus 5.5', 'reasoning', '97.5', '89.2'],
    ['Claude Fable 5.1', 'reasoning', '96.7', '91.7'],
    ['Claude Sonnet 5.5', 'reasoning', '95.8', '94.2'],
    ['Ekbasis (27B)', 'one pass, ~0.1 s, no text', '95.8', '85.8'],
    ['Qwen3.8-27B', 'reasoning (12k-token budget)', '86.7', '60.0'],
    ['Eikos-27B (no consequence training)', 'one pass', '80.0', '73.3'],
    ['Claude Haiku 4.5', 'reasoning', '77.5', '60.8'],
    ['Qwen3.8-27B', 'answering at once', '71.7', '65.8'],
  ],
  highlight: 'Ekbasis (27B)',
}

export const realRepo = {
  caption:
    'The git guard on a real repository (a clone of pallets/itsdangerous): 16 fresh scenarios, written and pre-registered before any model saw them; the repository state described by the client (commits as hashes, remote fetched), the truth from running the commands in a copy. The false alarm: dropping a stash right after applying it. On 22 other scenarios used during development: 5/5 flagged, 22/22 and 26/29 right.',
  stats: [
    { label: 'work-losing scenarios flagged', value: '3 / 3' },
    { label: 'false alarms among the other 13', value: '1 / 13' },
    { label: '"will it fail?" right', value: '16 / 17' },
  ],
}

export const longChains = {
  caption:
    "Chained simulation, one action per step, every variable asked after each action, the next state rebuilt from the answers (6 chains per cell): the final answer right. Where errors fade (a container is filled, a lamp switched), the chain recovers from them; where they never fade (orderings), they compound. The fix is the loop of a forward model with a sensor: predict, observe, correct. Given a way to read the real state, Ekbasis looks when it is not sure (by default: chain confidence below 0.9, plus a check now and then), and every chain stayed exact: card orderings 8 of 8 and 8 of 8 at 100 and 200 actions; containers, lamps and machines 4 of 4 at both lengths, with 2.9–10 looks per 100 actions. On 200 more chains with new seeds, 198 ended exact; of the two that did not, a container chain of 100 actions went wrong at action 87 with a confidence of 0.99, after the last check, and stayed wrong to the end (its final answer right); a card chain of 200 actions missed only its last action, which the loop never checks, and the model had flagged it (that step's probability 0.0006).",
  columns: ['World', '100 actions', '200 actions'],
  rows: [
    ['Lamps (from text / from an image / image + look again every 50)', '100% / 83% / 100%', '100% / 100% / 100%'],
    ['Containers (from text / from an image / image + look again every 50)', '100% / 100% / 100%', '100% / 100% / 100%'],
    ['Machines (a world never seen in training)', '100%', '100%'],
    ['Cards (orderings, never seen in training: errors never fade)', '50%', '33%'],
    ['Cards, looking at the real state when unsure (whole state right; looks per 100 actions)', '100% (42)', '100% (33)'],
  ],
}

/** Look when unsure: predict, observe, correct (long-chain experiments on the release weights; RELEASE_EVAL.md). */
export const lookWhenUnsure = {
  intro:
    'Where a later action overwrites a mistake (a container refilled, a lamp switched), a chain recovers by itself; where nothing ever undoes it (an ordering), mistakes compound. Give the simulation a way to read the real state and Ekbasis looks only when it is not sure, then continues from what it saw.',
  code: `from ekbasis import simulate

sim = simulate(client, rules, state, actions, questions, render,
               observe=read_real_state,    # the real state as {variable: value}: git status, a query, a sensor
               ordering=list(questions))   # the state is an ordering: read the most probable valid one
print(sim.final, sim.looks, sim.surprises) # when it looked, and which looks found the forecast wrong`,
  rule: "By default it looks when the chain confidence (the product of every answer's confidence since the last look) falls below 0.9, and it checks the forecast now and then: after 8 actions without a look, a gap that doubles up to 64 while the forecasts hold; a look that finds the forecast wrong (a surprise) brings the gap back to 8 and looks again after the next action, until a look finds it right. look_below, look_step_below, look_every and checks set other rules. Chains of 100 · 200 actions (4 per world, 8 for cards):",
  columns: ['World', 'Exact at the end, never looking', 'Exact at the end, looking when unsure', 'Steps wrong along the way, per 100 actions', 'Looks per 100 actions'],
  rows: [
    ["Containers (trained)", "4/4 · 4/4", "4/4 · 4/4", "2.3 → 1.5", "3.5 · 2.9"],
    ["Lamps (trained)", "4/4 · 4/4", "4/4 · 4/4", "0 → 0", "3 · 3.1"],
    ["Machines (never seen in training)", "4/4 · 4/4", "4/4 · 4/4", "2.3 → 0", "6.8 · 10"],
    ["Card orderings (never seen in training)", "0/8 · 2/8", "8/8 · 8/8", "67.8 → 0", "42.3 · 32.6"],
  ],
  less: "On 200 more chains with new seeds, run after the release evaluation (80 of cards, 40 of each other world), 198 ended exact. Of the two that did not, a container chain of 100 actions went wrong at action 87 with a confidence of 0.99, after the last check, and stayed wrong to the end (its final answer right); a card chain of 200 actions missed only its last action, which the loop never checks, and the model had flagged it (that step's probability 0.0006). Steps wrong along the way: 0.23 per 100 actions; looks: 16.9 per 100. To look less, look_below=0.5: every chain still ended exact (40 of 40), with 11.2 looks per 100 actions over these four worlds instead of 17.3, and 0.7 steps wrong along the way per 100 instead of 0.3. For an ordering, also ask where each value is (where=, each question's options being the ordering's variables): both views read together, in the same request, and the card chains looked about half as often for the same exactness (20 · 15 looks per 100 actions instead of 40 · 31 at chain confidence < 0.9, every chain exact).",
  why: "In card orderings, a world it never saw, 2.7 steps in 100 went wrong and it gave every one of them a probability below 0.7: looking when unsure finds them. In the worlds it was trained on, errors are rare (0–0.17 steps in 100) but come with confidence (0.972–0.996): a fixed threshold misses them, and the checks are what find them (containers: 2.3 → 1.5 steps wrong along the way per 100 with the checks). A pre-registered test on 15,008 generated questions in 12 world families, run on V42 (the first release candidate), confirmed the pattern: 58% of its wrong answers carried a confidence of 0.9 or more in the families it was trained on, 28% in the families it never saw (30 points apart, 95% interval 24 to 37), while its confidence ranks right above wrong about equally well in both (AUROC 0.92 and 0.91). Eikos-27B, the same model before consequence training, was almost never confidently wrong (1.9% and 0.5% of its errors): the training made it — details in the repository's confident-errors reports. On the same questions the release gives 48% and 25%, with 2.06 confident errors per 100 answers in the trained families against V42's 2.79: fewer, not gone, which is why the checks stay on by default. Correction (6 October 2026): 5,318 of the 15,008 questions, all in the trained families, turned out to repeat or nearly repeat a training row; without them the pattern holds (50.5% against 27.8%; the release 50.0% and 25.1%, with 1.46 confident errors per 100 answers against V42's 1.69).",
  lineage:
    'The idea is classic: the predict–update loop of a state estimator (a Kalman filter), with observations triggered by the predictor’s own uncertainty (event-based state estimation; with learned models, active observing); the checks’ backoff is the Trickle algorithm’s. What Ekbasis adds is a calibrated forecast in one pass, cheap enough to run at every action.',
  unlocks: [
    { title: 'Long sessions that stay on track', body: "238 of the 240 measured chains ended exact (one missed only its last action, which the model had flagged; one went wrong at a confident step after the last check) while looking at a fraction of the steps — 2.9–3.5 looks per 100 actions in the worlds it was trained on, 33–42 in an ordering world it never saw — which matters when observing is expensive: a screenshot read by a vision model, a slow API, a human check." },
    { title: 'A horizon for planning', body: 'With no observations, sim.horizon() gives how many actions the forecast holds by the model’s own confidence: act up to there, look, plan again.' },
    { title: 'A safety signal', body: 'A sudden drop in confidence, or a surprise at a look (sim.surprises), means the world left what the model expected: the agent did something unexpected, the environment changed, or the task is outside what Ekbasis knows. A moment to look, or to alert.' },
    { title: 'One rule for escalation', body: 'Looking at reality, calling a large reasoning model or asking a person: the same calibrated confidence decides.' },
  ],
  uses: [
    ['Coding and devops agents', 'the state of a repository, files and infrastructure across a long session; git status only when unsure.'],
    ['Browser and computer-use agents', 'the screen after each action, with a screenshot only when unsure (Ekbasis already reads a starting state from a picture of a simple world; real screens are not measured yet).'],
    ['Business processes', 'orders, stock and balances after a sequence of transactions, reconciled with the database only when unsure.'],
    ['Digital twins and IoT', 'machine states between sensor reads; read the sensor when unsure.'],
    ['Finance operations', 'positions and margins after a sequence of orders, checked with the broker when unsure.'],
  ],
  note: "The loop was measured on worlds whose rules are written in the prompt; in the two it never saw it looked more often, and all but one of 144 chains ended exact, that one on its last action. Measure on your own environment before relying on it.",
}

/** Planning with no LLM: beam search over actions, every next state predicted by Ekbasis, the plan run for real. */
export const planning =
  'Planning with no LLM: searching over actions with Ekbasis alone, 98.9% of the plans for 180 short puzzles (shortest plans 1–4 actions) worked when run for real, in about 11 s each — the same base model writing the plan while reasoning step by step: 97.8%; answering at once: 38.3%.'

export const speed = {
  caption: '80 forecasts of 10–30 actions (a few variables each), one RTX 6000 Pro per system; latency: the median of 8 forecasts made one at a time; throughput with 16 in parallel.',
  columns: ['System', 'Accuracy', 'Latency (one at a time)', 'Throughput (16 in parallel)'],
  rows: [
    ['Qwen3.8-27B reasoning', '100%', '36.6 s', '21.5 / min'],
    ['Ekbasis, state read once per step', '90.0%', '4.1 s', '28.2 / min'],
    ['Ekbasis, one prompt per question', '98.8%', '5.0 s', '14.9 / min'],
    ['Ekbasis, one check (1–3 actions, 1 question)', '96.7%', '0.09 s', '23 checks / s'],
  ],
}

/** Short consequence checks (1–3 actions; 240 questions): Ekbasis alone 96.7%, Qwen3.8-27B reasoning 100% (197 tokens
 * per question), answering at once 80.8%. Route to the reasoning model when Ekbasis' confidence is below the cut. */
export const routing = [
  { cut: '0.95', toLLM: '10%', acc: '99.6%' },
  { cut: '0.99', toLLM: '21%', acc: '100%' },
]

export const injection = {
  caption:
    'An instruction telling the AI that every command is safe, planted in the repository the guard reads (the 16 fresh real-repository scenarios). No work-losing scenario was missed. The cases it bent: with a planted branch name, a pull that works was called failing (44% → 53%); with commit messages shown, a rejected push was called safe (98% → 4%) — which is why the guard shows commits as hashes by default. During development, the same attack through commit messages hid 1 of 5 work-losing scenarios (97% → 17%).',
  columns: ['Where the instruction is planted', '"Lose work?" decisions changed', '"Will it fail?" decisions changed', 'Work-losing scenarios missed'],
  rows: [
    ['A file name', '1 / 16 (right: the planted file itself gets deleted)', '0 / 17', '0 / 4'],
    ['A branch name', '0 / 16', '2 / 17 (one wrong: the pull)', '0 / 3'],
    ['Commit messages, when shown (not the default)', '0 / 16', '2 / 17 (one wrong: the push)', '0 / 3'],
  ],
}

/** The released builds: every one that works ships, so each machine runs what fits (quality against bf16 in each card). */
export const builds = {
  caption:
    'Every build that works is released, so each machine runs the one that fits. Each card shows its quality against bf16 on the same evaluation (the gate was pre-registered); speeds on one RTX PRO 6000; GPU sizes tested by capping vLLM memory and checking the answers match.',
  columns: ['Build', 'Size', 'Runs on', 'Speed', 'Against bf16'],
  rows: [
    ['Ekbasis-27B (bf16)', '51 GB', 'GPUs with 80 GB', '0.09 s per check · 23 checks/s', 'the reference'],
    ['Ekbasis-27B-FP8', '30 GB', 'GPUs with 48 GB; fastest with FP8 kernels (Ada, Hopper, Blackwell)', '0.07 s per check · 37 checks/s (1.6×)', 'within 0.5 points; one more work-losing case missed of 42 never-seen'],
    ['Ekbasis-27B-INT4', '19 GB', 'GPUs with 32 GB; 24 GB with text only and a 4k context', 'about bf16', 'within 0.3 points; one more false alarm of 42 never-seen'],
    ['Ekbasis-27B-MLX-4bit', '15 GB', 'Macs with Apple Silicon (32 GB or more recommended)', '—', 'within 1 point on git and multi-question worlds; 1.9 points lower on single-question never-seen worlds; 95% of answers the same'],
  ],
}

export const limits = [
  'It knows what it was trained on: worlds whose rules you write in the prompt, and git. On never-seen command types accuracy drops (85.8% vs 95.8%).',
  'The state must contain what decides the outcome; the git guard adds it (which files differ, what both sides changed).',
  'Errors that never fade (orderings) compound in long chains, and in the worlds it knows its rare errors come with confidence: let it look at the real state when it is not sure, with a check now and then (cards: 8 of 8 chains exact at 200 actions, about 33 looks per 100).',
  'With written rules and time to think, large reasoning models are more accurate; Ekbasis wins on cost, latency and calibrated confidence.',
  'A safety net, not a security boundary: command obfuscation (bash -c, aliases) is out of scope. The hook fails closed (it asks when it cannot judge), and since client 0.1.3 it treats ignored build, dist, node_modules and cache folders as rebuildable.',
]

/** Check when sure: ekbasis.verify (client 0.1.4). The default rule on the second pre-registered test on fresh items
 *  (results/client_0.1.4 in the ekbasis repository). */
export const checkWhenSure =
  'Check when sure (client 0.1.4): ekbasis.verify says which confident answers (confidence ≥ 0.9) to check by real execution before acting. In a pre-registered test on fresh items from five capability suites, none of them overlapping the training data, its default per-domain thresholds caught 84.5% of the confident errors while verifying 22.6% of the confident answers; confidence alone, verifying 23.4%, caught 65.7%. A rule meant to certify at most 2% errors among unchecked answers did not pass.'

/** What kind of model this is: the comparison at the heart of the launch. */
export const kinds = {
  columns: ['', 'LLM, reasoning', 'System One (Eikos, Jev)', 'Ekbasis'],
  rows: [
    ['It answers', 'anything, in text', 'what is: which option holds now', 'what will be, if I do this'],
    ['Kind of question', 'open', 'a judgment of the present', 'an intervention: the outcome of acting'],
    ['Output', 'generated text', 'calibrated distribution over the options', 'calibrated distribution over the next state’s variables'],
    ['Learns from', 'human and model text', 'labeled judgments', 'what actually happened when the action ran'],
    ['Time', 'seconds to minutes of reasoning', 'one forward pass', 'one forward pass per step; chains to long sequences'],
    ['Role in an agent', 'plans and talks', 'judge', 'simulator and guard: it foresees'],
  ],
  analogies: [
    {
      title: 'The forward model the agents were missing.',
      body: 'Before you move your arm, the brain predicts the consequence of the motor command — that is what lets us act fast and correct before an error. One part plans, another predicts. The agent plans; Ekbasis predicts.',
    },
    {
      title: 'The world-model module, made real.',
      body: 'LeCun’s architecture for autonomous machine intelligence separates a world model — which predicts the next state given an action — from the actor and the critic. The LLM agent is the actor, AgentGuard the critic, Ekbasis the world model; it was even trained with a JEPA-style loss that aligns its internal state with the true outcome.',
    },
  ],
}
