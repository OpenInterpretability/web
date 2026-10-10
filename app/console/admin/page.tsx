import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { currentAdmin } from "@/lib/admin"
import { AdminApp } from "./admin-app"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin — Ekbasis console", robots: { index: false, follow: false } }

export default async function AdminPage() {
  // Server-side gate: anyone who is not the verified admin gets a plain 404.
  const admin = await currentAdmin()
  if (!admin) notFound()
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Link href="/console" className="mb-6 flex w-fit items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to console
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Shield className="h-7 w-7 text-brand-600 dark:text-brand-400" /> Admin
        </h1>
        <span className="chip bg-emerald-500/10 text-emerald-700 ring-inset ring-emerald-500/30 dark:text-emerald-300">
          {admin.primaryEmail} · verified
        </span>
      </div>
      <AdminApp />
    </main>
  )
}
