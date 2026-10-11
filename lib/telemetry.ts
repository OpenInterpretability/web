/**
 * Gateway telemetry for the admin console: every /api/v1 request becomes one event in a capped Redis
 * stream (the live feed) plus counters per minute, hour, day and user (the charts). Written after the
 * response is sent, so it never adds latency or fails a request.
 *
 *   tel:stream            XADD, ~20k most recent events (field "j" = JSON)
 *   tel:h:<YYYYMMDDHH>    per-hour (8 d)                 (per-minute chart: read from the stream)
 *   tel:d:<YYYYMMDD>      per-day counters (400 d)       tel:ud:<YYYYMMDD>   tokens per user that day (zset)
 *   tel:u:<userId>        lifetime counters per user     (tel:ulog: no longer written since 10 Oct 2026)
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
  int?: 1 // the caller is one of our own accounts (serverMetadata.internal): kept in the stream only
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

/** Renew a TTL now and then instead of on every write (each EXPIRE is a billed Redis command); keys still expire. */
const sometimes = (p = 0.05) => Math.random() < p

export async function recordEvent(e: TelemetryEvent): Promise<void> {
  const j = JSON.stringify(e)
  const isErr = e.status >= 400
  const h = `tel:h:${hourKey(e.t)}`
  const d = `tel:d:${dayKey(e.t)}`
  const st = `s${e.status}`
  // The stream is the live feed and the per-minute chart (readMinutes); hour and day buckets keep only what the stream
  // cannot cover (requests per status, tokens, latency), and request/error totals are derived from the status counts.
  const cmds: (string | number)[][] = [["XADD", "tel:stream", "MAXLEN", "~", 20000, "*", "j", j]]
  if (e.rid && e.uid) {
    cmds.push(["SET", ridKey(e.rid), JSON.stringify({ u: e.uid, t: e.t, p: e.path, s: e.status }), "EX", RID_TTL_SECONDS])
  }
  // Our own accounts (studies, benchmarks) stay in the stream only: they would swamp the customer counters and the
  // real-users study, and cost most of the Redis commands.
  if (e.int) {
    await pipeline(cmds)
    return
  }
  cmds.push(["HINCRBY", h, st, 1], ["HINCRBY", h, "tok", e.tok], ["HINCRBY", d, st, 1], ["HINCRBY", d, "tok", e.tok], ["HINCRBY", d, "ms", e.ms])
  if (sometimes()) cmds.push(["EXPIRE", h, 8 * 86400], ["EXPIRE", d, 400 * 86400])
  if (e.uid) {
    const u = `tel:u:${e.uid}`
    const ud = `tel:ud:${dayKey(e.t)}`
    cmds.push(["HINCRBY", u, "req", 1], ["HINCRBY", u, "tok", e.tok], ["HSET", u, "last", e.t], ["ZINCRBY", ud, e.tok, e.uid])
    if (isErr) cmds.push(["HINCRBY", u, "err", 1])
    const call: CallRecord = { t: e.t, rid: e.rid ?? null, p: e.path, s: e.status, tok: e.tok, ms: e.ms, sf: e.sf ?? null, cl: e.cl ?? null }
    cmds.push(["LPUSH", `tel:ucalls:${e.uid}`, JSON.stringify(call)])
    if (sometimes(0.02)) cmds.push(["LTRIM", `tel:ucalls:${e.uid}`, 0, 9999])
    if (sometimes()) cmds.push(["EXPIRE", ud, 400 * 86400], ["EXPIRE", `tel:ucalls:${e.uid}`, 400 * 86400], ["EXPIRE", `tel:uact:${e.uid}`, 400 * 86400])
    if (e.status >= 200 && e.status < 300) {
      cmds.push(["HINCRBY", `tel:uact:${e.uid}`, dayKey(e.t), 1], ["HSETNX", u, "firstOk", e.t])
    }
  }
  await pipeline(cmds)
}

/** Requests, tokens and errors per minute for the last `minutes`, from the stream (oldest first); `externalOnly` leaves
 * out our own accounts (int=1). */
export async function readMinutes(now: number, minutes = 60, externalOnly = false): Promise<{ t: number; req: number; tok: number; err: number }[]> {
  const start = Math.floor(now / 60_000) * 60_000 - (minutes - 1) * 60_000
  type Raw = [string, string[]][]
  const raw = (await redis<Raw>("XRANGE", "tel:stream", String(start), "+", "COUNT", 20000)) ?? []
  const out = Array.from({ length: minutes }, (_, i) => ({ t: start + i * 60_000, req: 0, tok: 0, err: 0 }))
  for (const [, fields] of raw) {
    const ev = JSON.parse(fields[fields.indexOf("j") + 1]) as TelemetryEvent
    if (ev.path === "/health" || ev.path === "/v1/health") continue
    if (externalOnly && ev.int === 1) continue
    const i = Math.floor((ev.t - start) / 60_000)
    if (i < 0 || i >= minutes) continue
    out[i].req += 1
    out[i].tok += ev.tok || 0
    if (ev.status >= 400) out[i].err += 1
  }
  return out
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

function toCounters(flat: unknown, key = ""): Counters {
  const out: Counters = { req: 0, tok: 0, err: 0 }
  let sReq = 0
  let sErr = 0
  if (Array.isArray(flat)) {
    for (let i = 0; i < flat.length; i += 2) {
      const k = String(flat[i])
      const v = Number(flat[i + 1])
      out[k] = v
      if (/^s\d{3}$/.test(k)) {
        sReq += v
        if (Number(k.slice(1)) >= 400) sErr += v
      }
    }
  }
  // Since 10 Oct 2026 buckets count requests per status only (req/err are no longer written). Day buckets have always
  // counted every request per status, so their totals are the status sums; hour buckets had only req/err before, so
  // their totals are the old fields plus the status sums.
  if (key.startsWith("tel:d:")) {
    out.req = sReq || out.req
    out.err = sReq ? sErr : out.err
  } else if (key.startsWith("tel:h:")) {
    out.req = (out.req || 0) + sReq
    out.err = (out.err || 0) + sErr
  }
  return out
}

/** Counters for a list of bucket keys (one pipeline). */
export async function readCounters(keys: string[]): Promise<Counters[]> {
  const res = await pipeline(keys.map((k) => ["HGETALL", k]))
  return res.map((r, i) => toCounters(r, keys[i]))
}
