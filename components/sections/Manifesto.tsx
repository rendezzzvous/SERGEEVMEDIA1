'use client'

import { useRef } from 'react'
import { gsap, MOTION_MQ, useGSAP } from '@/lib/motion'

/** Пословный reveal на скролле (scrub). Слова режем на сервере-клиенте одинаково — без SplitText. */
export function Manifesto({ text }: { text: string }) {
  const root = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_MQ, () => {
        gsap.fromTo(
          '[data-word]',
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'bottom 50%', scrub: true },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <p
      ref={root}
      className="text-[clamp(24px,3.1vw,54px)] leading-[1.08] font-medium tracking-[-0.02em] text-balance"
    >
      {text.split(/\s+/).map((word, i) => (
        <span key={i} data-word className="inline-block">
          {word}&nbsp;
        </span>
      ))}
    </p>
  )
}
