'use client'

import Link from 'next/link'
import { site } from '@/lib/constants'
import { Github, Menu, X, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const primaryNav = [
  { href: '/train', label: 'Train' },
  { href: '/observatory', label: 'Observatory' },
  { href: '/laboratory', label: 'Laboratory' },
  { href: '/watchtower', label: 'Watchtower' },
  { href: '/academy', label: 'Academy' },
]

const secondaryNav = [
  { href: '/interpscore', label: 'Leaderboard' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/research', label: 'Research' },
  { href: '/docs', label: 'Docs' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  type Theme = 'light' | 'dark'

  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null

    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = systemDark ? 'dark' : 'light'

      setTheme(initial)
      document.documentElement.classList.toggle('dark', systemDark)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'

    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/10 bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          <span className="text-sm sm:text-base">
            <span className="text-ink-900 dark:text-ink-50">Open</span>
            <span className="gradient-text">Interpretability</span>
          </span>
        </Link>

        {/* Primary (pillars) */}
        <ul className="hidden lg:flex items-center gap-5 text-sm">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li aria-hidden className="h-4 w-px bg-black/10 dark:bg-white/10" />
          {secondaryNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-ink-900/50 dark:text-ink-50/50 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
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
            href="/observatory/trace"
            className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Open Trace Theater
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-black/5 dark:border-white/10 bg-ink-50/95 dark:bg-ink-950/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="grid gap-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1.5 pt-2">
                Pillars
              </div>
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium text-ink-900 dark:text-ink-50 hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ))}
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1.5 pt-4">
                More
              </div>
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm text-ink-900/70 dark:text-ink-50/70 hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ))}
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/40 dark:text-ink-50/40 mb-1.5 pt-4">
                Classic
              </div>
              {[
                { href: '/playground', label: 'Playground' },
                { href: '/catalog', label: 'Catalog' },
                { href: '/models', label: 'Models' },
                { href: '/benchmarks', label: 'Benchmarks' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm text-ink-900/60 dark:text-ink-50/60"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
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
