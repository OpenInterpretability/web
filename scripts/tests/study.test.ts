/**
 * Real-users study instrumentation against a fake Upstash (scripts/tests/mock-upstash.ts).
 *   npx -y tsx scripts/tests/study.test.ts
 * Proves: feedback on someone else's request id is rejected; one feedback per request; the daily rate limit;
 * the request-id mapping expires after 30 days; the cohort funnel and retention on a synthetic cohort.
 */
import assert from "node:assert/strict"
import { installMockUpstash } from "./mock-upstash"

const kv = installMockUpstash("http://kv.test")
const DAY = 86400_000

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`ok   ${name}`)
  } catch (e) {
    console.error(`FAIL ${name}\n`, e)
    process.exitCode = 1
  }
}

async function main() {
  // Imported after the env is set: lib/crypto-pay/redis reads KV_REST_API_URL at module load.
  const { recordEvent, newRequestId, RID_RE } = await import("../../lib/telemetry")
  const { submitFeedback, FEEDBACK_PER_DAY, latestFeedback } = await import("../../lib/feedback")
  const { createCoupon, redeem } = await import("../../lib/coupons")
  const { readRedeemers, readActivity, buildRow, funnel, retention } = await import("../../lib/study")
  type Account = import("../../lib/study").Account

  const ev = (uid: string, t: number, status = 200, rid: string | null = newRequestId()) => ({
    t, uid, email: `${uid}@x.test`, key: "abcd", path: "/v1/systemone", status, tok: 1200, ms: 300, ip: "203.0.113.9", country: "BR",
    ...(rid ? { rid } : {}), cl: "ekbasis-python/0.1.5", sf: "git-check",
  })

  await test("request ids are req_ + 24 hex and unique", async () => {
    const ids = new Set(Array.from({ length: 1000 }, newRequestId))
    assert.equal(ids.size, 1000)
    for (const id of ids) assert.match(id, RID_RE)
  })

  await test("recordEvent stores rid -> owner (30 d) and a compact call without IP/email", async () => {
    const rid = newRequestId()
    await recordEvent(ev("alice", Date.now(), 200, rid))
    const owner = JSON.parse(kv.exec(["GET", `fb:rid:${rid}`]) as string)
    assert.equal(owner.u, "alice")
    const ttl = (kv.exp.get(`fb:rid:${rid}`)! - kv.clock.now) / 1000
    assert.equal(ttl, 30 * 86400)
    const [call] = kv.exec(["LRANGE", "tel:ucalls:alice", 0, 0]) as string[]
    const c = JSON.parse(call)
    assert.equal(c.rid, rid)
    assert.equal(c.sf, "git-check")
    assert.ok(!("ip" in c) && !("email" in c), "compact call must not hold ip/email")
    const stream = kv.exec(["XREVRANGE", "tel:stream", "+", "-", "COUNT", 1]) as [string, string[]][]
    assert.equal(JSON.parse(stream[0][1][1]).rid, rid)
  })

  await test("feedback on someone else's request id is rejected (404, nothing stored)", async () => {
    const rid = newRequestId()
    await recordEvent(ev("alice", Date.now(), 200, rid))
    const r = await submitFeedback("mallory", { request_id: rid, verdict: "wrong", note: "not mine" })
    assert.equal(r.ok, false)
    assert.equal(!r.ok && r.status, 404)
    assert.equal(kv.exec(["GET", `fb:done:${rid}`]), null)
    // an id nobody made gets exactly the same answer
    const r2 = await submitFeedback("mallory", { request_id: newRequestId(), verdict: "wrong" })
    assert.deepEqual(r2, r)
    // the owner can still give feedback on it
    const ok = await submitFeedback("alice", { request_id: rid, verdict: "prevented_harm", note: "  it stopped a force-push  " })
    assert.equal(ok.ok, true)
    assert.equal(ok.ok && ok.entry.note, "it stopped a force-push")
    assert.equal(ok.ok && ok.entry.path, "/v1/systemone")
  })

  await test("one feedback per request (409); bad bodies are 400", async () => {
    const rid = newRequestId()
    await recordEvent(ev("alice", Date.now(), 200, rid))
    assert.equal((await submitFeedback("alice", { request_id: rid, verdict: "correct" })).ok, true)
    const dup = await submitFeedback("alice", { request_id: rid, verdict: "wrong" })
    assert.equal(!dup.ok && dup.status, 409)
    const rid2 = newRequestId()
    await recordEvent(ev("alice", Date.now(), 200, rid2))
    for (const body of [
      { request_id: rid2, verdict: "maybe" },
      { request_id: "req_123", verdict: "correct" },
      { request_id: rid2, verdict: "correct", note: "x".repeat(501) },
      { request_id: rid2, verdict: "correct", note: 5 },
      [rid2],
      null,
    ]) {
      const r = await submitFeedback("alice", body)
      assert.equal(!r.ok && r.status, 400, JSON.stringify(body))
    }
    assert.equal((await submitFeedback("alice", { request_id: rid2, verdict: "correct", note: "x".repeat(500) })).ok, true)
    const totals = kv.exec(["HGETALL", "fb:u:alice"]) as string[]
    assert.deepEqual(Object.fromEntries(totals.reduce<[string, string][]>((a, v, i) => (i % 2 ? a : [...a, [v, totals[i + 1]]]), [])), { prevented_harm: "1", correct: "2" })
    const latest = await latestFeedback(10)
    assert.equal(latest[0].rid, rid2)
  })

  await test(`rate limit: ${FEEDBACK_PER_DAY} attempts per user per UTC day, then 429; resets the next day; per user`, async () => {
    const now = Date.UTC(2026, 9, 10, 12)
    for (let i = 0; i < FEEDBACK_PER_DAY; i++) {
      const r = await submitFeedback("bob", { request_id: newRequestId(), verdict: "correct" }, now)
      assert.equal(!r.ok && r.status, 404) // unknown ids, but each attempt counts
    }
    const rid = newRequestId()
    await recordEvent(ev("bob", now, 200, rid))
    const limited = await submitFeedback("bob", { request_id: rid, verdict: "correct" }, now)
    assert.equal(!limited.ok && limited.status, 429)
    const other = await submitFeedback("carol", { request_id: newRequestId(), verdict: "correct" }, now)
    assert.equal(!other.ok && other.status, 404, "another user is not limited")
    const next = await submitFeedback("bob", { request_id: rid, verdict: "correct" }, now + DAY)
    assert.equal(next.ok, true, "a new UTC day resets the limit")
  })

  await test("request ids expire after 30 days", async () => {
    const rid = newRequestId()
    await recordEvent(ev("dave", kv.clock.now, 200, rid))
    kv.clock.now += 31 * DAY
    const r = await submitFeedback("dave", { request_id: rid, verdict: "correct" }, kv.clock.now)
    assert.equal(!r.ok && r.status, 404)
    kv.clock.now = Date.now()
  })

  await test("retention windows: D1 = day 1, D7 = days 7-13, D30 = days 30-36, null while open", async () => {
    const a = Date.UTC(2026, 9, 1, 15)
    const k = (d: number) => {
      const x = new Date(a + d * DAY)
      return `${x.getUTCFullYear()}${String(x.getUTCMonth() + 1).padStart(2, "0")}${String(x.getUTCDate()).padStart(2, "0")}`
    }
    assert.deepEqual(retention(a, [k(1), k(13), k(37)], a + 40 * DAY), { d1: true, d7: true, d30: false })
    assert.deepEqual(retention(a, [k(0), k(6), k(30)], a + 40 * DAY), { d1: false, d7: false, d30: true })
    assert.deepEqual(retention(a, [k(1)], a + 10 * DAY), { d1: true, d7: null, d30: null })
    assert.deepEqual(retention(a, [], a + 1 * DAY), { d1: null, d7: null, d30: null })
  })

  await test("funnel on a synthetic EKBASIS100 cohort", async () => {
    await createCoupon({ code: "EKBASIS100", tokens: 25_000_000, maxRedemptions: 100, expiresAt: null, active: true, note: "launch", createdAt: Date.now(), createdBy: "test" })
    const credit = async () => {}
    // u1: key, calls on 4 distinct days (incl. day 1 and day 8) -> active3, D1, D7
    // u2: key, calls on 2 days                                   -> call only
    // u3: key, only failed requests (402)                         -> key only
    // u4: no key                                                  -> redeemed only
    // u5: internal account with heavy use                         -> excluded
    // u6: key, 3 calls on the SAME day                            -> call, 1 active day
    // u7: admin                                                   -> excluded
    const uids = ["u1", "u2", "u3", "u4", "u5", "u6", "u7"]
    for (const uid of uids) assert.equal((await redeem("ekbasis100", { id: uid, primaryEmail: `${uid}@x.test` }, credit)).ok, true)
    assert.equal((await redeem("EKBASIS100", { id: "u1", primaryEmail: "u1@x.test" }, credit)).ok, false, "one redemption per account")

    const redeemers = await readRedeemers("EKBASIS100")
    assert.deepEqual(redeemers.map((r) => r.uid).sort(), uids)
    const t0 = redeemers[0].t
    const at = (d: number, h = 1) => t0 + d * DAY + h * 3600_000
    for (const d of [0, 1, 3, 8]) await recordEvent(ev("u1", at(d)))
    for (const d of [2, 2, 5]) await recordEvent(ev("u2", at(d)))
    for (const d of [0, 1, 2]) await recordEvent(ev("u3", at(d), 402, null))
    for (const d of [0, 1, 2, 3, 4]) await recordEvent(ev("u5", at(d)))
    for (const h of [1, 2, 3]) await recordEvent(ev("u6", at(4, h)))
    for (const d of [0, 1, 2]) await recordEvent(ev("u7", at(d)))

    const acct = (id: string, keys: number, extra: Partial<Account> = {}): Account => ({
      id, email: `${id}@x.test`, exists: true, signedUpAt: t0 - DAY, internal: false, admin: false,
      keyCreatedAt: Array.from({ length: keys }, (_, i) => t0 + i * 1000), ...extra,
    })
    const accounts: Record<string, Account> = {
      u1: acct("u1", 2), u2: acct("u2", 1), u3: acct("u3", 1), u4: acct("u4", 0),
      u5: acct("u5", 1, { internal: true }), u6: acct("u6", 1), u7: acct("u7", 1, { admin: true }),
    }
    const activity = await readActivity(uids)
    assert.deepEqual(activity.get("u2")!.days.length, 2)
    assert.equal(activity.get("u2")!.calls, 3)
    assert.equal(activity.get("u3")!.calls, 0)
    assert.equal(activity.get("u3")!.attempts, 3)
    assert.equal(activity.get("u6")!.days.length, 1)

    // feedback from u1 shows up in the cohort's counts
    const rid = newRequestId()
    await recordEvent(ev("u1", at(8, 5), 200, rid))
    assert.equal((await submitFeedback("u1", { request_id: rid, verdict: "wrong" })).ok, true)
    const activity2 = await readActivity(uids)

    const now = t0 + 40 * DAY
    const rows = redeemers.map((r) => buildRow(r.uid, r.email, r.t, accounts[r.uid], activity2.get(r.uid), now))
    const f = funnel(rows)
    assert.equal(f.excluded, 2)
    assert.equal(f.entered, 5)
    assert.equal(f.key, 4)
    assert.equal(f.call, 3)
    assert.equal(f.active3, 1)
    assert.deepEqual(f.retention.d1, [1, 3]) // u1 yes; u2 (days 2,5) and u6 (day 4) no
    assert.deepEqual(f.retention.d7, [1, 3])
    assert.deepEqual(f.retention.d30, [0, 3])
    assert.deepEqual(f.adopted14, [3, 5]) // u1, u2, u6 called within 14 days; u3 (only 402s) and u4 did not
    assert.equal(f.feedback.wrong, 1)
    assert.equal(f.feedbackUsers, 1)
    const u1 = rows.find((r) => r.uid === "u1")!
    assert.equal(u1.activeDays, 4)
    assert.equal(u1.firstKeyAt, t0)
    assert.equal(rows.find((r) => r.uid === "u5")!.excluded, "internal")
    assert.equal(rows.find((r) => r.uid === "u7")!.excluded, "admin")
    // a deleted account is excluded too
    assert.equal(buildRow("gone", null, t0, undefined, undefined, now).excluded, "deleted")
  })

  await test("active days fall back to tel:ulog for calls made before the instrumentation", async () => {
    const t = Date.UTC(2026, 8, 1, 10)
    for (const d of [0, 2, 4]) {
      kv.exec(["LPUSH", "tel:ulog:old", JSON.stringify({ t: t + d * DAY, uid: "old", path: "/v1/systemone", status: 200, tok: 10, ms: 1 })])
    }
    kv.exec(["LPUSH", "tel:ulog:old", JSON.stringify({ t: t + 6 * DAY, uid: "old", path: "/v1/systemone", status: 402, tok: 0, ms: 1 })])
    const a = (await readActivity(["old"])).get("old")!
    assert.equal(a.days.length, 3)
    assert.equal(a.calls, 3)
    assert.equal(a.firstOkAt, t)
    // a call after the instrumentation sets tel:u.firstOk to a later time; the first call stays the earlier one
    await recordEvent(ev("old", t + 20 * DAY))
    const b = (await readActivity(["old"])).get("old")!
    assert.equal(b.firstOkAt, t)
    assert.equal(b.days.length, 4)
  })

  console.log(`\n${passed} passed${process.exitCode ? ", some FAILED" : ""} · ${kv.calls.length} redis commands`)
}

void main()
