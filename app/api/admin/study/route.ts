/** GET: the real-users study — cohort funnel, comparison group, per-user rows and feedback (docs/STUDY_REAL_USERS.md). */
import { requireAdmin, ajson } from "@/lib/admin"
import { loadStudy } from "@/lib/study-server"
import { latestFeedback, toVerdictCounts } from "@/lib/feedback"
import { pipeline } from "@/lib/crypto-pay/redis"
import { dayKey } from "@/lib/telemetry"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const now = Date.now()
  const days = Array.from({ length: 30 }, (_, i) => dayKey(now - i * 86400_000)).reverse()
  const [study, latest, counters] = await Promise.all([
    loadStudy(now),
    latestFeedback(50),
    pipeline([["HGETALL", "fb:total"], ...days.map((d) => ["HGETALL", `fb:d:${d}`])]),
  ])
  const who = new Map<string, { email: string | null; group: "cohort" | "comparison" }>()
  for (const r of study.cohort.rows) who.set(r.uid, { email: r.email, group: "cohort" })
  for (const r of study.comparison.rows) who.set(r.uid, { email: r.email, group: "comparison" })
  return ajson({
    ...study,
    feedback: {
      total: toVerdictCounts(counters[0]),
      days: days.map((d, i) => ({ day: d, ...toVerdictCounts(counters[i + 1]) })),
      latest: latest.map((f) => ({ ...f, email: who.get(f.uid)?.email ?? null, group: who.get(f.uid)?.group ?? "other" })),
    },
  })
}
