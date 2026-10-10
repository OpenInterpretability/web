/**
 * GET: the study's analysis export (docs/STUDY_REAL_USERS.md, "Data export"). Pseudonymous: user ids are replaced
 * by an HMAC, emails are dropped, and only call metadata is included (never contents). Feedback notes are
 * included only with ?notes=1, since they are free text the user typed.
 */
import { createHmac } from "crypto"
import { requireAdmin, ajson, audit } from "@/lib/admin"
import { loadStudy } from "@/lib/study-server"
import { readCalls, type StudyRow } from "@/lib/study"
import { redis } from "@/lib/crypto-pay/redis"
import type { FeedbackEntry } from "@/lib/feedback"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const withNotes = new URL(request.url).searchParams.get("notes") === "1"
  const secret = process.env.STUDY_EXPORT_SECRET ?? process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!secret) return ajson({ error: "STUDY_EXPORT_SECRET is not set" }, 503)
  const pid = (uid: string) => `p_${createHmac("sha256", secret).update(uid).digest("hex").slice(0, 16)}`

  const study = await loadStudy()
  const rows = [
    ...study.cohort.rows.map((r) => ({ group: "cohort" as const, r })),
    ...study.comparison.rows.map((r) => ({ group: "comparison" as const, r })),
  ]
  const users = rows.map(({ group, r }) => {
    const { uid, email: _email, ...rest } = r as StudyRow
    return { pid: pid(uid), group, ...rest }
  })
  const calls: Record<string, unknown[]> = {}
  const feedback: unknown[] = []
  for (const { r } of rows) {
    if (r.excluded) continue
    calls[pid(r.uid)] = (await readCalls(r.uid)).map(({ rid: _rid, ...c }) => c)
    const fb = ((await redis<string[]>("LRANGE", `fb:user:${r.uid}`, 0, 999)) ?? []).map((j) => JSON.parse(j) as FeedbackEntry)
    for (const f of fb) {
      feedback.push({ pid: pid(f.uid), t: f.t, verdict: f.verdict, callT: f.callT, path: f.path, status: f.status, ...(withNotes ? { note: f.note } : { hasNote: Boolean(f.note) }) })
    }
  }
  await audit(admin, "study.export", study.coupon.code, { users: users.length, notes: withNotes })
  return ajson({ generatedAt: study.generatedAt, coupon: study.coupon, funnels: { cohort: study.cohort.funnel, comparison: study.comparison.funnel }, users, calls, feedback })
}
