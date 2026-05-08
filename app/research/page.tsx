import Link from 'next/link'
import { ExternalLink, FileText, BookOpen, ScrollText } from 'lucide-react'
import { paperTopics, paperCount } from '@/lib/papers'
import { papers as ownPapers } from '@/lib/papers-content'

export const metadata = {
  title: 'Research — OpenInterp',
  description:
    `Published artifacts + canonical reading list (${paperCount} papers across SAE foundations, circuits, steering, probing, lenses, safety).`,
}

const artifacts = [
  {
    title: 'agent-probe-guard SDK v0.3.1',
    venue: 'PyPI · openinterp · HF dataset · GitHub release',
    status: 'Live · Apache-2.0',
    url: 'https://pypi.org/project/openinterp/',
    summary:
      'Two-probe activation gate for code agents on Qwen3.6-27B (capability + thinking-intent). Skip / escalate / proceed routing, ~50ms gate, refit() helper for cross-env transfer. Detect-only by design — confirmed across 3 intervention experiments.',
  },
  {
    title: 'agent-probe-guard probe weights',
    venue: 'HF dataset · caiovicentino1/agent-probe-guard-qwen36-27b',
    status: 'Live · Apache-2.0',
    url: 'https://huggingface.co/datasets/caiovicentino1/agent-probe-guard-qwen36-27b',
    summary:
      'L43 K=10 capability + L55 K=5 thinking probes for Qwen3.6-27B. CV AUROC 0.83 / 0.85 with random K-matched gap +0.08 / +0.15. Cross-env transfer caveat documented in paper Appendix C.',
  },
  {
    title: 'Qwen3.6-27B paper-grade SAE',
    venue: 'HF model · caiovicentino1/qwen36-27b-sae-papergrade',
    status: 'Live · Apache-2.0',
    url: 'https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade',
    summary:
      'Multi-layer SAE on Qwen3.6-27B trained on 200M tokens. L11 ve=0.842 / L31 0.706 / L55 0.808. Only public SAE for Qwen3.6 reasoning model as of May 2026. Used by FabricationGuard, ReasonGuard, agent-probe-guard.',
  },
  {
    title: 'Gemma-2-2B base/IT crosscoder (paper-grade)',
    venue: 'HF model · caiovicentino1/gemma2-2b-crosscoder-model-diff-papergrade',
    status: 'Live · Apache-2.0',
    url: 'https://huggingface.co/caiovicentino1/gemma2-2b-crosscoder-model-diff-papergrade',
    summary:
      'BatchTopK crosscoder, 73,728 latents, k=100, expansion 32, layer 13. Trained on 100M tokens (FineWeb-Edu + UltraChat-200k). VE_A 0.877 / VE_B 0.867. Substrate for the Cosine-Causal Gap paper.',
  },
  {
    title: 'SWE-bench Pro reproducible harness',
    venue: 'GitHub · OpenInterpretability/openinterp-swebench-harness',
    status: 'Live · Apache-2.0',
    url: 'https://github.com/OpenInterpretability/openinterp-swebench-harness',
    summary:
      'V1 harness for collecting agent rollouts on SWE-bench Pro with residual-stream captures (transformers direct, forward hooks). Phase 1 N=20 + Phase 6 N=99 in flight. Substrate for Two Forms Epiphenomenal Probes paper.',
  },
]

const roadmap = [
  {
    quarter: 'Now (May 2026)',
    items: [
      'Phase 6 N=99 SWE-bench Pro trace collection (in flight, ~6h remaining at last check)',
      'Paper-3 finalization with N=99 capability numbers + agent-probe-guard SDK v0.3.2 (Phase-1-real probes)',
      'Paper-1 ICML MI Workshop notification awaited (June 12)',
    ],
  },
  {
    quarter: 'Next (Jun-Sep 2026)',
    items: [
      'NeurIPS MI Workshop 2026 submissions × 3 (Sep deadline): Cosine-Causal Gap, Probe-Detected Grokking, Two Forms Epiphenomenal Probes',
      'nb47 v2 — Probe-gated memory with thinking-preservation prompt fix (RAG-breaks-CoT finding paper)',
      'nb48 — LoRA distillation from probe-gated memory (completes 3-timescale stack)',
      'MATS Winter 2027 application (opens July)',
    ],
  },
  {
    quarter: 'Later (Q4 2026+)',
    items: [
      'SAE-decoded steering experiments (Two Forms paper §6 future work, recover causal claim)',
      'Cross-model crosscoder replication on Qwen + Llama (Qwen CSV currently empty, Llama unstarted)',
      'nb37 v3 — extended DPO 400 steps × 40 checkpoints (confirms grokking phase transition continues)',
      'Integration with Anthropic circuit-tracer via native plugin',
      'Cross-architecture probe transfer matrix (Qwen3.6 ↔ Llama-3.3 ↔ Gemma-2)',
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
        <h2 className="text-xl font-semibold tracking-tight">Open artifacts</h2>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 max-w-3xl leading-relaxed">
          SDKs, probe weights, SAE / crosscoder models, and reproducible harnesses.
          Apache-2.0 throughout. Every artifact is paired with a paper or eval doc that
          documents how it was built and what it&apos;s for.
        </p>
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

      {/* ===== Our papers (in-house authored, full text on site) ===== */}
      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-xl font-semibold tracking-tight inline-flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Our papers
          </h2>
          <span className="text-xs font-mono text-ink-900/50 dark:text-ink-50/50">
            {ownPapers.length} hosted on site · full text
          </span>
        </div>
        <p className="text-sm text-ink-900/70 dark:text-ink-50/70 max-w-3xl mb-6 leading-relaxed">
          Drafts, eval docs, and submitted papers authored by OpenInterp. Markdown source mirrored
          from the research repos so you can read the exact text without leaving the site.
        </p>
        <div className="space-y-4">
          {ownPapers.map((p) => {
            const statusColor =
              p.status === 'draft' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30' :
              p.status === 'in-review' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/30' :
              p.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30' :
              'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30'
            return (
              <Link
                key={p.slug}
                href={`/research/papers/${p.slug}`}
                className="block card p-6 hover:border-brand-500/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-lg bg-brand-600/10 text-brand-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="font-semibold text-base">{p.title}</h3>
                      <span className={`chip ring-1 ring-inset ${statusColor}`}>{p.status}</span>
                    </div>
                    {p.subtitle ? (
                      <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70 italic">
                        {p.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
                      {p.authors} · {p.venue} · {p.date}
                    </p>
                    <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed line-clamp-3">
                      {p.abstract}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags?.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="chip bg-black/[0.04] dark:bg-white/[0.05] text-ink-900/60 dark:text-ink-50/60 ring-inset ring-1 ring-black/10 dark:ring-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-ink-900/30 dark:text-ink-50/30 shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
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
