import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Server, KeyRound, Building2, Boxes, CreditCard, ShieldCheck, ArrowRight, Check } from 'lucide-react'
import { site } from '@/lib/constants'

const URL_ = `${site.url}/ekbasis/pricing`
const COOKBOOK = 'https://github.com/OpenInterpretability/ekbasis-cookbook'

export const metadata: Metadata = {
  title: 'Ekbasis pricing — $0.04 per 1M input tokens, no output charges',
  description:
    'The consequence model for AI agents. Prepaid credits, no subscription: $0.04 per 1M input tokens (a check is ~1.5k tokens and generates 0). Self-host free forever under Apache-2.0. Enterprise on-prem and custom worlds.',
  keywords: ['Ekbasis pricing', 'consequence model', 'agent guard', 'AI agent safety API', 'world model API', 'OpenInterp'],
  alternates: { canonical: '/ekbasis/pricing' },
  openGraph: {
    type: 'website',
    url: URL_,
    siteName: site.name,
    title: 'Ekbasis pricing — $0.04 per 1M input tokens',
    description: 'Prepaid credits. No subscription. Self-host free forever under Apache-2.0.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@openinterp',
    creator: '@openinterp',
    title: 'Ekbasis pricing — $0.04 per 1M input tokens',
    description: 'Prepaid credits. No subscription. Self-host free forever.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      '@id': `${URL_}#product`,
      name: 'Ekbasis (hosted API)',
      description: 'The consequence model for AI agents, served as an API. Predicts what an action will do — what breaks, what gets lost, what charges you — in one forward pass, calibrated.',
      brand: { '@type': 'Organization', '@id': `${site.url}#org`, name: site.name, url: site.url },
      offers: {
        '@type': 'Offer',
        price: '0.04',
        priceCurrency: 'USD',
        description: 'Per 1M input tokens. No output charges (the model generates none). Prepaid credits.',
        url: URL_,
        availability: 'https://schema.org/PreOrder',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${site.url}#org`,
      name: site.name,
      url: site.url,
      sameAs: [site.github, 'https://huggingface.co/caiovicentino1', site.twitter],
    },
  ],
}

const ways = [
  {
    icon: Server,
    name: 'Hosted API',
    price: '$0.04',
    unit: 'per 1M input tokens',
    body: 'No output charges: a check is ~1.5k input tokens and the model generates none — the answer is read from the logits. Prepaid credits, no subscription, no minimum. Out of credits the guard fails closed (cannot judge → treated as risky): it never silently turns off.',
    note: '≈ $0.00006 per check · $0.06 per 1,000 checks',
  },
  {
    icon: Boxes,
    name: 'Self-host',
    price: 'Free',
    unit: 'forever, Apache-2.0',
    body: 'Open weights on Hugging Face: 27B (bf16, FP8, INT4) and the MLX 4-bit build for Apple Silicon. Same API, same prompt format, same calibration. Mac, laptop or your own GPUs.',
    note: 'For inference you self-host, the guard can run beside it at zero marginal cost (measured on shared GPUs).',
  },
  {
    icon: Building2,
    name: 'Enterprise on-prem',
    price: 'from $5k',
    unit: 'setup + retainer',
    body: 'We install the guard next to your production LLM — measured on 4× B200 sharing GPUs with a production SGLang deployment, isolated venv, monitored before/after. Runbook, launcher, monitoring and SLA.',
    note: 'Retainer from $1k/mo',
  },
  {
    icon: KeyRound,
    name: 'Custom worlds',
    price: 'from $10k',
    unit: 'your stack as the world',
    body: 'We generate consequence data for YOUR domain — your infra, your billing, your compliance rules — and train the model on it. You keep the weights.',
    note: 'The highest-margin option; the model is the proof of concept.',
  },
]

const numbers: { label: string; value: string; href?: string; hrefText?: string }[] = [
  { label: 'Agent harm with the guard consulted first', value: '48% → 6% (−41.4 pp, 95% CI [26.2, 56.7], n=93, one seed)', href: `${COOKBOOK}#agent-study`, hrefText: 'full study' },
  { label: 'Use-case suites, 21 domains, 171 scenarios', value: '168/168 correct, mean latency 0.55 s', href: `${COOKBOOK}/tree/main/examples`, hrefText: 're-runnable suites' },
  { label: 'Classic destructive git commands flagged', value: '8/8 at 98–99% · 0 false alarms on 9 safe commands', href: `${COOKBOOK}/blob/main/examples/results.md`, hrefText: 'guard battery' },
  { label: 'Confidence on ambiguous states', value: '0.59–0.84 — honest uncertainty, never a fake 0.99', href: `${COOKBOOK}/blob/main/docs/API.md`, hrefText: 'how to read it' },
]

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/ekbasis"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Ekbasis
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        PRICING · PREPAID CREDITS · NO SUBSCRIPTION
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        Pricing
      </h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        The guard is billed by what it actually consumes: <strong>input tokens</strong>. It generates no text, so
        there is no output charge — ever. Prepaid credits; when they run out the guard <em>fails closed</em>
        {' '}(answers &quot;cannot judge&quot;, which every tool treats as risky) rather than silently going away.
      </p>

      <div className="mt-8 rounded-2xl bg-brand-500/5 p-6 ring-1 ring-brand-500/30 sm:p-8">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-5xl font-semibold tracking-tight tabular-nums text-brand-700 dark:text-brand-300 sm:text-6xl">
            $0.04
          </span>
          <span className="pb-1.5 text-lg text-ink-900/60 dark:text-ink-50/60">
            per 1M input tokens · no output charges
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70">
          A check is ~1.5k input tokens → <strong className="tabular-nums">≈ $0.00006 per check</strong> (
          <strong className="tabular-nums">$0.06 per 1,000 checks</strong>). A $5 credit pack buys{' '}
          <strong className="tabular-nums">125M tokens ≈ 83,000 checks</strong>. Pay in{' '}
          <strong>USDC or USDT</strong> on Polygon, Arbitrum, Base or Ethereum. At typical API inference prices
          ($0.10–0.60/1M) the guard adds a small fraction to the bill; if you self-host your inference, the
          self-hosted guard costs zero.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/console" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-white dark:bg-white dark:text-ink-900 px-4 py-2 text-sm font-medium">
            <CreditCard className="h-4 w-4" /> Get an API key
          </a>
          <a href={`${site.github}/ekbasis`} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
            <Boxes className="h-4 w-4" /> Self-host: the weights
          </a>
          <a href={`mailto:${site.contact}?subject=Ekbasis%20enterprise%20/%20custom%20worlds`} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
            <Building2 className="h-4 w-4" /> Enterprise &amp; custom worlds
          </a>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Four ways to run it</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ways.map((w) => (
            <div key={w.name} className="rounded-xl p-5 ring-1 ring-black/10 dark:ring-white/15">
              <div className="flex items-center gap-2">
                <w.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h3 className="font-semibold">{w.name}</h3>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {w.price} <span className="text-sm font-normal text-ink-900/50 dark:text-ink-50/50">{w.unit}</span>
              </p>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{w.body}</p>
              <p className="mt-3 text-xs text-ink-900/50 dark:text-ink-50/50">{w.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">What the numbers say</h2>
        <p className="mt-2 text-ink-900/70 dark:text-ink-50/70">
          Every claim links to the measurement it comes from. Re-run the suites yourself against your own
          deployment — the data ships with the{' '}
          <a className="underline underline-offset-2" href={COOKBOOK}>
            cookbook
          </a>
          .
        </p>
        <div className="mt-6 hidden sm:block overflow-x-auto rounded-xl ring-1 ring-black/10 dark:ring-white/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black/[0.03] dark:bg-white/[0.04]">
                <th className="px-4 py-3 text-left font-semibold">Measurement</th>
                <th className="px-4 py-3 text-left font-semibold">Result</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {numbers.map((n) => (
                <tr key={n.label} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-3 font-medium">{n.label}</td>
                  <td className="px-4 py-3 tabular-nums">{n.value}</td>
                  <td className="px-4 py-3">
                    {n.href && (
                      <a className="underline underline-offset-2 text-brand-600 dark:text-brand-400" href={n.href}>
                        {n.hrefText}
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-3 sm:hidden">
          {numbers.map((n) => (
            <div key={n.label} className="rounded-xl p-4 ring-1 ring-black/10 dark:ring-white/15">
              <p className="text-sm font-semibold">{n.label}</p>
              <p className="mt-1 text-sm tabular-nums text-ink-900/70 dark:text-ink-50/70">{n.value}</p>
              {n.href && (
                <a className="mt-2 inline-block text-sm underline underline-offset-2 text-brand-600 dark:text-brand-400" href={n.href}>
                  {n.hrefText}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Start in 60 seconds</h2>
        <div className="mt-4 overflow-x-auto rounded-xl bg-black/[0.03] p-4 ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/15">
          <pre className="text-sm leading-relaxed">
            <code>{`pip install "git+https://github.com/OpenInterpretability/ekbasis"
export EKBASIS_URL=https://openinterp.org/api/v1     # or your self-hosted server
export EKBASIS_API_KEY=ekb_...                       # /console → keys

cd your-repo && ekbasis git-check -- "git reset --hard"
# Ekbasis: RISKY (lose uncommitted work: 99%)  → exit 2`}</code>
          </pre>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-ink-900/75 dark:text-ink-50/75">
          <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-brand-600 dark:text-brand-400" /> No subscription, no minimum bill, credits never expire</li>
          <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-brand-600 dark:text-brand-400" /> Paid in USDC or USDT, straight to the OpenInterp wallet (Polygon, Arbitrum, Base, Ethereum): no card</li>
          <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-brand-600 dark:text-brand-400" /> Fails closed: no credits → &quot;cannot judge&quot; → treated as risky (nothing destructive slips through)</li>
          <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-brand-600 dark:text-brand-400" /> The weights stay open: you can always leave, or stay free</li>
        </ul>
        <p className="mt-6 text-sm text-ink-900/60 dark:text-ink-50/60">
          Questions and enterprise: <a className="underline underline-offset-2" href={`mailto:${site.contact}`}>{site.contact}</a>
          {' '}· Papers:{' '}
          <a className="underline underline-offset-2" href="https://doi.org/10.5281/zenodo.23146970">Look When Unsure, Check When Sure</a> ·{' '}
          <a className="underline underline-offset-2" href="https://doi.org/10.5281/zenodo.23197341">When Does a Consequence Model Make AI Agents Safer?</a>
        </p>
        <a href="/console" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700">
          Open the console: keys, credits and usage <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </section>
    </main>
  )
}
