'use client'

/* eslint-disable @next/next/no-img-element -- нужен обычный <img>: fallback и источник пикселей для canvas */
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
const WIDTH = 360 // пикселей по ширине: крупное зерно дизеринга
const ASPECT = 4 / 3 // высота / ширина — как у портрета 3:4

/** Ordered (Bayer 4×4) дизеринг в чистые ink/paper. Fallback — ч/б <img>. */
export function DitherPortrait({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (cancelled || !canvas.current) return
      try {
        const c = canvas.current
        const w = WIDTH
        const h = Math.round(WIDTH * ASPECT)
        c.width = w
        c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        // cover-кроп по центру
        const iw = img.naturalWidth || w
        const ih = img.naturalHeight || h
        const s = Math.max(w / iw, h / ih)
        const sw = w / s
        const sh = h / s
        ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h)

        const frame = ctx.getImageData(0, 0, w, h)
        const d = frame.data
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
            // Гамма > 1 притемняет средние тона: на светлом фоне лицо не «выгорает» в точки
            const boosted = (255 * Math.pow(gray / 255, 1.45) - 128) * 1.2 + 128
            const threshold = ((BAYER[y % 4][x % 4] + 0.5) / 16) * 255
            const on = boosted > threshold
            d[i] = on ? 0xf2 : 0x0a
            d[i + 1] = on ? 0xf2 : 0x0a
            d[i + 2] = on ? 0xee : 0x0a
            d[i + 3] = 255
          }
        }
        ctx.putImageData(frame, 0, 0)
        setReady(true)
      } catch {
        // tainted canvas / нет 2d — остаётся fallback <img>
      }
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <div className={cn('relative aspect-[3/4] overflow-hidden bg-ink', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'absolute inset-0 h-full w-full object-cover [filter:grayscale(1)_contrast(1.4)]',
          ready && 'opacity-0',
        )}
      />
      <canvas
        ref={canvas}
        aria-hidden
        className={cn('dither absolute inset-0 h-full w-full', !ready && 'invisible')}
      />
    </div>
  )
}
