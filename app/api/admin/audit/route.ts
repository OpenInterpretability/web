import { requireAdmin, ajson, readAudit } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (admin instanceof Response) return admin
  return ajson({ entries: await readAudit(300) })
}
