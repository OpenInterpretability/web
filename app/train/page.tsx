import Link from 'next/link'
import { ArrowRight, Github, CheckCircle2, BookOpen, Upload } from 'lucide-react'
import { notebooks, tierComparison } from '@/lib/notebooks'
import { site } from '@/lib/constants'

export const metadata = {
  title: 'Train — OpenInterp',
  description:
    'Train your first SAE in 30 min on free Colab. Train a hybrid-architecture SAE on free Kaggle. Train paper-grade on cloud. Three tiers, one ladder.',
}

const difficultyStyle = {
  beginner: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  intermediate: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30',
  advanced: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-orange-500/30',
}

function ColabButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F9AB00] hover:bg-[#E79100] px-3.5 py-1.5 text-xs font-semibold text-black transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.54 9.46a5 5 0 0 0 0 7.08l1.42-1.42a3 3 0 0 1 0-4.24L4.54 9.46zm6.36 7.08a5 5 0 0 0 7.08 0l-1.42-1.42a3 3 0 0 1-4.24 0l-1.42 1.42zM7.17 6.63a5 5 0 0 1 7.08 0l-1.42 1.42a3 3 0 0 0-4.24 0L7.17 6.63zm12.29 2.83a5 5 0 0 0 0 7.08l-1.42-1.42a3 3 0 0 1 0-4.24l1.42-1.42z" />
      </svg>
      Open in Colab
    </a>
  )
}

function KaggleButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#20BEFF] hover:bg-[#0EABED] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M4.5 2v16h3v-6l1.7-1.6L14 18h3.5l-6.7-9L17 2h-3l-6.5 6.4V2h-3z" />
      </svg>
      Run on Kaggle
    </a>
  )
}

function GitHubButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 px-3.5 py-1.5 text-xs font-semibold transition-colors"
    >
      <Github className="h-3.5 w-3.5" />
      View on GitHub
    </a>
  )
}

export default function TrainPage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-10 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
            TRAIN · THE LADDER
          </span>
          <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-balance">
            Any model. <span className="gradient-text">Any scale.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
            Train your first sparse autoencoder in 30 minutes on a free Colab T4. Train a hybrid-architecture SAE in 4 hours on free Kaggle. Train paper-grade on cloud. One ladder, zero gatekeeping.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#tier-hobbyist"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Start with Tier 1 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={`https://github.com/OpenInterpretability/notebooks`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Github className="h-4 w-4" /> All notebooks on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Tier cards ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {notebooks.map((n, i) => {
            const Icon = n.icon
            return (
              <article
                key={n.tier}
                id={`tier-${n.tier}`}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-7 transition-all hover:border-black/10 dark:hover:border-white/20"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${n.gradient} opacity-50 pointer-events-none`}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col grow">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 text-brand-600 dark:text-brand-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`chip ring-inset ${difficultyStyle[n.difficulty]}`}>
                      {n.difficulty}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-1">
                    {n.badge}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{n.title}</h2>

                  <div className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Platform</span>
                      <span className="font-medium text-ink-900 dark:text-ink-50 text-right">{n.platform}</span>
                    </div>
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Cost</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-right">{n.cost}</span>
                    </div>
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Model</span>
                      <span className="font-mono text-right">{n.model}</span>
                    </div>
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Tokens</span>
                      <span className="font-mono text-right">{n.tokens}</span>
                    </div>
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Dictionary</span>
                      <span className="font-mono text-right">{n.expansion}</span>
                    </div>
                    <div className="flex justify-between text-ink-900/60 dark:text-ink-50/60">
                      <span className="text-ink-900/40 dark:text-ink-50/40">Time</span>
                      <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 text-right">{n.timeEstimate}</span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                    {n.description}
                  </p>

                  <div className="mt-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                      What you'll learn
                    </div>
                    <ul className="space-y-1">
                      {n.whatYouLearn.map((item, j) => (
                        <li key={j} className="flex gap-2 text-xs text-ink-900/70 dark:text-ink-50/70 leading-snug">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-2">
                      Prerequisites
                    </div>
                    <ul className="space-y-1">
                      {n.prerequisites.map((p, j) => (
                        <li key={j} className="flex gap-2 text-xs text-ink-900/60 dark:text-ink-50/60 leading-snug">
                          <span className="shrink-0 font-mono">→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {n.colabUrl && <ColabButton href={n.colabUrl} />}
                    {n.kaggleUrl && <KaggleButton href={n.kaggleUrl} />}
                    <GitHubButton href={n.githubUrl} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ===== Comparison table ===== */}
      <section className="mx-auto max-w-6xl px-6 mt-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            Side-by-side
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Pick the tier that matches your compute.
          </h2>
        </div>
        <div className="card p-2 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10">
                {tierComparison.headers.map((h, i) => (
                  <th
                    key={i}
                    className={`p-3 text-left font-semibold ${i === 0 ? 'text-ink-900/40 dark:text-ink-50/40 text-xs uppercase tracking-wider' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tierComparison.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-black/5 dark:border-white/10 last:border-b-0"
                >
                  <td className="p-3 text-xs uppercase tracking-wider text-ink-900/40 dark:text-ink-50/40 font-medium">
                    {row.label}
                  </td>
                  {row.values.slice(1).map((v, j) => (
                    <td
                      key={j}
                      className={`p-3 font-mono text-sm ${row.label === 'Cost' && v.startsWith('$0') ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-3">
            The shared recipe
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Every tier uses the same research-grade recipe.
          </h2>
          <p className="mt-4 text-base text-ink-900/70 dark:text-ink-50/70 max-w-2xl mx-auto leading-relaxed">
            The protocol scales. Only the hyperparameters change.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Stream activations',
              body: 'Hook the model\'s residual stream at a mid-layer. Stream a web-scale corpus (FineWeb-Edu, OpenThoughts, custom). Pack into batches, emit activation vectors.',
            },
            {
              step: '02',
              title: 'TopK SAE + AuxK',
              body: 'Hard TopK activation (Gao et al. 2024). AuxK auxiliary loss revives dead features. Geometric-median b_dec init. Decoder columns re-normed every step.',
            },
            {
              step: '03',
              title: 'Resume-safe checkpoint',
              body: 'HuggingFace streaming checkpoints every 5–10M tokens. If Colab idles, Kaggle kills the kernel, or the cloud instance crashes — you lose at most 10 minutes.',
            },
            {
              step: '04',
              title: 'Cosine LR + warmup',
              body: '5k–1k warmup to peak 2e-4, cosine decay to 6e-5 floor. Non-zero floor keeps dead-feature revival active throughout training.',
            },
            {
              step: '05',
              title: 'Held-out validation',
              body: 'Final step: compute var_expl, L0, and dead-fraction on 500k–1M fresh tokens (different seed). Upload val_report.json — your SAE ships with receipts.',
            },
            {
              step: '06',
              title: 'SAELens-compatible export',
              body: 'safetensors with W_enc, W_dec, b_enc, b_dec + cfg.json with architecture, d_in, d_sae, k, hook_name. Load directly in SAELens. Ready for Neuronpedia ingestion.',
            },
          ].map((s) => (
            <article key={s.step} className="card p-5">
              <div className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{s.step}</div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== After training ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <div className="card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
              AFTER YOU TRAIN
            </span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">Your SAE is now an asset. Put it to work.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              href="/observatory/trace"
              className="card p-5 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Trace it</span>
                <span className="chip bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30 ring-inset text-[10px]">LIVE</span>
              </div>
              <p className="text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                Feed your SAE + a prompt into the Trace Theater. See features ignite token-by-token.
              </p>
            </Link>
            <Link
              href="/observatory/atlas"
              className="card p-5 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Publish to Atlas</span>
                <span className="chip bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30 ring-inset text-[10px]">Q2</span>
              </div>
              <p className="text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                Cross-model feature matching. Your features become citable entries in the Rosetta Stone graph.
              </p>
            </Link>
            <Link
              href="/laboratory/sandbox"
              className="card p-5 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Edit with Sandbox</span>
                <span className="chip bg-pink-500/10 text-pink-700 dark:text-pink-300 ring-pink-500/30 ring-inset text-[10px]">Q2</span>
              </div>
              <p className="text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                Drag features in, compose steering recipes, export as intervention stacks.
              </p>
            </Link>
            <Link
              href="/academy/expeditions"
              className="card p-5 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Contribute an Expedition</span>
                <span className="chip bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30 ring-inset text-[10px]">Q3</span>
              </div>
              <p className="text-sm text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
                Your training run → an interactive tutorial that teaches the next generation.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-20 mb-24">
        <div className="card p-8 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Stuck? Lost? Want your notebook added?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
              Open an issue on GitHub, email us, or propose your own tier-specific recipe. We review every PR — unusual architectures (Mamba, RWKV, diffusion-LM) especially welcome.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/OpenInterpretability/notebooks/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <Github className="h-4 w-4" /> Open an issue
              </a>
              <a
                href={`mailto:${site.contact}?subject=${encodeURIComponent('/train — add my notebook')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Email {site.contact}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
