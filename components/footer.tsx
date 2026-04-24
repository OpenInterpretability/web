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
            Open research infrastructure for mechanistic interpretability. MIT + Apache-2.0.
          </p>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Pillars</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/observatory" className="hover:text-brand-600">Observatory</Link></li>
            <li><Link href="/laboratory" className="hover:text-brand-600">Laboratory</Link></li>
            <li><Link href="/watchtower" className="hover:text-brand-600">Watchtower</Link></li>
            <li><Link href="/academy" className="hover:text-brand-600">Academy</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Build</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/train" className="hover:text-brand-600">Train an SAE</Link></li>
            <li><Link href="/observatory/trace" className="hover:text-brand-600">Trace Theater</Link></li>
            <li><Link href="/playground" className="hover:text-brand-600">Playground</Link></li>
            <li><Link href="/models" className="hover:text-brand-600">SAE models</Link></li>
            <li><Link href="/benchmarks" className="hover:text-brand-600">Benchmarks</Link></li>
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
            <li><Link href="https://github.com/OpenInterpretability/cli" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">SDK (openinterp-cli)</Link></li>
            <li><Link href={site.huggingface} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">HuggingFace</Link></li>
            <li><Link href={site.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Twitter / X</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-ink-900/50 dark:text-ink-50/50 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} OpenInterpretability — MIT for code, CC-BY 4.0 for docs.</span>
          <span>Built in public.</span>
        </div>
      </div>
    </footer>
  )
}
