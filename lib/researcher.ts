// Data for the "Use" hub — reproduce & build on the work. Versions verified live (PyPI) 2026-06-16.
export const versions = {
  mcp: '0.1.0',        // openinterp-mcp (PyPI)
  sdk: '0.3.1',        // openinterp (PyPI)
  mechreward: '0.1.0', // mechreward (PyPI)
}

// The 6 Claude Code skills that ship the operational knowledge (descriptions are the real SKILL.md frontmatter).
export interface Skill { name: string; tool: string; repo: string; desc: string }
export const skills: Skill[] = [
  { name: 'colab-attach', tool: 'colab_attach', repo: 'openinterp-mcp',
    desc: 'Attach to your running Colab / vast.ai openinterp session via its public HTTPS URL — the first step of any run.' },
  { name: 'capture-acts', tool: 'capture_acts', repo: 'openinterp-mcp',
    desc: 'Capture residual-stream activations at chosen layers and token positions during a forward pass.' },
  { name: 'probe-eval', tool: 'probe_eval', repo: 'openinterp-mcp',
    desc: 'Apply a loaded linear probe to a stored capture; returns per-sample scores and AUROC when labels are given.' },
  { name: 'steer', tool: 'steer', repo: 'openinterp-mcp',
    desc: 'Inject direction×alpha into the residual stream and observe the behavioral effect — causal, not correlational.' },
  { name: 'causality-protocol', tool: 'causality_protocol', repo: 'openinterp-mcp',
    desc: 'The three mandatory checks (random-feature baseline, control-token norm, structural-rigidity α-sweep) that separate a causal probe from an epiphenomenal one.' },
  { name: 'openinterp-lab', tool: 'oilab', repo: 'openinterp-lab',
    desc: 'Operate a full mech-interp lab from the terminal — provision Colab GPUs via the Google Colab CLI, run the loops, replicate the papers.' },
]

export const skillRepoUrl = (s: Skill) =>
  `https://github.com/OpenInterpretability/${s.repo}/tree/main/skills/${s.name}`

// The four ways a researcher uses the lab.
export const useBlocks = [
  { id: 'reproduce', title: 'Reproduce a paper', tag: 'one command',
    body: 'Every paper in the arc replicates from a single command on the Colab CLI, with the verdict auto-checked against the published numbers.',
    code: 'oilab replicate lever-is-late', href: 'https://github.com/OpenInterpretability/openinterp-lab' },
  { id: 'mcp', title: 'Run your own experiments', tag: `openinterp-mcp v${versions.mcp}`,
    body: 'An MCP server that lets any agent — Claude Code, Cursor, Cline — run probe-causality experiments on your own GPU session. We never see your model, data, or keys.',
    code: 'pip install "openinterp-mcp[server]"', href: '/mcp' },
  { id: 'skills', title: 'The operational knowledge, as skills', tag: '6 Claude Code skills',
    body: 'The methodology is packaged as agent skills: how to capture activations, evaluate a probe, steer a direction, and run the three causality checks that separate a real result from an epiphenomenal one.',
    code: '', href: '#skills' },
  { id: 'notebooks', title: 'Notebooks', tag: 'self-contained',
    body: 'A ladder of runnable notebooks, from your first SAE in 30 minutes to the full-stack experiments behind the papers — each opens in Colab.',
    code: '', href: '/train' },
]
