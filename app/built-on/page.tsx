import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Built on — OpenInterp',
  description:
    'OpenInterp is the methodology + product layer above frontier-lab interpretability infrastructure. We extend Anthropic, DeepMind, Alibaba, Goodfire — we do not replicate their work.',
}

interface UpstreamItem {
  name: string
  date: string
  provider: string
  url: string
  what: string
  ourCoverage: string
  category: 'methodology' | 'sae' | 'tooling'
}

const upstream: UpstreamItem[] = [
  {
    name: 'Persona Vectors',
    date: 'Aug 2025',
    provider: 'Anthropic',
    url: 'https://www.anthropic.com/research/persona-features',
    what: 'Methodology for extracting persona-aligned linear directions from activations. Demonstrated on Claude 3.5 Sonnet at 7-8B scale internally.',
    ourCoverage: 'FabricationGuard productizes this methodology on Qwen3.6-27B reasoning. AUROC 0.88 cross-task on hallucination detection. Apache 2.0, ~1ms inference.',
    category: 'methodology',
  },
  {
    name: 'Tracing Thoughts',
    date: 'Mar 2025',
    provider: 'Anthropic',
    url: 'https://www.anthropic.com/research/tracing-thoughts-language-model',
    what: 'Internal-state introspection methodology to distinguish faithful from unfaithful reasoning via attribution graphs.',
    ourCoverage: 'ReasonGuard derives a deployable linear probe at L55/mid_think on Qwen3.6-27B. Honest narrow-scope finding (0.888 within math, 0.605 cross-domain).',
    category: 'methodology',
  },
  {
    name: 'Reasoning Models Don\'t Always Say What They Think',
    date: 'Apr 2025',
    provider: 'Anthropic',
    url: 'https://www.anthropic.com/research/reasoning-models-dont-say-think',
    what: 'Hint-injection methodology measuring CoT faithfulness. Found 25-41% strict faithfulness on Claude 3.7 / DeepSeek R1.',
    ourCoverage: 'CoTGuard v1 attempted hint-injection on Qwen3.6-27B + Claude Haiku judge — found 98.6% positive rate (judge too liberal). CoTGuard v2 will use causal-mediation methodology (Lanham 2023 truncation). Honest learning shipped publicly.',
    category: 'methodology',
  },
  {
    name: 'Gemma Scope',
    date: '2024',
    provider: 'DeepMind',
    url: 'https://huggingface.co/google/gemma-scope',
    what: 'Industrial-scale SAE suite for the Gemma family — Top-K + AuxK SAEs at every layer of every Gemma model, with feature labels.',
    ourCoverage: 'Cross-model probe transfer (planned Q4 2026): apply FabricationGuard methodology to Gemma 2B/9B using their SAE features. Compare AUROC across architectures.',
    category: 'sae',
  },
  {
    name: 'Qwen-Scope',
    date: 'Apr 2026',
    provider: 'Alibaba',
    url: 'https://huggingface.co/collections/Qwen/qwen-scope',
    what: 'Official SAE suite for the Qwen family — 14 SAEs covering Qwen3 (1.7B/8B/30B-A3B base) and Qwen3.5 (2B/9B/27B/35B-A3B base). W32K-W128K, L0_50/L0_100.',
    ourCoverage: 'Complementary coverage: Qwen-Scope ships base/MoE SAEs; OpenInterp ships SAEs for the post-trained reasoning variants (Qwen3.6-27B, Qwen3.6-35B-A3B). Q4 2026: ProbeBench will register Qwen-Scope SAEs as upstream substrates so external probes can target their features.',
    category: 'sae',
  },
  {
    name: 'OpenInterp paper-grade SAEs',
    date: 'Apr 2026',
    provider: 'OpenInterp',
    url: 'https://huggingface.co/caiovicentino1/qwen36-27b-sae-papergrade',
    what: 'First public SAEs for the Qwen3.6 reasoning-tuned series. Top-K + AuxK at L11/L31/L55, n=65k dictionary, k=128 sparsity, 200M tokens. Validated via InterpScore composite metric.',
    ourCoverage: 'Substrate for FabricationGuard, ReasonGuard, multi-probe DPO, multi-probe GRPO. Where Qwen-Scope stops (base / MoE base), we cover (reasoning).',
    category: 'sae',
  },
  {
    name: 'RLFR (Reinforcement Learning from Feature Rewards)',
    date: '2025',
    provider: 'Goodfire',
    url: 'https://goodfire.ai/',
    what: 'Methodology for using SAE features as reward signals in RLHF-style pipelines. Demonstrated on Llama 3.',
    ourCoverage: 'Inspired our multi-probe DPO and multi-probe GRPO pipelines. We extend by using probes (not steering vectors) and orthogonal-axis rewards (FG ⊥ RG, Pearson +0.014).',
    category: 'methodology',
  },
  {
    name: 'Sparse Feature Circuits',
    date: 'Jan 2024',
    provider: 'Marks et al. (ICLR 2025)',
    url: 'https://arxiv.org/abs/2403.19647',
    what: 'Methodology for discovering and editing interpretable causal graphs at SAE-feature level using attribution patching.',
    ourCoverage: 'Foundation for ProbeBench anti-Goodhart norms (random-K controls, three-way splits). Mentioned in paper-1 ICML submission.',
    category: 'methodology',
  },
  {
    name: 'Top-K + AuxK SAE',
    date: '2024',
    provider: 'Gao et al. (OpenAI)',
    url: 'https://arxiv.org/abs/2406.04093',
    what: 'Top-K SAE architecture with auxiliary k-dead-feature mitigation. Now standard for SAE training across labs.',
    ourCoverage: 'Used directly in our paper-grade Qwen3.6-27B and Qwen3.6-35B-A3B SAEs.',
    category: 'sae',
  },
  {
    name: 'Neuronpedia',
    date: '2024',
    provider: 'Decode Research',
    url: 'https://www.neuronpedia.org/',
    what: 'SAE feature encyclopedia for browsing, citing, and exporting features across model families.',
    ourCoverage: 'OpenInterp Atlas (Q3 2026) integrates with Neuronpedia for cross-model feature search. Symbiotic — they curate, we apply.',
    category: 'tooling',
  },
  {
    name: 'vLLM-Lens',
    date: 'Mar 2026',
    provider: 'UK AISI',
    url: 'https://github.com/AISI-Inspect/vllm-lens',
    what: 'vLLM plugin for residual stream extraction at inference time. Open-source infrastructure.',
    ourCoverage: 'OpenInterp vLLM plugin (planned Q3 2026) builds on top: applies probes at inference time using extracted activations. UK AISI ships infra; we ship the application layer.',
    category: 'tooling',
  },
]

const categoryStyle: Record<UpstreamItem['category'], { label: string; color: string }> = {
  methodology: {
    label: 'Methodology',
    color: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30',
  },
  sae: {
    label: 'SAE substrate',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30',
  },
  tooling: {
    label: 'Tooling / infra',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  },
}

export default function BuiltOnPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        BUILT ON · LINEAGE
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        We extend frontier-lab interpretability.
        <br />
        We do not replicate it.
      </h1>
      <p className="mt-6 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-3xl text-balance">
        OpenInterp is the methodology and product layer above the SAE infrastructure
        that Anthropic, DeepMind, Alibaba, and others already ship. Our job is to turn their
        research into <strong className="text-ink-900 dark:text-white">probes that ship</strong> and{' '}
        <strong className="text-ink-900 dark:text-white">standards that survive Goodhart</strong>.
        Apache 2.0 throughout. Anti-Goodhart by construction.
      </p>

      <div className="mt-12 grid gap-4">
        {upstream.map((item) => {
          const cat = categoryStyle[item.category]
          return (
            <article
              key={item.name}
              className="card p-6 sm:p-7 relative overflow-hidden hover:scale-[1.005] transition-transform"
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={`chip ${cat.color} ring-inset`}>{cat.label}</span>
                <span className="text-xs font-mono text-ink-900/50 dark:text-ink-50/50">
                  {item.provider} · {item.date}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl font-semibold tracking-tight">{item.name}</h2>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  source <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <p className="mt-3 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {item.what}
              </p>
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-900/50 dark:text-ink-50/50 mb-2">
                  How OpenInterp builds on it
                </div>
                <p className="text-sm text-ink-900/85 dark:text-ink-50/85 leading-relaxed">
                  {item.ourCoverage}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-14 card p-8 bg-gradient-to-br from-brand-500/5 to-accent-500/5">
        <h2 className="text-2xl font-semibold tracking-tight">What this means for us</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-900/80 dark:text-ink-50/80 leading-relaxed">
          <li className="flex gap-3">
            <span className="mt-1.5 shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
            <span>
              <strong>We do not train more SAEs unless there's a gap.</strong> Qwen-Scope covers
              base/MoE; we cover reasoning-tuned. Gemma Scope covers Gemma; we have not duplicated
              that work.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
            <span>
              <strong>We turn closed-source methodology into shippable probes.</strong> Anthropic
              describes Persona Vectors in a paper; FabricationGuard puts it on PyPI with
              cross-task validation.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
            <span>
              <strong>We register honest negatives.</strong> ReasonGuard's narrow-scope cross-domain
              limitation is on ProbeBench. CoTGuard v1's methodology failure is documented publicly.
              We do not spin numbers.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 shrink-0 font-mono text-brand-600 dark:text-brand-400">→</span>
            <span>
              <strong>We build the standards layer.</strong> ProbeBench is to probes what SAEBench
              is to SAEs — but with anti-Goodhart norms baked in (random-K, fresh-probe AUROC,
              three-way split, judge audit).
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/manifesto"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Read the manifesto
        </Link>
        <Link
          href="/research"
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          See our papers
        </Link>
        <Link
          href="/probebench"
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          Browse ProbeBench
        </Link>
      </div>
    </div>
  )
}
