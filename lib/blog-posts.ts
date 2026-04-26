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
