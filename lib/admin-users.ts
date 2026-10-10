/** Shapes the admin console shows for a user (server-only). */
import { pipeline } from "@/lib/crypto-pay/redis"

type U = {
  id: string
  displayName: string | null
  primaryEmail: string | null
  primaryEmailVerified: boolean
  signedUpAt: Date
  lastActiveAt: Date
  isRestricted: boolean
  restrictedReason: unknown
  serverMetadata: unknown
  getItem(id: string): Promise<{ quantity: number }>
}

export async function userRows(users: U[]) {
  const [balances, usage] = await Promise.all([
    Promise.all(users.map((u) => u.getItem("tokens").then((i) => i.quantity).catch(() => null))),
    pipeline(users.map((u) => ["HGETALL", `tel:u:${u.id}`])),
  ])
  return users.map((u, i) => {
    const flat = usage[i]
    const c: Record<string, number> = {}
    if (Array.isArray(flat)) for (let k = 0; k < flat.length; k += 2) c[String(flat[k])] = Number(flat[k + 1])
    const meta = (u.serverMetadata ?? {}) as { adminNote?: string; internal?: unknown }
    return {
      id: u.id,
      name: u.displayName,
      email: u.primaryEmail,
      verified: u.primaryEmailVerified,
      signedUpAt: u.signedUpAt.getTime(),
      lastActiveAt: u.lastActiveAt.getTime(),
      restricted: u.isRestricted,
      restrictedReason: u.restrictedReason ?? null,
      note: meta.adminNote ?? "",
      internal: meta.internal === true,
      balance: balances[i],
      requests: c.req ?? 0,
      tokensUsed: c.tok ?? 0,
      errors: c.err ?? 0,
      lastRequestAt: c.last ?? null,
    }
  })
}
