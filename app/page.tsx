import Link from 'next/link'
import {
  ArrowRight, Github, Terminal, ShieldCheck, BookOpen, FlaskConical,
  GitBranch, ExternalLink, Library, GraduationCap, Cpu,
} from 'lucide-react'
import { heroNew } from '@/lib/pillars'
import { arc, findings, discipline, secondLine, researchTools, credibility } from '@/lib/arc'

export default function HomePage() {
  return (
    <>
      {/* ===== Announcement banner: openinterp-lab on the Colab CLI ===== */}
      <a
        href="https://github.com/OpenInterpretability/openinterp-lab"
        target="_blank"
        rel="noopener noreferrer"
        className="group block border-b border-brand-500/20 bg-gradient-to-r from-brand-600/15 via-accent-500/10 to-brand-600/15 px-4 py-2.5 text-center text-sm backdrop-blur-sm hover:from-brand-600/25 hover:to-brand-600/25 transition-colors"
      >
        <span className="chip mr-2 bg-brand-500/20 text-brand-700 dark:text-brand-300 ring-brand-500/30 text-[11px] font-semibold uppercase tracking-wide">
          Reproduce
        </span>
        <span className="text-ink-900/70 dark:text-ink-50/70">Replicate any paper in the arc with one command:</span>
        <code className="mx-1.5 rounded bg-black/[0.06] dark:bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-ink-900 dark:text-ink-50">
          oilab replicate lever-is-late
        </code>
        <span className="font-medium text-brand-600 dark:text-brand-400 group-hover:underline">GitHub →</span>
      </a>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-20 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-20 text-center">
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
              href="/research"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Read the research arc
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://zenodo.org/record/20752896"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/50 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <Library className="h-3.5 w-3.5" />
              14 papers · permanent DOIs
            </a>
            <a
              href="https://github.com/OpenInterpretability"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              Code & data →
            </a>
          </div>
        </div>
      </section>

      {/* ===== Findings strip (the memorable results) ===== */}
      <section className="mx-auto max-w-7xl px-6 -mt-2">
        <div className="grid gap-4 md:grid-cols-3">
          {findings.map((f) => (
            <div key={f.headline} className="card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5" aria-hidden="true" />
              <div className="relative">
                <p className="gradient-text text-xl font-semibold tracking-tight">{f.headline}</p>
                <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== THE ARC (headline spine) ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            The WANDERING arc
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
            One question, followed honestly for ten papers.
          </h2>
          <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 text-balance leading-relaxed">
            Why do capable LLM agents loop forever and never finish — and can their internals tell us, or change it?
            Each step links to its permanent record.
          </p>
        </div>

        <ol className="relative border-l border-black/10 dark:border-white/10 ml-3 space-y-7">
          {arc.map((b) => (
            <li key={b.n} className="relative pl-8">
              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-brand-500 ring-4 ring-white dark:ring-ink-950" aria-hidden="true" />
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="group block card p-5 hover:ring-brand-500/40 transition-shadow">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-ink-900/40 dark:text-ink-50/40">{b.n}</span>
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {b.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{b.finding}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-900/45 dark:text-ink-50/45 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  <ExternalLink className="h-3 w-3" /> {b.doi}
                </div>
              </a>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Link href="/research" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:gap-3 transition-all">
            Full reading list, methods & all papers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== Discipline — why trust it ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-3">
            Why trust the claims
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            The discipline, not the marketing.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {discipline.map((d, i) => (
            <div key={d.title} className="card p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {[<FlaskConical key="a" className="h-4 w-4" />, <ShieldCheck key="b" className="h-4 w-4" />, <GitBranch key="c" className="h-4 w-4" />, <Cpu key="d" className="h-4 w-4" />][i]}
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{d.title}</h3>
              <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Who / credibility ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-24">
        <div className="card p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 via-transparent to-accent-500/8" aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{credibility.name}</h2>
              <p className="text-sm text-ink-900/65 dark:text-ink-50/65">{credibility.role}</p>
              <ul className="mt-4 space-y-1.5">
                {credibility.notes.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-sm text-ink-900/70 dark:text-ink-50/70">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-brand-500 shrink-0" /> {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <a href={credibility.orcidUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> ORCID
              </a>
              <a href={credibility.scholar} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                <GraduationCap className="h-3.5 w-3.5" /> Scholar
              </a>
              <Link href="/contribute" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                Collaborate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Second research line (training & efficiency) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="max-w-3xl mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
            A second line
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            Training & efficiency, in service of the same model.
          </h2>
          <p className="mt-3 text-base text-ink-900/60 dark:text-ink-50/60 leading-relaxed text-balance">
            The interpretability above runs on infrastructure we build and study in its own right.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {secondLine.map((s) => (
            <div key={s.name} className="card p-5">
              <h3 className="font-semibold tracking-tight">{s.name}</h3>
              <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Tools that fell out of the research (demoted) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="max-w-3xl mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
            Open tooling
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            Tools that came out of the research.
          </h2>
          <p className="mt-3 text-base text-ink-900/60 dark:text-ink-50/60 leading-relaxed text-balance">
            Released so others can reproduce and extend the work — not products, just the apparatus. Apache-2.0.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {researchTools.map((t) => (
            <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 card p-5 hover:ring-brand-500/40 transition-shadow">
              <Terminal className="mt-0.5 h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="text-sm">
                <span className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t.name}</span>
                <span className="text-ink-900/60 dark:text-ink-50/60"> — {t.detail}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ===== Built on (lineage / humility) ===== */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
            Built on
          </span>
          <p className="text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            We extend frontier-lab interpretability infrastructure with an agent-trajectory + honest-negatives layer.
            {' '}<Link href="/built-on" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">See full lineage →</Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          {['Anthropic Persona Vectors (2025)', 'Anthropic Tracing Thoughts (2025)', 'DeepMind Gemma Scope (2024)', 'Alibaba Qwen-Scope (2026)', 'Arditi et al. Refusal Direction (2024)'].map((x) => (
            <span key={x} className="chip bg-black/[0.03] dark:bg-white/[0.04] text-ink-900/70 dark:text-ink-50/70 ring-black/10 dark:ring-white/10">{x}</span>
          ))}
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-24 mb-16">
        <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/10" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Read it, reproduce it, or build on it.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-ink-900/65 dark:text-ink-50/65 leading-relaxed text-balance">
              Every claim has a permanent DOI, a public ledger, and a one-command replication. Found a flaw? That is the point — tell us.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/research" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                <BookOpen className="h-3.5 w-3.5" /> Start with the arc
              </Link>
              <a href="https://github.com/OpenInterpretability/openinterp-lab" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                <Terminal className="h-3.5 w-3.5" /> oilab replicate
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
