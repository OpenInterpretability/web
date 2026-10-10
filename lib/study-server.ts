/**
 * Loads the real-users study for the admin console: the coupon cohort and the contemporaneous comparison group
 * (accounts that signed up since the coupon was created and did not redeem it), with account facts from
 * Hexclave and activity from telemetry. See lib/study.ts for the definitions.
 */
import { getHexclaveServerApp } from "@/hexclave/server"
import { isAdminEmail, isInternalAccount } from "@/lib/admin"
import { getCoupon } from "@/lib/coupons"
import { buildRow, funnel, mapLimit, readActivity, readRedeemers, STUDY_COUPON, type Account, type Funnel, type StudyRow } from "@/lib/study"

type HxUser = Awaited<ReturnType<ReturnType<typeof getHexclaveServerApp>["listUsers"]>>[number]

const MAX_USERS = 5000

async function allUsers(): Promise<HxUser[]> {
  const app = getHexclaveServerApp()
  const out: HxUser[] = []
  let cursor: string | undefined
  do {
    const page = await app.listUsers({ limit: 200, cursor, orderBy: "signedUpAt", desc: true })
    out.push(...page)
    cursor = page.nextCursor ?? undefined
  } while (cursor && out.length < MAX_USERS)
  return out
}

async function accountOf(u: HxUser | null, id: string): Promise<Account> {
  if (!u) return { id, email: null, exists: false, signedUpAt: null, internal: false, admin: false, keyCreatedAt: [] }
  const keys = await u.listApiKeys().catch(() => [])
  return {
    id,
    email: u.primaryEmail,
    exists: true,
    signedUpAt: u.signedUpAt.getTime(),
    internal: isInternalAccount(u),
    admin: isAdminEmail(u.primaryEmail),
    keyCreatedAt: keys.map((k) => (k.createdAt instanceof Date ? k.createdAt.getTime() : Number(k.createdAt))),
  }
}

export type StudyData = {
  generatedAt: number
  coupon: { code: string; createdAt: number | null; redemptions: number; maxRedemptions: number | null }
  cohort: { funnel: Funnel; rows: StudyRow[] }
  comparison: { funnel: Funnel; rows: StudyRow[]; since: number | null }
}

export async function loadStudy(now = Date.now()): Promise<StudyData> {
  const [coupon, redeemers, users] = await Promise.all([getCoupon(STUDY_COUPON), readRedeemers(STUDY_COUPON), allUsers()])
  const byId = new Map(users.map((u) => [u.id, u]))
  const cohortIds = new Set(redeemers.map((r) => r.uid))
  const since = coupon?.createdAt ?? null
  const others = since === null ? [] : users.filter((u) => !cohortIds.has(u.id) && u.signedUpAt.getTime() >= since)

  // Cohort members missing from the listing (beyond MAX_USERS, or deleted) are looked up one by one.
  const app = getHexclaveServerApp()
  const cohortAccounts = await mapLimit(redeemers, 8, async (r) => accountOf(byId.get(r.uid) ?? (await app.getUser(r.uid)), r.uid))
  const otherAccounts = await mapLimit(others, 8, (u) => accountOf(u, u.id))
  const activity = await readActivity([...redeemers.map((r) => r.uid), ...others.map((u) => u.id)])

  const cohortRows = redeemers.map((r, i) => buildRow(r.uid, r.email, r.t, cohortAccounts[i], activity.get(r.uid), now))
  const otherRows = others.map((u, i) => buildRow(u.id, u.primaryEmail, u.signedUpAt.getTime(), otherAccounts[i], activity.get(u.id), now))
  return {
    generatedAt: now,
    coupon: { code: STUDY_COUPON, createdAt: since, redemptions: redeemers.length, maxRedemptions: coupon?.maxRedemptions ?? null },
    cohort: { funnel: funnel(cohortRows), rows: cohortRows },
    comparison: { funnel: funnel(otherRows), rows: otherRows, since },
  }
}
