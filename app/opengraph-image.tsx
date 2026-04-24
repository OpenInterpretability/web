import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'OpenInterp — Watch language models think.'
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
          padding: '80px',
          color: '#f5f5f7',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#0d0d10" />
            <circle cx="8" cy="12" r="5" stroke="#8b5cf6" strokeWidth="1.8" />
            <circle cx="16" cy="12" r="5" stroke="#06b6d4" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="1.8" fill="#8b5cf6" />
          </svg>
          <div style={{ display: 'flex', gap: 2 }}>
            <span>Open</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Interpretability
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 30,
          }}
        >
          <div
            style={{
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
            }}
          >
            <span>Watch language models</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              think.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#a1a1aa',
              marginTop: 24,
              maxWidth: 1000,
              lineHeight: 1.3,
            }}
          >
            Trace every feature. Every circuit. Every second of reasoning. Open source interpretability — MIT.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#71717a',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span>openinterp.org</span>
          <span>pip install openinterp</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
