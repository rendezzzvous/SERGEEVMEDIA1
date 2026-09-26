'use client'

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'

const LenisCtx = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisCtx)

/** После refresh() пины меняют высоту страницы — докручиваем к #hash заново. */
function settleHash(lenis: Lenis | null) {
  const id = decodeURIComponent(window.location.hash.slice(1))
  const el = id ? document.getElementById(id) : null
  if (!el) return
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true })
  else el.scrollIntoView()
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    let cancelled = false
    const refresh = (instance: Lenis | null) =>
      document.fonts.ready.then(() => {
        if (cancelled) return
        ScrollTrigger.refresh()
        settleHash(instance)
      })

    if (prefersReducedMotion()) {
      refresh(null)
      return () => {
        cancelled = true
      }
    }

    // Vanilla-инстанс: ScrollTrigger крутится от gsap.ticker, без scrollerProxy; touch остаётся нативным
    const instance = new Lenis({ autoRaf: false, anchors: true })
    const tick = (time: number) => instance.raf(time * 1000)
    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- инстанс создаётся только на клиенте
    setLenis(instance)
    refresh(instance)

    return () => {
      cancelled = true
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>
}
