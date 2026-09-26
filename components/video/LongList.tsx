'use client'

import { useRef } from 'react'
import { useLightbox } from '@/components/providers/LightboxProvider'
import { HoverPreview, type HoverPreviewHandle } from './HoverPreview'

export interface LongRowData {
  id: string
  index: string
  title: string
  client: string
  year: number
  duration: string
  src: string
  preview: string
  poster: string
}

export function LongList({ items, playLabel }: { items: LongRowData[]; playLabel: string }) {
  const { openVideo } = useLightbox()
  const preview = useRef<HoverPreviewHandle>(null)

  return (
    <div
      onPointerMove={(e) => e.pointerType === 'mouse' && preview.current?.move(e.clientX, e.clientY)}
      onPointerLeave={() => preview.current?.hide()}
    >
      <ul className="border-b border-current">
        {items.map((item) => (
          <li key={item.id} className="border-t border-current">
            <button
              type="button"
              data-cursor={playLabel}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return
                preview.current?.move(e.clientX, e.clientY)
                preview.current?.show(item.preview, item.poster)
              }}
              onFocus={() => preview.current?.hide()}
              onClick={() => {
                preview.current?.hide()
                openVideo({
                  src: item.src,
                  poster: item.poster,
                  title: item.title,
                  meta: `${item.index} · ${item.client} · ${item.year} · ${item.duration}`,
                })
              }}
              className="px-gutter group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-3 py-5 text-left transition-colors duration-150 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper md:grid-cols-[3.5rem_1fr_14rem_4rem_5rem_1.5rem] md:py-7"
            >
              {/* Мобильная карточка 16:9 с постером */}
              <span className="no-signal relative col-span-3 block aspect-video overflow-hidden md:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- постеры уже нарезаны под размер и лежат на CDN */}
                <img
                  src={item.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <span className="chip mono-label absolute bottom-3 left-3">▶ {playLabel}</span>
                <span className="chip mono-label absolute right-3 bottom-3 tabular-nums">
                  {item.duration}
                </span>
              </span>
              <span className="mono-label tabular-nums opacity-60">{item.index}</span>
              <span className="font-display col-span-2 min-w-0 text-[clamp(20px,3vw,52px)] md:col-span-1 leading-[0.95] font-bold [overflow-wrap:anywhere] uppercase transition-transform duration-300 ease-out md:group-hover:translate-x-3">
                {item.title}
              </span>
              <span className="mono-label hidden truncate md:block">{item.client}</span>
              <span className="mono-label hidden tabular-nums md:block">{item.year}</span>
              <span className="mono-label col-start-2 col-span-2 tabular-nums md:col-span-1 md:col-start-auto">
                <span className="md:hidden">{item.client} · </span>
                {item.duration}
              </span>
              <span aria-hidden className="hidden text-xl md:block">
                ↗
              </span>
            </button>
          </li>
        ))}
      </ul>
      <HoverPreview ref={preview} />
    </div>
  )
}
