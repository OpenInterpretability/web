/**
 * Gateway telemetry for the admin console: every /api/v1 request becomes one event in a capped Redis
 * stream (the live feed) plus counters per minute, hour, day and user (the charts). Written after the
 * response is sent, so it never adds latency or fails a request.
 *
 *   tel:stream            XADD, ~20k most recent events (field "j" = JSON)
 *   tel:m:<YYYYMMDDHHmm>  per-minute counters (2 h)      tel:h:<YYYYMMDDHH>  per-hour (8 d)
 *   tel:d:<YYYYMMDD>      per-day counters (400 d)       tel:ud:<YYYYMMDD>   tokens per user that day (zset)
 *   tel:u:<userId>        lifetime counters per user     tel:ulog:<userId>   that user's last 200 events
 */
import { pipeline, redis } from "@/lib/crypto-pay/redis"

export type TelemetryEvent = {
  t: number
  uid: string | null
  email: string | null
  key: string | null // last 4 chars of the API key
  path: string
  status: number
  tok: number
  ms: number
  ip: string | null
  country: string | null
  err?: string
}

const pad = (n: number) => String(n).padStart(2, "0")
export function dayKey(t: number) {
  const d = new Date(t)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}
export function hourKey(t: number) {
  return `${dayKey(t)}${pad(new Date(t).getUTCHours())}`
}
export function minuteKey(t: number) {
  return `${hourKey(t)}${pad(new Date(t).getUTCMinutes())}`
}

export async function recordEvent(e: TelemetryEvent): Promise<void> {
  const j = JSON.stringify(e)
  const isErr = e.status >= 400 ? 1 : 0
  const m = `tel:m:${minuteKey(e.t)}`
  const h = `tel:h:${hourKey(e.t)}`
  const d = `tel:d:${dayKey(e.t)}`
  const cmds: (string | number)[][] = [
    ["XADD", "tel:stream", "MAXLEN", "~", 20000, "*", "j", j],
    ["HINCRBY", m, "req", 1], ["HINCRBY", m, "tok", e.tok], ["HINCRBY", m, "err", isErr], ["EXPIRE", m, 7200],
    ["HINCRBY", h, "req", 1], ["HINCRBY", h, "tok", e.tok], ["HINCRBY", h, "err", isErr], ["EXPIRE", h, 8 * 86400],
    ["HINCRBY", d, "req", 1], ["HINCRBY", d, "tok", e.tok], ["HINCRBY", d, "err", isErr], ["HINCRBY", d, "ms", e.ms],
    ["HINCRBY", d, `s${e.status}`, 1], ["EXPIRE", d, 400 * 86400],
  ]
  if (e.uid) {
    const u = `tel:u:${e.uid}`
    const ud = `tel:ud:${dayKey(e.t)}`
    cmds.push(
      ["HINCRBY", u, "req", 1], ["HINCRBY", u, "tok", e.tok], ["HINCRBY", u, "err", isErr], ["HSET", u, "last", e.t],
      ["ZINCRBY", ud, e.tok, e.uid], ["EXPIRE", ud, 400 * 86400],
      ["LPUSH", `tel:ulog:${e.uid}`, j], ["LTRIM", `tel:ulog:${e.uid}`, 0, 199],
    )
  }
  await pipeline(cmds)
}

/** Stream entries newer than `sinceId` (exclusive), oldest first; or the last `count` when no id is given. */
export async function readStream(sinceId: string | null, count = 100): Promise<{ id: string; e: TelemetryEvent }[]> {
  type Raw = [string, string[]][]
  const raw = sinceId
    ? await redis<Raw>("XRANGE", "tel:stream", `(${sinceId}`, "+", "COUNT", count)
    : (await redis<Raw>("XREVRANGE", "tel:stream", "+", "-", "COUNT", count)).reverse()
  return (raw ?? []).map(([id, fields]) => ({ id, e: JSON.parse(fields[fields.indexOf("j") + 1]) as TelemetryEvent }))
}

type Counters = { req: number; tok: number; err: number; ms?: number; [k: string]: number | undefined }

function toCounters(flat: unknown): Counters {
  const out: Counters = { req: 0, tok: 0, err: 0 }
  if (Array.isArray(flat)) for (let i = 0; i < flat.length; i += 2) out[String(flat[i])] = Number(flat[i + 1])
  return out
}

/** Counters for a list of bucket keys (one pipeline). */
export async function readCounters(keys: string[]): Promise<Counters[]> {
  const res = await pipeline(keys.map((k) => ["HGETALL", k]))
  return res.map(toCounters)
}
