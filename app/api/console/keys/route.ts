import { getHexclaveServerApp } from "@/hexclave/server"
import { invalidateUser } from "@/lib/gateway-cache"

export const dynamic = "force-dynamic"

function unauthorized() {
  return Response.json({ error: "sign in first" }, { status: 401, headers: { "Cache-Control": "private, no-store" } })
}

export async function GET() {
  const user = await getHexclaveServerApp().getUser()
  if (!user) return unauthorized()
  const keys = await user.listApiKeys()
  return Response.json(
    {
      keys: keys.map((k) => ({
        id: k.id,
        description: k.description ?? null,
        createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : k.createdAt,
        expiresAt: k.expiresAt instanceof Date ? k.expiresAt.toISOString() : (k.expiresAt ?? null),
        revoked: k.manuallyRevokedAt instanceof Date ? k.manuallyRevokedAt.toISOString() : (k.manuallyRevokedAt ?? null),
        lastFour: k.value?.lastFour ?? "",
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}

export async function POST() {
  const user = await getHexclaveServerApp().getUser()
  if (!user) return unauthorized()
  const apiKey = await user.createApiKey({ description: "Ekbasis API key", expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })
  return Response.json(
    { id: apiKey.id, value: apiKey.value },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}

export async function DELETE(request: Request) {
  const user = await getHexclaveServerApp().getUser()
  if (!user) return unauthorized()
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return Response.json({ error: "missing id" }, { status: 400 })
  const keys = await user.listApiKeys()
  const key = keys.find((k) => k.id === id)
  if (!key) return Response.json({ error: "not found" }, { status: 404 })
  await key.revoke()
  await invalidateUser(user.id)
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } })
}
