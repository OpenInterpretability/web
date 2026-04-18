# Deploy guide — OpenInterpretability

End-to-end steps to go from `git push` to `openinterpretability.org` in production.

## Phase 0 — prerequisites (one-time)

1. **Register domains** (~$40/year total)
   ```bash
   # Via Vercel, Cloudflare Registrar, or Namecheap
   # openinterpretability.org   (~$12/yr)
   # openinterpretability.ai    (~$25/yr, optional)
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   ```

3. **Create GitHub org** (optional but recommended)
   - Name: `OpenInterpretability`
   - Move the web repo there (or start fresh here)

4. **Accounts needed**
   - Vercel (free Pro tier initially)
   - Cloudflare (for DNS / R2 later)
   - HuggingFace (already set up)

## Phase 1 — first deploy (static site, no backend)

```bash
cd openinterpretability-web
npm install
npm run build              # verify builds clean

vercel link                # prompts to create/link project
vercel --prod              # deploys to *.vercel.app URL
```

**Expected first-deploy URL**: `https://openinterpretability-web-<hash>.vercel.app`

## Phase 2 — custom domain

```bash
# In Vercel dashboard, or via CLI
vercel domains add openinterpretability.org
vercel domains add www.openinterpretability.org
```

Then in your registrar (Vercel, Cloudflare, etc.) set DNS:
- `A` record: @ → 76.76.21.21 (Vercel IP)
- `CNAME`: www → cname.vercel-dns.com

Vercel auto-provisions SSL via Let's Encrypt within a few minutes.

## Phase 3 — add backend (Modal for SAE inference)

When you're ready to make the `/playground` interactive:

1. **Create Modal account** ([modal.com](https://modal.com))
2. **Install Modal CLI**
   ```bash
   pip install modal
   modal setup
   ```
3. **Deploy inference function** (file pending: `backend/sae_inference.py`)
   ```bash
   cd backend
   modal deploy sae_inference.py
   # Outputs: https://<your-workspace>--sae-inference.modal.run
   ```
4. **Wire to Next.js**
   ```bash
   vercel env add MODAL_ENDPOINT_URL    # paste the modal.run URL
   vercel env add MODAL_TOKEN           # from modal dashboard
   ```
5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Phase 4 — analytics + monitoring

1. **Vercel Analytics** (free on Pro)
   - Enable in dashboard: Project → Analytics → Enable
   - Add `<Analytics />` component to `app/layout.tsx`

2. **PostHog** (optional, product analytics)
   ```bash
   npm install posthog-js
   # Wrap root layout with PostHog provider
   vercel env add NEXT_PUBLIC_POSTHOG_KEY
   ```

3. **Sentry** (optional, error tracking)
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

## Phase 5 — community + growth infrastructure

- **Discord server** → invite link in `lib/constants.ts` `site.discord`
- **Twitter/X account** → `@openinterpret` (TBD)
- **Crosspost pipeline**: GitHub Actions for LessWrong + HackerNews submission on blog post publish

## Env var reference

| Variable | Required? | What | Used by |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | v2 | Modal endpoint URL | Playground fetch |
| `MODAL_TOKEN` | v2 | Modal API token | Server-side (SSR) |
| `SUPABASE_URL` | v3 | Supabase project | Pack submissions |
| `SUPABASE_ANON_KEY` | v3 | Supabase anon key | Client auth |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | Analytics | Client tracking |

## Roll-forward checklist per release

- [ ] All `lib/constants.ts` numbers match latest paper / HF repos
- [ ] `npm run build` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] Manual smoke: landing, playground (preview), catalog, models, benchmarks, docs, research — all render
- [ ] OG image / favicon present
- [ ] `vercel --prod` completes
- [ ] Custom domain resolves
- [ ] GitHub tag release

## Troubleshooting

- **Build fails on Vercel but works locally**: check Node version. Vercel defaults to 20 LTS; we target `>=20`. Set in project settings if needed.
- **Tailwind styles missing in prod**: ensure `content` glob in `tailwind.config.ts` covers all app dirs.
- **Hydration errors**: check that components using `suppressHydrationWarning` aren't relying on client-only state server-side.
