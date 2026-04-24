import { pillars } from '@/lib/pillars'
import { PillarLanding } from '@/components/pillar-landing'
import { site } from '@/lib/constants'
import Link from 'next/link'
import { Mail, Trophy, BookOpen, Archive } from 'lucide-react'

export const metadata = {
  title: 'Academy — OpenInterp',
  description:
    'Onboard the world to mechanistic interpretability. From "what is an activation" to "discover a new feature" in 90 minutes.',
}

export default function AcademyPage() {
  const pillar = pillars.find((p) => p.id === 'academy')!
  return (
    <PillarLanding pillar={pillar}>
      <div className="mt-16 card p-8 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          The student in Mumbai, on a phone, in 2 minutes.
        </h2>
        <p className="mt-4 text-base text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-3xl text-balance italic">
          "discovers a hallucination feature in GPT-5 that nobody has seen — publishes a mini-paper
          embedded in the platform — and has three DeepMind researchers commenting in real time."
        </p>
        <p className="mt-4 text-sm text-ink-900/60 dark:text-ink-50/60 max-w-3xl leading-relaxed">
          That's the north star for Academy. Everything — the 15-minute first Expedition, the
          mobile-first layout, the Olympics leaderboard, the Reproducibility Vault that never
          decays — is optimized toward that one scene.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <BookOpen className="h-5 w-5 text-amber-500 mb-2" />
          <h3 className="font-semibold text-sm">12 Expeditions</h3>
          <p className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
            Guided interactive tutorials, from "what is a residual stream?" to "discover an
            original feature in Qwen3.6." Validated checkpoints, badge awards.
          </p>
        </div>
        <div className="card p-5">
          <Trophy className="h-5 w-5 text-pink-500 mb-2" />
          <h3 className="font-semibold text-sm">Monthly Olympics</h3>
          <p className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
            Challenge + leaderboard + prizes. "Find the feature that makes Qwen3.6 hallucinate on
            medical QA." Kaggle for mech interp.
          </p>
        </div>
        <div className="card p-5">
          <Archive className="h-5 w-5 text-cyan-500 mb-2" />
          <h3 className="font-semibold text-sm">Repro Vault</h3>
          <p className="mt-1 text-xs text-ink-900/60 dark:text-ink-50/60 leading-relaxed">
            Every artifact hashed, pinned, and served forever. The interpretability
            reproducibility crisis — solved.
          </p>
        </div>
      </div>

      <div className="mt-10 card p-6">
        <h3 className="font-semibold">Lecture or contribute an Expedition?</h3>
        <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          We're building an Expedition author SDK. If you publish interpretability work and want a
          tutorial that lets readers re-derive your result interactively, email us.
        </p>
        <a
          href={`mailto:${site.contact}?subject=${encodeURIComponent('Academy contributor')}`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" /> Become a contributor
        </a>
      </div>
    </PillarLanding>
  )
}
