/**
 * Blog post metadata. Each post is a static route at /blog/{slug}/page.tsx.
 *
 * Adding a new post:
 *   1. Add an entry here (newest at the top).
 *   2. Create app/blog/{slug}/page.tsx with the rendered content.
 *   3. Optional: add og-image at /public/og/{slug}.png (1200×630) — falls back to default.
 */

export interface BlogPostMeta {
  slug: string
  title: string
  summary: string
  date: string                // ISO YYYY-MM-DD
  authors: string[]
  tags: string[]
  readingMinutes: number
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: 'a-detector-is-not-a-fix',
    title: 'A detector is not a fix: detecting agent WANDERING is easy, steering it back is not',
    summary:
      'Across three papers we learned to detect when a coding agent gives up mid-task (tool-entropy collapse, cross-architecture), to localize its mechanistic fingerprint (an L11 edge-layer drift, found by stability selection), and then — the humbling part — we tried to use that locus to rescue the agent and failed three times. Injecting the SUCCESS direction at the very layer that detects WANDERING best does not rescue it (paired McNemar p=0.73); it destabilizes the model into malformed tool calls (0→60% as the dose rises). A monitor is not a lever, even at the strongest locus. Includes the walk-back where a wrong baseline made the null look like a p=0.02 positive.',
    date: '2026-05-30',
    authors: ['Caio Vicentino', 'OpenInterpretability'],
    tags: ['agents', 'WANDERING', 'SWE-bench Pro', 'steering', 'causal', 'null-result', 'Qwen3.6-27B', 'agent-safety', 'methodology'],
    readingMinutes: 14,
  },
  {
    slug: 'tool-entropy-crypto-agent-failure-mode',
    title: 'Tool-Entropy Collapse: A Detectable Failure Mode for Crypto AI Agents',
    summary:
      'Three named crypto-agent exploits in May 2026 totaling ~$245M+ share a specific failure mode we call WANDERING: the agent loops on tool calls instead of finalizing. We detect it with a probe-free signal — Shannon entropy of the last 10 tool-call names — that reproduces cross-architecture (Qwen3.6-27B, Llama-70b, GPT-5) and ships today as the first monitoring eval in the Inspect AI register.',
    date: '2026-05-27',
    authors: ['Caio Vicentino', 'OpenInterpretability'],
    tags: ['agent-safety', 'tool-entropy', 'WANDERING', 'crypto-agents', 'SWE-bench', 'cross-architecture', 'Inspect AI'],
    readingMinutes: 12,
  },
  {
    slug: 'qwen36-27b-hallucination-replication',
    title: 'Entity-recognition features in Qwen3.6-27B — a replication, and a methodology lesson',
    summary:
      'AUROC 0.84 for the "I know this entity" feature on Qwen3.6-27B — vs Ferrando 2024\'s 0.73 on Gemma-2-2B-IT. Two-day arc with three controls: a tokenization confound that gave fake AUROC=1.0, single-feature steering that didn\'t move calibration, and multi-feature top-200 ablation that beats the random-K null at 4-8σ — but the LLM judge shows the "less hedging" is purely additional incorrect answers, not correct ones. We found a hallucination-induction mechanism, not a calibration knob.',
    date: '2026-04-25',
    authors: ['Caio Vicentino', 'OpenInterpretability'],
    tags: ['SAE', 'hallucination', 'Qwen3.6-27B', 'Ferrando 2024', 'methodology', 'steering', 'circuits', 'controls'],
    readingMinutes: 18,
  },
]

export function getPost(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
