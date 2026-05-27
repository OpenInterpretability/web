import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react'
import { getPost } from '@/lib/blog-posts'

const SLUG = 'tool-entropy-crypto-agent-failure-mode'

export const metadata = {
  title: 'Tool-Entropy Collapse: A Detectable Failure Mode for Crypto AI Agents — OpenInterpretability blog',
  description:
    'Three crypto-agent exploits in May 2026 ($245M+). The pattern: agents loop on tools instead of finalizing. We can detect this in the last 10 turns using Shannon entropy of tool calls. Headline detector reproduces paper-grade 55% recall / 5% FP across Qwen3.6-27B, Llama-70b, and GPT-5. Ships now as an Inspect AI eval.',
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
            <strong>Three named crypto-agent exploits in May 2026 totaling ~$245M+</strong>:
            Morse-code prompt-injection drained $200K via a Grok-controlled agent on Base; a $45M
            AI trading agent breach reported by KuCoin; and Bloomberg writing that the $130B AI
            crypto sector is &ldquo;at the brink&rdquo;. Plus the AI16Z class action filed
            2026-04-20 (~3,945 wallets, $2.6B alleged).
          </li>
          <li>
            The pattern these exploits share is a specific agent failure mode we&apos;ve been
            calling <strong>WANDERING</strong>: the agent has tools, has context, &ldquo;thinks
            it knows&rdquo; what to do — but loops on tool calls instead of finalizing.
            Externally identical to &ldquo;agent ran out of turns&rdquo;, internally distinct.
          </li>
          <li>
            We can detect WANDERING with a probe-free signal: <strong>Shannon entropy of
            tool-call names in the last 10 turns</strong>. When agents wander, entropy collapses
            (they repeat the same tool over and over). Cross-architecture validated within
            SWE-bench: ratio W/S median{' '}
            <strong>0.41 on Qwen3.6-27B and Llama-70b, 0.71 on GPT-5</strong>.
          </li>
          <li>
            Tier 3 autonomous-termination signal: <strong>55% recall × 5% FP on Qwen3.6-27B</strong>.
            Ships today as an Inspect AI eval — register PR{' '}
            <ExtLink href="https://github.com/UKGovernmentBEIS/inspect_evals/pull/1716">
              UKGovernmentBEIS/inspect_evals#1716
            </ExtLink>{' '}
            (first &ldquo;monitoring eval&rdquo; in the register, awaiting AISI review).
          </li>
          <li>
            All artifacts Apache-2.0: paper at{' '}
            <ExtLink href="https://zenodo.org/records/20368601">
              Zenodo DOI 10.5281/zenodo.20368601
            </ExtLink>
            , dataset (910 MB, 99 trajectories + residuals) at{' '}
            <ExtLink href="https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6">
              caiovicentino1/swebench-pro-qwen36-27b-phase6
            </ExtLink>
            , code at{' '}
            <ExtLink href="https://github.com/OpenInterpretability/inspect-tool-entropy-collapse">
              OpenInterpretability/inspect-tool-entropy-collapse
            </ExtLink>
            .
          </li>
        </ul>

        <H2>What just happened in May 2026</H2>

        <p>
          On <strong>2026-05-04</strong>, an AI trading agent on Base was drained for{' '}
          <strong>$200K via a Morse-code prompt-injection tweet</strong>. The attacker encoded the
          payload in Morse, the Grok-controlled agent decoded and executed it. No traditional
          security audit catches that — the attack surface is the model&apos;s tool-use loop, not
          the smart contracts.
        </p>

        <p>
          Two weeks later, Bloomberg published{' '}
          <ExtLink href="https://www.bloomberg.com/news/articles/2026-05-15/ai-hacking-threat-pushes-130-billion-crypto-sector-to-the-brink">
            &ldquo;AI Hacking Threat Pushes $130 Billion Crypto Sector to the Brink&rdquo;
          </ExtLink>
          , documenting the Drift / Kelp / Zerion breaches and a $45M AI trading agent compromise
          reported by KuCoin. The piece names NK-linked AI-assisted attackers explicitly.
        </p>

        <p>
          Layered on top: the AI16Z class action filed 2026-04-20 alleges $2.6B in losses across
          ~3,945 wallets. Litigation discovery in that case will ask agent operators what they did
          to detect and prevent autonomous-tool failure modes. Operators who answered &ldquo;nothing,
          we trusted the model&rdquo; have a problem.
        </p>

        <p>
          This post is about one specific failure mode that&apos;s been hiding in plain sight in
          agentic AI: not jailbreaking, not prompt-injection per se, but the agent itself getting
          stuck in a tool-call loop and never producing its final action. We called it
          {' '}<strong>WANDERING</strong>{' '} in the paper and we have a clean detector for it.
        </p>

        <H2>The WANDERING phenotype</H2>

        <p>
          Working on Qwen3.6-27B running SWE-bench Pro across 99 multi-turn trajectories at L11 /
          L23 / L31 / L43 / L55, we found that the failures aren&apos;t one thing. Two distinct
          sub-classes show up that are <em>externally identical</em> (both exhaust the turn budget
          without calling <CodeChip>finish_tool</CodeChip>) but mechanistically distinct:
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>LOCKED (66% of failures)</strong>: the agent&apos;s internal &ldquo;am I doing
            the right thing?&rdquo; probe collapses to &lt; 0.30 by mean fraction 0.92 of the
            trajectory. 21% of LOCKED agents never even produce a candidate patch. This is the
            agent giving up internally.
          </li>
          <li>
            <strong>WANDERING (34% of failures)</strong>: the probe stays{' '}
            <strong>&gt; 0.70 with median final score 1.000</strong>. 95% of WANDERING agents
            produce a typed-out patch. They&apos;re internally confident they&apos;re done — but
            never emit <CodeChip>finish_tool</CodeChip>. The decision-to-action circuit is
            desynchronized.
          </li>
        </ul>

        <p>
          For probe-based safety monitoring this is bad news: a probe trained on
          success-vs-failure labels misclassifies 34% of failures as &ldquo;going well&rdquo;.
          Bootstrap 95% CI is [22.0%, 45.8%]. Probe-only monitoring schemes inherit that blind
          spot.
        </p>

        <H2>Tool-Entropy as the canonical signature</H2>

        <p>
          The signal that turned out to work is also the simplest one we tested: take the last
          10 turns of a trajectory, count which tools the agent called (
          <CodeChip>bash</CodeChip>, <CodeChip>str_replace_editor</CodeChip>,{' '}
          <CodeChip>python</CodeChip>, etc.), and compute Shannon entropy of that distribution.
        </p>

        <Pre>{`H(last_10_tool_calls) = -Σ p(tool) · log₂ p(tool)`}</Pre>

        <p>
          When the agent is making genuine progress, late-trajectory entropy is high (1.5–3 bits
          — diverse tool usage as it explores). When it&apos;s WANDERING, entropy collapses
          (often to &lt; 0.5 bits — it&apos;s calling the same tool with slight variations,
          searching for the answer it already &ldquo;has&rdquo;).
        </p>

        <p>
          The median W/S ratio on Qwen3.6-27B is <strong>0.41</strong> (Mann-Whitney{' '}
          <em>p</em> = 1.0 × 10⁻⁶). At <strong>threshold 0.5</strong>, this single rule yields{' '}
          <strong>55% recall × 5% false-positive rate</strong> — usable as a Tier 3 autonomous
          escalation signal.
        </p>

        <p>
          We replicated this <strong>across architectures within SWE-bench</strong>: Llama-70b{' '}
          (n = 2,315 trajectories, p &lt; 10⁻¹⁵, ratio <strong>0.41</strong> — identical to
          Qwen) and GPT-5 router (n = 1,419, p = 8.9 × 10⁻³⁵, ratio <strong>0.71</strong>).
          Cross-task on METR MALT (15+ task families) is <strong>null</strong> (p = 0.81), so we
          honestly scope: tool-entropy collapse is robust for{' '}
          <em>multi-turn code-execution agent tasks with rich action spaces</em>, not all
          agentic AI universally.
        </p>

        <H2>Why this matters for crypto agents specifically</H2>

        <p>
          Crypto AI agents (Virtuals, Aixbt, Olas, Truth Terminal, Clanker, Bankr, the Bittensor
          inference subnets) all run the same general loop: multi-turn, autonomous, with rich
          action spaces (trade, transfer, post, vote, deploy, withdraw). That&apos;s exactly the
          regime where tool-entropy collapse is a robust signature.
        </p>

        <p>
          Pre-AI16Z, none of these operators had a reason to look for WANDERING. Probes trained
          on success/failure labels would have missed it (that&apos;s the 34% blind spot). The
          standard observability stack — Datadog dashboards on tool-call latency, exception
          rates, gas costs — doesn&apos;t see internal decision-to-action desync.
        </p>

        <p>
          Post-AI16Z, the calculation changes. Litigation discovery is going to ask agent
          operators: <em>what did you do to detect autonomous-tool failure modes</em>? The
          honest answer for most operators today is &ldquo;we didn&apos;t&rdquo;. There&apos;s a
          gap between &ldquo;we deployed an agent and watched the dashboard&rdquo; and
          &ldquo;we monitored the internal decision-circuit alignment&rdquo;, and that gap
          is now legally adversarial.
        </p>

        <H2>The detection stack, ready to ship</H2>

        <p>
          We packaged the detector set as three operational tiers. All three are described in
          §10 of the paper. Tier 3 is the lightest possible escalation primitive — a single
          rule, runs in CPU milliseconds per turn, no model weights needed.
        </p>

        <Pre>{`Tier 1 (forensics):           v1 post-hoc text monitor
                                35% recall × 0% FP

Tier 2 (advisory escalation): v1 ∪ v4 cross-layer probe disagreement
                                80% recall × 30% FP × 15-turn lead

Tier 3 (autonomous):          v1 ∪ v5 tool-entropy collapse
                                70% recall × 5% FP (Qwen3.6-27B)`}</Pre>

        <p>
          The headline detector (v5 tool-entropy) is reproducible in 12 seconds end-to-end on the
          Inspect AI framework. We just opened a register PR for it:{' '}
          <ExtLink href="https://github.com/UKGovernmentBEIS/inspect_evals/pull/1716">
            UKGovernmentBEIS/inspect_evals#1716
          </ExtLink>
          . That&apos;s the first &ldquo;monitoring eval&rdquo; (detector-as-scorer, no model
          invoked) in the Inspect register — distinct from the standard
          &ldquo;capability eval&rdquo; pattern.
        </p>

        <p>
          Local run, no GPU needed:
        </p>

        <Pre>{`git clone https://github.com/OpenInterpretability/inspect-tool-entropy-collapse
cd inspect-tool-entropy-collapse
uv venv --python 3.11 .venv && source .venv/bin/activate
uv pip install -e .

inspect eval src/tool_entropy_collapse/tool_entropy_collapse.py \\
    -T detector=v5_tool_entropy \\
    --log-dir ./logs`}</Pre>

        <H2>Reproducibility receipts</H2>

        <p>
          Three things any reviewer of this claim should be able to do without contacting us:
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Read the paper</strong>:{' '}
            <ExtLink href="https://zenodo.org/records/20368601">
              Zenodo DOI 10.5281/zenodo.20368601
            </ExtLink>{' '}
            (14 sections, cross-architecture + cross-task validation, scope-limit MALT null
            included).
          </li>
          <li>
            <strong>Re-run the detector</strong>: code at{' '}
            <ExtLink href="https://github.com/OpenInterpretability/inspect-tool-entropy-collapse">
              OpenInterpretability/inspect-tool-entropy-collapse
            </ExtLink>
            , one-command install via <CodeChip>uv</CodeChip>.
          </li>
          <li>
            <strong>Re-train the labels</strong>: 910 MB dataset at{' '}
            <ExtLink href="https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6">
              caiovicentino1/swebench-pro-qwen36-27b-phase6
            </ExtLink>{' '}
            — 99 trajectories with per-turn tool calls, per-turn residual-stream activations at
            5 layers (bf16), gold sub-class labels, and all derived features needed to reproduce
            paper §6.
          </li>
        </ul>

        <p>
          One honest caveat we surface in the companion paper #2 (still in draft): the WANDERING
          labels were single-run classified on NVIDIA RTX 6000 Pro Blackwell. Cross-GPU re-runs
          on H100 show ~35% natural <CodeChip>finish_tool</CodeChip> flip rate on the same
          &ldquo;WANDERING&rdquo; instances. The phenotype is real but the category has some
          hardware-determinism noise. Multi-seed classification protocols would tighten it.
          Documenting honestly because future detector evaluations need to know.
        </p>

        <H2>If you operate a crypto-agent today</H2>

        <p>
          Three concrete things you can do this week, in order of effort:
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Compute your WANDERING rate</strong>: take your last 1,000 agent trajectories
            and run the v5 detector on each. If &gt; 5% of trajectories show tool-entropy collapse
            in their last 10 turns, you have a measurable autonomous-tool failure mode. The
            detector code is one <CodeChip>pip install</CodeChip> away.
          </li>
          <li>
            <strong>Add Tier 3 to your runtime</strong>: emit an alert when the entropy threshold
            triggers. At 5% FP / 55% recall, this gives you escalation precision adequate for an
            autonomous-termination guard (kill the agent and require human review on detection).
          </li>
          <li>
            <strong>Audit the six diagnostics</strong>: if you want a third-party signed report
            covering tool-entropy collapse plus the five other failure modes we&apos;ve documented,
            join the AgentGuard waitlist at{' '}
            <ExtLink href="https://openinterp.org/products">openinterp.org/products</ExtLink>.
            We&apos;re scoping pilot audits for Q3 2026.
          </li>
        </ol>

        <p>
          Tool-entropy collapse is not the only failure mode in autonomous AI agents, and v5 is
          not the only detector. But it&apos;s the cheapest signal we&apos;ve found that
          reproduces across architectures within SWE-bench, ships as code today, and addresses an
          attack surface that traditional security audits don&apos;t cover. For operators with
          real money on the line, that&apos;s where we&apos;d start.
        </p>

        <H2>Related artifacts</H2>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            Paper (Tool-Entropy Collapse, v0.8):{' '}
            <ExtLink href="https://zenodo.org/records/20368601">
              Zenodo 10.5281/zenodo.20368601
            </ExtLink>
          </li>
          <li>
            Inspect AI eval:{' '}
            <ExtLink href="https://github.com/OpenInterpretability/inspect-tool-entropy-collapse">
              OpenInterpretability/inspect-tool-entropy-collapse
            </ExtLink>
          </li>
          <li>
            Inspect Evals register PR:{' '}
            <ExtLink href="https://github.com/UKGovernmentBEIS/inspect_evals/pull/1716">
              UKGovernmentBEIS/inspect_evals#1716
            </ExtLink>
          </li>
          <li>
            HuggingFace dataset (910 MB, 99 trajectories + residuals):{' '}
            <ExtLink href="https://huggingface.co/datasets/caiovicentino1/swebench-pro-qwen36-27b-phase6">
              caiovicentino1/swebench-pro-qwen36-27b-phase6
            </ExtLink>
          </li>
          <li>
            Companion paper #2 (Two Honest Nulls — what does NOT rescue WANDERING): draft in
            progress at{' '}
            <ExtLink href="https://github.com/OpenInterpretability/openinterp-swebench-harness/blob/main/paper/paper2/two_honest_nulls.pdf">
              openinterp-swebench-harness/paper/paper2
            </ExtLink>
          </li>
        </ul>

        <p className="text-sm text-ink-900/55 dark:text-ink-50/55 mt-12">
          Comments, replications, counter-examples: <CodeChip>caio@openinterp.org</CodeChip>.
          We&apos;re especially interested if you run the detector on production crypto-agent
          traces — we&apos;d love to know whether the 0.41 ratio holds in deployment.
        </p>
      </div>
    </article>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight mt-12 mb-4 text-balance">{children}</h2>
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
