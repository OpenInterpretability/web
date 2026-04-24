import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Github,
  BookOpen,
  Code2,
  Package,
  Beaker,
  GitPullRequest,
  MessagesSquare,
  Award,
  Share2,
  FileText,
  Sparkles,
} from 'lucide-react'
import { site } from '@/lib/constants'

export const metadata = {
  title: 'Contribute — OpenInterp',
  description:
    'How to contribute to OpenInterpretability — train your first SAE, submit a Trace scenario, publish to the leaderboard, port a notebook. Good-first-issues waiting.',
}

const repos = [
  {
    name: 'web',
    blurb: 'Next.js site at openinterp.org — Trace Theater, Circuit Canvas, InterpScore leaderboard.',
    lang: 'TypeScript · Tailwind',
    icon: Code2,
    url: 'https://github.com/OpenInterpretability/web',
    contributing: 'https://github.com/OpenInterpretability/web/blob/main/CONTRIBUTING.md',
    issues: 'https://github.com/OpenInterpretability/web/issues',
    gradient: 'from-brand-500/15 to-accent-500/10',
    scopes: [
      'Trace Theater scenarios (one PR = one scenario)',
      'Leaderboard entries (one PR = one SAE)',
      'UI / accessibility / mobile polish',
      'New pillar sub-routes (Q2+)',
    ],
  },
  {
    name: 'notebooks',
    blurb: '23+ training & interpretability notebooks, from 30-min Colab hobbyist to paper-grade cloud.',
    lang: 'Jupyter · PyTorch',
    icon: BookOpen,
    url: 'https://github.com/OpenInterpretability/notebooks',
    contributing: 'https://github.com/OpenInterpretability/notebooks/blob/main/CONTRIBUTING.md',
    issues: 'https://github.com/OpenInterpretability/notebooks/issues',
    gradient: 'from-emerald-500/15 to-brand-500/10',
    scopes: [
      'Port a notebook to a new model (Llama, Mistral, Mamba, Phi, etc.)',
      'Replicate a 2024–2026 interpretability paper',
      'Add a platform (TPU, ROCm, MPS, Lambda)',
      'Docker / reproducibility improvements',
    ],
  },
  {
    name: 'cli',
    blurb: 'The openinterp Python package — SDK + CLI (pip install openinterp).',
    lang: 'Python ≥ 3.10',
    icon: Package,
    url: 'https://github.com/OpenInterpretability/cli',
    contributing: 'https://github.com/OpenInterpretability/cli/blob/main/CONTRIBUTING.md',
    issues: 'https://github.com/OpenInterpretability/cli/issues',
    gradient: 'from-orange-500/15 to-pink-500/10',
    scopes: [
      'New commands wrapping notebooks (score, steer, circuit, publish)',
      'Adapter integrations (SAELens, TransformerLens, nnsight)',
      'Performance wins (bf16 paths, torch.compile)',
      'Tests, type hints, docs',
    ],
  },
  {
    name: 'mechreward',
    blurb: 'SAE features as dense RL rewards. Qwen3.5-4B → 64% → 83% on GSM8K.',
    lang: 'Python · PyTorch · TRL',
    icon: Beaker,
    url: 'https://github.com/OpenInterpretability/mechreward',
    contributing: 'https://github.com/OpenInterpretability/mechreward/blob/main/CONTRIBUTING.md',
    issues: 'https://github.com/OpenInterpretability/mechreward/issues',
    gradient: 'from-pink-500/15 to-amber-500/10',
    scopes: [
      'Port Stage Gate protocol to a new model',
      'Submit a feature pack (helpful + harmful IDs)',
      'Add a benchmark (SuperGPQA, MATH-500, BIG-Bench-Hard)',
      'RepE / probing integration',
    ],
  },
]

const waysIn = [
  {
    icon: Sparkles,
    title: 'Zero-code',
    lines: [
      'Read the manifesto',
      'Open a Discussion with a question or idea',
      'Share a Trace you found interesting on X tagging @openinterp',
      'Star the repos that helped you',
    ],
  },
  {
    icon: BookOpen,
    title: 'Student / first-timer',
    lines: [
      'Train your first SAE in 30 min (notebook 01)',
      'Run InterpScore on your SAE (notebook 18)',
      'Submit your SAE to /interpscore (one-line PR)',
      'Pick a "good first issue" label on any repo',
    ],
  },
  {
    icon: Share2,
    title: 'Researcher',
    lines: [
      'Port a published method to a Colab we host',
      'Submit a Trace scenario for your domain (legal, bio, code)',
      'Publish negative results — honest failures are welcome',
      'Author an Expedition (Q3 2026)',
    ],
  },
  {
    icon: Award,
    title: 'Applied / safety team',
    lines: [
      'Run Watchtower preview (notebook 13) on your traffic',
      'Write an issue about a gap that blocks your deployment',
      'Propose a case study we can include with your approval',
      'Request Watchtower early access (Q4)',
    ],
  },
]

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <div className="mb-12 max-w-3xl">
        <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
          CONTRIBUTING
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance inline-flex items-center gap-3">
          <GitPullRequest className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          Build this with us.
        </h1>
        <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          OpenInterpretability is built in public by a growing group of students, researchers, and
          safety teams. Every notebook, every SAE, every line of site code can have your name on it.
        </p>
      </div>

      {/* Ways in */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between gap-2 mb-6 flex-wrap">
          <h2 className="text-2xl font-semibold tracking-tight">Four ways in — match your level</h2>
          <span className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
            no experience to researcher
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {waysIn.map((w) => {
            const Icon = w.icon
            return (
              <article key={w.title} className="card p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{w.title}</h3>
                <ul className="space-y-1.5 text-sm text-ink-900/70 dark:text-ink-50/70">
                  {w.lines.map((line, i) => (
                    <li key={i} className="flex gap-2 leading-snug">
                      <span className="font-mono text-brand-600 dark:text-brand-400">→</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* Pick a repo */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between gap-2 mb-6 flex-wrap">
          <h2 className="text-2xl font-semibold tracking-tight">Pick a repo</h2>
          <span className="text-xs text-ink-900/50 dark:text-ink-50/50 font-mono">
            4 repos · Apache-2.0 (code) · CC-BY 4.0 (docs)
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {repos.map((r) => {
            const Icon = r.icon
            return (
              <article
                key={r.name}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/20"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-60 pointer-events-none`}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col grow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 text-brand-600 dark:text-brand-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="chip bg-ink-900/5 dark:bg-white/5 text-ink-900/60 dark:text-ink-50/60 ring-black/10 dark:ring-white/10 ring-inset">
                      {r.lang}
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                    OpenInterpretability/{r.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                    {r.blurb}
                  </p>
                  <div className="mt-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                      Scope
                    </div>
                    <ul className="space-y-1">
                      {r.scopes.map((s, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-ink-900/70 dark:text-ink-50/70 leading-snug"
                        >
                          <span className="shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-5 flex flex-wrap gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" /> Repo
                    </a>
                    <a
                      href={r.contributing}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" /> CONTRIBUTING.md
                    </a>
                    <a
                      href={`${r.issues}?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                    >
                      Good-first-issues ↗
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Workflow</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { n: '1', t: 'Open an issue', d: 'If the change is > 20 lines, align first. Drafts welcome.' },
            { n: '2', t: 'Fork + branch', d: 'git checkout -b your-feature. Never push to main.' },
            { n: '3', t: 'Make it work', d: 'Local tests pass. Notebooks run start-to-finish.' },
            { n: '4', t: 'PR with evidence', d: 'Link to the issue. Paste numbers, screenshots, or logs.' },
            { n: '5', t: 'Review + merge', d: 'A maintainer responds within 72h. We prefer kind + specific feedback.' },
          ].map((step) => (
            <div key={step.n} className="card p-5">
              <div className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400 mb-1">
                0{step.n}
              </div>
              <h3 className="font-semibold mb-1">{step.t}</h3>
              <p className="text-xs text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Community</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="https://github.com/OpenInterpretability"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <Github className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
            <h3 className="font-semibold">GitHub organization</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              4 repos, Apache-2.0 license, Discussions enabled on every repo. Star the ones you use.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400">
              OpenInterpretability <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>
          <a
            href="https://github.com/OpenInterpretability/web/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <MessagesSquare className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
            <h3 className="font-semibold">Discussions</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              Design questions, cross-repo coordination, "which notebook should I run". Available on all 4 repos.
            </p>
          </a>
          <a
            href={`mailto:${site.contact}`}
            className="card p-6 hover:border-brand-500/40 transition-colors"
          >
            <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
            <h3 className="font-semibold">Email</h3>
            <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70">
              <code className="font-mono text-xs">{site.contact}</code> — safety reports, partnership inquiries, Watchtower design partner.
            </p>
          </a>
        </div>
      </section>

      {/* CoC */}
      <section className="mb-16">
        <div className="card p-6 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
          <h2 className="text-xl font-semibold tracking-tight mb-2">Code of Conduct</h2>
          <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-3xl">
            We follow <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct/" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:text-brand-700">Contributor Covenant 2.1</a>. Summary: be kind, be honest, assume good faith. Interpretability is a young field — many contributors are first-timers. Kindness is a feature, not a constraint. Report violations to <code className="font-mono text-xs">{site.contact}</code>.
          </p>
        </div>
      </section>
    </div>
  )
}
