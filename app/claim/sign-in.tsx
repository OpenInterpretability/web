"use client"

import { useHexclaveApp } from "@hexclave/next"
import { LogIn } from "lucide-react"

/** Signs in and comes back to this /claim link (the code is typed after sign-in, on this page). */
export function ClaimSignIn() {
  const app = useHexclaveApp()
  return (
    <button
      onClick={() => { void app.redirectToSignIn() }}
      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
    >
      <LogIn className="h-5 w-5" /> Sign in or create an account
    </button>
  )
}
