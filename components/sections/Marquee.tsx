'use client'

import { useRef } from 'react'
import { cn } from '@/lib/cn'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

interface Props {
  items: string[]
  separator?: string
  /** px/сек в покое; знак задаёт базовое направление */
  speed?: number
  className?: string
  itemClassName?: string
}

/** Бегущая строка: направление следует за скроллом, скорость — за его скоростью. */
export function Marquee({ items, separator = '—', speed = 80, className, itemClassName }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = track.current!
      const copy = el.firstElementChild as HTMLElement
      let width = copy.offsetWidth
      const ro = new ResizeObserver(() => (width = copy.offsetWidth))
      ro.observe(copy)

      const setX = gsap.quickSetter(el, 'x', 'px')
      let x = 0
      let dir = 1
      let boost = 0
      let active = false

      const tick = (_time: number, dt: number) => {
        if (!active || !width) return
        x -= (Math.abs(speed) + boost) * Math.sign(speed) * dir * (dt / 1000)
        boost *= 0.92
        x = gsap.utils.wrap(-width, 0, x)
        setX(x)
      }
      gsap.ticker.add(tick)
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (s) => (active = s.isActive),
        onUpdate: (s) => {
          dir = s.direction
          boost = Math.min(Math.abs(s.getVelocity()) * 0.35, 1400)
        },
      })
      active = st.isActive
      return () => {
        gsap.ticker.remove(tick)
        ro.disconnect()
      }
    },
    { scope: root },
  )

  // Каждая копия повторяет список дважды — хватает на самые широкие экраны
  const run = [...items, ...items]
  return (
    <div ref={root} className={cn('overflow-hidden whitespace-nowrap select-none', className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0">
            {run.map((item, i) => (
              <span key={i} className={cn('shrink-0 pr-[0.35em]', itemClassName)}>
                {item} <span className="opacity-60">{separator}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
