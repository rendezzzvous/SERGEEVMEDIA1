'use client'

import { useRef } from 'react'
import { useLightbox, type LightboxItem } from '@/components/providers/LightboxProvider'
import { AutoplayVideo } from '@/components/video/AutoplayVideo'
import type { Dictionary } from '@/i18n/get-dictionary'
import { DESKTOP_MQ, gsap, useGSAP } from '@/lib/motion'
import { SECTIONS } from '@/lib/sections'

interface Props {
  t: Dictionary['hero']
  playLabel: string
  /** full — шоурил со звуком для лайтбокса; нет шоурила → кнопка ведёт к работам */
  video: { bg: string; poster: string; full?: LightboxItem }
}

const WORD = 'SERGEEV'

export function Hero({ t, playLabel, video }: Props) {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLHeadingElement>(null)
  const { openVideo } = useLightbox()
  const full = video.full

  // Desktop: сцена пинится, полоса видео раскрывается на весь экран, SERGEEV наезжает на него (difference)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(DESKTOP_MQ, () => {
        // Верх полосы видео — сразу под строкой «монтажёр / video editor», на любом соотношении сторон
        const row = stage.current!.querySelector<HTMLElement>('[data-hero-row]')!
        const stripTop = () => Math.round(row.offsetTop + row.offsetHeight + window.innerHeight * 0.06)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage.current,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.fromTo(
          media.current,
          {
            clipPath: () =>
              `inset(${stripTop()}px 3.2vw ${Math.round(Math.max(window.innerHeight * 0.1, 104))}px 3.2vw)`,
          },
          { clipPath: 'inset(0px 0vw 0px 0vw)' },
          0,
        )
          .to(word.current, { y: () => window.innerHeight * 0.3 }, 0)
          // fromTo: иначе GSAP возьмёт стартовую opacity посреди CSS fade-in
          .fromTo('[data-hero-fade]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.35 }, 0)
      })
      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      id={SECTIONS.hero.id}
      data-section={SECTIONS.hero.n}
      className="theme-ink relative bg-ink text-paper"
    >
      <div
        ref={stage}
        className="relative flex flex-col overflow-hidden pt-20 pb-16 desktop:h-svh desktop:pt-0 desktop:pb-0"
      >
        {/* Абсолютный сосед <video> — только так mix-blend-mode работает над видео в Safari */}
        <h1
          ref={word}
          aria-label="SERGEEV"
          className="font-display pointer-events-none relative z-10 overflow-hidden py-[0.04em] text-center text-[clamp(52px,16.2vw,440px)] leading-[0.8] font-black tracking-[-0.055em] whitespace-nowrap text-paper desktop:absolute desktop:inset-x-0 desktop:top-[11svh] desktop:mix-blend-difference"
        >
          {WORD.split('').map((ch, i) => (
            <span key={i} aria-hidden className="hero-letter" style={{ '--i': i } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </h1>

        <div
          data-hero-fade
          data-hero-row
          className="px-gutter fade-in relative z-10 mt-6 flex items-baseline justify-between gap-4 text-[clamp(18px,2.4vw,40px)] leading-none font-light desktop:absolute desktop:inset-x-0 desktop:top-[calc(11svh+14vw)] desktop:mt-0"
        >
          <span>{t.role}</span>
          <span className="mono-label hidden opacity-60 md:inline">{t.tags}</span>
          <span>{t.roleAlt}</span>
        </div>
        <p data-hero-fade className="px-gutter mono-label fade-in relative z-10 mt-3 opacity-60 md:hidden">
          {t.tags}
        </p>

        <div
          ref={media}
          className="no-signal relative mx-[clamp(16px,3.2vw,56px)] mt-8 aspect-video overflow-hidden desktop:absolute desktop:inset-0 desktop:m-0 desktop:aspect-auto desktop:[clip-path:inset(calc(11svh+14vw+6svh+2.5vw)_3.2vw_max(10svh,104px)_3.2vw)]"
        >
          <AutoplayVideo
            eager
            src={video.bg}
            poster={video.poster}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {full ? (
            <button
              type="button"
              data-cursor={playLabel}
              aria-label={t.watch}
              onClick={() => openVideo(full)}
              className="absolute inset-0 z-[1]"
            />
          ) : (
            <a href={`#${SECTIONS.shorts.id}`} aria-label={t.work} className="absolute inset-0 z-[1]" />
          )}
        </div>

        <div className="px-gutter relative z-10 mt-4 flex items-center justify-between gap-2 desktop:absolute desktop:inset-x-0 desktop:bottom-[60px] desktop:mt-0">
          <span data-hero-fade className="mono-label hidden md:inline">
            {t.scroll}
          </span>
          {full ? (
            <button
              type="button"
              onClick={() => openVideo(full)}
              className="chip mono-label transition-colors hover:bg-paper hover:text-ink"
            >
              ▶ {t.watch}
            </button>
          ) : (
            <a
              href={`#${SECTIONS.shorts.id}`}
              className="chip mono-label transition-colors hover:bg-paper hover:text-ink"
            >
              ↓ {t.work}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
