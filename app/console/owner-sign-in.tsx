"use client"

import { useHexclaveApp } from "@hexclave/next"

/** 2026-10-20: the console no longer invites sign-ups (hosted API discontinued); the owner still signs in for the admin. */
export function OwnerSignIn() {
  const app = useHexclaveApp()
  return (
    <button
      onClick={() => {
        void app.redirectToSignIn()
      }}
      className="text-xs text-ink-900/45 underline underline-offset-2 hover:text-ink-900/70 dark:text-ink-50/45 dark:hover:text-ink-50/70"
    >
      Owner sign-in
    </button>
  )
}
