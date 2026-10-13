/** GET: whether the visitor is signed in, for the navbar (no email, no id: only a yes/no). */
import { getHexclaveServerApp } from "@/hexclave/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getHexclaveServerApp().getUser().catch(() => null)
  return Response.json({ signedIn: Boolean(user) }, { headers: { "Cache-Control": "private, no-store" } })
}
