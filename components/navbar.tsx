import Link from 'next/link'
import { site } from '@/lib/constants'
import { Github } from 'lucide-react'

const nav = [
  { href: '/playground', label: 'Playground' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/models', label: 'Models' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/docs', label: 'Docs' },
  { href: '/research', label: 'Research' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/10 bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          <span className="text-sm sm:text-base">
            <span className="text-ink-900 dark:text-ink-50">Open</span>
            <span className="gradient-text">Interpretability</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Link
            href="/playground"
            className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Try it
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Logo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" className="text-brand-600" />
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" className="text-accent-500" />
      <circle cx="12" cy="12" r="1.5" className="fill-brand-600" />
    </svg>
  )
}
