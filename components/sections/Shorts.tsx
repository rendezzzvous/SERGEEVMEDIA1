'use client'

import { useRef } from 'react'
import { useLenis } from '@/components/providers/SmoothScroll'
import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import { ShortCard, type ShortCardData } from '@/components/video/ShortCard'
import type { Dictionary } from '@/i18n/get-dictionary'
import { DESKTOP_MQ, gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { SECTIONS } from '@/lib/sections'

interface Props {
  t: Dictionary['shorts']
  label: string
  cursor: Dictionary['cursor']
  items: ShortCardData[]
}

export function Shorts({ t, label, cursor, items }: Props) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  // Desktop: секция пинится, вертикальный скролл двигает рейл по горизонтали (1px скролла = 1px рейла)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(DESKTOP_MQ, () => {
        const el = track.current!
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)
        gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        const ro = new ResizeObserver(() => ScrollTrigger.refresh())
        ro.observe(el)
        return () => ro.disconnect()
      })
      return () => mm.revert()
    },
    { scope: section },
  )

  // Desktop-drag мышью: тянем рейл → крутим страницу (курсор DRAG не врёт)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !window.matchMedia(DESKTOP_MQ).matches) return
    const startX = e.clientX
    const startScroll = lenis?.scroll ?? window.scrollY
    let dragged = false
    const move = (ev: PointerEvent) => {
      const dx = startX - ev.clientX
      if (!dragged && Math.abs(dx) < 6) return
      dragged = true
      document.documentElement.style.userSelect = 'none'
      if (lenis) lenis.scrollTo(startScroll + dx, { immediate: true, force: true })
      else window.scrollTo(0, startScroll + dx)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.documentElement.style.userSelect = ''
      if (dragged) {
        // Гасим click, который прилетит после отпускания на карточке
        const block = (ev: MouseEvent) => {
          ev.stopPropagation()
          ev.preventDefault()
        }
        window.addEventListener('click', block, { capture: true, once: true })
        setTimeout(() => window.removeEventListener('click', block, { capture: true }), 0)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <section
      ref={section}
      id={SECTIONS.shorts.id}
      data-section={SECTIONS.shorts.n}
      className="theme-ink relative bg-ink text-paper desktop:h-svh desktop:overflow-hidden"
    >
      <Ruler />
      <div className="flex h-full flex-col justify-center py-20 desktop:pt-16 desktop:pb-8">
        <SectionHeader n={SECTIONS.shorts.n} label={label} dur={SECTIONS.shorts.dur} />
        <div
          ref={track}
          data-cursor={cursor.drag}
          onPointerDown={onPointerDown}
          className="no-scrollbar px-gutter mt-8 flex [--card-h:clamp(360px,68svh,760px)] desktop:[--card-h:clamp(360px,64svh,760px)] snap-x snap-mandatory scroll-px-[clamp(16px,3.2vw,56px)] gap-[2px] overflow-x-auto desktop:w-max desktop:snap-none desktop:overflow-visible"
        >
          <div className="flex h-(--card-h) shrink-0 snap-start gap-5 pr-6 desktop:gap-8 desktop:pr-[4vw]">
            {/* «Вертикаль» — буквально вертикально, во всю высоту карточки */}
            <h2 className="font-display text-outline rotate-180 text-[calc(var(--card-h)/8.2)] leading-[0.82] font-black tracking-[-0.04em] whitespace-nowrap uppercase [writing-mode:vertical-rl]">
              {t.title}
            </h2>
            <div className="flex w-[52vw] flex-col justify-end gap-6 sm:w-[34vw] desktop:w-[22vw]">
              <p className="text-[clamp(18px,1.6vw,26px)] leading-snug">{t.lead}</p>
              <p className="mono-label opacity-60">{t.hint}</p>
            </div>
          </div>
          {items.map((item) => (
            <ShortCard key={item.id} item={item} viewsLabel={t.views} playLabel={cursor.play} />
          ))}
          <div aria-hidden className="w-[2px] shrink-0 desktop:w-[8vw]" />
        </div>
      </div>
    </section>
  )
}
