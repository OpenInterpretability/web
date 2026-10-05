import type { MetadataRoute } from 'next'
import { site } from '@/lib/constants'
import { probes } from '@/lib/probebench-data'
import { papers } from '@/lib/papers-content'

/**
 * Static + dynamic sitemap.
 *
 * Static routes are listed explicitly (mirrors app/ tree as of 2026-04-27).
 * ProbeBench dynamic routes (/probebench/probe/[id], /probebench/errors/[probe])
 * are emitted from the seed data so a new probe submission auto-populates the
 * sitemap on the next build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: Array<{
    path: string
    priority: number
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  }> = [
    // Top-level
    { path: '/',           priority: 1.0, changeFrequency: 'weekly' },
    { path: '/manifesto',  priority: 0.7, changeFrequency: 'monthly' },
    { path: '/roadmap',    priority: 0.7, changeFrequency: 'weekly' },
    { path: '/research',   priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contribute', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/docs',       priority: 0.7, changeFrequency: 'weekly' },
    { path: '/blog',       priority: 0.7, changeFrequency: 'weekly' },
    { path: '/blog/qwen36-27b-hallucination-replication', priority: 0.6, changeFrequency: 'monthly' },

    // Pillars
    { path: '/observatory',           priority: 0.9, changeFrequency: 'weekly' },
    { path: '/observatory/trace',     priority: 0.9, changeFrequency: 'weekly' },
    { path: '/observatory/circuits',  priority: 0.8, changeFrequency: 'weekly' },
    { path: '/observatory/atlas',     priority: 0.7, changeFrequency: 'monthly' },
    { path: '/observatory/compare',   priority: 0.7, changeFrequency: 'monthly' },
    { path: '/laboratory',            priority: 0.8, changeFrequency: 'weekly' },
    { path: '/laboratory/sandbox',    priority: 0.7, changeFrequency: 'monthly' },
    { path: '/laboratory/autointerp', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/laboratory/counterfactual', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/laboratory/recipes',    priority: 0.7, changeFrequency: 'monthly' },
    { path: '/watchtower',            priority: 0.8, changeFrequency: 'weekly' },
    { path: '/watchtower/firehose',   priority: 0.7, changeFrequency: 'daily' },
    { path: '/watchtower/audit',      priority: 0.7, changeFrequency: 'weekly' },
    { path: '/watchtower/watchlist',  priority: 0.7, changeFrequency: 'weekly' },
    { path: '/academy',               priority: 0.8, changeFrequency: 'weekly' },
    { path: '/academy/expeditions',   priority: 0.7, changeFrequency: 'monthly' },
    { path: '/academy/lectures',      priority: 0.7, changeFrequency: 'monthly' },
    { path: '/academy/olympics',      priority: 0.7, changeFrequency: 'monthly' },
    { path: '/academy/vault',         priority: 0.7, changeFrequency: 'monthly' },

    // Build / playground / catalog
    { path: '/train',       priority: 0.9, changeFrequency: 'weekly' },
    { path: '/playground',  priority: 0.7, changeFrequency: 'weekly' },
    { path: '/catalog',     priority: 0.7, changeFrequency: 'weekly' },
    { path: '/models',      priority: 0.8, changeFrequency: 'weekly' },
    { path: '/benchmarks',  priority: 0.7, changeFrequency: 'weekly' },

    // Standards / leaderboards
    { path: '/interpscore', priority: 0.8, changeFrequency: 'weekly' },

    // ProbeBench (static routes)
    { path: '/probebench',                  priority: 0.9, changeFrequency: 'weekly' },
    { path: '/probebench/about',            priority: 0.7, changeFrequency: 'monthly' },
    { path: '/probebench/submit',           priority: 0.8, changeFrequency: 'monthly' },
    { path: '/probebench/tasks',            priority: 0.7, changeFrequency: 'weekly' },
    { path: '/probebench/models',           priority: 0.7, changeFrequency: 'weekly' },
    { path: '/probebench/transfer-matrix',  priority: 0.7, changeFrequency: 'weekly' },
    { path: '/probebench/eval-awareness',   priority: 0.7, changeFrequency: 'weekly' },

    // Products and tools
    { path: '/tools',                       priority: 0.9, changeFrequency: 'weekly' },
    { path: '/ekbasis',                     priority: 0.9, changeFrequency: 'weekly' },
    { path: '/agentguard',                  priority: 0.9, changeFrequency: 'weekly' },
    { path: '/products/agentguard',         priority: 0.8, changeFrequency: 'weekly' },
    { path: '/products/agent-probe-guard',  priority: 0.8, changeFrequency: 'weekly' },
    { path: '/products/fabricationguard',   priority: 0.9, changeFrequency: 'weekly' },
    { path: '/mcp',                         priority: 0.7, changeFrequency: 'monthly' },
    { path: '/use',                         priority: 0.7, changeFrequency: 'monthly' },
    { path: '/start',                       priority: 0.7, changeFrequency: 'monthly' },
    { path: '/built-on',                    priority: 0.5, changeFrequency: 'monthly' },

    // Blog posts not listed above
    { path: '/blog/a-detector-is-not-a-fix',                  priority: 0.6, changeFrequency: 'monthly' },
    { path: '/blog/tool-entropy-crypto-agent-failure-mode',   priority: 0.6, changeFrequency: 'monthly' },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // probes[].release is a YYYY-MM-DD string, but draft entries may use
  // 'YYYY-MM-XX' placeholders — fall back to `now` when parsing fails.
  const safeDate = (s: string): Date => {
    const d = new Date(s)
    return isNaN(d.getTime()) ? now : d
  }

  const probeEntries: MetadataRoute.Sitemap = [
    ...probes.map((p) => ({
      url: `${site.url}/probebench/probe/${encodeURIComponent(p.id)}`,
      lastModified: safeDate(p.release),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...probes.map((p) => ({
      url: `${site.url}/probebench/errors/${p.id}`,
      lastModified: safeDate(p.release),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  // Research papers (each page carries Google Scholar citation_* tags)
  const paperEntries: MetadataRoute.Sitemap = papers.map((p) => ({
    url: `${site.url}/research/papers/${p.slug}`,
    lastModified: safeDate(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...paperEntries, ...probeEntries]
}
