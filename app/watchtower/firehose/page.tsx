import { ComingSoon } from '@/components/coming-soon'
import { pillars } from '@/lib/pillars'

export const metadata = { title: 'Feature Firehose API — OpenInterp Watchtower' }

export default function Page() {
  const pillar = pillars.find((p) => p.id === 'watchtower')!
  return (
    <ComingSoon
      pillar={pillar}
      status="q4"
      title="Feature Firehose API"
      blurb="Low-latency streaming API. Your production LLM calls pass through; per-token feature activations emit on WebSocket. ClickHouse-backed dashboards. Pricing from $2 per 1M tokens monitored. The enterprise tier that funds the OSS platform."
      sections={[
        {
          heading: 'Latency target',
          body:
            'p95 < 25ms added to your LLM call. We achieve this with: pre-loaded SAE weights on dedicated GPUs, batched forward passes, and INT4 quantized SAE inference (lossless per our benchmarks). Your user-facing latency stays within SLA.',
        },
        {
          heading: 'Deployment modes',
          body:
            'Cloud (we host, you pipe) · VPC-peered (low-latency inside AWS/GCP) · On-prem Docker (regulated industries). Watchlist updates push via MQTT so you never need to re-deploy.',
        },
        {
          heading: 'What emits',
          body:
            'Per-token: top-K feature activations with IDs, values, and semantic tags from Atlas. Aggregated: hourly feature histograms, anomaly scores, watchlist trigger counts. Everything queryable via SQL on ClickHouse.',
        },
      ]}
    />
  )
}
