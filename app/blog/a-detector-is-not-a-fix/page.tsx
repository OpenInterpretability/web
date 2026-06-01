import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react'
import { getPost } from '@/lib/blog-posts'

const SLUG = 'a-detector-is-not-a-fix'

export const metadata = {
  title: 'A detector is not a fix — OpenInterpretability blog',
  description:
    'We can detect when a coding agent gives up mid-task, and we found the exact layer where that failure is most legible. Then we tried to steer the agent back from that layer — and failed three times. A monitor is not a lever, even at the strongest locus.',
}

export default function PostPage() {
  const post = getPost(SLUG)!

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-900/55 dark:text-ink-50/55 mb-4">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {post.date}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingMinutes} min read
          </span>
          <span aria-hidden>·</span>
          <span>{post.authors.join(' · ')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-tight">
          {post.title}
        </h1>
        <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          {post.summary}
        </p>
      </header>

      <div className="prose-ish space-y-5 text-[15.5px] leading-[1.7] text-ink-900/85 dark:text-ink-50/85">

        <H2>TL;DR</H2>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Detect.</strong> When a coding agent gives up mid-task — it keeps acting but
            never submits, burning its whole turn budget — its tool-use entropy collapses in the
            last ten turns. That signal separates this <CodeChip>WANDERING</CodeChip> failure from
            success and generalizes across architectures (Qwen, Llama-70B, GPT-5).
          </li>
          <li>
            <strong>Understand.</strong> The mechanistic fingerprint of WANDERING is a drift in an{' '}
            <strong>early (edge) layer, L11</strong> — surfaced independently by stability selection
            over 60 features, with a 0.95 selection frequency. That is where the failure is most
            legible in the residual stream.
          </li>
          <li>
            <strong>Try to fix it.</strong> So we injected the &ldquo;what success looks like&rdquo;
            direction at that layer to steer the agent back. <strong>It does not work.</strong> Not
            at the output layer (inert), and — the surprising part — <em>not even at L11</em>, the
            layer that detects WANDERING best (paired McNemar <CodeChip>p = 0.73</CodeChip>). The one
            robust effect of the injection is the opposite of a rescue: it destabilizes the model
            into malformed tool calls, 0% → 60% as we turn up the dose.
          </li>
          <li>
            <strong>The lesson.</strong> A detector is not a lever. Finding the direction that
            <em> predicts</em> a failure does not give you a direction that <em>fixes</em> it — even
            when you target the exact layer where the prediction is strongest. For deployed agent
            safety this means: ship the monitor, but do not assume you can flip it into a one-shot
            repair.
          </li>
        </ul>

        <H2>The failure mode: agents that wander</H2>

        <p>
          Give a capable model a real software bug, a shell, and 50 turns to fix it. Most runs end
          one of two ways: the agent submits a patch (<CodeChip>SUCCESS</CodeChip>), or it locks into
          a repeated dead-end and gives up early (<CodeChip>LOCKED</CodeChip>). There is a third,
          quieter failure that is more unsettling to watch: the agent keeps working — reading files,
          running commands, editing — turn after turn, and simply <em>never decides it is done</em>.
          It exhausts the budget without ever calling <CodeChip>finish_tool</CodeChip>. We call this{' '}
          <CodeChip>WANDERING</CodeChip>.
        </p>

        <p>
          WANDERING matters for anyone running agents unattended. A LOCKED agent fails loudly and
          cheaply. A WANDERING agent fails <em>expensively</em> — it consumes the full budget, looks
          busy the whole time, and produces nothing. For autonomous agents that hold funds or take
          irreversible actions (the crypto-agent world is full of these now), &ldquo;looks busy,
          accomplishes nothing, never stops&rdquo; is exactly the kind of failure you want a monitor
          to catch.
        </p>

        <p>
          This post is the arc across three papers: one that detects WANDERING, one that localizes
          it, and one that tried to fix it and could not. The third is the most useful, so it gets
          the most space.
        </p>

        <H2>Paper 1 — Detect: tool-entropy collapse</H2>

        <p>
          The first paper (
          <ExtLink href="https://zenodo.org/records/20368601">
            Tool-Entropy Collapse, Zenodo
          </ExtLink>
          ) asks a narrow question: can you tell, from the trajectory alone, that an agent is
          wandering? The answer is yes, and the signal is simple. In its final ten turns a WANDERING
          agent&apos;s distribution over tool calls <em>collapses</em> — it stops exploring the action
          space and grinds on a shrinking set of moves. The entropy of that distribution drops
          relative to a successful agent&apos;s.
        </p>

        <p>
          The useful part is that this is not Qwen-specific. The same collapse separates WANDERING
          from SUCCESS in Llama-70B and in a GPT-5 router on the same SWE-bench tasks (ratios and
          p-values in the paper). As a deployable monitor it lands at a usable precision-recall —
          enough to gate an autonomous &ldquo;this run is lost, stop it&rdquo; escalation. It does
          <em> not</em> transfer to every agent benchmark (a cross-task test on a different action
          space came back null), so the honest scope is: multi-turn, code-execution agents with rich
          tool spaces. Within that scope, the detector works.
        </p>

        <Quote>
          The thing to hold onto: this is a <strong>correlational</strong> result. The entropy
          collapse <em>co-occurs</em> with wandering. Nothing about it says you can intervene on it.
        </Quote>

        <H2>Paper 2 — Understand: the fingerprint is at L11</H2>

        <p>
          The second paper asks <em>where in the network</em> WANDERING lives. We extracted 60
          features per trajectory across four channels — text, tool-use, residual-stream geometry at
          five layers (L11 through L55), and temporal dynamics — over 99 SWE-bench Pro trajectories,
          and trained a three-way classifier (SUCCESS / LOCKED / WANDERING).
        </p>

        <p>
          Two things are worth reporting honestly. First, the walk-back: our initial classifier hit
          a macro-F1 of 0.987, which is the kind of number that should make you suspicious of your
          own pipeline rather than proud of your model. It was leakage — several features were
          near-definitional proxies for the label. Dropping them took the honest macro-F1 to{' '}
          <strong>0.636</strong> (z = 5.88, p = 0.001 against a permutation null). Still well above
          chance, no longer too good to be true.
        </p>

        <p>
          Second, the mechanism. We used stability selection — repeatedly refitting on subsamples and
          keeping only features that survive almost every time — to find <em>which</em> features
          carry the signal. The answer is clean and, in hindsight, interpretable:
        </p>

        <Pre>{`stable feature           class       selection freq
─────────────────────────────────────────────────────
tool_diversity_count     SUCCESS     0.99   (used a 3rd tool)
L43_cosine_consec_late   LOCKED      0.84   (mid-layer freeze)
L11_drift_first_last     WANDERING   0.95   (edge-layer drift)`}</Pre>

        <p>
          LOCKED agents <em>freeze</em> in a middle layer (L43) — their representation stops moving,
          consistent with locking onto one idea. WANDERING agents <em>drift</em> in an early, edge
          layer (L11) — the representation keeps rotating without converging on the &ldquo;I am
          done&rdquo; action. The effect sizes are subtle (a few points on a cosine, not a visual
          chasm), but the locus is robust: <strong>L11 is where WANDERING is most legible.</strong>
        </p>

        <H2>Paper 3 — Try to fix it: the part that humbled us</H2>

        <p>
          Here is the obvious next move. If wandering agents have a consolidated &ldquo;I should
          finish&rdquo; verdict in the middle of the network that simply fails to reach the action,
          and if successful agents have a recognizable edge-layer state, then take the edge-layer
          residual from a <em>successful</em> agent and inject it into a wandering one. Supply the
          missing &ldquo;this is what done looks like&rdquo; signal. Steer it home.
        </p>

        <p>We tried this three ways. All three are null on rescue.</p>

        <H3>Attempt 1 — the output layer (L55): inert</H3>

        <p>
          The first attempt injected the SUCCESS direction at L55, an output-planning layer, always
          on, at a modest strength. Nothing. The hooked agents flipped to{' '}
          <CodeChip>finish_tool</CodeChip> at the same rate as no intervention — if anything slightly
          less. The model was behaviorally inert to the injection.
        </p>

        <H3>Attempt 2 — the right layer (L11): still null, with a twist</H3>

        <p>
          The natural objection: you targeted the wrong layer. Paper 2 says WANDERING lives at L11,
          not L55. So we re-ran the whole thing at L11, norm-matched the injection strength, and swept
          the dose. This is the test the project was built to run — intervene at the exact locus where
          the failure is most legible.
        </p>

        <p>
          Before the result, the control that decides everything. <strong>WANDERING is not run-stable.</strong>{' '}
          Re-running the same 20 wandering trajectories at temperature 1.0 with <em>no</em> intervention,
          7 of 20 (35%) flip to <CodeChip>finish_tool</CodeChip> on their own. The label is a
          single-run snapshot of a stochastic process. That one fact dictates the analysis: the only
          honest baseline for &ldquo;did my hook rescue this agent&rdquo; is the <em>paired</em>{' '}
          no-hook re-run on the same instance, not the definitional &ldquo;all 20 are WANDERING by
          construction.&rdquo;
        </p>

        <p>Here is what we measured:</p>

        <Pre>{`condition                    finish_tool   invalid_tools (crash)
──────────────────────────────────────────────────────────────
no-hook baseline (paired)    7/20 (35%)    0
L11 hook, alpha = 0.70       5/20 (25%)    0
L11 hook, alpha = 1.15       2/20 (10%)    12/20 (60%)`}</Pre>

        <p>
          Read the first two rows. The hook flips <em>fewer</em> agents (5/20) than doing nothing
          (7/20). Paired, instance by instance, the discordant pairs are 5 that finished without the
          hook but not with it, versus 3 that finished only with it. McNemar&apos;s exact test:{' '}
          <strong>p = 0.73</strong>. Null, with the point estimate pointing the wrong way. Correcting
          the locus from L55 to L11 did not convert the null — it just moved the failure from
          &ldquo;inert&rdquo; to &ldquo;live but un-steerable.&rdquo;
        </p>

        <H3>The walk-back: how this almost shipped as a positive</H3>

        <p>
          This is worth dwelling on, because it is the kind of mistake that is easy to make and easy
          to miss. Our own analysis notebook computed a different number. It counted the 6 of 20
          agents that flipped at <em>either</em> dose, and ran a Fisher test against the{' '}
          <em>definitional</em> 0/20 baseline (&ldquo;all of these were WANDERING, so any finish is a
          win&rdquo;). That gives <CodeChip>p = 0.02</CodeChip> — a clean little positive. A draft of
          the paper was written around it.
        </p>

        <p>
          It is wrong. The 0/20 baseline is the bug. The same agents finish 7/20 on a no-hook re-run,
          so the correct comparison is paired, and paired it is null. Worse, of those 6 &ldquo;rescued&rdquo;
          agents, 2 already finish with no hook at all — their rescue is the temperature dice, not the
          intervention. We caught it by recomputing from the raw per-run logs instead of trusting the
          summary cell. The general rule we wrote down for ourselves:
        </p>

        <Quote>
          When you intervene on a run-unstable phenotype, the baseline must be the paired
          same-session no-hook re-run — never the definitional label. Comparing intervention-flips
          against a 0/N definitional baseline manufactures false positives.
        </Quote>

        <H3>The one real effect: the dose-dependent crash</H3>

        <p>
          Look at the third column of the table. At low strength the L11 hook does nothing visible. At
          higher strength it crashes the model into <CodeChip>invalid_tools</CodeChip> — malformed
          tool calls — on 12 of 20 runs. A no-hook re-run <em>never</em> produces that. So the L11
          injection is unambiguously <strong>causal</strong>: it reaches behavior, unlike the inert
          L55 hook. It just reaches behavior in the wrong direction. Push the &ldquo;success&rdquo;
          direction at L11 hard enough and the agent does not finish — it falls apart. (The crash is
          also direction-agnostic: a random direction of the same size crashes it too.)
        </p>

        <p>
          So L11 is the right place to <em>read</em> WANDERING and the wrong place to <em>steer</em>{' '}
          it to completion. The detector locus and the lever locus are not the same locus — they may
          not be a residual direction at all.
        </p>

        <H2>Why this is the useful result</H2>

        <p>
          It is tempting, across mechanistic interpretability, to slide from &ldquo;we found a
          direction that predicts the behavior&rdquo; to &ldquo;so we can steer the behavior by moving
          along that direction.&rdquo; Our own program now has four nulls on exactly that slide
          (two earlier probe results, plus L55 and L11 here). The pattern is consistent enough to
          state plainly:
        </p>

        <Quote>
          Predictive directions in the residual stream are routinely correlational without being
          causal levers. And when a steering null shows up, the fix is <em>not</em> always &ldquo;you
          picked the wrong layer&rdquo; — we picked the provably-best layer and it was still null.
          The gap between a detector and a lever is not always a targeting error.
        </Quote>

        <p>
          For deploying agent safety, that distinction is load-bearing. The good news survives intact:
          the WANDERING detector works, generalizes across architectures, and is cheap enough to run
          as an autonomous &ldquo;stop this run&rdquo; gate. The cautionary half is that you cannot
          take that same monitor and naively invert it into a one-shot rescue by nudging activations.
          Detection you can ship today. Repair is a harder, separate problem.
        </p>

        <H2>What we would try next</H2>

        <p>
          The null we have is specifically about an <em>always-on, additive residual direction</em>.
          Its dose-response has only two regimes — a null one (low strength) and a destabilizing one
          (high strength) — with no rescue regime in between. That leaves two honest openings:
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>A transient, behavior-gated pulse.</strong> Instead of injecting continuously,
            fire a single corrective pulse only at the moment the tool-entropy signal collapses — and
            gate it on the <em>behavioral</em> signal, not the residual one. Which agents are even
            candidate-rescuable is predicted by how deeply their tool-entropy has collapsed (AUC
            0.77), and <em>not</em> by the residual fingerprint (AUC 0.62, fails its own test). If a
            lever exists, the evidence says it is indexed by behavior, not by a static direction.
          </li>
          <li>
            <strong>Run-stable labels first.</strong> Re-run every trajectory several times up front
            and only call an agent WANDERING if it wanders on all of them, then intervene on those.
            That removes the temperature noise that swamps a 20-instance study — without the
            after-the-fact conditioning that quietly rigs the result.
          </li>
        </ul>

        <H2>Notes &amp; artifacts</H2>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            Detector paper (published):{' '}
            <ExtLink href="https://zenodo.org/records/20368601">
              Tool-Entropy Collapse, Zenodo DOI 10.5281/zenodo.20368601
            </ExtLink>
            . The localization and intervention papers are in preparation.
          </li>
          <li>
            All experiments are on <CodeChip>Qwen3.6-27B</CodeChip> over SWE-bench Pro (N = 99
            trajectories; 20 WANDERING), one RTX 6000 Pro Blackwell (96 GB). Generation is at
            temperature 1.0 — the source of the run-instability that drives the paired-baseline rule.
          </li>
          <li>
            The honest re-analysis (paired McNemar, contamination check, dose-response) is a single
            script that recomputes everything from the raw per-run logs, separate from the notebook
            that produced the original (wrong-baseline) number.
          </li>
        </ul>

        <p className="text-sm text-ink-900/55 dark:text-ink-50/55 pt-2">
          If you build agent monitors, the one-line takeaway is the boring, expensive one: validate
          the lever separately from the detector, and validate it against a paired baseline. The
          direction that tells you an agent is lost will not, by default, tell it how to get home.
        </p>

      </div>

      <footer className="mt-14 pt-6 border-t border-black/5 dark:border-white/10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
        </Link>
      </footer>
    </article>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight mt-12 mb-4 text-balance">{children}</h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold tracking-tight mt-6 mb-3 text-balance">{children}</h3>
  )
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[13px] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="not-prose overflow-x-auto rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] p-4 text-[13px] font-mono leading-[1.55] text-ink-900/85 dark:text-ink-50/85">
      {children}
    </pre>
  )
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="not-prose my-4 border-l-2 border-brand-500/50 bg-brand-500/5 px-4 py-3 text-ink-900/90 dark:text-ink-50/90">
      {children}
    </blockquote>
  )
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 dark:text-brand-400 underline underline-offset-2 hover:text-brand-700 inline-flex items-baseline gap-0.5"
    >
      {children}
      <ExternalLink className="h-3 w-3 inline-block self-center ml-0.5 opacity-60" />
    </a>
  )
}
