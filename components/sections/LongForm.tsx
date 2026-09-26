import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import { LongList, type LongRowData } from '@/components/video/LongList'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'

export function LongForm({
  t,
  label,
  playLabel,
  items,
}: {
  t: Dictionary['long']
  label: string
  playLabel: string
  items: LongRowData[]
}) {
  return (
    <section
      id={SECTIONS.long.id}
      data-section={SECTIONS.long.n}
      className="relative bg-paper py-20 text-ink md:py-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.long.n} label={label} dur={SECTIONS.long.dur} />
      <div className="px-gutter mt-10 mb-12 md:mt-14 md:mb-16">
        <h2 className="font-display text-[clamp(40px,11.5vw,220px)] leading-[0.85] font-black tracking-[-0.04em] uppercase whitespace-nowrap">
          {t.title}
        </h2>
        <p className="mt-6 max-w-[34ch] text-[clamp(18px,1.6vw,26px)] leading-snug md:ml-auto md:w-1/3">
          {t.lead}
        </p>
      </div>
      <LongList items={items} playLabel={playLabel} />
    </section>
  )
}
