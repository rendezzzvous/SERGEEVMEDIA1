'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { DESKTOP_MQ, gsap, useGSAP } from '@/lib/motion'

export interface HoverPreviewHandle {
  show: (src: string, poster?: string) => void
  hide: () => void
  move: (x: number, y: number) => void
}

/** Один общий немой <video> 16:9, который следует за курсором по списку long-form (только desktop). */
export const HoverPreview = forwardRef<HoverPreviewHandle>(function HoverPreview(_, ref) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const api = useRef<HoverPreviewHandle | null>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(DESKTOP_MQ, () => {
      const el = box.current!
      const v = video.current!
      v.muted = true
      v.defaultMuted = true
      v.setAttribute('muted', '')
      gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 })
      const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
      const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
      let visible = false
      api.current = {
        move: (x, y) => {
          if (!visible) gsap.set(el, { x, y })
          toX(x)
          toY(y)
        },
        show: (src, poster) => {
          if (poster) v.poster = poster
          if (v.getAttribute('src') !== src) v.src = src
          void v.play().catch(() => {})
          visible = true
          gsap.to(el, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
        },
        hide: () => {
          visible = false
          gsap.to(el, {
            scale: 0.6,
            autoAlpha: 0,
            duration: 0.25,
            ease: 'power2.in',
            overwrite: 'auto',
            onComplete: () => v.pause(),
          })
        },
      }
      return () => {
        api.current = null
        v.pause()
        v.removeAttribute('src')
        v.load()
      }
    })
    return () => mm.revert()
  })

  useImperativeHandle(ref, () => ({
    show: (src, poster) => api.current?.show(src, poster),
    hide: () => api.current?.hide(),
    move: (x, y) => api.current?.move(x, y),
  }))

  return (
    <div
      ref={box}
      aria-hidden
      className="no-signal pointer-events-none invisible fixed top-0 left-0 z-40 hidden aspect-video w-[clamp(280px,26vw,460px)] overflow-hidden desktop:block"
    >
      <video
        ref={video}
        className="h-full w-full object-cover"
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
      />
    </div>
  )
})
