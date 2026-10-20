import type { Metadata } from 'next'
import { HostedApiNotice } from '@/components/hosted-api-notice'

// 2026-10-20: agent registration (auth.md) went with the hosted API (lib/hosted-api.ts); the confirm endpoint answers 410.
export const metadata: Metadata = {
  title: 'Agent sign-in — discontinued',
  robots: { index: false },
}

export default function ClaimPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Agent sign-in was discontinued</h1>
      <p className="mt-3 text-ink-900/70 dark:text-ink-50/70">
        Agents can no longer receive Ekbasis API keys here: the hosted API they were for was discontinued on 2026-10-20.
        Nothing on your account changes if you close this page.
      </p>
      <div className="mt-8">
        <HostedApiNotice />
      </div>
    </main>
  )
}
