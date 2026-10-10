/** POST {description?}: create a key for the user (value shown once).  DELETE ?keyId=: revoke it. */
import { getHexclaveServerApp } from "@/hexclave/server"
import { requireAdmin, ajson, audit, readJson, notFound } from "@/lib/admin"

export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const user = await getHexclaveServerApp().getUser(id)
  if (!user) return notFound()
  const b = await readJson<{ description: string }>(request)
  const key = await user.createApiKey({
    description: String(b.description || "Created by admin").slice(0, 100),
    expiresAt: new Date(Date.now() + 365 * 86400_000),
  })
  await audit(admin, "key.create", id, { email: user.primaryEmail, keyId: key.id })
  return ajson({ id: key.id, value: key.value })
}

export async function DELETE(request: Request, { params }: Ctx) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  const { id } = await params
  const keyId = new URL(request.url).searchParams.get("keyId")
  const user = await getHexclaveServerApp().getUser(id)
  if (!user || !keyId) return notFound()
  const key = (await user.listApiKeys()).find((k) => k.id === keyId)
  if (!key) return notFound()
  await key.revoke()
  await audit(admin, "key.revoke", id, { email: user.primaryEmail, keyId })
  return ajson({ ok: true })
}
