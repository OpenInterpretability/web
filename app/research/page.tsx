import Link from 'next/link'
import { ExternalLink, FileText, BookOpen } from 'lucide-react'
import { paperTopics, paperCount } from '@/lib/papers'

export const metadata = {
  title: 'Research — OpenInterp',
  description:
    `Published artifacts + canonical reading list (${paperCount} papers across SAE foundations, circuits, steering, probing, lenses, safety).`,
}

const artifacts = [
  {
    title: 'Qwen3.6-35B-A3B SAE at L23 — Stage Gate 1 passed (ρ=0.522)',
    venue: 'GitHub release · mechreward catalog',
    status: 'Published artifact',
    url:
      'https://github.com/OpenInterpretability/mechreward/blob/main/catalogs/qwen3.6-35b-a3b/reasoning_pack.json',
    summary:
      'First SAE on triple-hybrid MoE + GDN + Gated-Attention architecture. Matches Qwen3.5-4B correlation level with 46% of the training budget.',
  },
  {
    title: 'Circuit-tracer integration gap report (4 concrete issues)',
    venue: 'GitHub · mechreward',
    status: 'Upstream issue pending',
    url:
      'https://github.com/OpenInterpretability/mechreward/blob/main/circuit_tracer_gap_report.md',
    summary:
      'Integration audit of Anthropic\'s circuit-tracer against our hybrid-GDN SAEs. Four actionable gaps with reproducers.',
  },
]

const roadmap = [
  {
    quarter: 'Now',
    items: [
      'Stage Gate 2 for Qwen3.6-35B-A3B (3-way reward ablation: R0 / R1 / R2)',
      'Stage Gate 3 Phase A for Qwen3.6-35B-A3B',
      'Cross-architecture benchmark matrix (GSM8K, SuperGPQA, MATH-500)',
    ],
  },
  {
    quarter: 'Next',
    items: [
      'Auto-interp pipeline (OpenInterp-labeled features)',
      'Feature-pack marketplace v1 (community submissions)',
      'Paper v1 on arXiv (paper-form of LW post + S4 extensions)',
      'Gemma-4-E4B G1 + G2 + G3 full pipeline',
    ],
  },
  {
    quarter: 'Later',
    items: [
      'Safety-focused feature packs (beyond reasoning)',
      'Integration with Anthropic circuit-tracer via native plugin',
      'Multi-step, scheduled reward shaping (intentional design roadmap)',
      'Hybrid-arch SAE training library (saelib-hybrid, fork of sae_lens)',
    ],
  },
]

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">Research</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Papers, posts, and roadmap.</h1>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
          Every artifact is open. Negative results are publishable. Broken links, stale numbers,
          or methodological bugs get flagged and fixed in public.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Published / in review</h2>
        <div className="mt-6 space-y-4">
          {artifacts.map((a) => (
            <article key={a.url} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 rounded-lg bg-brand-600/10 text-brand-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className="chip bg-brand-600/10 text-brand-700 dark:text-brand-300 ring-brand-600/20 ring-inset">
                      {a.status}
                    </span>
                  </div>
                  <p className="mono text-xs text-ink-900/50 dark:text-ink-50/50 mt-1">
                    {a.venue}
                  </p>
                  <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                    {a.summary}
                  </p>
                  <Link
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
                  >
                    Read <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Roadmap</h2>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
          Living document. Items change as results come in.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {roadmap.map((col) => (
            <article key={col.quarter} className="card p-6">
              <div className="text-xs uppercase tracking-wider text-brand-600 font-medium">
                {col.quarter}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {col.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-600 mt-1">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Further reading (canonical papers) ===== */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-3xl font-semibold tracking-tight inline-flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            Further reading
          </h2>
          <span className="text-xs font-mono text-ink-900/50 dark:text-ink-50/50">
            {paperCount} canonical papers · curated
          </span>
        </div>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-3xl leading-relaxed">
          The reading list we wish we'd had when starting. Every paper cites a primary source (arxiv, transformer-circuits.pub, LessWrong, or an official blog). If you spot a dead link or a missing seminal paper, <Link href="https://github.com/OpenInterpretability/web/blob/main/lib/papers.ts" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 underline decoration-dotted">open a PR editing <code className="font-mono text-xs">lib/papers.ts</code></Link>.
        </p>

        <div className="mt-10 space-y-12">
          {paperTopics.map((topic) => (
            <section key={topic.id} id={topic.id}>
              <div className="border-l-2 border-brand-500 pl-4 mb-6">
                <h3 className="text-2xl font-semibold tracking-tight">{topic.label}</h3>
                <p className="mt-1 text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed max-w-3xl">
                  {topic.intro}
                </p>
              </div>

              <div className="space-y-8">
                {topic.groups.map((g) => (
                  <div key={g.heading}>
                    <div className="flex items-baseline gap-3 mb-3">
                      <h4 className="text-base font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                        {g.heading}
                      </h4>
                      {g.sub && (
                        <span className="text-xs text-ink-900/50 dark:text-ink-50/50 italic">
                          · {g.sub}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {g.papers.map((p) => (
                        <li key={p.url}>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block card p-4 hover:border-brand-500/40 transition-colors"
                          >
                            <div className="flex items-baseline justify-between gap-3 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 inline-flex items-start gap-1.5">
                                  <span>{p.title}</span>
                                  <ExternalLink className="h-3 w-3 mt-1 shrink-0 opacity-50 group-hover:opacity-100" />
                                </h5>
                                <div className="mt-0.5 text-xs font-mono text-ink-900/50 dark:text-ink-50/50">
                                  {p.authors} · {p.year}
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                              {p.what}
                            </p>
                            <p className="mt-1.5 text-xs text-ink-900/55 dark:text-ink-50/55 italic leading-relaxed">
                              → {p.why}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 card p-5 bg-brand-500/5">
          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            This list is intentionally curated, not exhaustive. Seminal paper missing?{' '}
            <a
              href="https://github.com/OpenInterpretability/web/issues/new?title=Further+reading+-+suggest+a+paper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 underline decoration-dotted"
            >
              Open an issue
            </a>{' '}
            with the arxiv/URL and one sentence on why it belongs. We'll review within 72h.
          </p>
        </div>
      </section>

      <section className="mt-16 card p-6">
        <h2 className="text-lg font-semibold">Cite this work</h2>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
          BibTeX for the library + protocol (paper arXiv forthcoming):
        </p>
        <pre className="mt-4 mono text-xs bg-ink-950 text-ink-50 rounded-lg p-4 overflow-x-auto">
{`@software{openinterpretability2026mechreward,
  author = {Vicentino, Caio and contributors},
  title  = {mechreward: Mechanistic interpretability as reward signal for RL},
  year   = {2026},
  url    = {https://github.com/OpenInterpretability/mechreward},
  note   = {OpenInterpretability project},
}`}
        </pre>
      </section>
    </div>
  )
}
