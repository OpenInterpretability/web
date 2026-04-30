import Link from 'next/link'
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import { threeMoats, pillars } from '@/lib/pillars'
import { MiniPillarCard } from '@/components/pillar-card'
import { site } from '@/lib/constants'

export const metadata = {
  title: 'Manifesto — OpenInterp',
  description:
    'Why OpenInterp exists. The gap, the pillars, the moats, the student in Mumbai on a phone at 2:00 am.',
}

export default function ManifestoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        MANIFESTO · 2026
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        The microscope is built. Now we need the standards.
      </h1>

      <div className="mt-10 space-y-10 text-ink-900/80 dark:text-ink-50/80 text-lg leading-relaxed">
        <p>
          Anthropic published Persona Vectors and Tracing Thoughts. DeepMind shipped Gemma Scope.
          Alibaba shipped Qwen-Scope. Neuronpedia built the encyclopedia. Goodfire raised
          $150M to commercialize the substrate. The interpretability infrastructure is, finally,
          a thing that exists.
        </p>

        <p>
          What does <em>not</em> exist yet — at least not in shippable form — is the methodology
          and product layer above it. The probes that take SAE features and turn them into
          something a developer can put in front of a customer. The benchmarks that survive
          Goodhart. The standards that distinguish a probe that learned the underlying signal from
          a probe that learned a confound. The deployment plumbing that lets a hospital safety
          team actually use a 27B activation probe in production.
        </p>

        <p>
          That is the gap OpenInterp fills. We don't train more SAEs — frontier labs already do
          that better than we ever could. We turn their work into <strong className="text-ink-900 dark:text-white">probes
          that ship</strong> and <strong className="text-ink-900 dark:text-white">standards that
          survive Goodhart</strong>. Apache 2.0 throughout. Anti-Goodhart by construction.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          The five gaps
        </h2>

        <p>The gaps that no current tool fills:</p>

        <div className="card p-6">
          <dl className="space-y-5 text-base leading-normal">
            <div>
              <dt className="font-semibold">Narrative / trace</dt>
              <dd className="text-ink-900/70 dark:text-ink-50/70 mt-1">
                Features shown in isolation, never the full journey of a prompt. A model's thought
                is a sequence, not a dictionary entry.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Comparison</dt>
              <dd className="text-ink-900/70 dark:text-ink-50/70 mt-1">
                "Why did model A answer X but model B answer Y?" is the question that matters in a
                reasoning-model world. No tool diffs activations side-by-side.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Circuits as UI</dt>
              <dd className="text-ink-900/70 dark:text-ink-50/70 mt-1">
                Every beautiful circuit figure in the 2024–2026 literature was hand-drawn in Figma.
                Circuits live in papers, not tools.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Onboarding</dt>
              <dd className="text-ink-900/70 dark:text-ink-50/70 mt-1">
                UX assumes PhD-level familiarity. Students bounce in 90 seconds. The field grows
                slower than the problem.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Failure archaeology</dt>
              <dd className="text-ink-900/70 dark:text-ink-50/70 mt-1">
                "My model hallucinated, which features fired?" Today: write a notebook. Tomorrow:
                upload a failure dataset, get a ranked feature list back automatically.
              </dd>
            </div>
          </dl>
        </div>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          The four pillars
        </h2>

        <p>
          OpenInterp is built as four complementary platforms — the minimum set that fills all five
          gaps and also finances itself:
        </p>

        <div className="not-prose grid gap-3">
          {pillars.map((p) => (
            <MiniPillarCard key={p.id} pillar={p} />
          ))}
        </div>

        <p>
          <strong className="text-ink-900 dark:text-white">Observatory</strong> is the microscope —
          watch the model. <strong className="text-ink-900 dark:text-white">Laboratory</strong> is
          the workbench — edit the model.{' '}
          <strong className="text-ink-900 dark:text-white">Watchtower</strong> is the gantry —
          monitor the model. <strong className="text-ink-900 dark:text-white">Academy</strong> is
          the school — teach the world to use the other three. One platform. Four ways in.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          Three structural bets
        </h2>

        <div className="not-prose grid gap-4 mt-6">
          {threeMoats.map((m, i) => (
            <article key={i} className="card p-6">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
                <span className="font-mono text-xs font-semibold">0{i + 1}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                {m.body}
              </p>
              <div className="mt-3 font-mono text-xs text-ink-900/50 dark:text-ink-50/50">
                {m.meta}
              </div>
            </article>
          ))}
        </div>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          What we uniquely bring
        </h2>

        <p>Every claim below is grounded in a shipped, Apache-2.0 licensed, public artifact:</p>

        <ul className="list-none space-y-3 pl-0">
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">
              First public SAE on the Qwen3.6 family
            </strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              dense (27B) and triple-hybrid MoE (35B-A3B). Verified against HuggingFace at shipping
              time; zero competitors.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">Hybrid architecture expertise</strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              first SAEs on Gated Delta Networks (Qwen3.5-4B), ensemble MoE (Gemma-4 E4B), and
              triple-hybrid (Qwen3.6-35B-A3B). Landscape was previously uninterpretable.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">
              mechreward — features as RL rewards
            </strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              +19 pp on GSM8K (Qwen3.5-4B) in 168 effective training steps via per-token SAE-sparse
              rewards. ρ=0.52 cross-architecture on SuperGPQA. pip install mechreward.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">Stage Gate protocol</strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              correlation pre-test (G1) → three-way ablation (G2) → ceiling-breaking full RL (G3).
              Don't burn GPU hours until the signal predicts the outcome.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">Honest negatives</strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              we published the feature-circuits result that failed replication. Trust comes from
              admitting what broke.
            </span>
          </li>
        </ul>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          The first-minute experience
        </h2>

        <div className="relative my-8 border-l-4 border-brand-500 pl-6 py-2 italic text-xl leading-relaxed text-ink-900/90 dark:text-ink-50/90 text-balance">
          <Quote className="absolute -left-3 -top-1 h-6 w-6 bg-ink-50 dark:bg-ink-950 text-brand-500" />
          A student in Mumbai, on a phone, at 2:00 am, in two minutes — discovers a hallucination
          feature in GPT-5 that nobody has seen. Publishes a mini-paper embedded in the platform.
          Has three DeepMind researchers commenting in real time before breakfast.
        </div>

        <p>
          That is the north star. Everything — the hero animation, the mobile-first layout, the
          zero-login Trace Theater, the shareable trace URLs, the Expedition that validates your
          work in 15 minutes instead of 15 weeks — is optimized toward that one scene.
        </p>

        <p className="text-lg font-semibold text-ink-900 dark:text-white">
          Neuronpedia is a tab you consult. OpenInterp is a tab you leave open.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          How to get involved
        </h2>

        <div className="not-prose grid gap-3">
          <Link
            href="/observatory/trace"
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Watch the Trace Theater</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                2 minutes. See the flagship experience today.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Contribute on GitHub</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                All code Apache-2.0. Every SAE public. Every Stage Gate reproducible.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </a>
          <a
            href={`mailto:${site.contact}?subject=${encodeURIComponent('OpenInterp partner')}`}
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Become a design partner</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                Watchtower Enterprise, Model Partner Program, Academy contributor.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </a>
        </div>

        <p className="mt-14 text-sm text-ink-900/50 dark:text-ink-50/50 italic">
          Manifesto last revised 2026-04-23. Build in public. Amend in public.
        </p>
      </div>
    </div>
  )
}
