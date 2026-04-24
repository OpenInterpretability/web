import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #050507 0%, #1a1a2e 100%)',
          borderRadius: 36,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="12" r="5" stroke="#8b5cf6" strokeWidth="1.8" />
          <circle cx="16" cy="12" r="5" stroke="#06b6d4" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="1.8" fill="#8b5cf6" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
