import { ImageResponse } from 'next/og'
import { og } from '@/lib/skopos-data'

export const runtime = 'edge'
export const alt = 'Ekbasis-Skopos-27B — the next Ekbasis: an open world model for agents.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'radial-gradient(1200px 630px at 50% 70%, rgba(139,92,246,0.25) 0%, rgba(6,182,212,0.12) 40%, rgba(5,5,7,1) 80%)',
          padding: '72px',
          color: '#f5f5f7',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 600, color: '#a1a1aa' }}>
          OpenInterpretability · new release · open model, data and code
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.04em' }}>Ekbasis-Skopos</span>
            <span style={{ fontSize: 44, color: '#71717a' }}>σκοπός</span>
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            What happens if I run this?
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#d4d4d8', gap: 36 }}>
            {og.points.map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
