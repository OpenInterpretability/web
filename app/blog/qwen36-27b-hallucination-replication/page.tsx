import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react'
import { getPost } from '@/lib/blog-posts'

const SLUG = 'qwen36-27b-hallucination-replication'

export const metadata = {
  title: 'Entity-recognition features in Qwen3.6-27B — OpenInterpretability blog',
  description:
    'A replication of Ferrando 2024 on a 27B reasoning model. The first attempt got AUROC=1.0 from a tokenization confound; the second got 0.84 — meaningfully above the 0.73 Gemma-2-2B-IT baseline. The debug is the more useful part.',
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
            On <CodeChip>caiovicentino1/qwen36-27b-sae-papergrade</CodeChip>, the best single SAE
            latent classifies known vs. unknown Wikidata entities with{' '}
            <strong>AUROC 0.8379</strong> at layer 11 — beating Ferrando 2024&apos;s
            0.732 on Gemma-2-2B-IT (their L13).
          </li>
          <li>
            The <strong>signal peaks at L11 (early stack, ~17% depth)</strong>, not mid-stack.
            Different from Gemma-2-2B-IT&apos;s L9-mid finding. We don&apos;t have causal evidence
            for why yet — one hypothesis is that 27B reasoning-tuned models commit to entity
            recognition earlier; another is just architectural variance. Worth confirming on more
            27B+ reasoning models.
          </li>
          <li>
            <strong>The first run got AUROC = 1.0</strong>. That was a tokenization confound, not a
            breakthrough. The debug + fix is the more useful part of this post.
          </li>
          <li>
            All artifacts published under Apache-2.0:{' '}
            <ExtLink href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/blob/main/hallucination_v0_0_2.json">
              hallucination_v0_0_2.json
            </ExtLink>{' '}
            on HF, notebook{' '}
            <ExtLink href="https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/24b_hallucination_v002_ferrando_proper.ipynb">
              24b_hallucination_v002_ferrando_proper.ipynb
            </ExtLink>
            .
          </li>
        </ul>

        <H2>What we&apos;re replicating</H2>

        <p>
          <ExtLink href="https://arxiv.org/abs/2411.14257">
            Ferrando et al. ICLR 2025, &ldquo;Do I Know This Entity? Knowledge Awareness and
            Hallucinations in Language Models&rdquo;
          </ExtLink>{' '}
          showed that on Gemma-2-2B and Gemma-2-9B, individual SAE features can act as a probe for
          whether the model &ldquo;knows&rdquo; a given entity. Ablating those features changes
          the model&apos;s confabulation rate. It&apos;s the cleanest existing argument that
          SAE-based interpretability can produce a calibration signal for hallucinations.
        </p>

        <p>
          We have three paper-grade SAEs on Qwen3.6-27B (
          <ExtLink href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade">
            HF
          </ExtLink>{' '}
          / 200M tokens / L11, L31, L55 / TopK + AuxK / Apache-2.0) and wanted to know whether the
          same trick works on a much larger, reasoning-tuned model. We didn&apos;t know what the
          answer would be. The interesting bit was finding out.
        </p>

        <H2>v0.0.1 — how we got AUROC = 1.0 the wrong way</H2>

        <p>
          The first version of the test built a dataset by hand:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>200 unambiguously famous people (Tom Hanks, Albert Einstein, Lionel Messi, &hellip;)</li>
          <li>
            200 procedurally-generated synthetic names with Slavic / Latinate roots (Vlasik Korpel,
            Krenadia Brovner, &hellip;) — designed to look real but have zero Wikipedia presence
          </li>
        </ul>
        <p>
          For each entity we ran a contrastive prompt, captured the SAE residual at the
          entity&apos;s last token, and trained a linear probe on the top-50 features by
          separation. The result:
        </p>

        <Quote>
          AUROC = <strong>1.0000</strong> on all three layers (L11 / L31 / L55).
        </Quote>

        <p>
          That number is suspicious. Real entity-recognition probes on 2B–9B models live in the
          0.7–0.85 range. Perfect separation in interp is almost always a confound.
        </p>

        <p>The diagnosis was a 30-second tokenization check:</p>

        <Pre>{`KNOWN   mean=3.30 tokens   median=3   range=1–7
UNKNOWN mean=6.03 tokens   median=6   range=4–10`}</Pre>

        <p>
          Synthetic names were tokenizing to roughly twice as many tokens as real names. Their
          last tokens were random subword fragments (<CodeChip>{`'cu'`}</CodeChip>,{' '}
          <CodeChip>{`'nov'`}</CodeChip>, <CodeChip>{`'ic'`}</CodeChip>) while the famous-name last
          tokens were real word endings. The SAE was happily detecting that — the
          highest-separation feature fired on &ldquo;long sequence of rare subwords&rdquo; via
          attention, not on entity recognition.
        </p>

        <p>
          The wrong AUROC = 1.0, in other words, was perfectly explained by the
          surface-tokenization difference. We never had to think about what the model knew.
        </p>

        <H2>The lesson</H2>

        <p>
          We had read Ferrando&apos;s abstract and our own prior research notes — but we had not
          read the dataset-construction section of the paper, nor opened their{' '}
          <ExtLink href="https://github.com/javiferran/sae_entities">
            javiferran/sae_entities
          </ExtLink>{' '}
          repository. A 30-minute look at either would have surfaced the critical detail: their
          known and unknown entities both come from the same Wikidata distribution. They never
          mix synthetic names with real ones.
        </p>

        <p>
          We&apos;ve added a hard rule to our memory: before writing a notebook that replicates a
          published method, read the paper&apos;s dataset section and any open replication
          first. Cost: 30 minutes. Saves: hours of compute on a result that doesn&apos;t
          generalize.
        </p>

        <H2>v0.0.2 — what worked</H2>

        <p>The corrected pipeline mirrors Ferrando&apos;s controls:</p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Real Wikidata entities only.</strong> We pulled their pre-processed JSON files
            (<CodeChip>player.json</CodeChip>, <CodeChip>movie.json</CodeChip>,{' '}
            <CodeChip>city.json</CodeChip>, <CodeChip>song.json</CodeChip>) — same surface
            distribution for both classes. No synthetic names anywhere.
          </li>
          <li>
            <strong>Model-defined labels.</strong> For each candidate entity, we asked Qwen3.6-27B
            three attribute questions (<em>place of birth?</em>, <em>director?</em>, etc.) and
            scored the answers. ≥2/3 correct + zero refusals → known. 0/3 correct + ≥1 refusal →
            unknown. Anything in between → discarded. That follows their{' '}
            <em>filter_known_unknown</em> protocol exactly.
          </li>
          <li>
            <strong>Pile noise filter.</strong> We ran ~2 000 random tokens from{' '}
            <CodeChip>NeelNanda/pile-10k</CodeChip> through each SAE and dropped any feature that
            fired on more than 2% of them. This explicitly removes generic surface features —
            including the kind that drove our v0.0.1 result. Roughly 1 250 features per layer were
            filtered out.
          </li>
          <li>
            <strong>Single-latent scoring.</strong> We didn&apos;t train a multi-feature linear
            probe. Following the paper, the &ldquo;classifier&rdquo; is just one feature&apos;s
            raw activation magnitude. Less powerful, more honest.
          </li>
          <li>
            <strong>Train-only feature selection.</strong> Top-100 candidate features were chosen
            by Cohen&apos;s d on the train split only, then their AUROC was measured on a
            disjoint test split.
          </li>
        </ol>

        <p>
          The final dataset, after Qwen3.6-27B did its own labelling on 1 000 candidates, was{' '}
          <strong>134 known + 92 unknown entities</strong> (774 ambiguous / discarded). Smaller
          than we&apos;d like, but enough to read.
        </p>

        <H2>The numbers</H2>

        <table className="not-prose w-full text-sm border-collapse my-6">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-left">
              <th className="py-2 pr-4 font-semibold">Layer (depth)</th>
              <th className="py-2 pr-4 font-semibold">Best feature</th>
              <th className="py-2 pr-4 font-semibold text-right">Cross-type AUROC</th>
              <th className="py-2 pr-4 font-semibold text-right">Pile fire-rate at best</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13.5px]">
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">L11 (17%)</td>
              <td className="py-2 pr-4">f61723</td>
              <td className="py-2 pr-4 text-right font-semibold">0.8379</td>
              <td className="py-2 pr-4 text-right">0.50%</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">L31 (48%)</td>
              <td className="py-2 pr-4">f54622</td>
              <td className="py-2 pr-4 text-right">0.8085</td>
              <td className="py-2 pr-4 text-right">—</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">L55 (86%)</td>
              <td className="py-2 pr-4">f29703</td>
              <td className="py-2 pr-4 text-right">0.7724</td>
              <td className="py-2 pr-4 text-right">—</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm text-ink-900/65 dark:text-ink-50/65 italic">
          Reference: Ferrando 2024 reports AUROC ≈ 0.732 on Gemma-2-2B-IT at L13. Our 27B beats
          that across all three layers — the gap is largest at L11, where it is 0.105 above their
          number.
        </p>

        <p>
          The headline activation distribution at the best layer is below: most known entities
          have near-zero activation on that feature, while unknowns spread to the right.
        </p>

        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/resolve/main/charts/hallucination_v002.png"
            alt="L11/f61723 activation histogram — known vs unknown — single-latent AUROC = 0.8379"
            className="w-full rounded-lg border border-black/5 dark:border-white/10"
          />
          <figcaption className="mt-3 text-xs text-ink-900/55 dark:text-ink-50/55 text-center font-mono">
            L11/f61723 · single-latent AUROC = 0.8379 · Pile-filtered (0.50% activation rate on
            random Pile tokens)
          </figcaption>
        </figure>

        <H2>Within-type sanity check</H2>

        <p>
          The class composition isn&apos;t balanced across entity types — 73 of the known entities
          are movies but only 32 are players, while unknowns are mostly players (53/92). To rule
          out a class-imbalance confound, we computed AUROC{' '}
          <em>within each entity type separately</em>:
        </p>

        <table className="not-prose w-full text-sm border-collapse my-6">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-left">
              <th className="py-2 pr-4 font-semibold">Entity type</th>
              <th className="py-2 pr-4 font-semibold">N (known + unknown)</th>
              <th className="py-2 pr-4 font-semibold text-right">Best within-type AUROC</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13.5px]">
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">player</td>
              <td className="py-2 pr-4">32 + 53</td>
              <td className="py-2 pr-4 text-right font-semibold">0.9113 (L11)</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">movie</td>
              <td className="py-2 pr-4">73 + 28</td>
              <td className="py-2 pr-4 text-right">0.8461 (L31)</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">song</td>
              <td className="py-2 pr-4">28 + 2</td>
              <td className="py-2 pr-4 text-right text-ink-900/45 dark:text-ink-50/45">
                too few unknowns
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4">city</td>
              <td className="py-2 pr-4">1 + 9</td>
              <td className="py-2 pr-4 text-right text-ink-900/45 dark:text-ink-50/45">
                too few knowns
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          Both player and movie show strong separation independently, so the cross-type 0.84
          isn&apos;t purely class-imbalance. <strong>One caveat:</strong> within-type N is small,
          so we couldn&apos;t use a held-out test split — the within-type numbers are biased
          upward by feature selection on the same data they&apos;re evaluated on. The 0.8379
          cross-type number is the only fully unbiased one.
        </p>

        <H2>The L11 finding</H2>

        <p>
          Ferrando reports the entity-recognition signal peaks around layer 9 of the 18-layer
          Gemma-2-2B-IT, then plateaus deeper. We see the strongest signal at{' '}
          <strong>L11 of the 64-layer Qwen3.6-27B</strong> — about 17% depth. By L31 (48%) the
          AUROC is 0.81 and by L55 (86%) it&apos;s 0.77.
        </p>

        <p>
          Two hypotheses for why early-stack might be where the signal lives in this model:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            27B + reasoning-tuning may push entity-token detection earlier — the model has
            &ldquo;decided&rdquo; whether it recognizes a name before it starts thinking.
          </li>
          <li>
            Architectural variance — Qwen3.6 dense transformer vs Gemma-2-2B might just route
            this kind of token-level lexical matching differently. Same task, different geometry.
          </li>
        </ol>
        <p>
          We don&apos;t have enough data to pick between these. Both predict that running the same
          test on Llama-3.3-70B-Reasoning or Qwen3.6-35B-A3B (a different architecture) would
          adjudicate. That&apos;s the next experiment.
        </p>

        <H2>Caveats we&apos;re flagging up front</H2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>N is small.</strong> 134 + 92 = 226 entities is below the ≥500/class Ferrando
            recommends; CIs are wide. The AUROC point estimate could move ±0.04 with a larger
            run.
          </li>
          <li>
            <strong>Songs and cities under-represented.</strong> Our labelling pipeline was too
            strict on numeric attributes (population, elevation, year) — the model often
            paraphrases or rounds, and substring-match misses correct answers. A v0.0.3 should
            replace substring-match with a Claude-as-judge labeller, similar to{' '}
            <ExtLink href="https://www.hallucination-probes.com/">
              Obalcells et al. 2025 (the Ferrando follow-up)
            </ExtLink>
            .
          </li>
          <li>
            <strong>The top feature (f61723) was also our top feature in v0.0.1.</strong> Pile
            filter and a different dataset distinguished a real signal from a confound, but it
            still suggests f61723 is partly an &ldquo;uncommon-name&rdquo; detector — not a clean
            semantic &ldquo;I know this&rdquo; circuit. A causal ablation experiment would tighten
            the interpretation.
          </li>
          <li>
            <strong>Single-prompt activation.</strong> We capture the residual at one position in
            one prompt template per entity. Ferrando aggregates across attribute-specific
            templates. Our number is therefore noisier than theirs.
          </li>
        </ul>

        <H2>Update — we tried the steering test (and it didn&apos;t work)</H2>

        <Quote>
          <strong>2026-04-25 follow-up:</strong> Same day as the original post. Causal evidence
          is the right next test, so we ran it. Result: <strong>predictive but not
          controllable</strong>. The feature&apos;s AUROC of 0.84 stands as a detection signal,
          but it isn&apos;t a steering knob.
        </Quote>

        <p>
          We tested two interventions on <CodeChip>L11/f61723</CodeChip> during generation, on 20
          known + 20 unknown Wikidata entities (re-labelled with the v0.0.2 protocol):
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Clamp ±5</strong>: force the feature to 0 (&ldquo;treat as known&rdquo;) or
            5.0 (&ldquo;treat as unknown&rdquo;)
          </li>
          <li>
            <strong>Additive ±2</strong> (Anthropic biology-paper style): add ± 2 × W_dec[f61723]
            to the residual at L11 — gentler, stays in-distribution
          </li>
        </ul>

        <p>Refusal rates across conditions:</p>

        <table className="not-prose w-full text-sm border-collapse my-6">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-left">
              <th className="py-2 pr-4 font-semibold">Class</th>
              <th className="py-2 pr-4 font-semibold text-right">Baseline</th>
              <th className="py-2 pr-4 font-semibold text-right">Ablate</th>
              <th className="py-2 pr-4 font-semibold text-right">Amplify</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13.5px]">
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">Known (n=20)</td>
              <td className="py-2 pr-4 text-right">0.0%</td>
              <td className="py-2 pr-4 text-right">0.0%</td>
              <td className="py-2 pr-4 text-right">0.0%</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Unknown (n=20)</td>
              <td className="py-2 pr-4 text-right">15.0%</td>
              <td className="py-2 pr-4 text-right">20.0% / 25.0%</td>
              <td className="py-2 pr-4 text-right">15.0% / 10.0%</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm text-ink-900/65 dark:text-ink-50/65 italic">
          Cells show additive ±2 / clamp ±5. Ablate on unknown was supposed to{' '}
          <em>decrease</em> refusal (treat as known); it increased instead. Amplify on known was
          supposed to <em>increase</em> refusal; nothing moved because the model never refused at
          baseline on these niche-but-real entities.
        </p>

        <p>
          But here&apos;s the nuance worth keeping:{' '}
          <strong>the additive intervention changed the actual generation text in 60–65% of
          cases</strong>. The feature is causally active — it shifts what facts the model
          confabulates and how it phrases descriptions — just not on the binary refuse-vs-answer
          decision the AUROC promised.
        </p>

        <p>Three readings of this, in increasing speculativeness:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>The feature is &ldquo;uncommon-token detector&rdquo;</strong>, not strictly
            &ldquo;I don&apos;t know&rdquo;. Real causal effect on style and word choice, but
            doesn&apos;t flip the model&apos;s binary commit-or-hedge behavior. AUROC was reading
            a correlate of the latent we wanted, not the latent itself.
          </li>
          <li>
            <strong>27B reasoning-tuned models route calibration through circuits, not single
            features.</strong> Anthropic&apos;s{' '}
            <ExtLink href="https://transformer-circuits.pub/2024/scaling-monosemanticity/">
              Templeton et al. 2024
            </ExtLink>{' '}
            already flagged this on Claude 3 Sonnet — single-feature steering for
            high-level model behaviors is hit-or-miss.
          </li>
          <li>
            <strong>SAE feature decomposition is lossy.</strong> The 65k-feature dictionary may
            capture an aspect of the &ldquo;I don&apos;t know&rdquo; semantic without isolating
            the full causal pathway.
          </li>
        </ol>

        <H3>What this changes for use cases</H3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Still valid:</strong> hallucination warning UI, RAG auto-trigger, production
            monitoring. Predictive use stands — AUROC 0.84 wasn&apos;t invalidated.
          </li>
          <li>
            <strong>Invalidated:</strong> steering API (&ldquo;amplify the feature to reduce
            confabulation&rdquo;), RL reward shaper based on this feature, any
            &ldquo;we control hallucination&rdquo; story.
          </li>
          <li>
            <strong>Open:</strong> circuit-level interventions (multiple features at once),
            attention-head steering, or constrained decoding remain to test. We didn&apos;t
            disprove that <em>some</em> intervention controls calibration — just that this single
            feature doesn&apos;t.
          </li>
        </ul>

        <p className="text-sm text-ink-900/70 dark:text-ink-50/70">
          The HF artifact is at{' '}
          <ExtLink href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/blob/main/steering_v0_0_1.json">
            steering_v0_0_1.json
          </ExtLink>
          ; the notebook is{' '}
          <ExtLink href="https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/25_steering_f61723_calibration.ipynb">
            25_steering_f61723_calibration.ipynb
          </ExtLink>
          .
        </p>

        <H2>Update 2 — multi-feature steering: ⚠️ method caveat (controls pending)</H2>

        <Quote>
          <strong>Honest walk-back, same day, after literature review:</strong> the original
          framing of this section overclaimed. The −15pp effect we report below is likely an
          artefact of three confounds we have not yet ruled out — most importantly,{' '}
          <strong>we have not run a random-feature ablation control</strong>, which is exactly
          the test that{' '}
          <ExtLink href="https://forum.effectivealtruism.org/posts/9vkEpghkuEv5QtfKG/entity-recognition-feature-steering-in-gemma-2-2b">
            collapsed Ferrando 2024&apos;s large-K ablation
          </ExtLink>{' '}
          (4 697 random features at L9 of Gemma-2-2B gave −29.2pp, basically identical to
          their 4 697 entity features → the &ldquo;circuit&rdquo; was generic perturbation).
          Our K=200 of 65k latents (~0.3% of the SAE) is squarely in the regime where this
          control has historically killed published findings. Until we run it, treat the
          numbers below as <em>provisional</em>.
        </Quote>
        <p className="text-sm text-ink-900/65 dark:text-ink-50/65">
          <strong>Other confounds we haven&apos;t ruled out:</strong> top-K by |Cohen&apos;s d|
          mixes fires-on-known and fires-on-unknown features (Marks / Templeton / Ferrando all
          sort by signed d, separately per direction); N=20 per class gives 95% CI of roughly
          ±15pp on the −15pp effect (we are 1.5σ from null); features were selected on the
          same prompts we evaluated refusal on, which our own{' '}
          <ExtLink href="https://github.com/OpenInterpretability/notebooks">
            prior memory note
          </ExtLink>{' '}
          documents inflates effects ~15pp through selection bias. Cumulatively the suspicions
          are large enough that we cannot stand behind the &ldquo;circuit-level signal&rdquo;
          framing yet. Notebook 27 (random-K control · direction-sorted sweep · anti-feature
          control · 3-way split · confabulation-vs-correct labelling) is the next experiment.
          ETA: same week.
        </p>

        <p className="text-sm text-ink-900/65 dark:text-ink-50/65 italic">
          We&apos;re leaving the original section below for transparency. The replication-on-27B
          result (Update 1) is unaffected by this caveat — it concerns only single-feature
          steering and the multi-feature Update 2.
        </p>

        <hr className="my-6 border-amber-500/30" />

        <Quote>
          <strong>Same-day follow-up:</strong> if a single feature isn&apos;t the calibration
          knob, maybe a <em>circuit</em> is. Anthropic Templeton 2024 already flagged that
          high-level behaviors in Claude 3 Sonnet route through multiple features, not single
          ones. We tested the obvious next step: ablate top-K simultaneously.
        </Quote>

        <p>
          We swept K ∈ {`{0, 5, 20, 50, 200}`} simultaneously-ablated features (top by Cohen&apos;s
          d after the Pile filter, mix of fires-on-known and fires-on-unknown), measured refusal
          rate per condition. The aggregate result:
        </p>

        <table className="not-prose w-full text-sm border-collapse my-6">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-left">
              <th className="py-2 pr-4 font-semibold">K</th>
              <th className="py-2 pr-4 font-semibold text-right">Known refusal</th>
              <th className="py-2 pr-4 font-semibold text-right">Unknown refusal</th>
              <th className="py-2 pr-4 font-semibold text-right">Δ unknown vs K=0</th>
              <th className="py-2 pr-4 font-semibold text-right">Texts changed @ K (unknown)</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13.5px]">
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">0</td>
              <td className="py-2 pr-4 text-right">10.0%</td>
              <td className="py-2 pr-4 text-right">60.0%</td>
              <td className="py-2 pr-4 text-right">—</td>
              <td className="py-2 pr-4 text-right">—</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">5</td>
              <td className="py-2 pr-4 text-right">5.0%</td>
              <td className="py-2 pr-4 text-right">60.0%</td>
              <td className="py-2 pr-4 text-right">+0pp</td>
              <td className="py-2 pr-4 text-right">45%</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">20</td>
              <td className="py-2 pr-4 text-right">5.0%</td>
              <td className="py-2 pr-4 text-right">50.0%</td>
              <td className="py-2 pr-4 text-right">−10pp</td>
              <td className="py-2 pr-4 text-right">70%</td>
            </tr>
            <tr className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-4">50</td>
              <td className="py-2 pr-4 text-right">15.0%</td>
              <td className="py-2 pr-4 text-right">50.0%</td>
              <td className="py-2 pr-4 text-right">−10pp</td>
              <td className="py-2 pr-4 text-right">80%</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-semibold">200</td>
              <td className="py-2 pr-4 text-right">10.0%</td>
              <td className="py-2 pr-4 text-right font-semibold">45.0%</td>
              <td className="py-2 pr-4 text-right font-semibold">−15pp</td>
              <td className="py-2 pr-4 text-right font-semibold">95%</td>
            </tr>
          </tbody>
        </table>

        <p>
          Δ refusal on unknown is <strong>monotonic in K</strong>, in the predicted direction
          (ablating &ldquo;I don&apos;t know&rdquo; features → less hedging). At K=200,
          <strong> 95% of generations differ</strong> from baseline. This is real causal effect
          at circuit level, where single-feature wasn&apos;t.
        </p>

        <p>
          But the qualitative is the more interesting part. Some examples at K=200:
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Danny Green</strong> (NBA player, known): model switches to{' '}
            <em>baseball player Daniel Joseph Green</em>. Ablation didn&apos;t make the model
            confabulate — it{' '}
            <em>retrieved a different real person sharing the name</em>.
          </li>
          <li>
            <strong>Dikembe Mutombo</strong> (known): adds the false claim that he is a{' '}
            <em>&ldquo;physician&rdquo;</em>. He&apos;s a humanitarian, not a physician.
            Ablation increased a specific kind of hallucination.
          </li>
          <li>
            <strong>Luke Nevill</strong> (unknown, real Australian basketball player):
            confabulation shifts <em>American → Australian</em>, names &ldquo;Kogan.com&rdquo;
            instead of &ldquo;Neville Group&rdquo;. The geography drift was{' '}
            <em>toward truth</em>, by accident.
          </li>
          <li>
            <strong>Bambale Osby</strong> (unknown, real basketball player): description shifts
            from &ldquo;basketball player on Spurs&rdquo; → &ldquo;actress, singer, dancer&rdquo;.
            Ablation produced more, not less, hallucination.
          </li>
        </ul>

        <p>
          Three things this means:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Circuit-level signal is real.</strong> The refusal-rate Δ is small (−15pp at
            K=200) but monotonic and in the right direction. Combined with 95% text-change rate,
            this is unambiguously causal effect on behavior — just not the clean &ldquo;less
            confabulation&rdquo; story we hoped for.
          </li>
          <li>
            <strong>Even at circuit level, intervention is not a calibration knob.</strong>{' '}
            Individual cases shift in <em>unpredictable directions</em>: sometimes toward truth
            (Luke Nevill → Australian), sometimes toward more hallucination (Bambale Osby
            actress), sometimes to a different real person (Danny Green NBA → baseball). The
            aggregate looks like &ldquo;less hedging&rdquo;, but per-entity it&apos;s closer to
            &ldquo;random perturbation of the entity-retrieval circuit&rdquo;.
          </li>
          <li>
            <strong>This validates Templeton 2024&apos;s framing.</strong> They reported on
            Claude 3 Sonnet that single-feature steering for high-level model behaviors is hit or
            miss; multi-feature is closer to the right unit but still coarse. We replicate this
            on a different architecture (Qwen3.6-27B dense reasoning-tuned, vs Sonnet&apos;s
            unknown architecture).
          </li>
        </ol>

        <H3>The full story arc</H3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Predictive (AUROC 0.84):</strong> single SAE feature classifies known/unknown
            cleanly after Pile filter. Ship-able as detector for UI / RAG / monitoring.
          </li>
          <li>
            <strong>Single-feature steering: not causal.</strong> Clamping or perturbing f61723
            alone changes 60% of generations but doesn&apos;t shift refusal rate in the predicted
            direction. Feature is causally active for{' '}
            <em>something</em>, but not for the &ldquo;I know vs I don&apos;t know&rdquo; binary.
          </li>
          <li>
            <strong>Multi-feature (top-200) steering: partial causal, chaotic.</strong> −15pp on
            unknown refusal at K=200, monotonic in K, but per-entity behavior is unpredictable
            (truth, more hallucination, identity-swap, no change — all happen).
          </li>
        </ol>

        <p>
          Honest takeaway:{' '}
          <strong>
            in 27B reasoning models, hallucination calibration is distributed across many
            features and lacks a clean steering interface — even at circuit scale. SAE-as-detector
            works; SAE-as-knob doesn&apos;t, at least via straight ablation.
          </strong>
        </p>

        <p className="text-sm text-ink-900/70 dark:text-ink-50/70">
          HF artifact:{' '}
          <ExtLink href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/blob/main/multi_feature_steering_v0_0_1.json">
            multi_feature_steering_v0_0_1.json
          </ExtLink>
          ; notebook{' '}
          <ExtLink href="https://github.com/OpenInterpretability/notebooks/blob/main/notebooks/26_multi_feature_steering.ipynb">
            26_multi_feature_steering.ipynb
          </ExtLink>
          .
        </p>

        <H2>What&apos;s next</H2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Targeted-direction multi-feature.</strong> Top-K by |Cohen&apos;s d| mixes
            fires-on-known and fires-on-unknown features. Ablating only the fires-on-unknown
            ones (or only the fires-on-known) might give cleaner direction. Worth a notebook.
          </li>
          <li>
            <strong>Larger held-out test.</strong> Re-run the pipeline at N ≥ 500/class, ideally
            with a Claude-as-judge labeller so we can use songs and cities. The 0.84 might tighten
            to 0.78 or stretch to 0.88 — either way, a real number.
          </li>
          <li>
            <strong>Cross-model.</strong> Same test on Qwen3.6-35B-A3B (triple-hybrid arch) and
            Llama-3.3-70B (different family) to adjudicate the L11-early hypothesis.
          </li>
          <li>
            <strong>Composite hallucination predictor.</strong> Combine the entity-recognition
            feature with our existing reasoning-quality probe (
            <ExtLink href="https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade/blob/main/interpscore_papergrade.json">
              MCR Stage D, AUROC 0.78
            </ExtLink>
            ) to see whether they capture orthogonal signal.
          </li>
        </ul>

        <H2>Acknowledgments</H2>
        <p>
          The methodology is{' '}
          <ExtLink href="https://arxiv.org/abs/2411.14257">Ferrando et al. 2024</ExtLink>; the
          dataset is theirs; the entire framing is theirs. We just ran it on a bigger model and
          reported what we found. Their{' '}
          <ExtLink href="https://github.com/javiferran/sae_entities">
            javiferran/sae_entities
          </ExtLink>{' '}
          repo is one of the cleanest research codebases we&apos;ve worked with — most of the
          methodology details we needed were inline-commented. The successor paper{' '}
          <ExtLink href="https://arxiv.org/abs/2509.03531">Obalcells et al. 2025</ExtLink>{' '}
          (Ferrando is a co-author) extends this with a Claude-as-judge labeller and tests up to
          70B; that&apos;s likely the right reference for a v0.1 follow-up.
        </p>

        <H2>Reproduce</H2>

        <Pre>{`# Notebook
git clone https://github.com/OpenInterpretability/notebooks
cd notebooks/notebooks
# Open 24b_hallucination_v002_ferrando_proper.ipynb on Colab
# Set HF_TOKEN in Secrets, "Runtime → Run all"

# Cost: ~$15 GPU + ~2h on RTX 6000 Pro 96GB
# Output: hallucination_v0_0_2.json + chart at the SAE HF repo`}</Pre>

        <p>
          Comments, replications, push-back, &ldquo;you missed control X&rdquo; — open an issue on{' '}
          <ExtLink href="https://github.com/OpenInterpretability/notebooks/issues">
            OpenInterpretability/notebooks
          </ExtLink>{' '}
          or email <a href="mailto:hi@openinterp.org" className="underline underline-offset-2 text-brand-600 dark:text-brand-400 hover:text-brand-700">hi@openinterp.org</a>. Most useful would be: independent replication on
          a different 27B+ reasoning model.
        </p>

      </div>

      <hr className="my-12 border-black/10 dark:border-white/10" />

      <footer className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-900/50 dark:text-ink-50/50">
        <span>Apache-2.0 · 2026</span>
        <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:text-brand-700">
          ← All posts
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
