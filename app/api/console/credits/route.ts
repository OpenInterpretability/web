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

export async function POST(request: Request) {
  const user = await getHexclaveServerApp().getUser()
  if (!user) {
    return Response.json({ error: "sign in first" }, { status: 401, headers: { "Cache-Control": "private, no-store" } })
  }
  let packId: string | undefined
  try {
    const body = (await request.json()) as { packId?: string }
    packId = body.packId
  } catch {
    packId = undefined
  }
  if (!packId || !["pack-5", "pack-20", "pack-50"].includes(packId)) {
    return Response.json({ error: "unknown pack" }, { status: 400 })
  }
  const origin = new URL(request.url).origin
  const checkoutUrl = await user.createCheckoutUrl({
    productId: packId,
    returnUrl: `${origin}/console`,
  })
  return Response.json(
    { checkoutUrl },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
