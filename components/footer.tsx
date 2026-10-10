import Link from 'next/link'
import { site } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="font-semibold tracking-tight">
            <span>Open</span>
            <span className="gradient-text">Interpretability</span>
          </div>
          <p className="mt-2 text-ink-900/60 dark:text-ink-50/60 leading-relaxed text-balance">
            Ekbasis API: know what an action will do before your agent runs it. From an independent lab for
            AI-agent safety. Open weights, Apache-2.0.
          </p>
          <Link
            href="/console"
            className="mt-4 inline-flex items-center rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Get your API key
          </Link>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Ekbasis API</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/console" className="hover:text-brand-600">Console · sign in</Link></li>
            <li><Link href="/ekbasis/start" className="hover:text-brand-600">Getting started</Link></li>
            <li><Link href="/ekbasis/pricing" className="hover:text-brand-600">Pricing</Link></li>
            <li><a href="/ekbasis/agents.md" className="hover:text-brand-600">For agents (agents.md)</a></li>
            <li><Link href="/ekbasis" className="hover:text-brand-600">Results and models</Link></li>
            <li><Link href="https://github.com/OpenInterpretability/ekbasis" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Client and CLI</Link></li>
            <li><Link href="https://github.com/OpenInterpretability/ekbasis-cookbook" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Cookbook</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">The lab</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/lab" className="hover:text-brand-600">About the lab</Link></li>
            <li><Link href="/tools" className="hover:text-brand-600">Open tools</Link></li>
            <li><Link href="/observatory" className="hover:text-brand-600">Observatory</Link></li>
            <li><Link href="/probebench" className="hover:text-brand-600">ProbeBench</Link></li>
            <li><Link href="/interpscore" className="hover:text-brand-600">InterpScore</Link></li>
            <li><Link href="/academy" className="hover:text-brand-600">Academy</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Research</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/manifesto" className="hover:text-brand-600">Manifesto</Link></li>
            <li><Link href="/roadmap" className="hover:text-brand-600">Roadmap</Link></li>
            <li><Link href="/research" className="hover:text-brand-600">Papers & posts</Link></li>
            <li><Link href="/docs" className="hover:text-brand-600">Docs</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Community</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="https://github.com/OpenInterpretability" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">GitHub org</Link></li>
            <li><Link href="https://github.com/OpenInterpretability/notebooks" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Notebooks</Link></li>
            <li><Link href="https://github.com/OpenInterpretability/cli" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">SDK (openinterp)</Link></li>
            <li><Link href={site.huggingface} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">HuggingFace</Link></li>
            <li><Link href={site.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Twitter / X</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-ink-900/50 dark:text-ink-50/50 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} OpenInterpretability — Apache-2.0 for code, CC-BY 4.0 for docs.</span>
          <span>Built in public.</span>
        </div>
      </div>
    </footer>
  )
}
