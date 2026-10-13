/** GET: whether the visitor is signed in, for the navbar (no email, no id: only a yes/no). */
import { cookies } from "next/headers"
import { getHexclaveServerApp } from "@/hexclave/server"

export const dynamic = "force-dynamic"

// Without one of Hexclave's session cookies the visitor is not signed in: answer without calling Hexclave (every page
// view of a visitor who is not signed in used to cost one call to it).
const SESSION_COOKIE = /^(hexclave|stack)-(refresh|access)/

export async function GET() {
  const jar = await cookies()
  if (!jar.getAll().some((c) => SESSION_COOKIE.test(c.name))) {
    return Response.json({ signedIn: false }, { headers: { "Cache-Control": "private, no-store" } })
  }
  const user = await getHexclaveServerApp().getUser().catch(() => null)
  return Response.json({ signedIn: Boolean(user) }, { headers: { "Cache-Control": "private, no-store" } })
}
