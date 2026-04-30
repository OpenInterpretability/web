'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Trophy, ScanEye, GitBranch, FileCode, Database, Cpu, BookOpen, GitPullRequest, Stethoscope, Radar,
} from 'lucide-react'

const items = [
  { href: '/probebench',                            label: 'Leaderboard',     icon: Trophy },
  { href: '/probebench/dimensions',                 label: 'Dimensions',      icon: Radar },
  { href: '/probebench/tasks',                      label: 'Tasks',           icon: Database },
  { href: '/probebench/models',                     label: 'Models',          icon: Cpu },
  { href: '/probebench/transfer-matrix',            label: 'Transfer matrix', icon: GitBranch },
  { href: '/probebench/eval-awareness',             label: 'Eval-awareness',  icon: ScanEye },
  { href: '/probebench/applications/medical-ai',    label: 'Medical AI',      icon: Stethoscope },
  { href: '/probebench/about',                      label: 'Methodology',     icon: BookOpen },
  { href: '/probebench/submit',                     label: 'Submit',          icon: GitPullRequest },
]

export function ProbeBenchSubnav() {
  const pathname = usePathname() ?? ''
  return (
    <div className="border-b border-black/5 dark:border-white/10 bg-ink-50/60 dark:bg-ink-950/60 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/probebench'
              ? pathname === '/probebench'
              : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={
                'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ' +
                (isActive
                  ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-1 ring-inset ring-brand-500/30'
                  : 'text-ink-900/60 dark:text-ink-50/60 hover:text-ink-900 dark:hover:text-ink-50 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]')
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
