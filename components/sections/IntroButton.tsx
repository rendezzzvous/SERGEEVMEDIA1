'use client'

import { useLightbox, type LightboxItem } from '@/components/providers/LightboxProvider'

/** «▶ Смотреть интро» под портретом: видео-знакомство в лайтбоксе со звуком. */
export function IntroButton({ item, label }: { item: LightboxItem; label: string }) {
  const { openVideo } = useLightbox()
  return (
    <button
      type="button"
      data-cursor="PLAY"
      onClick={() => openVideo(item)}
      className="font-display group mt-4 flex w-full items-center justify-between bg-ink px-4 py-4 text-left text-lg font-bold text-paper uppercase transition-colors hover:bg-paper hover:text-ink hover:outline hover:outline-1 hover:outline-ink"
    >
      <span>▶ {label}</span>
      <span className="mono-label opacity-70">{item.meta.split(' · ').pop()}</span>
    </button>
  )
}
