import Link from 'next/link'
import { site } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="font-semibold tracking-tight">
            <span>Open</span>
            <span className="gradient-text">Interpretability</span>
          </div>
          <p className="mt-2 text-ink-900/60 dark:text-ink-50/60 leading-relaxed text-balance">
            Open research infrastructure for mechanistic interpretability. Apache-2.0.
          </p>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Products</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/playground" className="hover:text-brand-600">Playground</Link></li>
            <li><Link href="/catalog" className="hover:text-brand-600">Feature catalog</Link></li>
            <li><Link href="/models" className="hover:text-brand-600">SAE models</Link></li>
            <li><Link href="/benchmarks" className="hover:text-brand-600">Benchmarks</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Research</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href="/research" className="hover:text-brand-600">Papers & posts</Link></li>
            <li><Link href="/docs" className="hover:text-brand-600">Docs</Link></li>
            <li>
              <Link href="https://www.lesswrong.com/posts/H7mnTT7aPPijpjLAS/per-token-sae-features-as-online-rl-reward-breaking-the-g2" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                Per-token SAE-reward (LW)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink-900 dark:text-ink-50 mb-3">Community</div>
          <ul className="space-y-2 text-ink-900/60 dark:text-ink-50/60">
            <li><Link href={site.github} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">GitHub</Link></li>
            <li><Link href={site.huggingface} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">HuggingFace</Link></li>
            <li><Link href={site.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Twitter / X</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-ink-900/50 dark:text-ink-50/50 flex justify-between">
          <span>© {new Date().getFullYear()} {site.name} — Apache-2.0 for code, CC-BY 4.0 for docs.</span>
          <span>Built while waiting for Stage Gate 2 to finish.</span>
        </div>
      </div>
    </footer>
  )
}
