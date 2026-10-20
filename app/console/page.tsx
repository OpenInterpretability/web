import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { currentAdmin } from "@/lib/admin"
import { HostedApiNotice } from "@/components/hosted-api-notice"
import { OwnerSignIn } from "./owner-sign-in"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Console — Ekbasis",
  description: "The hosted Ekbasis API was discontinued on 2026-10-20. Ekbasis is download-only: get the model on Hugging Face.",
}

/**
 * 2026-10-20: the hosted API, its keys and its credits were discontinued (lib/hosted-api.ts). The console only says
 * so and points to the download; the admin pages stay reachable for the owner. The old panels (keys-panel.tsx,
 * credits-panel.tsx, signed-out.tsx) are kept in the repository, unused.
 */
export default async function ConsolePage() {
  const admin = await Promise.race([
    currentAdmin().catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
  ])
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Home
      </Link>
      {admin && (
        <Link
          href="/console/admin"
          className="mb-6 ml-auto flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-brand-500/40 hover:bg-brand-500/10"
        >
          <Shield className="h-4 w-4" /> Admin
        </Link>
      )}
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">Ekbasis console</h1>
      <div className="mt-8">
        <HostedApiNotice />
      </div>
      {!admin && (
        <div className="mt-12 text-right">
          <OwnerSignIn />
        </div>
      )}
    </main>
  )
}
