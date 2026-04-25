import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { blogPosts } from '@/lib/blog-posts'

export const metadata = {
  title: 'Blog — OpenInterpretability',
  description:
    'Research notes, replications, and methodology lessons from the OpenInterpretability project. Honest writeups — including what didn\'t work the first time.',
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      <div className="mb-10">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-balance">Blog</h1>
        <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed text-balance">
          Research notes, replications, and methodology lessons. Including the runs where we got it
          wrong the first time — those tend to be the most useful posts.
        </p>
      </div>

      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block group card p-7 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-900/55 dark:text-ink-50/55 mb-3">
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
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-balance mb-3">
                {post.title}
              </h2>
              <p className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
                {post.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-block rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-ink-900/65 dark:text-ink-50/65"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {posts.length === 1 && (
        <p className="mt-10 text-xs text-ink-900/40 dark:text-ink-50/40 text-center font-mono">
          More posts coming as research lands. RSS / mailing list when there are 5+.
        </p>
      )}
    </div>
  )
}
