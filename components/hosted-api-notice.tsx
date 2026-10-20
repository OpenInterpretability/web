import { Download } from "lucide-react"
import { HOSTED_API_DISCONTINUED_AT, MODEL_DOWNLOADS, SELF_HOST_QUICK_START } from "@/lib/hosted-api"

/** The notice every page that used to sell the hosted API shows instead: the API is gone, the model is downloadable. */
export function HostedApiNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl p-6 text-left ring-1 ring-amber-500/40 bg-amber-500/[0.06]">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        Hosted API discontinued · {HOSTED_API_DISCONTINUED_AT}
      </p>
      <p className="mt-2 text-ink-900/80 dark:text-ink-50/80">
        The hosted Ekbasis API no longer takes requests, and API keys and credits are no longer sold. Ekbasis is now
        download-only: the weights and the System One server are public on Hugging Face, and you run them yourself.
      </p>
      {!compact && (
        <>
          <ul className="mt-4 space-y-1.5 text-sm">
            {MODEL_DOWNLOADS.map((m) => (
              <li key={m.id}>
                <a href={m.url} className="font-medium text-brand-600 underline underline-offset-2 dark:text-brand-400">
                  {m.id}
                </a>{" "}
                <span className="text-ink-900/60 dark:text-ink-50/60">— {m.note}</span>
              </li>
            ))}
          </ul>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black/[0.04] p-4 text-xs leading-relaxed dark:bg-white/[0.06]">
            <code>{SELF_HOST_QUICK_START}</code>
          </pre>
        </>
      )}
      <a
        href={MODEL_DOWNLOADS[0].url}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        <Download className="h-4 w-4" /> Download the model
      </a>
    </div>
  )
}
