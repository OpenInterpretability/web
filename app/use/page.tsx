import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Github, Terminal, BookOpen, FlaskConical, Boxes, ExternalLink, Cpu } from 'lucide-react'
import { skills, skillRepoUrl, useBlocks, versions, skillsInstall } from '@/lib/researcher'
import { CopyButton } from '@/components/copy-button'

export const metadata: Metadata = {
  title: 'Use — reproduce & build on the work · OpenInterp',
  description:
    'Use the tools and the knowledge: replicate the papers with one command, run probe-causality experiments from your own agent, and pull the methodology as Claude Code skills. Open, self-hostable, privacy-first.',
}

const ICONS: Record<string, JSX.Element> = {
  reproduce: <FlaskConical className="h-4 w-4" />,
  mcp: <Terminal className="h-4 w-4" />,
  skills: <Boxes className="h-4 w-4" />,
  notebooks: <BookOpen className="h-4 w-4" />,
}

export default function UsePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div className="absolute left-1/2 top-12 -z-10 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            For researchers
          </span>
          <h1 className="text-4xl sm:text-6xl font-semibold leading-[1.04] tracking-tight text-balance">
            Use the tools — and the <span className="gradient-text">knowledge</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            Everything behind the arc is open and runnable. Replicate a paper in one command, run probe-causality
            experiments from your own agent on your own GPU, or pull the methodology as agent skills. We never see
            your model, data, or keys.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="https://github.com/OpenInterpretability/openinterp-lab" target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all">
              <FlaskConical className="h-3.5 w-3.5" /> Replicate a paper <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link href="/mcp" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 bg-white/50 dark:bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <Terminal className="h-3.5 w-3.5" /> openinterp-mcp
            </Link>
            <a href="https://github.com/OpenInterpretability" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-ink-900/70 dark:text-ink-50/70 hover:text-ink-900 dark:hover:text-ink-50 transition-colors">
              <Github className="h-3.5 w-3.5" /> All repos →
            </a>
          </div>
        </div>
      </section>

      {/* The four ways */}
      <section className="mx-auto max-w-7xl px-6 mt-8">
        <div className="grid gap-5 md:grid-cols-2">
          {useBlocks.map((b) => {
            const internal = b.href.startsWith('/') || b.href.startsWith('#')
            const Wrap: any = internal ? Link : 'a'
            const wrapProps = internal ? { href: b.href } : { href: b.href, target: '_blank', rel: 'noopener noreferrer' }
            return (
              <Wrap key={b.id} {...wrapProps} className="group card p-6 relative overflow-hidden hover:scale-[1.005] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">{ICONS[b.id]}</div>
                    <span className="chip bg-black/[0.03] dark:bg-white/[0.05] text-ink-900/60 dark:text-ink-50/60 ring-black/10 dark:ring-white/10 text-[11px]">{b.tag}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight">{b.title}</h2>
                  <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">{b.body}</p>
                  {b.code ? (
                    <code className="mt-4 block rounded-md bg-black/[0.05] dark:bg-white/10 px-3 py-2 font-mono text-[12.5px] text-ink-900 dark:text-ink-50 overflow-x-auto">
                      <span className="text-brand-500 select-none">$ </span>{b.code}
                    </code>
                  ) : null}
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Wrap>
            )
          })}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-7xl px-6 mt-24 scroll-mt-24">
        <div className="max-w-3xl mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
            The methodology, packaged
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            Nine Claude Code skills.
          </h2>
          <p className="mt-3 text-base text-ink-900/60 dark:text-ink-50/60 leading-relaxed text-balance">
            Drop these into any agent and it inherits the operational knowledge — including the four causality
            checks (with the structure-matched control + naming gate) that separate a real result from a confounded
            or epiphenomenal one. Each maps to a typed
            <code className="mx-1 rounded bg-black/[0.05] dark:bg-white/10 px-1 py-0.5 font-mono text-[12px]">openinterp-mcp</code>
            tool.
          </p>
        </div>

        {/* One-line installer */}
        <div className="card p-5 mb-8 bg-ink-950 dark:bg-black/40 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-50/50">
              Install all {skills.length} into your terminal
            </span>
            <CopyButton text={skillsInstall.cmd} />
          </div>
          <code className="block overflow-x-auto font-mono text-[13px] text-emerald-300">
            <span className="text-ink-50/40 select-none">$ </span>{skillsInstall.cmd}
          </code>
          <p className="mt-3 text-xs text-ink-50/50 leading-relaxed">
            Downloads each <code className="font-mono text-ink-50/70">SKILL.md</code> into{' '}
            <code className="font-mono text-ink-50/70">{skillsInstall.dest}</code> — writes only markdown, runs no code.
            Use <code className="font-mono text-ink-50/70">-s -- --project</code> for a repo-local{' '}
            <code className="font-mono text-ink-50/70">./.claude/skills</code>, or{' '}
            <a href={skillsInstall.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-50/80">inspect the script first</a>.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <a key={s.name} href={skillRepoUrl(s)} target="_blank" rel="noopener noreferrer"
               className="group flex flex-col card p-5 hover:ring-brand-500/40 transition-shadow">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="font-mono text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{s.name}</span>
              </div>
              <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed flex-1">{s.desc}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-ink-900/45 dark:text-ink-50/45">
                <span className="font-mono">tool: {s.tool}()</span>
                <span className="inline-flex items-center gap-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"><ExternalLink className="h-3 w-3" /> {s.repo}</span>
              </div>
            </a>
          ))}
        </div>
        <p className="mt-5 text-xs text-ink-900/50 dark:text-ink-50/50">
          Install: <code className="rounded bg-black/[0.05] dark:bg-white/10 px-1.5 py-0.5 font-mono">pip install &quot;openinterp-mcp[server]&quot;</code> (v{versions.mcp}) ·
          {' '}point your agent&apos;s MCP config at it · the skills live in each repo&apos;s <code className="rounded bg-black/[0.05] dark:bg-white/10 px-1.5 py-0.5 font-mono">skills/</code>.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 mt-24 mb-16">
        <div className="card p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/10" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">Build on it — and tell us what breaks.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-ink-900/65 dark:text-ink-50/65 leading-relaxed text-balance">
              Everything is Apache-2.0 and reproducible. Extend a probe, replicate a result, or disagree with one —
              the methodology is built to be argued with.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/research" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                <BookOpen className="h-3.5 w-3.5" /> Read the research first
              </Link>
              <Link href="/contribute" className="inline-flex items-center gap-2 rounded-lg border border-black/15 dark:border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                Collaborate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
