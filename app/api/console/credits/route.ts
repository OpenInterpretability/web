import { getHexclaveServerApp } from "@/hexclave/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getHexclaveServerApp().getUser()
  if (!user) {
    return Response.json({ error: "sign in first" }, { status: 401, headers: { "Cache-Control": "private, no-store" } })
  }
  const tokens = await user.getItem("tokens")
  return Response.json(
    { tokens: tokens?.nonNegativeQuantity ?? 0 },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
