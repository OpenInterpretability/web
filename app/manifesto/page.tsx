import Link from 'next/link'
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import { arc, discipline } from '@/lib/arc'
import { site } from '@/lib/constants'

export const metadata = {
  title: 'Manifesto — OpenInterp',
  description:
    'Why OpenInterp exists. The microscope is built; we build the standards that tell a real mech-interp signal from a confound — the audit layer for interpretability claims in agentic systems.',
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
        MANIFESTO · 2026-06
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        The microscope is built. Now we need the standards.
      </h1>
      <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300 mb-2">
          The thesis
        </p>
        <p className="text-lg leading-relaxed text-ink-900/85 dark:text-ink-50/85 text-balance">
          <strong>OpenInterpretability is building the audit layer for mechanistic-interpretability
          claims in agentic systems</strong> — the rigor that tells a real signal from a confound.
          One question, asked honestly: <em>when should we believe a mech-interp claim?</em>
        </p>
      </div>

      <div className="mt-10 space-y-10 text-ink-900/80 dark:text-ink-50/80 text-lg leading-relaxed">
        <p>
          Anthropic published Persona Vectors and Tracing Thoughts. DeepMind shipped Gemma Scope.
          Alibaba shipped Qwen-Scope. Neuronpedia built the encyclopedia. Goodfire raised $150M to
          commercialize the substrate. The interpretability microscope is, finally, a thing that
          exists.
        </p>

        <p>
          What does <em>not</em> exist yet is the standard above it: the methodology that
          distinguishes a probe that learned the underlying signal from a probe that learned a
          confound. That gap is not academic. In our own work a covert-intent probe scored
          AUROC <strong className="text-ink-900 dark:text-white">0.98</strong> — and collapsed to{' '}
          <strong className="text-ink-900 dark:text-white">0.52</strong> the moment we held the
          framing constant and cross-validated by trajectory. The number was real. The signal was
          not. Almost every &ldquo;our interpretability tool detects X&rdquo; claim has a 0.98 hiding a
          0.52, and the field has no shared, runnable way to catch it.
        </p>

        <p>
          That is the gap OpenInterp fills. We don&rsquo;t train more SAEs — frontier labs already do
          that better than we ever could. We build the <strong className="text-ink-900 dark:text-white">layer
          that decides whether to believe the microscope</strong>: an agent-trajectory capture
          pipeline, a confound auditor, and a 15-paper arc of pre-registered findings — every probe
          inspectable, every methodology re-runnable, every claim citable. Apache-2.0 throughout.
          Anti-Goodhart by construction.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          What the arc found
        </h2>

        <p>
          We studied one hard problem deeply: <strong className="text-ink-900 dark:text-white">why
          capable LLM agents loop forever and never finish</strong>, and whether their internals can
          tell us — or change it. Nine beats, each a permanent Zenodo DOI, each an honest one-liner:
        </p>

        <div className="not-prose card divide-y divide-ink-900/[0.06] dark:divide-ink-50/[0.08]">
          {arc.map((b) => (
            <a
              key={b.n}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline gap-3 px-5 py-3 hover:bg-brand-500/[0.04] transition-colors"
            >
              <span className="font-mono text-xs text-ink-900/40 dark:text-ink-50/40 tabular-nums">
                {b.n}
              </span>
              <span className="font-semibold text-sm text-ink-900 dark:text-white">{b.title}</span>
            </a>
          ))}
        </div>

        <p>
          The arc bends one way. Interpretability <strong className="text-ink-900 dark:text-white">locates</strong> a
          real, causal control surface — a late action band where an agent commits — but it does not{' '}
          <strong className="text-ink-900 dark:text-white">secure</strong> it. Detection is not
          control, even at the exact named feature. An internal authorization monitor reads the
          authorization the model <em>feels</em>, not the one the user <em>granted</em>. The brake
          that suppresses an irreversible action collapses under an adaptive white-box attack. Five
          orthogonal limits, one conclusion:
        </p>

        <div className="relative my-8 border-l-4 border-brand-500 pl-6 py-2 italic text-xl leading-relaxed text-ink-900/90 dark:text-ink-50/90 text-balance">
          <Quote className="absolute -left-3 -top-1 h-6 w-6 bg-ink-50 dark:bg-ink-950 text-brand-500" />
          Use interpretability to <strong className="not-italic text-ink-900 dark:text-white">audit
          and monitor</strong> a fixed model — not to defend against an adversary optimizing against
          a known locus, and not as a shortcut to building a better model. Locating where behavior is
          decided is necessary, and nowhere near sufficient, for securing it.
        </div>

        <p>
          That is an unfashionable position, and it is the one the evidence supports. The honest
          frontier read in 2026: interpretability is strong for{' '}
          <strong className="text-ink-900 dark:text-white">understanding and auditing</strong>, and
          weak for <strong className="text-ink-900 dark:text-white">building and defending</strong> —
          the genuine engineering wins attributed to &ldquo;interp&rdquo; come from observable
          attention/activation structure plus a cheap optimization step, not from circuits or SAE
          features doing the work. We say so out loud. The lab that tells you when <em>not</em> to
          believe a result is the one worth believing when it says you can.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          The flagship: <code className="text-2xl">oilab audit</code>
        </h2>

        <p>
          The thesis, made runnable. <code>oilab audit</code> takes a probe or direction and a
          labeled activation set, and runs a confound battery offline, on CPU, in seconds —
          permutation null, random-direction floor, leave-one-rollout-out <em>and</em>{' '}
          leave-one-group-out, a structure-matched control, leakage residualization,
          distribution-shift transfer. It returns one verdict card: <code>REAL_SIGNAL</code> only if
          the honest cross-validated number survives every applicable check; otherwise{' '}
          <code>CONFOUNDED</code> or <code>UNDETERMINED</code>. It is the codified version of the
          discipline that turned our own 0.98 into a 0.52 before we could publish it. The rigor a
          frontier lab applies by hand, as one command anyone can run.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          Why the claims are trustworthy
        </h2>

        <p>The discipline, not the marketing:</p>

        <div className="not-prose grid gap-3">
          {discipline.map((d) => (
            <div key={d.title} className="card p-5">
              <h3 className="font-semibold text-ink-900 dark:text-white">{d.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-900/70 dark:text-ink-50/70">
                {d.body}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          What we uniquely bring
        </h2>

        <p>Every claim below is grounded in a shipped, Apache-2.0 licensed, public artifact:</p>

        <ul className="list-none space-y-3 pl-0">
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">
              Real agent-trajectory activation capture
            </strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              per-token internals captured on real long-horizon coding-agent runs (SWE-bench Pro) and
              on a ported SHADE-Arena. Almost nobody combines SAE/circuit interpretability with
              activation capture on <em>real</em> agent trajectories — that is where the arc&rsquo;s
              findings come from.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">
              First public SAE on the Qwen3.6 family
            </strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              full-stack, 11 layers on the 27B reasoning model; plus first SAEs on hybrid
              architectures (Gated Delta Networks, triple-hybrid MoE). Verified against Hugging Face
              at shipping time.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">
              <code>oilab audit</code> — the confound auditor
            </strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              the only runnable, offline standard for telling a real probe signal from a confound.
              Reproduces our own airtight falsification, byte-for-byte, on CPU.
            </span>
          </li>
          <li className="card p-5">
            <strong className="text-ink-900 dark:text-white">Honest negatives</strong>
            {' — '}
            <span className="text-ink-900/70 dark:text-ink-50/70">
              six pre-registered walk-backs across the arc, including the result that detection is
              not control and the white-box monitoring advantage we tried to prove and could not.
              Trust comes from admitting what broke.
            </span>
          </li>
        </ul>

        <p className="text-sm text-ink-900/60 dark:text-ink-50/60">
          A second research line — full-stack SAE training, mechanistic reward modeling, and sub-4-bit
          quantization for cheap open-weights inference — funds and feeds the agent-safety arc above.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          The first-minute experience
        </h2>

        <div className="relative my-8 border-l-4 border-brand-500 pl-6 py-2 italic text-xl leading-relaxed text-ink-900/90 dark:text-ink-50/90 text-balance">
          <Quote className="absolute -left-3 -top-1 h-6 w-6 bg-ink-50 dark:bg-ink-950 text-brand-500" />
          A researcher with a probe that scores 0.9, on a laptop, in one command — runs{' '}
          <span className="not-italic font-mono text-base">oilab audit</span> and learns, before
          they believe it, before they publish it, before they ship it, that the signal is a
          confound. Or that it is real, and now provably so.
        </div>

        <p>
          That is the north star. Everything — the replicable arc, the agent-capture pipeline, the
          confound battery, the recompute-every-number harness — is optimized toward turning{' '}
          <em>&ldquo;the model probably does X&rdquo;</em> into <em>&ldquo;here is the check, run it
          yourself.&rdquo;</em>
        </p>

        <p className="text-lg font-semibold text-ink-900 dark:text-white">
          Frontier labs build the microscope. We build the standard that tells a finding from a
          confound.
        </p>

        <h2 className="text-3xl font-semibold tracking-tight mt-14 text-ink-900 dark:text-white">
          How to get involved
        </h2>

        <div className="not-prose grid gap-3">
          <Link
            href="/research"
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Read the research arc</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                Nine beats, permanent DOIs, honest one-liners. The full WANDERING arc.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </Link>
          <a
            href="https://github.com/OpenInterpretability/openinterp-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Replicate a paper in one command</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                openinterp-lab on the Colab CLI — and <code>oilab audit</code> to stress-test your
                own probe.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-brand-500/30 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">Contribute on GitHub</div>
              <div className="mt-0.5 text-sm text-ink-900/60 dark:text-ink-50/60">
                All code Apache-2.0. Every SAE public. Every number recomputable.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </a>
        </div>

        <p className="mt-14 text-sm text-ink-900/50 dark:text-ink-50/50 italic">
          Manifesto last revised 2026-06-23. We publish our own nulls. Build in public. Amend in
          public.
        </p>
      </div>
    </div>
  )
}
