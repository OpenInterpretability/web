/**
 * User feedback on a single Ekbasis call (the real-users study, docs/STUDY_REAL_USERS.md).
 * The caller names one of its own calls by the request id the gateway returned (X-Ekbasis-Request-Id)
 * and says whether the prediction was right, and whether it stopped them from doing something bad.
 *
 *   fb:rid:<rid>            owner of the request (written by lib/telemetry, 30 d)
 *   fb:done:<rid>           one feedback per request (SET NX, 400 d)
 *   fb:stream               XADD, ~100k most recent feedback entries (field "j" = JSON)
 *   fb:user:<uid>           that user's last 1000 entries
 *   fb:d:<YYYYMMDD>         per-day counters by verdict (400 d)    fb:total   lifetime counters by verdict
 *   fb:u:<uid>              lifetime counters by verdict for that user
 *   fb:rl:<uid>:<YYYYMMDD>  rate limit (attempts per UTC day, valid or not)
 *
 * Free: never metered. Only the verdict, the optional note the user typed, and metadata of the call are stored;
 * the request and response contents are never stored anywhere.
 */
import { getJSON, pipeline, redis, setNX, underLimit } from "@/lib/crypto-pay/redis"
import { dayKey, ridKey, RID_RE } from "@/lib/telemetry"

export const VERDICTS = ["correct", "wrong", "prevented_harm", "false_alarm"] as const
export type Verdict = (typeof VERDICTS)[number]
export const NOTE_MAX = 500
export const FEEDBACK_PER_DAY = 200

export type FeedbackEntry = {
  t: number
  rid: string
  uid: string
  verdict: Verdict
  note: string | null
  // metadata of the call the feedback is about (from the gateway's record)
  callT: number
  path: string
  status: number
}

export type FeedbackResult =
  | { ok: true; entry: FeedbackEntry }
  | { ok: false; status: 400 | 404 | 409 | 429; error: string }

/** Validates the JSON body. Returns the parsed fields or an error message. */
export function parseFeedbackBody(b: unknown): { rid: string; verdict: Verdict; note: string | null } | { error: string } {
  if (!b || typeof b !== "object" || Array.isArray(b)) return { error: "body must be a JSON object" }
  const o = b as Record<string, unknown>
  const rid = typeof o.request_id === "string" ? o.request_id.trim() : ""
  if (!RID_RE.test(rid)) return { error: "request_id must be the X-Ekbasis-Request-Id of one of your calls (req_ + 24 hex)" }
  if (typeof o.verdict !== "string" || !(VERDICTS as readonly string[]).includes(o.verdict)) {
    return { error: `verdict must be one of: ${VERDICTS.join(", ")}` }
  }
  let note: string | null = null
  if (o.note !== undefined && o.note !== null) {
    if (typeof o.note !== "string") return { error: "note must be a string" }
    // eslint-disable-next-line no-control-regex
    const clean = o.note.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    if (clean.length > NOTE_MAX) return { error: `note must be at most ${NOTE_MAX} characters` }
    note = clean || null
  }
  return { rid, verdict: o.verdict as Verdict, note }
}

/**
 * Records feedback from `uid` on request `rid`. Order matters:
 *   1. rate limit (counts every attempt, so request ids cannot be probed at volume);
 *   2. the request must exist and belong to this user — someone else's id gets the same 404 as an unknown one;
 *   3. one feedback per request.
 */
export async function submitFeedback(uid: string, body: unknown, now = Date.now()): Promise<FeedbackResult> {
  const day = dayKey(now)
  if (!(await underLimit(`fb:rl:${uid}:${day}`, FEEDBACK_PER_DAY, 2 * 86400))) {
    return { ok: false, status: 429, error: `rate limit: at most ${FEEDBACK_PER_DAY} feedback calls per day` }
  }
  const p = parseFeedbackBody(body)
  if ("error" in p) return { ok: false, status: 400, error: p.error }

  const owner = await getJSON<{ u: string; t: number; p: string; s: number }>(ridKey(p.rid))
  if (!owner || owner.u !== uid) {
    return { ok: false, status: 404, error: "unknown request id: not one of your calls, or older than 30 days (ids can take a few seconds to register)" }
  }
  if (!(await setNX(`fb:done:${p.rid}`, String(now), 400 * 86400))) {
    return { ok: false, status: 409, error: "feedback for this request was already recorded" }
  }
  const entry: FeedbackEntry = { t: now, rid: p.rid, uid, verdict: p.verdict, note: p.note, callT: owner.t, path: owner.p, status: owner.s }
  const j = JSON.stringify(entry)
  await pipeline([
    ["XADD", "fb:stream", "MAXLEN", "~", 100000, "*", "j", j],
    ["LPUSH", `fb:user:${uid}`, j], ["LTRIM", `fb:user:${uid}`, 0, 999],
    ["HINCRBY", `fb:d:${day}`, p.verdict, 1], ["EXPIRE", `fb:d:${day}`, 400 * 86400],
    ["HINCRBY", "fb:total", p.verdict, 1],
    ["HINCRBY", `fb:u:${uid}`, p.verdict, 1],
  ])
  return { ok: true, entry }
}

export type VerdictCounts = Record<Verdict, number>

export function toVerdictCounts(flat: unknown): VerdictCounts {
  const out = Object.fromEntries(VERDICTS.map((v) => [v, 0])) as VerdictCounts
  if (Array.isArray(flat)) {
    for (let i = 0; i < flat.length; i += 2) {
      const k = String(flat[i]) as Verdict
      if (k in out) out[k] = Number(flat[i + 1])
    }
  }
  return out
}

/** Latest feedback entries, newest first. */
export async function latestFeedback(count = 50): Promise<FeedbackEntry[]> {
  type Raw = [string, string[]][]
  const raw = (await redis<Raw>("XREVRANGE", "fb:stream", "+", "-", "COUNT", count)) ?? []
  return raw.map(([, fields]) => JSON.parse(fields[fields.indexOf("j") + 1]) as FeedbackEntry)
}
