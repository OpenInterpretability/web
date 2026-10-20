import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HostedApiNotice } from '@/components/hosted-api-notice'
import { HOSTED_API_DISCONTINUED_AT } from '@/lib/hosted-api'

// 2026-10-20: the hosted API was discontinued (lib/hosted-api.ts). This URL stays alive for old links and says so;
// the price, the credit packs and the offer structured data are gone with it.
export const metadata: Metadata = {
  title: 'Ekbasis — hosted API discontinued, the model is a download',
  description: `The hosted Ekbasis API, its API keys and its credit packs were discontinued on ${HOSTED_API_DISCONTINUED_AT}. Ekbasis is open weights (Apache-2.0): download it from Hugging Face and run it yourself.`,
  alternates: { canonical: '/ekbasis/pricing' },
  robots: { index: false },
}

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/ekbasis"
        className="mb-8 flex w-fit items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Ekbasis
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Pricing</h1>
      <p className="mt-4 text-lg text-ink-900/70 dark:text-ink-50/70">
        There is nothing to buy anymore. Ekbasis is free to download and to run on your own hardware, under Apache-2.0.
      </p>
      <div className="mt-8">
        <HostedApiNotice />
      </div>
    </main>
  )
}
