# OpenInterpretability — Web

Next.js 14 App Router site for **OpenInterpretability** — open research infrastructure for mechanistic interpretability.

Companion to the [`mechreward`](https://github.com/caiovicentino/mechreward) library and the public SAE releases on HuggingFace.

## Quick deploy

```bash
npm install
npm run build        # verify build passes locally
vercel --prod        # deploy (requires `vercel login` first)
```

## Stack

- **Next.js 14** App Router, Server Components
- **Tailwind CSS 3.4** with custom brand palette
- **TypeScript 5**
- **lucide-react** for icons
- No CMS — all content in `lib/constants.ts` (research data + copy)
- Dark mode via `prefers-color-scheme` (no toggle yet)

## Structure

```
openinterpretability-web/
├── app/
│   ├── layout.tsx        # root layout, nav, footer
│   ├── page.tsx          # landing
│   ├── playground/       # interactive feature explorer (preview)
│   ├── catalog/          # validated feature packs
│   ├── models/           # SAE registry
│   ├── benchmarks/       # G1 / G3 results + prior-work comparison
│   ├── docs/             # quickstart + API ref
│   ├── research/         # papers, posts, roadmap
│   └── globals.css
├── components/
│   ├── navbar.tsx
│   └── footer.tsx
├── lib/
│   ├── constants.ts      # single source of truth for content
│   └── utils.ts          # cn() helper
├── public/               # static assets (logo pending)
├── tailwind.config.ts
├── next.config.js
├── vercel.json
└── tsconfig.json
```

## Local dev

```bash
npm install
npm run dev              # http://localhost:3000
npm run build && npm run start  # production mode locally
```

## Adding content

All research content lives in `lib/constants.ts`. Update the exported arrays (saes, benchmarks, priorWork, moat, stages) and the relevant page re-renders.

To add a page, create `app/<slug>/page.tsx` and optionally add to the `nav` array in `components/navbar.tsx`.

## Deploy

```bash
# First time
vercel login
vercel link          # link to Vercel project (create new or connect existing)

# Set env vars (none required yet — backend comes in v2)
# vercel env add NEXT_PUBLIC_API_URL

# Custom domain (after registering openinterpretability.org)
# vercel domains add openinterpretability.org

# Deploy
vercel --prod
```

See [DEPLOY.md](./DEPLOY.md) for the full end-to-end setup including domain, backend (Modal), and monitoring.

## License

Apache-2.0 for code. Content under CC-BY 4.0.

## Sibling projects

- [caiovicentino/mechreward](https://github.com/caiovicentino/mechreward) — Python library for SAE-as-reward RL
- HuggingFace: [caiovicentino1](https://huggingface.co/caiovicentino1) — trained SAEs + LoRA adapters
