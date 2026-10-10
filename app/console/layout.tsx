import type { ReactNode } from "react"
import React, { Suspense } from "react"
import Link from "next/link"
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next"
import { getHexclaveClientApp } from "@/hexclave/client"

export const dynamic = "force-dynamic"

function SetupNeeded() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-brand-500/30 ring-inset">
        CONSOLE
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Console is being wired up</h1>
      <p className="mt-4 text-ink-900/70 dark:text-ink-50/70">
        The Hexclave project credentials are not set on this deployment yet. Once they are, this page
        becomes the place to generate API keys and buy prepaid credits.
      </p>
      <p className="mt-3 text-sm text-ink-900/50 dark:text-ink-50/50">
        Meanwhile: <Link href="/ekbasis/pricing" className="underline underline-offset-2">the pricing page</Link>{" "}
        has everything about plans and self-hosting.
      </p>
    </div>
  )
}

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const configured = Boolean(process.env.HEXCLAVE_PROJECT_ID) && Boolean(process.env.HEXCLAVE_SECRET_SERVER_KEY)
  if (!configured) return <SetupNeeded />

  return (
    <HexclaveProvider
      // The SDK's generic parameter fights its own docs example here; the app object is correct at runtime.
      app={getHexclaveClientApp() as unknown as React.ComponentProps<typeof HexclaveProvider>["app"]}
    >
      <HexclaveTheme>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600" aria-hidden />
            </div>
          }
        >
          {children}
        </Suspense>
      </HexclaveTheme>
    </HexclaveProvider>
  )
}
