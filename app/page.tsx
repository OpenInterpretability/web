import Link from 'next/link'
import { ArrowRight, Github, Zap, ShieldCheck, GitBranch, Cpu, Atom, Package } from 'lucide-react'
import { headline, moat, saes, benchmarks, priorWork, stages, site } from '@/lib/constants'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-600/20 bg-brand-600/5 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
            {headline.eyebrow}
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
            {headline.h1.split('operational').map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i}>
                  <span className="gradient-text">operational</span>
                  {part}
                </span>
              )
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-900/70 dark:text-ink-50/70 text-balance leading-relaxed">
            {headline.sub}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 transition-colors"
            >
              Try the playground <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Github className="h-4 w-4" /> Star on GitHub
            </Link>
          </div>

          {/* Install pill */}
          <div className="mt-10 mx-auto max-w-md">
            <div className="mono text-sm card px-4 py-3 flex items-center justify-between">
              <span className="text-ink-900/60 dark:text-ink-50/60">$</span>
              <code className="flex-1 text-center">pip install mechreward</code>
              <span className="chip bg-brand-600/10 text-brand-700 dark:text-brand-300 ring-brand-600/20">
                alpha
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Headline metrics */}
      <section className="mx-auto max-w-7xl px-6 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="GSM8K lift (Qwen3.5-4B)" value="+19 pp" detail="64% → 83% in 168 effective steps" />
          <Metric label="G1 correlation (Qwen3.6-35B)" value="ρ = 0.52" detail="n=100 held-out SuperGPQA, p<1e-7" />
          <Metric label="Sparse vs raw ablation" value="+11 pp" detail="R1 (SAE-sparse) − R2 (raw direction)" />
          <Metric label="Public SAEs on hybrid arch" value="3" detail="GDN · ensemble-MoE · triple-hybrid" />
        </div>
      </section>

      {/* Moat / what no one else has */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          Six things that don&apos;t exist anywhere else.
        </h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 max-w-3xl text-balance">
          Every card below corresponds to a public artifact: a trained SAE, a validated feature pack,
          a protocol, or an ablation result. No vaporware.
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moat.map((m, i) => (
            <article key={i} className="card p-6 hover:border-brand-500/30 transition-colors">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
                {getIcon(i)}
                <span className="text-xs font-medium uppercase tracking-wider">0{i + 1}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {m.body}
              </p>
              <div className="mt-4 mono text-xs text-ink-900/50 dark:text-ink-50/50">
                {m.meta}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SAE registry glance */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Trained SAEs</h2>
            <p className="mt-2 text-ink-900/70 dark:text-ink-50/70 max-w-2xl">
              First TopK residual-stream SAEs on architectures previously unreachable.
            </p>
          </div>
          <Link href="/models" className="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4">
          {saes.map((s) => (
            <article key={s.model} className="card p-6 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{s.model}</h3>
                  <span className={`chip ring-inset ${
                    s.status === 'Released'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20'
                  }`}>{s.status}</span>
                </div>
                <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70">
                  {s.architecture} · {s.layer} · {s.expansion} expansion · {s.tokens} training tokens
                </p>
                <p className="mt-2 text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                  {s.firstPublic}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-3 text-sm text-center md:text-right">
                <Stat label="var_exp" value={s.varExp.toFixed(3)} />
                <Stat label="d_sae" value={s.dSae.toLocaleString()} />
                <Stat label="G1 ρ" value={s.g1Rho != null ? s.g1Rho.toFixed(3) : '—'} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Prior work comparison */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <h2 className="text-3xl font-semibold tracking-tight">Where we fit.</h2>
        <p className="mt-2 text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          Honest comparison against the four closest prior works. All numbers are from the
          published papers; we don&apos;t soften or spin.
        </p>
        <div className="mt-8 grid gap-4">
          {priorWork.map((p) => (
            <article key={p.name} className="card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-semibold">{p.name}</h3>
                <Link
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs text-brand-600 hover:text-brand-700"
                >
                  arxiv:{p.arxiv}
                </Link>
              </div>
              <p className="mt-2 text-sm">{p.method}</p>
              <p className="mt-1 text-sm text-ink-900/60 dark:text-ink-50/60">
                <strong>Their result:</strong> {p.result}
              </p>
              <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                <strong>How we differ:</strong> {p.vsUs}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Stage Gates protocol */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <h2 className="text-3xl font-semibold tracking-tight">The Stage Gate protocol.</h2>
        <p className="mt-2 text-ink-900/70 dark:text-ink-50/70 max-w-3xl">
          Don&apos;t spend GPU hours on RL until you&apos;ve verified the signal predicts the outcome.
          Every validated pack in the catalog has passed all three gates.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {stages.map((s) => (
            <article key={s.id} className="card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-brand-600/10 text-brand-700 dark:text-brand-300 mono text-sm font-semibold px-2 py-0.5">
                  {s.id}
                </div>
                <h3 className="font-semibold">{s.name.replace(/^Stage Gate \d+ — /, '')}</h3>
              </div>
              <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {s.purpose}
              </p>
              <dl className="mt-4 space-y-2 text-xs">
                <Row dt="Threshold" dd={s.threshold} />
                <Row dt="Budget" dd={s.budget} />
                <Row dt="Artifacts" dd={s.artifacts} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* Benchmarks preview */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <h2 className="text-3xl font-semibold tracking-tight">Validated benchmarks.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="card p-6">
            <h3 className="font-semibold">{benchmarks.qwen35_g3.title}</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <BigNumber label="Baseline" value={`${benchmarks.qwen35_g3.baseline}%`} />
              <BigNumber label="Trained (R1)" value={`${benchmarks.qwen35_g3.r1}%`} accent />
              <BigNumber label="Δ" value={`+${benchmarks.qwen35_g3.deltaPp} pp`} />
            </div>
            <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              {benchmarks.qwen35_g3.notes}
            </p>
          </article>
          <article className="card p-6">
            <h3 className="font-semibold">{benchmarks.qwen36_g1.title}</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <BigNumber label="Spearman ρ" value={benchmarks.qwen36_g1.rho.toFixed(3)} accent />
              <BigNumber label="Pearson r" value={benchmarks.qwen36_g1.pearson.toFixed(3)} />
              <BigNumber label="n" value={String(benchmarks.qwen36_g1.nHeldOut)} />
            </div>
            <p className="mt-4 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              {benchmarks.qwen36_g1.notes}
            </p>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 mt-24 mb-16">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Use SAE features as RL reward — in ten lines.
            </h2>
            <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 max-w-xl mx-auto text-balance">
              mechreward drops into TRL, OpenRLHF, and verl with a single import.
              Every feature pack is validated at ρ ≥ 0.30 on held-out data before it ships.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                Read the quickstart <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                See the paper
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50 font-medium">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight gradient-text">{value}</div>
      <div className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60 leading-snug">{detail}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
        {label}
      </div>
      <div className="mt-0.5 mono text-sm font-semibold">{value}</div>
    </div>
  )
}

function BigNumber({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-900/50 dark:text-ink-50/50">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${accent ? 'gradient-text' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function Row({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-900/50 dark:text-ink-50/50 uppercase tracking-wider">{dt}</dt>
      <dd className="mono text-ink-900/80 dark:text-ink-50/80 text-right">{dd}</dd>
    </div>
  )
}

function getIcon(i: number) {
  const Icons = [Atom, ShieldCheck, Zap, GitBranch, Cpu, Package]
  const Icon = Icons[i % Icons.length]
  return <Icon className="h-4 w-4" />
}
