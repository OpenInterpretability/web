# `web` — Next.js site at [openinterp.org](https://openinterp.org)

Trace Theater, Circuit Canvas, InterpScore, /train, /research. Next.js 16 + TypeScript + Tailwind.

Apache-2.0 (code) · CC-BY 4.0 (docs)

## What this repo is

The full openinterp.org site — 35 static-prerendered routes built on **Next.js 16 + TypeScript + Tailwind**, hosting:

- **Trace Theater** (`/observatory/trace`) — interactive token-by-token SAE feature visualization with 10 scenarios
- **Circuit Canvas** (`/observatory/circuits`) — attribution-graph viewer built on `@xyflow/react` + `@dagrejs/dagre`
- **InterpScore leaderboard** (`/interpscore`) — public composite SAE ranking (v0.0.1)
- **/train** — 3-tier notebook ladder (free Colab → free Kaggle → cloud paper-grade)
- **/research** — 51 curated canonical papers + shipped artifacts
- **/contribute** — 4 ways in, matched to your level
- **/manifesto** + **/roadmap** — vision & 12-month plan
- 4 pillar pages (Observatory, Laboratory, Watchtower, Academy) + 14 sub-routes

---

## Part of a 5-repo ecosystem

| Repo | What's in it |
|---|---|
| [`.github`](https://github.com/OpenInterpretability/.github) | Org profile + shared CoC + SECURITY |
| **`web`** (you are here) | Next.js site behind openinterp.org |
| [`notebooks`](https://github.com/OpenInterpretability/notebooks) | 23 training + interpretability notebooks |
| [`cli`](https://github.com/OpenInterpretability/cli) | `pip install openinterp` — Python SDK |
| [`mechreward`](https://github.com/OpenInterpretability/mechreward) | SAE features as dense RL reward |

---

## Stack

- **Next.js 16** · App Router · React Server Components · Turbopack
- **TypeScript 5** · strict mode
- **Tailwind CSS 3.4** · custom brand palette (`brand-*` indigo · `accent-*` cyan · `ink-*` neutral)
- **[`@xyflow/react`](https://reactflow.dev) 12** · Circuit Canvas DAG viewer (pinch-zoom touch, MIT)
- **[`@dagrejs/dagre`](https://github.com/dagrejs/dagre)** · layered DAG layout
- **[`lucide-react`](https://lucide.dev)** · icons
- **Inter + JetBrains Mono** via `next/font/google` (no CDN)
- **Dark mode** · class-based, FOUC-free (inline script in `<head>`), respects `prefers-color-scheme`, user override via navbar toggle

No CMS. No database. All content lives in typed data files (`lib/*.ts`). Every page is static-prerendered.

---

## Local dev

```bash
git clone https://github.com/OpenInterpretability/web
cd web
npm install                        # ~30s
npm run dev                        # → http://localhost:3000
```

### Before opening a PR

```bash
npm run build                      # full production build (≤ 10s)
npx tsc --noEmit -p .              # type check (≤ 5s)
```

Both must pass. CI runs them automatically.

---

## Directory structure

```
web/
├── app/                            # Next.js 16 App Router
│   ├── layout.tsx                  # root layout + metadata + theme FOUC script
│   ├── page.tsx                    # landing (hero + pillars + moats + metrics + SAEs)
│   ├── icon.svg                    # favicon (gradient logo)
│   ├── apple-icon.tsx              # 180×180 apple-touch-icon (ImageResponse)
│   ├── opengraph-image.tsx         # 1200×630 OG card (dynamic PNG)
│   ├── twitter-image.tsx           # Twitter card (same image)
│   │
│   ├── train/page.tsx              # 3-tier ladder + 6 supplementary sections
│   ├── interpscore/page.tsx        # leaderboard + formula + submit CTA
│   ├── research/page.tsx           # artifacts + roadmap + 51 canonical papers
│   ├── manifesto/page.tsx          # vision, gaps, pillars, moats
│   ├── roadmap/page.tsx            # quarter-by-quarter plan
│   ├── contribute/page.tsx         # how-to for external contributors
│   ├── docs/page.tsx               # mechreward quickstart
│   │
│   ├── observatory/                # pillar — SEE
│   │   ├── page.tsx
│   │   ├── trace/page.tsx          # 🎬 Trace Theater (interactive)
│   │   ├── circuits/page.tsx       # 🔗 Circuit Canvas (interactive)
│   │   ├── atlas/page.tsx          # coming Q2 — preview
│   │   └── compare/page.tsx        # coming Q2 — preview
│   │
│   ├── laboratory/                 # pillar — EDIT (Q2)
│   ├── watchtower/                 # pillar — MONITOR (Q4)
│   ├── academy/                    # pillar — TEACH (Q3)
│   │
│   ├── playground/, catalog/, models/, benchmarks/   # classic legacy routes
│
├── components/
│   ├── navbar.tsx                  # sticky nav + theme toggle + mobile menu
│   ├── footer.tsx                  # 5-col footer
│   ├── theme-toggle.tsx            # Sun/Moon dark-mode toggle
│   ├── trace-theater.tsx           # client — scenario picker + playback + heatmap
│   ├── circuit-canvas.tsx          # client — @xyflow/react DAG viewer
│   ├── pillar-card.tsx             # reusable pillar card
│   ├── pillar-landing.tsx          # shared pillar page wrapper
│   └── coming-soon.tsx             # template for Q2/Q3/Q4 sub-routes
│
├── lib/                            # SINGLE SOURCE OF TRUTH FOR CONTENT
│   ├── constants.ts                # site metadata, SAE registry, research artifacts
│   ├── pillars.ts                  # 4 pillars + 3 structural bets + roadmap + hero
│   ├── notebooks.ts                # 23 training notebooks (ladder + supplementary groups)
│   ├── trace-data.ts               # default Trace scenario (clinical triage) + TraceScenario type
│   ├── trace-scenarios.ts          # 9 extra scenarios (math, code, riddle, safety, planning, creative, multilingual, ambiguity, tom)
│   ├── circuit-data.ts             # demo circuit + CircuitData type
│   ├── papers.ts                   # 51 canonical papers across 3 topics × 21 groups
│   ├── leaderboard.ts              # InterpScore v0.0.1 formula + 5 seed entries
│   └── utils.ts                    # cn() helper
│
├── .github/
│   ├── ISSUE_TEMPLATE/             # bug + feature + trace-scenario + leaderboard-submission
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml            # type check + build
│
├── tailwind.config.ts              # brand palette + dark: class mode
├── next.config.js
├── vercel.json
└── tsconfig.json
```

---

## How to contribute (concrete recipes)

> Full rules in [CONTRIBUTING.md](./CONTRIBUTING.md). These are the 3 most common PR patterns.

### Add a Trace Theater scenario

File: [`lib/trace-scenarios.ts`](./lib/trace-scenarios.ts). Append one object to the `extraScenarios` array:

```ts
{
  id: 'legal-ambiguity',          // kebab-case
  label: 'Legal reasoning — contract ambiguity',
  category: 'ambiguity',          // reuse or widen the union in trace-data.ts
  prompt: '"Party A shall use reasonable efforts..." — is this enforceable?',
  model: 'Qwen/Qwen3.6-27B',      // always
  layer: 'L31 residual',          // or whichever layer you used
  sae_repo: 'YOUR_USER/your-sae',
  tokens: [' It', ' depends', ' on', ' jurisdiction', ...],   // 15-25 tokens
  features: [                     // 8-10 features — UNIQUE IDs (grep to confirm)
    { id: 'f7110', name: 'legal_formalism', desc: '...', auroc: 0.66 },
    // ...
  ],
  activations: [[...], [...]],    // rectangular [features][tokens], values 0-1
  counterfactuals: {
    f7110: {
      '-3': 'Text when feature ablated...',
      '0': '...',
      '1': 'Baseline response...',
      '3': 'Amplified response...',
    },
  },
}
```

PR title: `Add Trace scenario: <your label>`. Include a screenshot of it running locally.

### Submit an SAE to the InterpScore leaderboard

1. Run [`18_interpscore_eval.ipynb`](https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/18_interpscore_eval.ipynb) on your SAE
2. It writes `interpscore.json` to your HF SAE repo
3. Edit [`lib/leaderboard.ts`](./lib/leaderboard.ts), append one `LeaderboardEntry` object
4. PR title: `Leaderboard: add <YOUR_USER/your-sae>`

The formula file + 5 seed entries are the source of truth; ranking re-sorts automatically.

### Add a paper to `/research`

File: [`lib/papers.ts`](./lib/papers.ts). Append a `Paper` object to the right `PaperGroup.papers` array:

```ts
{
  title: 'Your cited paper title',
  authors: 'First Author et al.',
  year: 2026,
  url: 'https://arxiv.org/abs/XXXX.YYYYY',
  what: 'What the paper does (one sentence).',
  why: 'Why it matters to a 2026 practitioner (one sentence).',
}
```

PR title: `papers: add <short title>`. Criteria: primary source, real URL (no confabulated arxiv IDs), ≤2 sentences each.

---

## Design system cheat-sheet

| Want | Tailwind utility |
|---|---|
| Brand accent | `text-brand-600 dark:text-brand-400` |
| Secondary accent | `text-accent-500` (cyan) |
| Neutral text | `text-ink-900 dark:text-ink-50` |
| Muted text | `text-ink-900/70 dark:text-ink-50/70` (or /60, /50, /40) |
| Gradient headline | `<span className="gradient-text">...</span>` |
| Card surface | `<div className="card p-5">...</div>` (border + bg + backdrop-blur) |
| Chip / badge | `<span className="chip bg-brand-500/10 ring-brand-500/30 ring-inset">LIVE</span>` |
| Grid background | `<div className="bg-grid dark:bg-grid-dark" />` |

Dark mode: every new component must include `dark:` variants. The `ThemeToggle` in navbar is wired up; your job is to not break it.

---

## Metadata & SEO

- OG card rendered dynamically via `app/opengraph-image.tsx` — edit there if you want a different social preview
- Favicon: `app/icon.svg` (Next.js auto-serves as `<link rel="icon">`)
- Twitter `@openinterp` wired in layout metadata
- `metadataBase` is the canonical `https://openinterp.org`

---

## Deploy

Owner-only. Vercel project `openinterp` under team `caiovicentinos-projects`.

```bash
vercel --prod
```

CI runs `npx tsc --noEmit` + `npm run build` on every PR. Merging to `main` auto-deploys.

---

## Community

- [Discussions](https://github.com/OpenInterpretability/web/discussions) — design questions, "which repo should this live in"
- [Good-first-issues](https://github.com/OpenInterpretability/web/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- [Contributor guide](./CONTRIBUTING.md)
- [Code of Conduct](https://github.com/OpenInterpretability/.github/blob/main/CODE_OF_CONDUCT.md) — Contributor Covenant 2.1
- hi@openinterp.org — safety reports, partnership inquiries
- [@openinterp on X](https://x.com/openinterp)

---

Apache-2.0 (code) · CC-BY 4.0 (docs) · [openinterp.org](https://openinterp.org)
