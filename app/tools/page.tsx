import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { site } from '@/lib/constants'
import { safetyStack, toolGroups } from '@/lib/safety-stack'

export const metadata: Metadata = {
  title: 'Open tools for AI-agent safety and interpretability',
  description:
    'Every open tool of OpenInterpretability in one place: the agent safety stack (AgentGuard, Ekbasis), research instruments (openinterp-mcp, openinterp-lab, decision-locator), benchmarks (ProbeBench, InterpScore) and training (mechreward). Apache-2.0.',
  alternates: { canonical: '/tools' },
  openGraph: {
    type: 'website',
    url: `${site.url}/tools`,
    siteName: site.name,
    title: 'Open tools for AI-agent safety · OpenInterpretability',
    description: 'AgentGuard, Ekbasis, openinterp-mcp, ProbeBench and more — open source, measured, Apache-2.0.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@openinterp',
    title: 'Open tools for AI-agent safety · OpenInterpretability',
    description: 'AgentGuard, Ekbasis, openinterp-mcp, ProbeBench and more — open source, measured, Apache-2.0.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'OpenInterpretability open tools',
  itemListElement: toolGroups.flatMap((g) => g.tools).map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    url: t.href.startsWith('/') ? `${site.url}${t.href}` : t.href,
  })),
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/" className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">OPEN SOURCE · APACHE-2.0</span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">Tools</h1>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">
        What came out of the research, released so anyone can reproduce it, extend it, or use it to keep agents safe.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">The agent safety stack</h2>
        <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">Four questions before an agent acts; each layer sees what the others cannot.</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {safetyStack.map((l) => (
            <li key={l.layer}>
              <Link href={l.href} className={`block rounded-xl p-5 ring-1 h-full hover:ring-brand-500/40 transition-shadow ${l.isNew ? 'ring-brand-500/40 bg-brand-500/5' : 'ring-black/10 dark:ring-white/15'}`}>
                <span className="font-mono text-xs text-ink-900/45 dark:text-ink-50/45">{l.layer}</span>
                <p className="mt-2 font-semibold">{l.question}</p>
                <p className="mt-1 text-sm text-ink-900/65 dark:text-ink-50/65">{l.detail}</p>
                <p className="mt-3 text-xs font-semibold text-brand-700 dark:text-brand-300">{l.tool} →</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {toolGroups.map((g) => (
        <section key={g.group} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{g.group}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {g.tools.map((t) => {
              const external = !t.href.startsWith('/')
              const body = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t.name}</span>
                    {'isNew' in t && t.isNew ? (
                      <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/30 text-[10px] font-semibold uppercase">New</span>
                    ) : external ? (
                      <ArrowUpRight className="h-4 w-4 text-ink-900/40 dark:text-ink-50/40" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-ink-900/65 dark:text-ink-50/65 leading-relaxed">{t.what}</p>
                </>
              )
              const cls = 'group block card p-5 hover:ring-brand-500/40 transition-shadow'
              return external ? (
                <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
              ) : (
                <Link key={t.name} href={t.href} className={cls}>{body}</Link>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
