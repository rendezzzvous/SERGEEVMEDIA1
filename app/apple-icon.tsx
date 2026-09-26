import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0a0a' }}>
      <svg width="180" height="180" viewBox="0 0 64 64">
        <path
          d="M44 16H24a8 8 0 0 0 0 16h16a8 8 0 0 1 0 16H18"
          fill="none"
          stroke="#f2f2ee"
          strokeWidth="7"
          strokeLinecap="square"
        />
      </svg>
    </div>,
    size,
  )
}
