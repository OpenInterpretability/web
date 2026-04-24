import { Microscope, FlaskConical, Shield, GraduationCap, LucideIcon } from 'lucide-react'

export type PillarStatus = 'live' | 'q2' | 'q3' | 'q4'

export interface PillarTool {
  name: string
  slug: string
  blurb: string
  status: PillarStatus
}

export interface Pillar {
  id: 'observatory' | 'laboratory' | 'watchtower' | 'academy'
  name: string
  slug: string
  icon: LucideIcon
  tagline: string
  intro: string
  status: PillarStatus
  quarter: string
  tools: PillarTool[]
  gradient: string
}

export const pillars: Pillar[] = [
  {
    id: 'observatory',
    name: 'Observatory',
    slug: '/observatory',
    icon: Microscope,
    tagline: 'See the model thinking, feature by feature, token by token.',
    intro:
      'The narrative layer Neuronpedia lacks. Scrub a prompt through the residual stream, watch features ignite, click into circuits, compare reasoning across models.',
    status: 'live',
    quarter: 'Q1 2026 · Live',
    gradient: 'from-brand-500/20 to-accent-500/20',
    tools: [
      {
        name: 'Trace Theater',
        slug: '/observatory/trace',
        blurb:
          'Cinematic timeline. Scrub token-by-token, features ignite in real-time, intervention slider with live counterfactuals. Exportable as video.',
        status: 'live',
      },
      {
        name: 'Circuit Canvas',
        slug: '/observatory/circuits',
        blurb:
          'Figma-style attribution graphs. Nodes = features, edges = strength. Click a node, see the circuit that produced the output. AtP* + Sparse Feature Circuits pipeline.',
        status: 'live',
      },
      {
        name: 'Atlas',
        slug: '/observatory/atlas',
        blurb:
          'Google Scholar for features. Cross-model semantic search: find "overconfidence" and see matches across Qwen, Gemma, Llama, Claude. The Rosetta Stone.',
        status: 'q2',
      },
      {
        name: 'Compare',
        slug: '/observatory/compare',
        blurb:
          'N-way diff. Same prompt in four models side-by-side; or four prompts in one model. Heatmap of divergence. Killer for reasoning-model evaluation.',
        status: 'q2',
      },
    ],
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    slug: '/laboratory',
    icon: FlaskConical,
    tagline: 'Edit the model. Compose interventions. Export steered checkpoints.',
    intro:
      'Democratizes the "edit-the-model" capability that today lives in five labs. Drag features in. Suppress one, amplify another. Preview output live. Ship the recipe.',
    status: 'q2',
    quarter: 'Q2 2026',
    gradient: 'from-pink-500/20 to-orange-500/20',
    tools: [
      {
        name: 'Sandbox',
        slug: '/laboratory/sandbox',
        blurb:
          'Drag-and-drop steering. Compose multi-feature interventions. Live output preview. Save as recipe URL.',
        status: 'q2',
      },
      {
        name: 'Recipe Store',
        slug: '/laboratory/recipes',
        blurb:
          'Public marketplace of steering packs — helpful, honest, harmless. Fork, star, PR. One-click plug-in to your transformers model.',
        status: 'q2',
      },
      {
        name: 'Auto-Interp Engine',
        slug: '/laboratory/autointerp',
        blurb:
          'Upload a failure dataset, get back the top 50 features correlated with errors. The sacred grail of LLM debugging.',
        status: 'q3',
      },
      {
        name: 'Counterfactual Studio',
        slug: '/laboratory/counterfactual',
        blurb:
          '"What if this token were X?" Surgical replay with exact-token edits; see how features downstream shift. Feels like a React time-travel debugger.',
        status: 'q3',
      },
    ],
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    slug: '/watchtower',
    icon: Shield,
    tagline: 'Monitor LLMs in production. Feature-level observability for safety teams.',
    intro:
      'The Enterprise tier that sustains the entire OSS platform. Pipe your production LLM traffic, get real-time dashboards of which features fire, alerts when dangerous ones activate, immutable audit trails for compliance.',
    status: 'q4',
    quarter: 'Q4 2026 · Enterprise',
    gradient: 'from-cyan-500/20 to-emerald-500/20',
    tools: [
      {
        name: 'Feature Firehose API',
        slug: '/watchtower/firehose',
        blurb:
          'Low-latency streaming API. Your LLM calls pass through; features emit on WebSocket. ClickHouse-backed dashboards. Pricing from $2/1M tokens.',
        status: 'q4',
      },
      {
        name: 'Safety Watchlist',
        slug: '/watchtower/watchlist',
        blurb:
          'Deception, sycophancy, shutdown-resistance, jailbreak-fingerprint features monitored 24/7. Slack / PagerDuty alerts on trigger.',
        status: 'q4',
      },
      {
        name: 'Audit Trail',
        slug: '/watchtower/audit',
        blurb:
          'Immutable logs of every feature activation. SOC2, EU AI Act, NIST-ready. "We prove we monitored interpretability continuously."',
        status: 'q4',
      },
    ],
  },
  {
    id: 'academy',
    name: 'Academy',
    slug: '/academy',
    icon: GraduationCap,
    tagline: 'Onboard the world. From "what is an activation" to "discover a new feature" in 90 minutes.',
    intro:
      'Education-first, not PhD-gated. The student in Mumbai on a phone should finish their first Expedition in 15 minutes. Gamified discovery. Olympics-style leaderboards. Reproducibility that lasts forever.',
    status: 'q3',
    quarter: 'Q3 2026',
    gradient: 'from-amber-500/20 to-pink-500/20',
    tools: [
      {
        name: 'Expeditions',
        slug: '/academy/expeditions',
        blurb:
          'Interactive tutorials with validated checkpoints and badge awards. 12 guided paths from zero to contributor.',
        status: 'q3',
      },
      {
        name: 'Interp Olympics',
        slug: '/academy/olympics',
        blurb:
          'Monthly feature-hunting challenges with leaderboards and prizes. Kaggle for mechanistic interpretability.',
        status: 'q3',
      },
      {
        name: 'Live Lectures',
        slug: '/academy/lectures',
        blurb:
          'Researchers lecture inside the tool. Real-time Q&A. The interpretability course that runs in the same browser as the data.',
        status: 'q3',
      },
      {
        name: 'Reproducibility Vault',
        slug: '/academy/vault',
        blurb:
          'Every trace, circuit, recipe, and notebook hashed forever. "This visualization I made in 2026 still renders identical in 2030." Free forever.',
        status: 'q3',
      },
    ],
  },
]

export const threeMoats = [
  {
    title: 'Cross-model feature graph',
    body:
      'A feature-equivalence graph across Qwen, Gemma, Llama, Claude, Mistral. "Feature 2503 in Qwen ≈ feature 8901 in Gemma" — rendered, searchable, citable. Grows with every community-submitted SAE; the dataset gets more useful the more people contribute.',
    meta: 'Q2 2026: first rendering with 2 models. Q4: 5+ models.',
  },
  {
    title: 'Revenue that funds the free tier',
    body:
      'A paid monitoring API (Watchtower) is designed to subsidize the OSS tier long-term — so students, researchers, and contributors never hit a paywall. Paid where it sustains (safety teams, compliance, vendor integration); free where it matters.',
    meta: 'Target: first design partner Q3, first revenue Q4. Not yet proven.',
  },
  {
    title: 'Model partnerships',
    body:
      'Working with model vendors and research labs to ship SAEs alongside model releases. When an open-source SAE lands on the same day as the model, interpretability becomes part of the release process rather than an afterthought — a better default for everyone.',
    meta: 'First partnership conversation active. Nothing signed yet.',
  },
]

export const roadmap = [
  {
    quarter: 'Q1 2026',
    label: 'NOW',
    theme: 'Observatory v0',
    active: true,
    items: [
      'Trace Theater (Qwen3.6-27B, 3 curated prompts, real feature IDs)',
      'Paper-grade SAEs landing on HuggingFace (n=65k, L11/L31/L55)',
      'Public Python SDK v0.1 · pip install openinterp',
      'mechreward + Stage Gate preserved and integrated into Atlas',
    ],
  },
  {
    quarter: 'Q2 2026',
    label: 'NEXT',
    theme: 'Expansion',
    active: false,
    items: [
      'Atlas search across 8+ model families',
      'Circuit Canvas v1 (attribution graphs)',
      'Lab Sandbox beta (compose interventions)',
      'Compare mode (N-way diff)',
      'Academic paper + 10 partnership conversations',
    ],
  },
  {
    quarter: 'Q3 2026',
    label: 'COMMUNITY',
    theme: 'Academy + growth',
    active: false,
    items: [
      'Recipe Store public launch',
      'Expeditions v1 · 12 guided tutorials',
      'Interp Olympics Season 1',
      'Live Lectures · 4 researchers/mo',
      'Target: 1,000 monthly active users',
    ],
  },
  {
    quarter: 'Q4 2026',
    label: 'SUSTAINABILITY',
    theme: 'Watchtower + revenue',
    active: false,
    items: [
      'Watchtower Enterprise beta · 3 design partners',
      'Model Partner Program · first vendor SAE launch-day release',
      'Reproducibility Vault · public hash index',
      'First revenue in. OSS tier permanently funded.',
    ],
  },
]

export const heroNew = {
  eyebrow: 'Observatory · Laboratory · Watchtower · Academy — shipped MIT',
  watchLine: 'Watch language models',
  thinkLine: 'think.',
  subBold: 'Trace every feature. Every circuit. Every second of reasoning.',
  subText:
    'The open platform for mechanistic interpretability. Train SAEs on free Colab in 30 min or at paper-grade in the cloud. Trace any model. Edit features, monitor deployments, teach the next generation — one platform, four ways in.',
}
