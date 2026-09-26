'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/lib/motion'

interface Props {
  src: string
  poster?: string
  className?: string
  /** hero: preload="metadata" и src сразу (первый экран) */
  eager?: boolean
  videoRef?: RefObject<HTMLVideoElement | null>
}

/**
 * Немое автовидео: src вешается только вблизи viewport, пауза вне его, снятие src далеко
 * (у iOS лимит одновременно живых декодеров). В reduced-motion — только постер.
 */
export function AutoplayVideo({ src, poster, className, eager, videoRef }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)

  // React не сериализует `muted` в DOM (facebook/react#10389) → iOS не автоплеит. Ставим руками.
  const setRef = useCallback(
    (el: HTMLVideoElement | null) => {
      ref.current = el
      if (videoRef) videoRef.current = el
      if (!el) return
      el.muted = true
      el.defaultMuted = true
      el.setAttribute('muted', '')
    },
    [videoRef],
  )

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const attach = () => {
      if (el.getAttribute('src') !== src) el.src = src
    }
    if (eager) attach()

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attach()
          void el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { rootMargin: '25%' },
    )
    const far = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && el.hasAttribute('src')) {
          el.removeAttribute('src')
          el.load()
        }
      },
      { rootMargin: '150%' },
    )
    near.observe(el)
    far.observe(el)
    return () => {
      near.disconnect()
      far.disconnect()
    }
  }, [src, eager])

  return (
    <video
      ref={setRef}
      className={cn('block', className)}
      poster={poster}
      playsInline
      loop
      preload={eager ? 'metadata' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
    />
  )
}
