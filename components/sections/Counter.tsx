'use client'

import { useRef } from 'react'
import { groupThousands } from '@/lib/format'
import { gsap, MOTION_MQ, useGSAP } from '@/lib/motion'

/** Сервер рендерит финальное число; клиент только анимирует textContent от 0 при появлении. */
export function Counter({ value, suffix }: { value: number; suffix: string }) {
  const num = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_MQ, () => {
      const el = num.current!
      const state = { v: 0 }
      gsap.to(state, {
        v: value,
        duration: 1.6,
        ease: 'power3.out',
        snap: { v: 1 },
        onStart: () => (el.textContent = '0'),
        onUpdate: () => (el.textContent = groupThousands(state.v)),
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })
    return () => mm.revert()
  })

  return (
    <span className="tabular-nums">
      <span ref={num}>{groupThousands(value)}</span>
      {suffix}
    </span>
  )
}
