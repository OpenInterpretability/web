/**
 * The latest published versions of the Ekbasis clients, sent on every API answer (X-Ekbasis-Latest-Python,
 * X-Ekbasis-Latest-Js) so a client can tell its user, once a day, that an update exists. Read from PyPI and npm through
 * the data cache (one fetch an hour); never more than ~0.8 s on a cold cache, and nothing is sent if it fails.
 */
type Latest = { python?: string; js?: string }

let memo: { at: number; v: Latest } | null = null

async function get(url: string, pick: (d: unknown) => string | undefined): Promise<string | undefined> {
  try {
    const r = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(800) })
    if (!r.ok) return undefined
    const v = pick(await r.json())
    return typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v) ? v : undefined
  } catch {
    return undefined
  }
}

export async function latestClients(): Promise<Latest> {
  if (memo && Date.now() - memo.at < 3600_000) return memo.v
  const [python, js] = await Promise.all([
    get("https://pypi.org/pypi/ekbasis/json", (d) => (d as { info?: { version?: string } }).info?.version),
    get("https://registry.npmjs.org/ekbasis/latest", (d) => (d as { version?: string }).version),
  ])
  const v: Latest = { python, js }
  if (python || js) memo = { at: Date.now(), v }
  return v
}
