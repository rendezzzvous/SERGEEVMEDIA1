'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/motion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** Точка + кольцо. Над [data-cursor] кольцо становится плашкой с лейблом (PLAY/DRAG…), над ссылками — OPEN. */
export function Cursor({ openLabel }: { openLabel: string }) {
  // Рендерится только после mount и только на устройствах с мышью (без hydration mismatch)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER)
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return enabled ? <CursorImpl openLabel={openLabel} /> : null
}

function CursorImpl({ openLabel }: { openLabel: string }) {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const d = dot.current!
    const r = ring.current!
    const reduce = prefersReducedMotion()
    const dotX = gsap.quickTo(d, 'x', { duration: reduce ? 0 : 0.05 })
    const dotY = gsap.quickTo(d, 'y', { duration: reduce ? 0 : 0.05 })
    const ringX = gsap.quickTo(r, 'x', { duration: reduce ? 0 : 0.4, ease: 'power3' })
    const ringY = gsap.quickTo(r, 'y', { duration: reduce ? 0 : 0.4, ease: 'power3' })
    let state = 'hidden'
    let label = ''

    const setState = (next: string, nextLabel = '') => {
      if (next !== state) {
        state = next
        r.dataset.state = next
        d.dataset.state = next === 'label' || next === 'hidden' ? 'hidden' : ''
      }
      if (nextLabel !== label) {
        label = nextLabel
        text.current!.textContent = nextLabel
      }
    }

    let last: { x: number; y: number } | null = null

    const resolve = (target: Element | null) => {
      // <dialog> живёт в top layer поверх курсора → там возвращаем нативный
      if (target?.closest('input, textarea, select, dialog')) return setState('hidden')
      const labelled = target?.closest<HTMLElement>('[data-cursor]')
      if (labelled?.dataset.cursor) return setState('label', labelled.dataset.cursor)
      if (target?.closest('a')) return setState('label', openLabel)
      if (target?.closest('button, label, [role="button"]')) return setState('hover')
      setState('idle')
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (state === 'hidden' && !last) gsap.set([d, r], { x: e.clientX, y: e.clientY })
      last = { x: e.clientX, y: e.clientY }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
      resolve(e.target instanceof Element ? e.target : null)
    }
    // Под неподвижной мышью при скролле проезжает контент — пересчитываем лейбл раз в кадр
    let raf = 0
    const onScroll = () => {
      if (!last || raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (last) resolve(document.elementFromPoint(last.x, last.y))
      })
    }
    const onLeave = () => {
      last = null
      setState('hidden')
    }

    document.documentElement.classList.add('has-cursor')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [openLabel])

  return (
    <>
      <div ref={ring} className="cursor-ring" data-state="hidden" aria-hidden>
        <span ref={text} />
      </div>
      <div ref={dot} className="cursor-dot" data-state="hidden" aria-hidden />
    </>
  )
}
