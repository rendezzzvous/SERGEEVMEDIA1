'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Dictionary } from '@/i18n/get-dictionary'
import { toTimecode } from '@/lib/timecode'
import { useLenis } from './SmoothScroll'

export interface LightboxItem {
  src: string
  poster?: string
  title: string
  meta: string
}

type Ctx = { openVideo: (item: LightboxItem) => void }
const LightboxCtx = createContext<Ctx | null>(null)

export function useLightbox(): Ctx {
  const ctx = useContext(LightboxCtx)
  if (!ctx) throw new Error('useLightbox must be used inside <LightboxProvider>')
  return ctx
}

/**
 * Один всегда смонтированный <dialog> с <video>. openVideo() вызывается синхронно из click:
 * WebKit разрешает play() со звуком только внутри жеста пользователя.
 */
export function LightboxProvider({
  children,
  labels,
}: {
  children: ReactNode
  labels: Dictionary['lightbox']
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const lenis = useLenis()

  const [item, setItem] = useState<LightboxItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState({ current: 0, duration: 0 })

  const openVideo = useCallback(
    (next: LightboxItem) => {
      const v = videoRef.current
      const d = dialogRef.current
      if (!v || !d) return
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (next.poster) v.poster = next.poster
      else v.removeAttribute('poster')
      v.src = next.src
      v.muted = false
      void v.play().catch(() => setPlaying(false))
      d.showModal()
      lenis?.stop()
      setItem(next)
      setMuted(false)
      setTime({ current: 0, duration: 0 })
    },
    [lenis],
  )

  const onClose = () => {
    const v = videoRef.current
    if (v) {
      v.pause()
      v.removeAttribute('src')
      v.load()
    }
    lenis?.start()
    setItem(null)
    setPlaying(false)
    returnFocus.current?.focus({ preventScroll: true })
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play().catch(() => {})
    else v.pause()
  }
  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  const seekBy = (delta: number) => {
    const v = videoRef.current
    if (v && Number.isFinite(v.duration))
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + delta))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      if (e.key !== 'm' && e.key !== 'k') return
    }
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'm') toggleMute()
    else if (e.key === 'ArrowRight') seekBy(5)
    else if (e.key === 'ArrowLeft') seekBy(-5)
  }

  const progress = time.duration ? (time.current / time.duration) * 100 : 0
  const ctx = useMemo(() => ({ openVideo }), [openVideo])

  return (
    <LightboxCtx.Provider value={ctx}>
      {children}
      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={item?.title ?? 'Video'}
        data-lenis-prevent
        onClose={onClose}
        onKeyDown={onKeyDown}
      >
        <header className="px-gutter flex items-start justify-between gap-6 pt-5 pb-4">
          <div className="min-w-0">
            <p className="mono-label opacity-60">{item?.meta}</p>
            <p className="font-display mt-1 truncate text-lg font-bold uppercase md:text-2xl">
              {item?.title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="mono-label border border-paper px-3 py-2 transition-colors hover:bg-paper hover:text-ink"
            data-cursor={labels.close}
          >
            {labels.close} ✕
          </button>
        </header>

        <div className="relative min-h-0 px-gutter">
          <video
            ref={videoRef}
            className="no-signal h-full w-full object-contain"
            playsInline
            preload="none"
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onLoadedMetadata={(e) => setTime({ current: 0, duration: e.currentTarget.duration })}
            onTimeUpdate={(e) =>
              setTime({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })
            }
          />
        </div>

        <footer className="px-gutter grid grid-cols-[auto_1fr_auto] items-center gap-4 pt-4 pb-6 md:gap-6">
          <button type="button" onClick={togglePlay} className="mono-label w-16 text-left">
            {playing ? `❚❚ ${labels.pause}` : `▶ ${labels.play}`}
          </button>
          <div className="flex min-w-0 items-center gap-4">
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(progress * 10)}
              aria-label={labels.seek}
              className="scrubber w-full"
              style={{ '--p': `${progress}%` } as React.CSSProperties}
              onChange={(e) => {
                const v = videoRef.current
                if (v && Number.isFinite(v.duration))
                  v.currentTime = (Number(e.target.value) / 1000) * v.duration
              }}
            />
            <span className="mono-label hidden shrink-0 tabular-nums sm:inline">
              {toTimecode(time.current)} / {toTimecode(time.duration || 0)}
            </span>
          </div>
          <button type="button" onClick={toggleMute} className="mono-label w-16 text-right">
            {muted ? labels.unmute : labels.mute}
          </button>
        </footer>
      </dialog>
    </LightboxCtx.Provider>
  )
}
