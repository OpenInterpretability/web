import { changeQuantity } from "@/lib/credit-chunks"
/** GET ?query=&cursor=: users with balance and usage.  POST {email, name?, tokens?}: create a user. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson, audit, readJson } from "@/lib/admin"
import { userRows } from "@/lib/admin-users"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const sp = new URL(request.url).searchParams
  const page = await getHexclaveServerApp().listUsers({
    limit: Math.min(Number(sp.get("limit") ?? 50) || 50, 200),
    cursor: sp.get("cursor") ?? undefined,
    query: sp.get("query") || undefined,
    orderBy: sp.get("order") === "signedUpAt" ? "signedUpAt" : "lastActiveAt",
    desc: true,
  })
  return ajson({ users: await userRows(page), nextCursor: page.nextCursor })
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const b = await readJson<{ email: string; name: string; tokens: number }>(request)
  const email = String(b.email ?? "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ajson({ error: "valid email required" }, 400)
  const tokens = Math.max(0, Math.floor(Number(b.tokens ?? 0)))
  const app = getHexclaveServerApp()
  const existing = await app.listUsers({ query: email, limit: 5 })
  if (existing.some((u) => u.primaryEmail?.toLowerCase() === email)) return ajson({ error: "a user with this email already exists" }, 409)
  const user = await app.createUser({
    primaryEmail: email,
    primaryEmailAuthEnabled: true,
    otpAuthEnabled: true,
    primaryEmailVerified: false,
    displayName: b.name ? String(b.name).slice(0, 100) : undefined,
  })
  if (tokens > 0) await changeQuantity(await user.getItem("tokens"), tokens)
  await audit(admin, "user.create", user.id, { email, tokens })
  return ajson({ id: user.id })
}
