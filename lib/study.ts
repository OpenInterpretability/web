/**
 * The real-users study (docs/STUDY_REAL_USERS.md): cohort, funnel and retention computed from telemetry.
 * Server-only, but with no Hexclave import, so it can be tested against a fake Redis: the route passes in the
 * account facts it reads from Hexclave (keys, sign-up time, internal flag).
 *
 * Definitions (the protocol cites these by name):
 *   call          a gateway request by the user that the model answered with 2xx (tel:uact / tel:ulog)
 *   active day    a UTC day with ≥1 call
 *   anchor (D0)   UTC day of redemption (cohort) or of sign-up (comparison group)
 *   D1            active on D0+1           D7   active on any day in D0+7..D0+13     D30  any day in D0+30..D0+36
 *                 null (censored) while the window has not fully elapsed
 *   funnel        redeemed → created a key → ≥1 call → active on ≥3 distinct days (each stage ⊂ the previous)
 *   adopted14     first call at or before anchor + 14 days (M2); null until those 14 days have passed
 */
import { pipeline, redis } from "@/lib/crypto-pay/redis"
import { dayKey, type CallRecord } from "@/lib/telemetry"
import { toVerdictCounts, type VerdictCounts } from "@/lib/feedback"

export const STUDY_COUPON = (process.env.STUDY_COUPON ?? "EKBASIS100").toUpperCase()
const DAY = 86400_000

export type Redemption = { uid: string; email: string | null; t: number; tokens: number }

/** Redeemers of a coupon, one per account (earliest redemption), oldest first. */
export async function readRedeemers(code = STUDY_COUPON): Promise<Redemption[]> {
  const raw = (await redis<string[]>("LRANGE", `cpn:log:${code}`, 0, -1)) ?? []
  const byUid = new Map<string, Redemption>()
  for (const r of raw) {
    const x = JSON.parse(r) as Redemption
    const prev = byUid.get(x.uid)
    if (!prev || x.t < prev.t) byUid.set(x.uid, x)
  }
  return [...byUid.values()].sort((a, b) => a.t - b.t)
}

export type Activity = {
  days: string[] // active UTC days, YYYYMMDD, ascending
  attempts: number // every gateway request attributed to the user (any status)
  calls: number // 2xx
  tokens: number
  errors: number
  firstOkAt: number | null
  lastAt: number | null
  feedback: VerdictCounts
}

const flatToObj = (flat: unknown): Record<string, string> => {
  const o: Record<string, string> = {}
  if (Array.isArray(flat)) for (let i = 0; i < flat.length; i += 2) o[String(flat[i])] = String(flat[i + 1])
  return o
}

/**
 * Activity per user from telemetry. Active days are the union of tel:uact (written since the study
 * instrumentation) and the 2xx events in tel:ulog (the last 200 events, for activity before it).
 */
export async function readActivity(uids: string[]): Promise<Map<string, Activity>> {
  const out = new Map<string, Activity>()
  if (uids.length === 0) return out
  const res = await pipeline(
    uids.flatMap((u) => [["HGETALL", `tel:uact:${u}`], ["HGETALL", `tel:u:${u}`], ["LRANGE", `tel:ulog:${u}`, 0, 199], ["HGETALL", `fb:u:${u}`]]),
  )
  uids.forEach((uid, i) => {
    const act = flatToObj(res[4 * i])
    const u = flatToObj(res[4 * i + 1])
    const log = (Array.isArray(res[4 * i + 2]) ? (res[4 * i + 2] as string[]) : []).map((j) => JSON.parse(j) as { t: number; status: number })
    const days = new Set(Object.keys(act).filter((d) => Number(act[d]) > 0))
    let okInLog = 0
    let firstOkLog: number | null = null
    for (const e of log) {
      if (e.status >= 200 && e.status < 300) {
        days.add(dayKey(e.t))
        okInLog++
        if (firstOkLog === null || e.t < firstOkLog) firstOkLog = e.t
      }
    }
    const okFromAct = Object.values(act).reduce((a, n) => a + Number(n), 0)
    out.set(uid, {
      days: [...days].sort(),
      attempts: Number(u.req ?? 0),
      calls: Math.max(okFromAct, okInLog),
      tokens: Number(u.tok ?? 0),
      errors: Number(u.err ?? 0),
      // tel:u.firstOk is set on the first 2xx after the instrumentation; earlier calls are only in tel:ulog.
      firstOkAt: u.firstOk ? Math.min(Number(u.firstOk), firstOkLog ?? Infinity) : firstOkLog,
      lastAt: u.last ? Number(u.last) : null,
      feedback: toVerdictCounts(res[4 * i + 3]),
    })
  })
  return out
}

/** A user's compact call records (newest first), for the export. */
export async function readCalls(uid: string, count = 10000): Promise<CallRecord[]> {
  const raw = (await redis<string[]>("LRANGE", `tel:ucalls:${uid}`, 0, count - 1)) ?? []
  return raw.map((r) => JSON.parse(r) as CallRecord)
}

const dayIndexOfKey = (k: string) => Date.UTC(Number(k.slice(0, 4)), Number(k.slice(4, 6)) - 1, Number(k.slice(6, 8))) / DAY
const dayIndexOfT = (t: number) => Math.floor(t / DAY)

/** D1 / D7 / D30 as defined above; null while the window is still open (censored). */
export function retention(anchorT: number, days: string[], now: number): { d1: boolean | null; d7: boolean | null; d30: boolean | null } {
  const d0 = dayIndexOfT(anchorT)
  const today = dayIndexOfT(now)
  const idx = new Set(days.map(dayIndexOfKey))
  const win = (from: number, to: number) => {
    if (today <= d0 + to) return null // the last day of the window has not ended yet
    for (let d = d0 + from; d <= d0 + to; d++) if (idx.has(d)) return true
    return false
  }
  return { d1: win(1, 1), d7: win(7, 13), d30: win(30, 36) }
}

/** Account facts the route reads from Hexclave. `exists: false` = the account was deleted. */
export type Account = {
  id: string
  email: string | null
  exists: boolean
  signedUpAt: number | null
  internal: boolean
  admin: boolean
  keyCreatedAt: number[]
}

export type StudyRow = {
  uid: string
  email: string | null
  anchorAt: number // redemption (cohort) or sign-up (comparison)
  excluded: null | "internal" | "admin" | "deleted"
  keys: number
  firstKeyAt: number | null
  calls: number
  attempts: number
  tokens: number
  errors: number
  activeDays: number
  firstOkAt: number | null
  lastAt: number | null
  d1: boolean | null
  d7: boolean | null
  d30: boolean | null
  adopted14: boolean | null
  feedback: VerdictCounts
}

export function exclusion(a: Account | undefined): StudyRow["excluded"] {
  if (!a || !a.exists) return "deleted"
  if (a.internal) return "internal"
  if (a.admin) return "admin"
  return null
}

export function buildRow(uid: string, email: string | null, anchorAt: number, account: Account | undefined, act: Activity | undefined, now: number): StudyRow {
  const days = act?.days ?? []
  const keys = account?.keyCreatedAt ?? []
  return {
    uid,
    email: account?.email ?? email,
    anchorAt,
    excluded: exclusion(account),
    keys: keys.length,
    firstKeyAt: keys.length ? Math.min(...keys) : null,
    calls: act?.calls ?? 0,
    attempts: act?.attempts ?? 0,
    tokens: act?.tokens ?? 0,
    errors: act?.errors ?? 0,
    activeDays: days.length,
    firstOkAt: act?.firstOkAt ?? null,
    lastAt: act?.lastAt ?? null,
    ...retention(anchorAt, days, now),
    adopted14: act?.firstOkAt != null && act.firstOkAt <= anchorAt + 14 * DAY ? true : now < anchorAt + 14 * DAY ? null : false,
    feedback: act?.feedback ?? toVerdictCounts(null),
  }
}

export type Funnel = {
  entered: number // redeemed (cohort) or signed up (comparison), after exclusions
  key: number
  call: number
  active3: number
  excluded: number
  retention: { d1: [number, number]; d7: [number, number]; d30: [number, number] } // [retained, eligible] among users with ≥1 call
  adopted14: [number, number] // M2: [first call within 14 days, eligible] among all entered
  feedback: VerdictCounts
  feedbackUsers: number
}

/** Strict funnel: each stage counts only users who passed the previous ones. Excluded rows are counted apart. */
export function funnel(rows: StudyRow[]): Funnel {
  const inc = rows.filter((r) => !r.excluded)
  const key = inc.filter((r) => r.keys > 0)
  const call = key.filter((r) => r.calls > 0)
  const active3 = call.filter((r) => r.activeDays >= 3)
  const ret = (k: "d1" | "d7" | "d30"): [number, number] => {
    const elig = call.filter((r) => r[k] !== null)
    return [elig.filter((r) => r[k] === true).length, elig.length]
  }
  const fb = toVerdictCounts(null)
  let feedbackUsers = 0
  for (const r of inc) {
    let any = false
    for (const v of Object.keys(fb) as (keyof VerdictCounts)[]) {
      fb[v] += r.feedback[v]
      if (r.feedback[v] > 0) any = true
    }
    if (any) feedbackUsers++
  }
  return {
    entered: inc.length,
    key: key.length,
    call: call.length,
    active3: active3.length,
    excluded: rows.length - inc.length,
    retention: { d1: ret("d1"), d7: ret("d7"), d30: ret("d30") },
    adopted14: [inc.filter((r) => r.adopted14 === true).length, inc.filter((r) => r.adopted14 !== null).length],
    feedback: fb,
    feedbackUsers,
  }
}

/** Runs `fn` over `items` with at most `n` in flight (Hexclave calls per user). */
export async function mapLimit<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++
        out[k] = await fn(items[k])
      }
    }),
  )
  return out
}
