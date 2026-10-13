/**
 * Public status data of the hosted Ekbasis API, written by the ekbasis-ops repository (GitHub Actions, measuring from
 * outside our infrastructure) through POST /api/ops/ingest and read by /ekbasis/status.
 *
 *   st:probe      list of probe records, newest first, last 30 days at one probe per 10 min (4,500 kept)
 *   st:score      list of daily scorecard records, newest first (400 kept)
 *   st:seen:<t>   dedupe of a record by its timestamp (35 days)
 *
 * Records hold only measurements (status, ms, server timing, scores): never a key or request content.
 */
import { pipeline, redis } from "@/lib/crypto-pay/redis"

export type Probe = { t: string; ok: boolean; status: number | null; ms: number; timing?: Record<string, number>; model?: string; right?: boolean; error?: string; src?: string }
export type Suite = { n: number; answered: number; failed: number; accuracy: number; confident_errors_per_100: number; ece: number; brier: number; p50_ms: number; p90_ms: number; tokens_per_check: number }
export type Score = {
  t: string
  tag?: string
  health?: { model?: string; version?: string }
  suites: Record<string, Suite>
  chains?: { chains: number; failed: number; exact: number; looks_per_100_actions: number; seconds_per_action: number }
  total?: { checks: number; failed: number; p50_ms: number; p90_ms: number; p99_ms: number; usd_per_1000_checks: number; tokens_per_check: number }
}

const PROBES_KEPT = 4500
const SCORES_KEPT = 400

function cleanProbe(r: Record<string, unknown>): Probe | null {
  if (typeof r.t !== "string" || typeof r.ms !== "number") return null
  const timing: Record<string, number> = {}
  for (const [k, v] of Object.entries((r.timing ?? {}) as Record<string, unknown>)) if (typeof v === "number" && /^[a-z]{1,12}$/.test(k)) timing[k] = v
  return {
    t: r.t, ok: r.ok === true, status: typeof r.status === "number" ? r.status : null, ms: r.ms, timing,
    model: typeof r.model === "string" ? r.model.slice(0, 64) : undefined,
    right: typeof r.right === "boolean" ? r.right : undefined,
    error: typeof r.error === "string" ? r.error.slice(0, 64) : undefined,
    src: r.src === "vercel" ? "vercel" : "github",
  }
}

function cleanScore(r: Record<string, unknown>): Score | null {
  if (typeof r.t !== "string" || !r.suites || typeof r.suites !== "object") return null
  const { t, tag, health, suites, chains, total } = r as unknown as Score
  return { t, tag: typeof tag === "string" ? tag.slice(0, 32) : undefined, health, suites, chains, total }
}

/** Store records not seen before; returns how many were new. */
export async function ingest(kind: "probe" | "score", records: Record<string, unknown>[]): Promise<number> {
  let added = 0
  for (const raw of records) {
    const rec = kind === "probe" ? cleanProbe(raw) : cleanScore(raw)
    if (!rec) continue
    const fresh = await redis<string | null>("SET", `st:seen:${kind}:${rec.t}`, "1", "NX", "EX", 35 * 86400)
    if (!fresh) continue
    const key = kind === "probe" ? "st:probe" : "st:score"
    await pipeline([
      ["LPUSH", key, JSON.stringify(rec)],
      ["LTRIM", key, 0, (kind === "probe" ? PROBES_KEPT : SCORES_KEPT) - 1],
    ])
    added++
  }
  return added
}

export async function readStatus(): Promise<{ probes: Probe[]; scores: Score[] }> {
  const [p, s] = (await pipeline([
    ["LRANGE", "st:probe", 0, PROBES_KEPT - 1],
    ["LRANGE", "st:score", 0, 89],
  ])) as (string[] | null)[]
  const parse = <T,>(xs: string[] | null) => (xs ?? []).map((x) => JSON.parse(x) as T)
  const probes = parse<Probe>(p).sort((a, b) => b.t.localeCompare(a.t))
  const scores = parse<Score>(s).sort((a, b) => b.t.localeCompare(a.t))
  return { probes, scores }
}
