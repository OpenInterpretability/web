/**
 * Canonical papers for study — curated reading list on /research.
 *
 * Every entry cites a primary source (arxiv, transformer-circuits.pub,
 * LessWrong, or an official blog). Descriptions are short + honest.
 * If you spot a dead link or a missing seminal paper, open a PR to
 * OpenInterpretability/web editing this file.
 */

export interface Paper {
  title: string
  authors: string
  year: number
  url: string
  what: string     // what the paper does, one sentence
  why: string      // why it matters to a practitioner in 2026, one sentence
}

export interface PaperGroup {
  heading: string
  sub?: string
  papers: Paper[]
}

export interface PaperTopic {
  id: string
  label: string
  intro: string
  groups: PaperGroup[]
}

export const paperTopics: PaperTopic[] = [
  // ============================================================
  // TOPIC 1 — SAE foundations & scaling
  // ============================================================
  {
    id: 'sae-foundations',
    label: 'SAE foundations & scaling',
    intro:
      'Start here. The dictionary-learning → scaling → evaluation arc that every modern interpretability paper builds on.',
    groups: [
      {
        heading: 'Foundations',
        sub: 'The "SAEs actually work" moment and its precursors.',
        papers: [
          {
            title: 'Sparse Autoencoders Find Highly Interpretable Features in Language Models',
            authors: 'Cunningham et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2309.08600',
            what: 'Shows that SAEs trained on LM residual streams recover sparse, causally-relevant, human-interpretable features, outperforming neuron and PCA baselines.',
            why: 'The canonical "SAEs actually work" paper — mandatory background before any training run.',
          },
          {
            title: 'Towards Monosemanticity: Decomposing Language Models With Dictionary Learning',
            authors: 'Bricken et al. (Anthropic)',
            year: 2023,
            url: 'https://transformer-circuits.pub/2023/monosemantic-features/',
            what: 'Trains SAEs on a 1-layer transformer, demonstrating thousands of monosemantic features with feature-splitting under width scaling.',
            why: 'Established the training recipe every practitioner still iterates on (L1, resampling, ghost grads).',
          },
          {
            title: 'Interim Report: Taking Features Out of Superposition',
            authors: 'Sharkey, Braun & Millidge (Conjecture)',
            year: 2022,
            url: 'https://www.lesswrong.com/posts/z6QQJbtpkEAX3Aojj/interim-research-report-taking-features-out-of-superposition',
            what: 'The pre-Cunningham interim report that seeded the SAE research program from Elhage et al.\'s superposition hypothesis.',
            why: 'Useful priors on why L1 + overcomplete dictionaries are the right inductive bias.',
          },
        ],
      },
      {
        heading: 'Scaling SAEs',
        sub: 'From toy models to frontier-scale.',
        papers: [
          {
            title: 'Scaling and Evaluating Sparse Autoencoders',
            authors: 'Gao et al. (OpenAI)',
            year: 2024,
            url: 'https://arxiv.org/abs/2406.04093',
            what: 'Introduces TopK and AuxK losses, scaling laws in (n_features, k, compute), and GPT-4-scale SAEs.',
            why: 'The default recipe for anyone training > 1M features. TopK kills L1 shrinkage; AuxK revives dead latents.',
          },
          {
            title: 'Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet',
            authors: 'Templeton et al. (Anthropic)',
            year: 2024,
            url: 'https://transformer-circuits.pub/2024/scaling-monosemanticity/',
            what: 'Trains 34M-feature SAEs on production-scale Sonnet and documents abstract/multimodal/safety features.',
            why: 'Proves SAEs transfer to frontier models; sets the qualitative bar for feature cataloging.',
          },
          {
            title: 'Gemma Scope: Open SAEs Everywhere All At Once on Gemma 2',
            authors: 'Lieberum et al. (DeepMind)',
            year: 2024,
            url: 'https://arxiv.org/abs/2408.05147',
            what: 'Releases 400+ JumpReLU SAEs across every layer/site of Gemma 2 2B/9B/27B.',
            why: 'Go-to open resource — don\'t train from scratch when a Gemma Scope checkpoint covers your site.',
          },
        ],
      },
      {
        heading: 'Architecture variants',
        sub: 'Beyond ReLU + L1 — Gated, JumpReLU, BatchTopK, ProLU.',
        papers: [
          {
            title: 'Jumping Ahead: Improving Reconstruction Fidelity with JumpReLU SAEs',
            authors: 'Rajamanoharan et al. (DeepMind)',
            year: 2024,
            url: 'https://arxiv.org/abs/2407.14435',
            what: 'Replaces ReLU+L1 with a learnable-threshold JumpReLU activation plus a straight-through L0 loss.',
            why: 'Matches TopK quality without the fixed-k constraint — current Pareto frontier.',
          },
          {
            title: 'Improving Dictionary Learning with Gated Sparse Autoencoders',
            authors: 'Rajamanoharan et al. (DeepMind)',
            year: 2024,
            url: 'https://arxiv.org/abs/2404.16014',
            what: 'Decouples "which features fire" from "how much they fire" via a gated architecture, resolving L1 shrinkage bias.',
            why: 'Key precursor to JumpReLU — useful when you want magnitude fidelity without a hard TopK.',
          },
          {
            title: 'BatchTopK Sparse Autoencoders',
            authors: 'Bussmann, Leask & Nanda',
            year: 2024,
            url: 'https://arxiv.org/abs/2412.06410',
            what: 'TopK applied across the batch rather than per-token — variable sparsity per example, fixed average L0.',
            why: 'Small change, meaningful reconstruction gains. Trivial to retrofit into a TopK training loop.',
          },
          {
            title: 'ProLU: A Nonlinearity for Sparse Autoencoders',
            authors: 'Taggart',
            year: 2024,
            url: 'https://www.alignmentforum.org/posts/HEpufTdakGTTKgoYF/prolu-a-nonlinearity-for-sparse-autoencoders',
            what: 'Proportional-ReLU activation that preserves feature magnitudes while giving gradient signal to pre-threshold activations.',
            why: 'Lightweight alternative when Gated/JumpReLU infra is overkill.',
          },
        ],
      },
      {
        heading: 'Transcoders & cross-coders',
        sub: 'SAEs that span layers — the primitives behind 2025 circuit analysis.',
        papers: [
          {
            title: 'Transcoders Find Interpretable LLM Feature Circuits',
            authors: 'Dunefsky, Chlenski & Nanda',
            year: 2024,
            url: 'https://arxiv.org/abs/2406.11944',
            what: 'SAE-like module trained to map MLP input → MLP output, yielding input-independent weights that support tractable circuits.',
            why: 'Essential if your goal is mechanistic circuits rather than feature dictionaries.',
          },
          {
            title: 'Sparse Crosscoders for Cross-Layer Features and Model Diffing',
            authors: 'Lindsey et al. (Anthropic)',
            year: 2024,
            url: 'https://transformer-circuits.pub/2024/crosscoders/',
            what: 'Generalizes SAEs to read/write across multiple layers or multiple models simultaneously.',
            why: 'Required reading for fine-tune interpretability and layer-spanning circuits.',
          },
          {
            title: 'Circuit Tracing: Revealing Computational Graphs in Language Models',
            authors: 'Ameisen, Lindsey et al. (Anthropic)',
            year: 2025,
            url: 'https://transformer-circuits.pub/2025/attribution-graphs/methods.html',
            what: 'Introduces Cross-Layer Transcoders (CLTs) and attribution graphs for end-to-end circuit extraction on production models.',
            why: 'Current state-of-the-art methodology for "explain this specific completion."',
          },
        ],
      },
      {
        heading: 'Evaluation & benchmarks',
        papers: [
          {
            title: 'SAEBench: A Comprehensive Benchmark for Sparse Autoencoders',
            authors: 'Karvonen et al.',
            year: 2025,
            url: 'https://arxiv.org/abs/2503.09532',
            what: 'Seven-task benchmark (probing, unlearning, SCR, TPP, absorption, auto-interp, sparse probing) comparing SAE architectures apples-to-apples.',
            why: 'Run this before claiming your new variant beats TopK/JumpReLU. We publish the InterpScore composite on top of it.',
          },
          {
            title: 'A is for Absorption: Studying Feature Splitting and Absorption in SAEs',
            authors: 'Chanin et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2409.14507',
            what: 'Identifies "absorption" — a general feature silently swallows a specific feature\'s activation, breaking interpretability evals.',
            why: 'Critical failure mode to probe for. Affects nearly every SAE at scale.',
          },
        ],
      },
      {
        heading: 'Training tricks & auto-interp',
        papers: [
          {
            title: 'Open Source Automated Interpretability for SAE Features',
            authors: 'Juang, Paulo, Drori, Belrose (EleutherAI)',
            year: 2024,
            url: 'https://blog.eleuther.ai/autointerp/',
            what: 'Open-source auto-interp pipeline with detection/fuzzing scoring, reproducing OpenAI\'s scaling-curve methodology.',
            why: 'Practical toolkit for evaluating features at million-latent scale.',
          },
          {
            title: 'Efficient Dictionary Learning with Switch Sparse Autoencoders',
            authors: 'Mudide et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2410.08201',
            what: 'MoE-style routing across many small expert SAEs — ~5× FLOPs reduction at matched reconstruction.',
            why: 'Use when compute-bound on frontier-model-scale training.',
          },
        ],
      },
    ],
  },

  // ============================================================
  // TOPIC 2 — Circuits & Attribution
  // ============================================================
  {
    id: 'circuits',
    label: 'Circuits & attribution',
    intro:
      'How information flows. Attribution patching, automatic circuit discovery, sparse feature circuits, Anthropic\'s 2025 biology papers.',
    groups: [
      {
        heading: 'Early circuit analysis',
        sub: 'The Elhage/Olsson/Wang canon — read before any attribution paper.',
        papers: [
          {
            title: 'A Mathematical Framework for Transformer Circuits',
            authors: 'Elhage et al. (Anthropic)',
            year: 2021,
            url: 'https://transformer-circuits.pub/2021/framework/index.html',
            what: 'Decomposes attention-only transformers into QK/OV circuits and identifies induction heads as composable primitives.',
            why: 'Foundation for every circuit paper since. Read this before anything else.',
          },
          {
            title: 'In-context Learning and Induction Heads',
            authors: 'Olsson et al. (Anthropic)',
            year: 2022,
            url: 'https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html',
            what: 'Six lines of evidence that induction heads drive most in-context learning in LLMs.',
            why: 'Anchors the "phase-transition during training" methodology still used to diagnose capability emergence.',
          },
          {
            title: 'Interpretability in the Wild: A Circuit for IOI in GPT-2 Small',
            authors: 'Wang et al.',
            year: 2022,
            url: 'https://arxiv.org/abs/2211.00593',
            what: 'Reverse-engineers a 26-head circuit for indirect-object identification — the canonical end-to-end circuit case study.',
            why: 'Every modern circuit-discovery benchmark (ACDC, EAP, Edge Pruning) is still evaluated against IOI.',
          },
          {
            title: 'Progress Measures for Grokking via Mechanistic Interpretability',
            authors: 'Nanda et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2301.05217',
            what: 'Fully reverse-engineers modular-addition grokking into a Fourier-basis algorithm; defines progress measures predicting phase transitions.',
            why: 'Template for "mech-interp as science of learning dynamics."',
          },
        ],
      },
      {
        heading: 'Attribution patching',
        papers: [
          {
            title: 'Attribution Patching: Activation Patching At Industrial Scale',
            authors: 'Nanda',
            year: 2023,
            url: 'https://www.neelnanda.io/mechanistic-interpretability/attribution-patching',
            what: 'Introduces the linear-approximation trick that replaces O(N) forward passes with two passes + one backward.',
            why: 'If you patch at scale in 2026, you are using this.',
          },
          {
            title: 'AtP*: An Efficient and Scalable Method for Localizing LLM Behaviour',
            authors: 'Kramár, Lieberum, Shah & Nanda (DeepMind)',
            year: 2024,
            url: 'https://arxiv.org/abs/2403.00745',
            what: 'Fixes AtP\'s two systematic failure modes (attention saturation, cancellation) and adds diagnostics with guarantees.',
            why: 'Production-grade attribution-patching recipe for frontier models.',
          },
          {
            title: 'Attribution Patching Outperforms Automated Circuit Discovery',
            authors: 'Syed, Rager & Conmy',
            year: 2023,
            url: 'https://arxiv.org/abs/2310.10348',
            what: 'Shows edge-level attribution patching (EAP) matches or beats ACDC on IOI/Greater-Than/Docstring at a fraction of the cost.',
            why: 'Default choice for edge-level circuit recovery today.',
          },
        ],
      },
      {
        heading: 'Circuit discovery algorithms',
        papers: [
          {
            title: 'Towards Automated Circuit Discovery for Mechanistic Interpretability (ACDC)',
            authors: 'Conmy et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2304.14997',
            what: 'First general algorithm for recovering circuits by iterated edge pruning under a faithfulness metric.',
            why: 'Still the reference against which newer discovery methods are benchmarked.',
          },
          {
            title: 'Finding Transformer Circuits with Edge Pruning',
            authors: 'Bhaskar et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2406.16778',
            what: 'Learns a differentiable mask over edges via gradient descent; scales to CodeLlama-13B.',
            why: 'Practical path when ACDC/EAP are too coarse or too noisy on larger models.',
          },
          {
            title: 'Information Flow Routes: Automatically Interpreting Language Models at Scale',
            authors: 'Ferrando & Voita',
            year: 2024,
            url: 'https://arxiv.org/abs/2403.00824',
            what: 'Builds graphs of token-level information flow via attribution, skipping the need for contrastive prompt pairs.',
            why: 'Useful when you lack a clean counterfactual to patch against.',
          },
        ],
      },
      {
        heading: 'Sparse feature circuits',
        papers: [
          {
            title: 'Sparse Feature Circuits: Discovering and Editing Interpretable Causal Graphs',
            authors: 'Marks et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2403.19647',
            what: 'Discovers human-interpretable circuits over SAE features (not neurons); uses them to debug spurious correlations (SHIFT).',
            why: 'The bridge between dictionary-learning SAEs and causal circuit analysis. Our notebook 15 replicates it.',
          },
        ],
      },
      {
        heading: 'Anthropic 2025 — biology of an LLM',
        sub: 'The definitive 2025 case-study corpus.',
        papers: [
          {
            title: 'On the Biology of a Large Language Model',
            authors: 'Anthropic',
            year: 2025,
            url: 'https://transformer-circuits.pub/2025/attribution-graphs/biology.html',
            what: 'Applies attribution graphs to ten behaviors (planning in poetry, multilingual features, multi-step reasoning, refusals).',
            why: 'Shows what circuit-level interpretability can produce at frontier scale.',
          },
        ],
      },
      {
        heading: 'Causal scrubbing / DAS',
        papers: [
          {
            title: 'Causal Scrubbing: A Method for Rigorously Testing Interpretability Hypotheses',
            authors: 'Chan et al.',
            year: 2022,
            url: 'https://www.alignmentforum.org/posts/JvZhhzycHu2Yd57RN/causal-scrubbing-a-method-for-rigorously-testing',
            what: 'Formalizes circuit hypotheses as equivalence classes of interventions; measures faithfulness via recursive resampling.',
            why: 'Rigor backbone for any "is my circuit the real circuit?" claim.',
          },
          {
            title: 'Inducing Causal Structure for Interpretable Neural Networks (DAS)',
            authors: 'Geiger et al.',
            year: 2022,
            url: 'https://arxiv.org/abs/2112.00826',
            what: 'Distributed Alignment Search learns a rotation that aligns model activations with a high-level causal graph.',
            why: 'Principled way to test whether a symbolic algorithm is implemented inside a network.',
          },
          {
            title: 'Interpretability at Scale: Identifying Causal Mechanisms in Alpaca',
            authors: 'Wu et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2305.08809',
            what: 'Scales DAS to a 7B instruction-tuned model and localizes specific decision variables.',
            why: 'Demonstrates causal-abstraction methods are tractable on real LLMs, not just toy tasks.',
          },
        ],
      },
      {
        heading: 'Patchscopes & faithfulness',
        papers: [
          {
            title: 'Patchscopes: A Unifying Framework for Inspecting Hidden Representations',
            authors: 'Ghandeharioun et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2401.06102',
            what: 'Decodes any hidden state by patching it into a separate inference pass with a probing prompt — subsumes logit/tuned/future lens.',
            why: 'Go-to tool when you want to ask "what does this residual stream know?" in natural language.',
          },
          {
            title: 'Have Faith in Faithfulness: Going Beyond Circuit Overlap',
            authors: 'Hanna, Pezzelle & Belinkov',
            year: 2024,
            url: 'https://arxiv.org/abs/2403.17806',
            what: 'Shows circuit-overlap metrics miss real faithfulness; proposes edge-ablation evaluations that track behavioral preservation.',
            why: 'Mandatory reading before you publish a "we found the circuit" claim.',
          },
        ],
      },
    ],
  },

  // ============================================================
  // TOPIC 3 — Steering, probing, lenses, safety
  // ============================================================
  {
    id: 'steering-probing',
    label: 'Steering, probing & safety',
    intro:
      'The supervised and semi-supervised complements to SAEs — probes, activation steering, representation engineering, interpretability for deception detection.',
    groups: [
      {
        heading: 'Lenses',
        papers: [
          {
            title: 'Interpreting GPT: The Logit Lens',
            authors: 'nostalgebraist',
            year: 2020,
            url: 'https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens',
            what: 'Decode intermediate residual streams with the unembedding matrix to see layer-wise "predictions."',
            why: 'The zeroth tool every practitioner reaches for when inspecting a new model.',
          },
          {
            title: 'Eliciting Latent Predictions from Transformers with the Tuned Lens',
            authors: 'Belrose et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2303.08112',
            what: 'Per-layer affine probe trained to match final logits; fixes logit-lens miscalibration on modern models.',
            why: 'Use this instead of Logit Lens for anything larger than GPT-2.',
          },
          {
            title: 'Jump to Conclusions: Short-Cutting Transformers With Linear Transformations',
            authors: 'Din et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2303.09435',
            what: 'Learns linear mappings from any layer to any later layer, enabling cheap early-exit and causal interventions across depth.',
            why: 'A middle-ground lens family between Logit and Tuned.',
          },
        ],
      },
      {
        heading: 'Activation steering',
        sub: 'Directions are the unit of analysis.',
        papers: [
          {
            title: 'Activation Addition (ActAdd)',
            authors: 'Turner et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2308.10248',
            what: 'Add a difference-of-prompts activation vector at inference to shift style/topic with no fine-tuning.',
            why: 'Simplest possible steering baseline — try before anything fancier.',
          },
          {
            title: 'Steering Llama 2 via Contrastive Activation Addition (CAA)',
            authors: 'Panickssery et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2312.06681',
            what: 'Averages paired contrastive activations across a dataset (sycophancy, refusal, etc.) to produce robust steering vectors.',
            why: 'Recipe behind most production "persona vectors."',
          },
          {
            title: 'Representation Engineering: A Top-Down Approach to AI Transparency',
            authors: 'Zou et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2310.01405',
            what: 'LAT scans for concept directions (honesty, power-seeking, morality) and intervenes on them.',
            why: 'Launched the "directions are the unit of analysis" frame now used across steering and reward work.',
          },
        ],
      },
      {
        heading: 'Probing',
        papers: [
          {
            title: 'Understanding Intermediate Layers Using Linear Classifier Probes',
            authors: 'Alain & Bengio',
            year: 2016,
            url: 'https://arxiv.org/abs/1610.01644',
            what: 'Foundational linear-probe methodology for intermediate representations.',
            why: 'Every downstream probe paper cites this.',
          },
          {
            title: 'Designing and Interpreting Probes with Control Tasks',
            authors: 'Hewitt & Liang',
            year: 2019,
            url: 'https://arxiv.org/abs/1909.03368',
            what: 'Introduces control-task selectivity to distinguish probes that discover structure from probes that memorize.',
            why: 'Mandatory sanity check before claiming a probe "reads a concept."',
          },
          {
            title: 'Probing Classifiers: Promises, Shortcomings, and Advances',
            authors: 'Belinkov',
            year: 2022,
            url: 'https://arxiv.org/abs/2102.12452',
            what: 'Survey codifying probing methodology, pitfalls (capacity, causality, selectivity), and the shift to causal probes.',
            why: 'Read before designing any new probe study.',
          },
        ],
      },
      {
        heading: 'CCS & latent knowledge',
        sub: 'The "elicit what the model believes" research line, with its critiques.',
        papers: [
          {
            title: 'Discovering Latent Knowledge in Language Models Without Supervision (CCS)',
            authors: 'Burns et al.',
            year: 2022,
            url: 'https://arxiv.org/abs/2212.03827',
            what: 'Unsupervised consistency loss over yes/no contrast pairs to recover a "truth" direction.',
            why: 'Seeded the ELK (Eliciting Latent Knowledge) research program.',
          },
          {
            title: 'Challenges with Unsupervised LLM Knowledge Discovery',
            authors: 'Farquhar et al.',
            year: 2023,
            url: 'https://arxiv.org/abs/2312.10029',
            what: 'Shows CCS often tracks salient features rather than truth.',
            why: 'Essential cold-shower read before you ship any CCS-based monitor.',
          },
          {
            title: 'Eliciting Latent Knowledge from Quirky Language Models',
            authors: 'Mallen & Belrose',
            year: 2023,
            url: 'https://arxiv.org/abs/2312.01037',
            what: 'Fine-tunes models to lie under a keyword, benchmarks probes on recovering ground truth.',
            why: 'Canonical ELK testbed.',
          },
        ],
      },
      {
        heading: 'Model editing',
        papers: [
          {
            title: 'Locating and Editing Factual Associations in GPT (ROME)',
            authors: 'Meng et al.',
            year: 2022,
            url: 'https://arxiv.org/abs/2202.05262',
            what: 'Causal tracing localizes facts to mid-layer MLPs; rank-one update edits them.',
            why: 'Defined "interpretability-guided editing" as a category.',
          },
          {
            title: 'Mass-Editing Memory in a Transformer (MEMIT)',
            authors: 'Meng et al.',
            year: 2022,
            url: 'https://arxiv.org/abs/2210.07229',
            what: 'Extends ROME to thousands of simultaneous edits.',
            why: 'Reference baseline for bulk factual editing.',
          },
        ],
      },
      {
        heading: 'SAE features as reward',
        sub: 'Direct prior art for mechreward.',
        papers: [
          {
            title: 'SARM: Interpretable Reward Model via Sparse Autoencoder',
            authors: 'Li et al.',
            year: 2025,
            url: 'https://arxiv.org/abs/2508.08746',
            what: 'Replaces the opaque reward head with an SAE-features linear readout.',
            why: 'Cleanest "interpretable reward model" baseline.',
          },
          {
            title: 'ReasonScore: Discovering Reasoning Features in LLMs with SAEs',
            authors: 'AIRI',
            year: 2025,
            url: 'https://arxiv.org/abs/2503.18878',
            what: 'Score SAE features by reasoning-token specificity.',
            why: 'Dense-transformer precedent used by our Qwen3.5/3.6 pipeline.',
          },
        ],
      },
      {
        heading: 'Automated interpretability',
        papers: [
          {
            title: 'Language Models Can Explain Neurons in Language Models',
            authors: 'Bills et al. (OpenAI)',
            year: 2023,
            url: 'https://openaipublic.blob.core.windows.net/neuron-explainer/paper/index.html',
            what: 'GPT-4 writes and scores natural-language explanations for GPT-2 neurons.',
            why: 'Origin of the explain-and-simulate protocol behind every auto-interp tool.',
          },
          {
            title: 'A Multimodal Automated Interpretability Agent (MAIA)',
            authors: 'Shaham et al.',
            year: 2024,
            url: 'https://arxiv.org/abs/2404.14394',
            what: 'Agentic system that probes, perturbs, and writes explanations.',
            why: 'Current reference for fully automated feature audits.',
          },
          {
            title: 'Open Problems in Mechanistic Interpretability',
            authors: 'Sharkey et al.',
            year: 2025,
            url: 'https://arxiv.org/abs/2501.16496',
            what: 'Catalogs auto-interp reliability, fidelity scoring, and open bottlenecks.',
            why: 'Best single map of what auto-interp still cannot do.',
          },
        ],
      },
      {
        heading: 'Deception & safety monitoring',
        papers: [
          {
            title: 'Sleeper Agents: Training Deceptive LLMs That Persist Through Safety Training',
            authors: 'Hubinger et al. (Anthropic)',
            year: 2024,
            url: 'https://arxiv.org/abs/2401.05566',
            what: 'Trains backdoored models that retain the backdoor across standard safety training.',
            why: 'Motivates interpretability-based deception detection — and the follow-up showing it partially works.',
          },
          {
            title: 'Simple Probes Can Catch Sleeper Agents',
            authors: 'Mallen et al. (Anthropic)',
            year: 2024,
            url: 'https://www.anthropic.com/research/probes-catch-sleeper-agents',
            what: 'Shows that linear probes on residual streams detect "I am being deployed" features even in backdoored models.',
            why: 'Strongest empirical case that cheap probes catch deliberate deception.',
          },
        ],
      },
    ],
  },
]

export const paperCount = paperTopics.reduce(
  (sum, t) => sum + t.groups.reduce((s, g) => s + g.papers.length, 0),
  0
)
