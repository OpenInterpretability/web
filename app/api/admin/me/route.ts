import { currentAdmin, ajson, notFound } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const admin = await currentAdmin()
  return admin ? ajson({ admin: true, email: admin.primaryEmail }) : notFound()
}
