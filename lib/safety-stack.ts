// The agent safety stack: four questions before an agent acts, each answered by an open tool.
export const safetyStack = [
  {
    layer: '01 · provenance & policy',
    question: 'Who wants this action?',
    detail: 'Does it derive from untrusted data, and are its parameters within policy? Dataflow, not text, so obfuscated injections are caught.',
    tool: 'AgentGuard L0–L1',
    href: '/agentguard',
    isNew: false,
  },
  {
    layer: '02 · intent',
    question: 'Does the agent mean harm?',
    detail: 'A late-layer direction reads whether the agent is committed to an unauthorized irreversible action. Needs open weights.',
    tool: 'AgentGuard L2',
    href: '/agentguard',
    isNew: false,
  },
  {
    layer: '03 · consequence',
    question: 'What will it do here?',
    detail: 'A world model trained on real executions predicts what the action will do in the current state, calibrated, in one pass. Works with closed agents.',
    tool: 'Ekbasis',
    href: '/ekbasis',
    isNew: true,
  },
  {
    layer: '04 · actuation',
    question: 'What happens now?',
    detail: 'Block, redirect to a safe read-only action, or escalate to a human, with the reason each layer gave.',
    tool: 'AgentGuard L3',
    href: '/agentguard',
    isNew: false,
  },
]

// Every open tool of the lab, for /tools.
export const toolGroups = [
  {
    group: 'Agent safety',
    tools: [
      { name: 'Ekbasis', what: 'An open world model for agents: what an action will do in this state (lose work? fail?), calibrated, one pass. Git guard, Claude Code hook, MCP server.', href: '/ekbasis', isNew: true },
      { name: 'AgentGuard', what: 'Defense-in-depth action firewall for tool-using agents, with a model-internal intent brake.', href: '/agentguard' },
      { name: 'FabricationGuard', what: 'Activation-probe fabrication detection for open-weights LLMs: AUROC 0.88 cross-task, ~1 ms. pip install openinterp.', href: '/products/fabricationguard' },
      { name: 'agent-probe-guard', what: 'Two-probe activation gate for code agents: predicts whether a trace will succeed before tools fire.', href: '/products/agent-probe-guard' },
    ],
  },
  {
    group: 'Research instruments',
    tools: [
      { name: 'openinterp-mcp', what: 'Bring-your-own-agent interpretability: probe-causality experiments from Claude Code or Cursor.', href: '/mcp' },
      { name: 'openinterp-lab', what: 'One-command replication of the papers on the Google Colab CLI.', href: 'https://github.com/OpenInterpretability/openinterp-lab' },
      { name: 'decision-locator', what: 'Find the layer where a language model commits a decision — and steer it.', href: 'https://github.com/OpenInterpretability/decision-locator' },
      { name: 'inspect-tool-entropy-collapse', what: 'Inspect AI eval that detects the WANDERING failure mode in agent trajectories.', href: 'https://github.com/OpenInterpretability/inspect-tool-entropy-collapse' },
      { name: 'openinterp-swebench-harness', what: 'Instrumented agent harness that records feature trajectories during SWE-bench runs.', href: 'https://github.com/OpenInterpretability/openinterp-swebench-harness' },
    ],
  },
  {
    group: 'Benchmarks & standards',
    tools: [
      { name: 'ProbeBench', what: 'Leaderboard and registry for activation probes, with error analyses.', href: '/probebench' },
      { name: 'InterpScore', what: 'Composite, transparent ranking of sparse autoencoders.', href: '/interpscore' },
    ],
  },
  {
    group: 'Training',
    tools: [
      { name: 'mechreward', what: 'Interpretable internal features as dense reward signals for RL training of LLMs.', href: 'https://github.com/OpenInterpretability/mechreward' },
      { name: 'notebooks', what: 'Train your first sparse autoencoder in 30 minutes, then scale to 27B.', href: 'https://github.com/OpenInterpretability/notebooks' },
      { name: 'openinterp (SDK + CLI)', what: 'Python SDK and command line for the probes and the leaderboard.', href: 'https://github.com/OpenInterpretability/cli' },
    ],
  },
]
