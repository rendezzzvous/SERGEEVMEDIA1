'use client'

import { useLightbox } from '@/components/providers/LightboxProvider'
import { AutoplayVideo } from './AutoplayVideo'

export interface ShortCardData {
  id: string
  index: string
  total: string
  title: string
  client: string
  views?: string
  duration: string
  year: number
  src: string
  preview: string
  poster: string
}

export function ShortCard({
  item,
  viewsLabel,
  playLabel,
}: {
  item: ShortCardData
  viewsLabel: string
  playLabel: string
}) {
  const { openVideo } = useLightbox()
  return (
    <button
      type="button"
      data-cursor={playLabel}
      onClick={() =>
        openVideo({
          src: item.src,
          poster: item.poster,
          title: item.title,
          meta: `${item.index} / ${item.total} · ${item.client} · ${item.year} · ${item.duration}`,
        })
      }
      className="group no-signal relative aspect-[9/16] h-(--card-h) shrink-0 snap-start overflow-hidden text-left text-paper"
      aria-label={`${item.title} — ${item.client}`}
    >
      <span
        aria-hidden
        className="font-display text-outline absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[calc(var(--card-h)*0.24)] leading-none font-black tracking-[-0.03em] opacity-40"
      >
        {item.index}
      </span>
      <AutoplayVideo
        src={item.preview}
        poster={item.poster}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span className="mono-label absolute top-3 left-3 chip">
        {item.index} / {item.total}
      </span>
      <span className="mono-label absolute top-3 right-3 chip tabular-nums">{item.duration}</span>
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-ink p-4 transition-colors group-hover:bg-paper group-hover:text-ink">
        <span className="font-display text-base leading-tight font-bold uppercase">{item.title}</span>
        <span className="mono-label flex justify-between gap-2 opacity-70">
          <span className="truncate">{item.client}</span>
          {item.views && (
            <span className="shrink-0">
              {item.views} {viewsLabel}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
