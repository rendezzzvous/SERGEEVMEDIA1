'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { toTimecode } from '@/lib/timecode'

const REEL_SECONDS = 120 // вся страница читается как двухминутный рил
const FPS = 24

export function TimelineHud({ labels, rec }: { labels: Record<string, string>; rec: string }) {
  const bar = useRef<HTMLDivElement>(null)
  const tc = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)

  // Пишем в DOM напрямую, без setState: SSR-текст 00:00:00:00 совпадает с первым кадром клиента
  useGSAP(() => {
    const setScale = gsap.quickSetter(bar.current, 'scaleX')
    const update = (p: number) => {
      tc.current!.textContent = toTimecode(p * REEL_SECONDS, FPS)
      setScale(p)
    }
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => update(s.progress),
      onRefresh: (s) => update(s.progress),
    })

    gsap.utils.toArray<HTMLElement>('[data-section]').forEach((el) => {
      const n = el.dataset.section!
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => {
          if (s.isActive) label.current!.textContent = `[${n}] ${labels[n] ?? ''}`
        },
      })
    })
  })

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const tick = () => {
      const d = new Date()
      if (clock.current) clock.current.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
    tick()
    const id = window.setInterval(tick, 10_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] mix-blend-difference"
      >
        <div ref={bar} className="h-full origin-left scale-x-0 bg-paper" />
      </div>
      <div
        aria-hidden
        className="mono-label pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-between p-3 md:p-4"
      >
        <div className="flex gap-1">
          <span ref={tc} className="chip tabular-nums">
            00:00:00:00
          </span>
          <span ref={label} className="chip hidden sm:inline-flex">
            [00] {labels['00']}
          </span>
        </div>
        <div className="chip">
          <span className="rec-dot">●</span>
          <span>{rec}</span>
          <span ref={clock} className="tabular-nums">
            --:--
          </span>
        </div>
      </div>
    </>
  )
}
