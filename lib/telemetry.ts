/**
 * Gateway telemetry for the admin console: every /api/v1 request becomes one event in a capped Redis
 * stream (the live feed) plus counters per minute, hour, day and user (the charts). Written after the
 * response is sent, so it never adds latency or fails a request.
 *
 *   tel:stream            XADD, ~20k most recent events (field "j" = JSON)
 *   tel:m:<YYYYMMDDHHmm>  per-minute counters (2 h)      tel:h:<YYYYMMDDHH>  per-hour (8 d)
 *   tel:d:<YYYYMMDD>      per-day counters (400 d)       tel:ud:<YYYYMMDD>   tokens per user that day (zset)
 *   tel:u:<userId>        lifetime counters per user     tel:ulog:<userId>   that user's last 200 events
 *
 * For the real-users study (docs/STUDY_REAL_USERS.md) — metadata only, never request or response contents:
 *   tel:uact:<userId>     hash UTC day -> successful (2xx) calls that day (400 d); distinct active days
 *   tel:ucalls:<userId>   that user's last 10k calls, compact and without IP/email (400 d)
 *   fb:rid:<requestId>    which user made the request (30 d), so feedback can be checked against its owner
 */
import { randomBytes } from "crypto"
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
  rid?: string // request id returned to the caller in X-Ekbasis-Request-Id (proxied calls only)
  cl?: string // client: the User-Agent, truncated (metadata only)
  sf?: string // surface the client says it called from (X-Ekbasis-Surface, e.g. "git-check"), validated
}

/** Compact per-call record kept for the study (no IP, no email, no contents). */
export type CallRecord = { t: number; rid: string | null; p: string; s: number; tok: number; ms: number; sf: string | null; cl: string | null }

/** Request ids are kept this long so a user can attach feedback to a call. */
export const RID_TTL_SECONDS = 30 * 86400
export const ridKey = (rid: string) => `fb:rid:${rid}`
export const RID_RE = /^req_[0-9a-f]{24}$/

/** `req_` + 24 hex chars: unguessable, so a request id cannot be used to probe someone else's calls. */
export function newRequestId(): string {
  return `req_${randomBytes(12).toString("hex")}`
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
    const call: CallRecord = { t: e.t, rid: e.rid ?? null, p: e.path, s: e.status, tok: e.tok, ms: e.ms, sf: e.sf ?? null, cl: e.cl ?? null }
    cmds.push(
      ["LPUSH", `tel:ucalls:${e.uid}`, JSON.stringify(call)], ["LTRIM", `tel:ucalls:${e.uid}`, 0, 9999], ["EXPIRE", `tel:ucalls:${e.uid}`, 400 * 86400],
    )
    if (e.status >= 200 && e.status < 300) {
      cmds.push(["HINCRBY", `tel:uact:${e.uid}`, dayKey(e.t), 1], ["EXPIRE", `tel:uact:${e.uid}`, 400 * 86400], ["HSETNX", u, "firstOk", e.t])
    }
    if (e.rid) {
      cmds.push(["SET", ridKey(e.rid), JSON.stringify({ u: e.uid, t: e.t, p: e.path, s: e.status }), "EX", RID_TTL_SECONDS])
    }
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
