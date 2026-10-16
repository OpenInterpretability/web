import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, GitBranch, ExternalLink, Database, Boxes, BookOpen, FileText } from 'lucide-react'
import { site } from '@/lib/constants'
import { DataTable, Stats } from '@/components/ekbasis/data-table'
import {
  skopos, changed, confirm, guard, t3c, executed, confidentErrors, calibration, images, agentWorld, skoposBuilds, training,
  audit, upgrade, skoposLimits, scorecard, prelaunch, jev,
} from '@/lib/skopos-data'

const URL_ = `${site.url}/ekbasis/skopos`

export const metadata: Metadata = {
  title: `${skopos.name} — ${skopos.tagline}`,
  description: skopos.description,
  keywords: [
    'Ekbasis', 'Skopos', 'Ekbasis-Skopos-27B', 'world model', 'consequence model', 'agent safety', 'git guard',
    'calibrated prediction', 'open source model', 'OpenInterpretability',
  ],
  alternates: { canonical: '/ekbasis/skopos' },
  robots: skopos.draft ? { index: false, follow: false } : undefined,
  openGraph: { type: 'website', url: URL_, siteName: site.name, title: `${skopos.name} — ${skopos.tagline}`, description: skopos.description },
  twitter: { card: 'summary_large_image', title: `${skopos.name} — ${skopos.tagline}`, description: skopos.description },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${URL_}#model`,
      name: skopos.name,
      description: skopos.description,
      codeRepository: skopos.links.code,
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      url: URL_,
      isBasedOn: skopos.links.ekbasis27b,
    },
    { '@type': 'Dataset', '@id': `${URL_}#data`, name: 'ekbasis-skopos-data', url: skopos.links.dataset, license: `${skopos.links.dataset}#licenses-and-attribution` },
  ],
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-3 text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{children}</p>
)

export default function SkoposPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/ekbasis"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Ekbasis
      </Link>

      {skopos.draft && (
        <p className="mb-6 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/30">
          Private preview — not released. Pending: {skopos.pending.length ? skopos.pending.join('; ') : 'nothing'}.
        </p>
      )}

      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        NEW RELEASE · OPEN MODEL (APACHE-2.0) · OPEN DATA (PER-ROW LICENSES) · OPEN CODE
      </span>
      <h1 className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
        Ekbasis-Skopos-27B <span className="text-ink-900/40 dark:text-ink-50/40 font-normal">{skopos.greek}</span>
      </h1>
      <p className="mt-3 text-2xl font-medium tracking-tight text-balance">{skopos.tagline}</p>
      <p className="mt-5 text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed max-w-2xl text-balance">{skopos.lead}</p>
      <ul className="mt-5 max-w-2xl space-y-2">
        {skopos.highlights.map((h) => (
          <li key={h} className="rounded-xl bg-brand-500/5 p-3 ring-1 ring-brand-500/25 text-ink-900/80 dark:text-ink-50/80">
            {h}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-900/50 dark:text-ink-50/50">{skopos.status}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={skopos.links.model} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 text-sm font-medium">
          <Boxes className="h-4 w-4" /> Model · Hugging Face
        </a>
        <a href={skopos.links.dataset} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <Database className="h-4 w-4" /> Data
        </a>
        <a href={skopos.links.code} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-white dark:bg-white dark:text-ink-900 px-4 py-2 text-sm font-medium">
          <GitBranch className="h-4 w-4" /> Code
        </a>
        <a href={skopos.links.report} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <FileText className="h-4 w-4" /> Evaluation report
        </a>
        <a href={skopos.links.prereg} className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <ExternalLink className="h-4 w-4" /> Pre-registrations
        </a>
        <Link href="/ekbasis/start" className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-black/15 dark:ring-white/20 px-4 py-2 text-sm font-medium">
          <BookOpen className="h-4 w-4" /> Getting started
        </Link>
      </div>

      <Section id="what-changed" title="What changed from Ekbasis-27B">
        <P>{changed.caption}</P>
        <DataTable columns={changed.columns} rows={changed.rows} />
        {changed.notes.map((n) => (
          <P key={n}>{n}</P>
        ))}
        <div className="mt-6 rounded-xl ring-1 ring-black/10 dark:ring-white/15 p-5">
          <p className="font-semibold">{confirm.title}</p>
          <P>{confirm.caption}</P>
          <Stats stats={confirm.stats} />
        </div>
      </Section>

      <Section id="guard" title="A git guard with fewer false alarms">
        <P>{guard.caption}</P>
        <Stats stats={guard.stats} />
        <P>{t3c.caption}</P>
        <DataTable columns={t3c.columns} rows={t3c.rows} highlight={t3c.highlight} />
      </Section>

      <Section id="executed" title="What the new training adds">
        <P>{executed.caption}</P>
        <DataTable columns={executed.columns} rows={executed.rows} />
      </Section>

      <Section id="confident-errors" title="Confident errors">
        <P>{confidentErrors.caption}</P>
        <DataTable columns={confidentErrors.columns} rows={confidentErrors.rows} />
      </Section>

      <Section id="calibrated" title="Confidence you can act on">
        <P>{calibration.caption}</P>
        <DataTable columns={calibration.columns} rows={calibration.rows} />
        <P>{calibration.perBuildCaption}</P>
        <DataTable columns={calibration.perBuildColumns} rows={calibration.perBuildRows} />
      </Section>

      <Section id="images" title="Images">
        <P>{images.caption}</P>
        <Stats stats={images.stats} />
      </Section>

      <Section id="agentworldbench" title="On real agent trajectories">
        <P>{agentWorld.caption}</P>
        <DataTable columns={agentWorld.columns} rows={agentWorld.rows} />
      </Section>

      {prelaunch && (
        <Section id="pre-launch" title="Pre-launch evaluation">
          <P>{prelaunch.intro}</P>
          <p className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-500/30">
            {prelaunch.blocker}
          </p>
          <h3 className="mt-6 text-sm font-semibold text-ink-900 dark:text-ink-50">No release blocker</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
            {prelaunch.noBlocker.map((x) => <li key={x}>{x}</li>)}
          </ul>
          {prelaunch.flagged.length > 0 && (<>
            <h3 className="mt-6 text-sm font-semibold text-ink-900 dark:text-ink-50">Flagged (counts; Skopos worse by 2 or more)</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
              {prelaunch.flagged.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </>)}
          {prelaunch.borderline.length > 0 && (<>
            <h3 className="mt-6 text-sm font-semibold text-ink-900 dark:text-ink-50">Intervals that touch 0 (not blockers)</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
              {prelaunch.borderline.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </>)}
          {prelaunch.better.length > 0 && (<>
            <h3 className="mt-6 text-sm font-semibold text-ink-900 dark:text-ink-50">Better than Ekbasis-27B beyond the interval</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
              {prelaunch.better.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </>)}
          {prelaunch.appended.length > 0 && (
            <P>{`Supplementary checks that cannot block, appended to the evaluation report after release: ${prelaunch.appended.join('; ')}.`}</P>
          )}
          {prelaunch.notRun.length > 0 && (
            <P>{`Not run as published: ${prelaunch.notRun.join('; ')}.`}</P>
          )}
          {prelaunch.running.length > 0 && (
            <P>{`Still running at release; their results are appended to the evaluation report on completion: ${prelaunch.running.join('; ')}.`}</P>
          )}
        </Section>
      )}

      <Section id="builds" title="Pick the build that fits your machine">
        <P>{skoposBuilds.caption}</P>
        <DataTable columns={skoposBuilds.columns} rows={skoposBuilds.rows} />
      </Section>

      <Section id="upgrade" title="Upgrade">
        {upgrade.paragraphs.map((p) => (
          <P key={p}>{p}</P>
        ))}
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink-900 p-4 text-sm text-ink-50">
          <code>{upgrade.code}</code>
        </pre>
      </Section>

      {scorecard && (
        <Section id="scorecard" title="Scorecard for the hosted API">
          <P>{scorecard.caption}</P>
          <DataTable columns={scorecard.columns} rows={scorecard.rows} />
          {scorecard.neverTrained && (
            <p className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-500/30">
              {scorecard.neverTrained.caption}
            </p>
          )}
          <P>{scorecard.calCaption}</P>
          <DataTable columns={scorecard.calColumns} rows={scorecard.calRows} />
          <P>{scorecard.latCaption}</P>
          <DataTable columns={scorecard.latColumns} rows={scorecard.latRows} />
        </Section>
      )}

      {jev && (
        <Section id="general-evaluator" title="Against a general-purpose calibrated evaluator">
          <P>{jev.caption}</P>
          <DataTable columns={jev.columns} rows={jev.rows} />
          <DataTable columns={jev.scColumns} rows={jev.scRows} />
          <P>{jev.reading}</P>
        </Section>
      )}

      <Section id="data-and-code" title="Training data, code and checks — open, with the exceptions listed">
        {training.paragraphs.map((p) => (
          <P key={p}>{p}</P>
        ))}
        <DataTable columns={training.columns} rows={training.rows} />
        {audit.paragraphs.map((p) => (
          <P key={p}>{p}</P>
        ))}
      </Section>

      <Section id="limits" title="Honest scope">
        <ul className="mt-4 space-y-2 text-ink-900/75 dark:text-ink-50/75 list-disc pl-5">
          {skoposLimits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Section>
    </main>
  )
}
