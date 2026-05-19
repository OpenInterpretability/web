import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ExternalLink, FileText, Calendar, User, BookOpen } from 'lucide-react'
import { papers, getPaper } from '@/lib/papers-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return papers.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const paper = getPaper(slug)
  if (!paper) return { title: 'Paper not found · OpenInterp' }
  return {
    title: `${paper.title} — OpenInterp`,
    description: paper.abstract.slice(0, 200),
  }
}

async function loadMarkdown(slug: string): Promise<string | null> {
  try {
    const path = join(process.cwd(), 'content', 'papers', `${slug}.md`)
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

const statusColors: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  'in-review': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/30',
  submitted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  published: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30',
}

export default async function PaperPage({ params }: PageProps) {
  const { slug } = await params
  const paper = getPaper(slug)
  if (!paper) notFound()

  const md = await loadMarkdown(slug)
  if (!md) notFound()

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* breadcrumb */}
      <Link
        href="/research"
        className="inline-flex items-center gap-1.5 text-sm text-ink-900/60 dark:text-ink-50/60 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Research
      </Link>

      {/* header */}
      <header className="mt-6 pb-8 border-b border-black/10 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`chip ring-inset ring-1 ${statusColors[paper.status] || statusColors.draft}`}
          >
            {paper.status}
          </span>
          {paper.tags?.map((t) => (
            <span
              key={t}
              className="chip bg-black/[0.04] dark:bg-white/[0.05] text-ink-900/60 dark:text-ink-50/60 ring-inset ring-1 ring-black/10 dark:ring-white/10"
            >
              {t}
            </span>
          ))}
        </div>

        <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
          {paper.title}
        </h1>
        {paper.subtitle ? (
          <p className="mt-3 text-lg sm:text-xl text-ink-900/70 dark:text-ink-50/70 text-balance leading-relaxed">
            {paper.subtitle}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-900/60 dark:text-ink-50/60">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {paper.authors}
            {paper.orcid ? (
              <a
                href={`https://orcid.org/${paper.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`ORCID iD ${paper.orcid}`}
                title={`ORCID iD ${paper.orcid}`}
                className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#A6CE39] hover:bg-[#A6CE39]/10"
              >
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[#A6CE39]" />
                ORCID
              </a>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {paper.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {paper.venue}
          </span>
        </div>

        {paper.artifacts && paper.artifacts.length > 0 ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {[...paper.artifacts]
              .sort((a, b) => {
                const aPdf = /\.pdf|zenodo/i.test(a.href + a.label) ? 0 : 1
                const bPdf = /\.pdf|zenodo/i.test(b.href + b.label) ? 0 : 1
                return aPdf - bPdf
              })
              .map((a) => {
                const isExternal = a.href.startsWith('http')
                const isPdf = /\.pdf|zenodo/i.test(a.href + a.label)
                const Tag: any = isExternal ? 'a' : Link
                const props: any = isExternal
                  ? { href: a.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: a.href }
                const cls = isPdf
                  ? 'inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md ring-1 ring-brand-700/50 hover:bg-brand-700 transition-colors'
                  : 'inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-colors'
                return (
                  <Tag key={a.href} {...props} className={cls}>
                    {isPdf ? <FileText className="h-4 w-4" /> : isExternal ? <ExternalLink className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {a.label}
                  </Tag>
                )
              })}
          </div>
        ) : null}
      </header>

      {/* content */}
      <div className="paper-prose mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </div>
    </article>
  )
}
