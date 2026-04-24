import Link from 'next/link'
import { ArrowRight, Github, Zap, ShieldCheck, GitBranch, Cpu, Atom, Package, Play } from 'lucide-react'
import { headline, moat, saes, benchmarks, priorWork, stages, site } from '@/lib/constants'
import { pillars, threeMoats, roadmap, heroNew } from '@/lib/pillars'
import { PillarCard } from '@/components/pillar-card'

export default function HomePage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-20 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
            {heroNew.eyebrow}
          </div>

          <h1 className="mt-8 text-5xl sm:text-7xl lg:text-[5.5rem] font-semibold leading-[1.02] tracking-tight text-ink-900 dark:text-white text-balance">
            {heroNew.watchLine}{' '}
            <span className="gradient-text font-semibold">{heroNew.thinkLine}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-ink-900/80 dark:text-ink-50/80 text-balance leading-relaxed font-medium">
            {heroNew.subBold}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg text-ink-900/60 dark:text-ink-50/60 text-balance leading-relaxed">
            {heroNew.subText}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/train"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
            >
              Train your first SAE in 30 min
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/observatory/trace"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/50 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Open Trace Theater
            </Link>
            <Link
              href="/manifesto"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Read the manifesto
            </Link>
          </div>

          {/* Install pill */}
          <div className="mt-12 mx-auto max-w-md">
            <div className="font-mono text-sm card px-5 py-3.5 flex items-center gap-3 shadow-md">
              <span className="text-brand-500 select-none">$</span>
              <code className="flex-1 text-left text-ink-900 dark:text-ink-50">pip install mechreward</code>
              <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30">
                alpha
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Headline metrics (preserved) ===== */}
      <section className="mx-auto max-w-7xl px-6 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="GSM8K lift (Qwen3.5-4B)" value="+19 pp" detail="64% → 83% in 168 effective steps" />
          <Metric label="G1 correlation (Qwen3.6-35B)" value="ρ = 0.52" detail="n=100 held-out SuperGPQA, p<1e-7" />
          <Metric label="Sparse vs raw ablation" value="+11 pp" detail="R1 (SAE-sparse) − R2 (raw direction)" />
          <Metric label="Public SAEs on hybrid arch" value="3" detail="GDN · ensemble-MoE · triple-hybrid" />
        </div>
      </section>

      {/* ===== The four pillars (NEW · primary frame) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            Four pillars
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
            Observe. Edit. Monitor. Teach.
          </h2>
          <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 text-balance leading-relaxed">
            Neuronpedia is the encyclopedia you consult. OpenInterp is the microscope, the
            laboratory, the watchtower, and the school — one platform, four ways in.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {pillars.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </div>
      </section>

      {/* ===== Trace Theater teaser (NEW) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="card p-8 sm:p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-orange-500/10"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] items-center">
            <div>
              <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30 ring-inset">
                FLAGSHIP · LIVE Q1 2026
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                Scrub a prompt through Qwen3.6-27B. Watch features ignite.
              </h2>
              <p className="mt-4 text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
                Trace Theater is the Observatory flagship. Real SAE feature IDs extracted from
                our multi-layer Qwen3.6-27B SAE. Token-by-token playback, heatmap, intervention
                slider with live counterfactuals. Try it in 2 minutes — zero login.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/observatory/trace"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Open Trace Theater
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/observatory"
                  className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  See all Observatory tools
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Mini heatmap preview */}
              <div className="card p-4 bg-black/[0.03] dark:bg-white/[0.03]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-3">
                  Preview · L31 heatmap · 10 features × 23 tokens
                </div>
                <div className="space-y-[3px]">
                  {[
                    [0.8, 0.75, 0.3, 0.62, 0.55, 0.58, 0.2, 0.4, 0.35, 0.15, 0.38, 0.15, 0.42, 0.38, 0.18, 0.48, 0.52, 0.61, 0.18, 0.71, 0.58, 0.45, 0.2],
                    [0.22, 0.35, 0.18, 0.91, 0.88, 0.95, 0.08, 0.28, 0.85, 0.1, 0.92, 0.1, 0.45, 0.78, 0.08, 0.22, 0.88, 0.62, 0.1, 0.28, 0.82, 0.9, 0.08],
                    [0.92, 0.45, 0.12, 0.35, 0.22, 0.28, 0.05, 0.55, 0.3, 0.05, 0.25, 0.05, 0.28, 0.25, 0.05, 0.35, 0.28, 0.18, 0.05, 0.89, 0.52, 0.35, 0.05],
                    [0.18, 0.25, 0.1, 0.72, 0.96, 0.9, 0.08, 0.22, 0.93, 0.08, 0.88, 0.08, 0.35, 0.68, 0.08, 0.18, 0.55, 0.25, 0.08, 0.22, 0.95, 0.82, 0.08],
                    [0.35, 0.55, 0.18, 0.48, 0.52, 0.55, 0.1, 0.72, 0.68, 0.15, 0.65, 0.15, 0.58, 0.62, 0.1, 0.62, 0.75, 0.68, 0.15, 0.58, 0.78, 0.72, 0.1],
                    [0.08, 0.12, 0.05, 0.18, 0.15, 0.18, 0.02, 0.18, 0.22, 0.05, 0.88, 0.05, 0.15, 0.18, 0.03, 0.25, 0.95, 0.92, 0.08, 0.12, 0.25, 0.18, 0.03],
                    [0.65, 0.72, 0.25, 0.35, 0.32, 0.35, 0.12, 0.78, 0.38, 0.18, 0.35, 0.18, 0.32, 0.32, 0.12, 0.72, 0.35, 0.28, 0.18, 0.42, 0.38, 0.32, 0.12],
                  ].map((row, i) => (
                    <div key={i} className="grid gap-[2px] grid-cols-23" style={{ gridTemplateColumns: 'repeat(23, 1fr)' }}>
                      {row.map((v, j) => (
                        <div
                          key={j}
                          className="h-4 rounded-sm bg-black/[0.05] dark:bg-white/[0.04] relative"
                        >
                          <div
                            className="absolute inset-0 rounded-sm bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ opacity: v }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-900/50 dark:text-ink-50/50 font-mono">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse-slow" />
                  f2503, f3383, f1847, f4521, f2156, f3892, f152 — shown
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Six moats (PRESERVED) ===== */}
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
              <div className="mt-4 font-mono text-xs text-ink-900/50 dark:text-ink-50/50">
                {m.meta}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== SAE registry glance (PRESERVED) ===== */}
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

      {/* ===== Prior work (PRESERVED) ===== */}
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
                  className="font-mono text-xs text-brand-600 hover:text-brand-700"
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

      {/* ===== Stage Gates (PRESERVED) ===== */}
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
                <div className="rounded-md bg-brand-600/10 text-brand-700 dark:text-brand-300 font-mono text-sm font-semibold px-2 py-0.5">
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

      {/* ===== Benchmarks (PRESERVED) ===== */}
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

      {/* ===== Three killer moats (NEW) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            The three killer moats
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
            What keeps OpenInterp ahead.
          </h2>
          <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 text-balance leading-relaxed">
            Six shipped artifacts above are the current moat. Below are the three structural moats
            that compound — making it effectively impossible to front-run.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {threeMoats.map((m, i) => (
            <article key={i} className="card p-7 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-brand-500/20 to-transparent rounded-full blur-2xl"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                  0{i + 1} · MOAT
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                  {m.body}
                </p>
                <div className="mt-4 font-mono text-xs text-ink-900/50 dark:text-ink-50/50">
                  {m.meta}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Roadmap teaser (NEW) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
              12-month roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Built in public, quarter by quarter.
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            Full roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((r) => (
            <article
              key={r.quarter}
              className={`card p-5 ${
                r.active ? 'border-brand-500/40 bg-gradient-to-br from-brand-500/5 to-accent-500/5' : ''
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50">
                {r.quarter}
                {r.active && <span className="ml-1.5 text-brand-600 dark:text-brand-400">· NOW</span>}
              </div>
              <h3 className="mt-2 font-semibold">{r.theme}</h3>
              <ul className="mt-3 space-y-1.5">
                {r.items.slice(0, 3).map((item, j) => (
                  <li key={j} className="flex gap-2 text-xs text-ink-900/60 dark:text-ink-50/60 leading-snug">
                    <span className="font-mono text-brand-600 dark:text-brand-400">→</span>
                    {item}
                  </li>
                ))}
                {r.items.length > 3 && (
                  <li className="text-[11px] text-ink-900/40 dark:text-ink-50/40 pl-4">
                    + {r.items.length - 3} more
                  </li>
                )}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24 mb-16">
        <div className="card p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              {headline.h1}
            </h2>
            <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 max-w-2xl mx-auto text-balance leading-relaxed">
              Trace, edit, monitor, teach. Every SAE is public. Every Stage Gate is reproducible.
              Watchtower Enterprise funds the OSS tier. Join us — or watch from the sidelines.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/observatory/trace"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Open Trace Theater
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Github className="h-4 w-4" /> Star on GitHub
              </Link>
              <a
                href={`mailto:${site.contact}?subject=${encodeURIComponent('Watchtower early access')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Watchtower early access
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50"
              >
                Read the quickstart
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
      <div className="mt-0.5 font-mono text-sm font-semibold">{value}</div>
    </div>
  )
}

function BigNumber({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
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
      <dd className="font-mono text-ink-900/80 dark:text-ink-50/80 text-right">{dd}</dd>
    </div>
  )
}

function getIcon(i: number) {
  const Icons = [Atom, ShieldCheck, Zap, GitBranch, Cpu, Package]
  const Icon = Icons[i % Icons.length]
  return <Icon className="h-4 w-4" />
}
