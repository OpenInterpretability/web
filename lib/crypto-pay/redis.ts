/** Minimal Upstash Redis REST client (the Vercel integration sets KV_REST_API_URL / KV_REST_API_TOKEN). */

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export function redisConfigured(): boolean {
  return Boolean(URL_ && TOKEN)
}

export async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  if (!URL_ || !TOKEN) throw new Error("payments store not configured")
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command.map(String)),
    cache: "no-store",
  })
  const d = (await r.json()) as { result?: T; error?: string }
  if (!r.ok || d.error) throw new Error(`redis: ${d.error ?? r.status}`)
  return d.result as T
}

/** SET key value NX [EX seconds] — true only for the first writer. This is the double-credit guard. */
export async function setNX(key: string, value: string, exSeconds?: number): Promise<boolean> {
  const args: (string | number)[] = ["SET", key, value, "NX"]
  if (exSeconds) args.push("EX", exSeconds)
  return (await redis<string | null>(...args)) === "OK"
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const v = await redis<string | null>("GET", key)
  return v ? (JSON.parse(v) as T) : null
}

export async function setJSON(key: string, value: unknown, exSeconds: number): Promise<void> {
  await redis("SET", key, JSON.stringify(value), "EX", exSeconds)
}

/** Fixed-window rate limit: true while the caller is under `limit` hits per `windowSeconds`. */
export async function underLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const n = await redis<number>("INCR", key)
  if (n === 1) await redis("EXPIRE", key, windowSeconds)
  return n <= limit
}

/** Several commands in one round trip (Upstash /pipeline). Each entry is [result] or throws on transport error. */
export async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
  if (!URL_ || !TOKEN) throw new Error("payments store not configured")
  if (commands.length === 0) return []
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands.map((c) => c.map(String))),
    cache: "no-store",
  })
  if (!r.ok) throw new Error(`redis pipeline: HTTP ${r.status}`)
  const d = (await r.json()) as { result?: unknown; error?: string }[]
  return d.map((x) => (x.error ? null : x.result))
}
