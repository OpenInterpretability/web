import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Github,
  Terminal,
  ScrollText,
} from 'lucide-react'
import { REGISTRY_GITHUB } from '@/lib/atlas-registry'

export const metadata = {
  title: 'Submit to the Atlas · OpenInterp',
  description:
    'Two paths to publish a mechanistic-interpretability finding to the public Atlas — agent-callable via openinterp-mcp, or manual PR. Both end with a hashed manifest + optional Zenodo DOI.',
}

function Step({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-ink-900/80 dark:text-ink-50/80 font-medium text-sm">
        {n}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-ink-900 dark:text-ink-50">{title}</h3>
        <div className="text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">{children}</div>
      </div>
    </li>
  )
}

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="space-y-3 border-b border-black/10 dark:border-white/15 pb-10">
        <p className="text-sm uppercase tracking-wide text-ink-900/50 dark:text-ink-50/50">
          atlas / submit
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
          Submit to the Atlas
        </h1>
        <p className="max-w-3xl text-lg text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
          Two paths. Both end with the same artifact: a sha256-hashed manifest in the public
          registry, optionally with a Zenodo DOI, indexable by{' '}
          <Link href="/atlas" className="text-brand-600 dark:text-brand-400 underline-offset-2 hover:underline">
            /atlas
          </Link>.
        </p>
      </div>

      {/* Two paths side by side */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* Path A — Recommended: agent-callable */}
        <article className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-6 sm:p-8 relative">
          <div className="absolute top-4 right-4">
            <span className="chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30 ring-inset">
              Recommended
            </span>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Terminal className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">Path A — via your agent</h2>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            If you already ran the experiment via{' '}
            <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
              openinterp-mcp
            </code>{' '}
            on your Colab, you have everything needed. One Python call publishes the HF dataset,
            mints the Zenodo DOI, and opens the registry PR.
          </p>
          <pre className="mt-4 rounded-lg bg-ink-950 text-emerald-200 p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`from openinterp_mcp.publish import publish

publish(
  title="L31 hallucination probe — Qwen3.6-27B, cross-task AUROC 0.88",
  type="probe-result",          # or atlas-entry / adversarial-finding / replication
  model_id="Qwen/Qwen3.6-27B-Instruct",
  claim="One-line plain-language summary.",
  numbers={"auroc": 0.88, "n_samples": 200},
  methodology_check={"verdict": "weak-causal", "baselines_run": [...]},
  artifacts=["probe.joblib", "scaler.joblib"],
  hf_repo_id="myhandle/my-probe",
)
# Output:
#   manifest_sha256: 8d5df2d5d5252163...
#   HF dataset:      huggingface.co/datasets/myhandle/my-probe
#   Zenodo DOI:      10.5281/zenodo.XXXXX
#   Registry PR:     github.com/OpenInterpretability/registry/pull/XX`}
          </pre>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-start gap-2 text-ink-900/70 dark:text-ink-50/70">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Manifest sha256 computed canonically (same hash on re-run)</span>
            </li>
            <li className="flex items-start gap-2 text-ink-900/70 dark:text-ink-50/70">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Zenodo DOI minted if <code className="font-mono text-xs">ZENODO_TOKEN</code> in env</span>
            </li>
            <li className="flex items-start gap-2 text-ink-900/70 dark:text-ink-50/70">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>BibTeX auto-generated · citation tracking via Semantic Scholar wired in</span>
            </li>
            <li className="flex items-start gap-2 text-ink-900/70 dark:text-ink-50/70">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>CI validates schema + sha mismatch before merge</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5" /> First result in 10 min
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/mcp"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              MCP architecture
            </Link>
          </div>
        </article>

        {/* Path B — Manual */}
        <article className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/20 text-brand-600 dark:text-brand-400">
            <Github className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">Path B — manual PR</h2>
          <p className="mt-2 text-sm text-ink-900/70 dark:text-ink-50/70 leading-relaxed">
            If you didn&apos;t use openinterp-mcp (existing artifact, replication, or external
            methodology), write the JSON manifest by hand. The schema is intentionally minimal.
          </p>
          <ol className="mt-5 space-y-5">
            <Step n="1" title="Open a registry issue first">
              File the{' '}
              <a
                href={`${REGISTRY_GITHUB}/issues/new?template=atlas_entry.yml`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                Atlas entry proposal <ExternalLink className="h-3 w-3" />
              </a>{' '}
              with title, type, model, claim, and 1-line summary. Lets maintainers flag scope or
              duplication before you invest in the manifest.
            </Step>
            <Step n="2" title="Write the manifest">
              See the{' '}
              <a
                href={`${REGISTRY_GITHUB}/blob/main/schema.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                schema.json <ExternalLink className="h-3 w-3" />
              </a>{' '}
              for required + optional fields. Required: title, author, type, license,
              schema_version, created_at, manifest_sha256. Set <code className="font-mono text-xs">manifest_sha256: null</code>{' '}
              first; compute it canonically (next step).
            </Step>
            <Step n="3" title="Compute the canonical sha256">
              Build with the same Python module the MCP pipeline uses, so the hash is verifiable
              by reviewers:
              <pre className="mt-2 rounded-md bg-ink-950 text-emerald-200 p-3 text-[11px] font-mono overflow-x-auto">
{`from openinterp_mcp.publish.manifest import build_publication_manifest
m = build_publication_manifest(title=..., author=..., type=..., ...)
print(m.manifest_sha256)  # 64-char hex; slug = first 10 chars`}
              </pre>
            </Step>
            <Step n="4" title="Open the PR">
              Place the JSON at{' '}
              <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                atlas/{`<year>`}/{`<slug>`}.json
              </code>
              , append a one-line entry to{' '}
              <code className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                index.json
              </code>
              , bump <code className="font-mono text-xs">count</code> + <code className="font-mono text-xs">last_updated</code>. CI re-hashes and gates auto-merge.
            </Step>
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`${REGISTRY_GITHUB}/issues/new?template=atlas_entry.yml`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> Open proposal issue
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`${REGISTRY_GITHUB}/blob/main/CONTRIBUTING_TO_ATLAS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Contributing guide
            </a>
          </div>
        </article>
      </section>

      {/* Schema cheatsheet */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Schema cheatsheet</h2>
        <p className="text-sm text-ink-900/65 dark:text-ink-50/65 max-w-3xl mb-6">
          Both paths produce the same manifest shape. Fields below are normative; see{' '}
          <a
            href={`${REGISTRY_GITHUB}/blob/main/schema.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            schema.json
          </a>{' '}
          for the authoritative reference.
        </p>
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-semibold uppercase tracking-wider text-ink-900/55 dark:text-ink-50/55 border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="text-left px-4 py-3">Field</th>
                <th className="text-left px-4 py-3">Required</th>
                <th className="text-left px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {[
                ['title', '✓', '1–200 chars, plain language'],
                ['author', '✓', 'GitHub handle preferred'],
                ['type', '✓', 'probe-result / atlas-entry / adversarial-finding / replication / sae-feature'],
                ['license', '✓', 'apache-2.0 / mit / cc-by-4.0 / cc0'],
                ['model_id', 'when type=probe-result', 'e.g. Qwen/Qwen3.6-27B-Instruct'],
                ['claim', 'recommended', 'one-line plain-language summary'],
                ['numbers', 'optional', 'free-form dict of metrics (auroc, n, gap, …)'],
                ['artifacts', 'optional', 'filenames in the HF dataset'],
                ['methodology_check', 'optional', 'output of causality_protocol — verdict + baselines'],
                ['reproduces', 'when type=replication', 'paper slug being reproduced'],
                ['schema_version', '✓ (=1)', 'integer, currently fixed at 1'],
                ['created_at', '✓', 'ISO 8601 UTC, e.g. 2026-05-11T01:02:45Z'],
                ['manifest_sha256', '✓', '64-char hex, canonical content hash'],
              ].map(([field, req, notes]) => (
                <tr key={field} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-brand-600 dark:text-brand-400">{field}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-900/65 dark:text-ink-50/65">{req}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-900/70 dark:text-ink-50/70">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What gets accepted */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-3">What gets accepted</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
              Yes
            </div>
            <ul className="space-y-1.5 text-sm text-ink-900/70 dark:text-ink-50/70">
              <li>Probes with measurable AUROC + reproducer</li>
              <li>Causal verdicts (any class — incl. epiphenomenal)</li>
              <li>Honest-negative findings (walked-back claims)</li>
              <li>Replications (positive or negative)</li>
              <li>SAE features with auto-interp + max-activating examples</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
              Needs review
            </div>
            <ul className="space-y-1.5 text-sm text-ink-900/70 dark:text-ink-50/70">
              <li>Small-N findings (&lt; 50) without random-feature baseline</li>
              <li>Steering claims without control-token normalization</li>
              <li>Cross-model claims without per-model Pearson_CE</li>
              <li>Single-shot evaluations without N&gt;1 confidence</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">
              Not accepted
            </div>
            <ul className="space-y-1.5 text-sm text-ink-900/70 dark:text-ink-50/70">
              <li>Closed-weight artifacts (must be reproducible)</li>
              <li>Unhashed claims (manifest_sha256 required)</li>
              <li>Pure literature reviews (no novel measurement)</li>
              <li>Marketing claims without numbers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link
          href="/atlas"
          className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
        >
          ← Back to Atlas
        </Link>
        <span className="text-ink-900/40 dark:text-ink-50/40">·</span>
        <a
          href={`${REGISTRY_GITHUB}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-ink-900/65 dark:text-ink-50/65 hover:text-ink-900 dark:hover:text-ink-50"
        >
          <Github className="h-3.5 w-3.5" /> Registry on GitHub
        </a>
        <span className="text-ink-900/40 dark:text-ink-50/40">·</span>
        <a
          href="https://raw.githubusercontent.com/OpenInterpretability/registry/main/schema.json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-ink-900/65 dark:text-ink-50/65 hover:text-ink-900 dark:hover:text-ink-50 font-mono"
        >
          <ScrollText className="h-3.5 w-3.5" /> schema.json
        </a>
      </div>
    </main>
  )
}
