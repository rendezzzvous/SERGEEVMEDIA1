import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { hasLocale, locales } from '@/i18n/config'

export const alt = 'SERGEEV — video editor'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const INK = '#0a0a0a'
const PAPER = '#f2f2ee'

// Satori не читает next/font и не умеет variable-шрифты → статический Unbounded 900 из public/fonts
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ru = !hasLocale(locale) || locale === 'ru'
  const font = await readFile(join(process.cwd(), 'public/fonts/Unbounded-Black.ttf'))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: INK,
        color: PAPER,
        padding: '48px 56px',
        fontFamily: 'Unbounded',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, letterSpacing: 2 }}>
        <span>{ru ? '[01] МОНТАЖ' : '[01] VIDEO EDITOR'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 16, height: 16, borderRadius: 16, background: PAPER }} />
          REC
        </span>
      </div>
      <div style={{ display: 'flex', fontSize: 166, lineHeight: 0.8, letterSpacing: -3, marginLeft: -6 }}>
        SERGEEV
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          letterSpacing: 2,
          opacity: 0.7,
        }}
      >
        <span>REELS · YOUTUBE · COMMERCIAL · CLIPS</span>
        <span>00:00:00:00</span>
      </div>
    </div>,
    { ...size, fonts: [{ name: 'Unbounded', data: font, weight: 900, style: 'normal' }] },
  )
}
