/**
 * Admin gate for /console/admin and /api/admin/*. Checked on the server for every request:
 *   - signed in with Hexclave, primary email in ADMIN_EMAILS and VERIFIED, account not restricted;
 *   - mutating requests must come from our own origin (Origin header), on top of the JSON-only bodies.
 * Anyone else gets a 404, so the admin surface does not reveal that it exists.
 * Every admin mutation is written to an audit log (adm:audit, last 5000 entries).
 */
import { getHexclaveServerApp } from "@/hexclave/server"
import { pipeline, redis } from "@/lib/crypto-pay/redis"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "caiosanford@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

const H = { "Cache-Control": "private, no-store" }
export const ajson = (obj: unknown, status = 200) => Response.json(obj, { status, headers: H })
export const notFound = () => ajson({ error: "not found" }, 404)

type AdminUser = NonNullable<Awaited<ReturnType<ReturnType<typeof getHexclaveServerApp>["getUser"]>>>

/** True for the configured admin emails (the study excludes them from every cohort). */
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()))
}

/** Accounts marked internal (serverMetadata.internal === true) are ours: excluded from the real-users study. */
export function isInternalAccount(user: { serverMetadata: unknown }): boolean {
  const m = user.serverMetadata
  return Boolean(m && typeof m === "object" && (m as { internal?: unknown }).internal === true)
}

export function isAdminUser(user: { primaryEmail: string | null; primaryEmailVerified: boolean; isRestricted: boolean } | null): boolean {
  return Boolean(
    user && user.primaryEmail && user.primaryEmailVerified && !user.isRestricted && ADMIN_EMAILS.includes(user.primaryEmail.toLowerCase()),
  )
}

/** The signed-in admin, or null (for server components: render notFound()). */
export async function currentAdmin(): Promise<AdminUser | null> {
  const user = await getHexclaveServerApp().getUser()
  return user && isAdminUser(user) ? user : null
}

/** For route handlers: the admin, or a 404 Response to return as is. */
export async function requireAdmin(request: Request): Promise<AdminUser | Response> {
  const admin = await currentAdmin()
  if (!admin) return notFound()
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin")
    const self = new URL(request.url).origin
    const allowed = new Set([self, process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://openinterp.org"])
    if (!origin || !allowed.has(origin)) return ajson({ error: "bad origin" }, 403)
    const ct = request.headers.get("content-type") ?? ""
    if (request.method !== "DELETE" && !ct.includes("application/json")) return ajson({ error: "json only" }, 415)
  }
  return admin
}

export type AuditEntry = { t: number; admin: string; action: string; target: string; detail?: unknown }

export async function audit(admin: { primaryEmail: string | null }, action: string, target: string, detail?: unknown) {
  const e: AuditEntry = { t: Date.now(), admin: admin.primaryEmail ?? "?", action, target, detail }
  await pipeline([["LPUSH", "adm:audit", JSON.stringify(e)], ["LTRIM", "adm:audit", 0, 4999]])
}

export async function readAudit(count = 200): Promise<AuditEntry[]> {
  const raw = (await redis<string[]>("LRANGE", "adm:audit", 0, count - 1)) ?? []
  return raw.map((r) => JSON.parse(r) as AuditEntry)
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return {}
  }
}
