import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import type { Stat } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'
import { Counter } from './Counter'
import { Marquee } from './Marquee'

interface Props {
  t: Dictionary['numbers']
  label: string
  locale: Locale
  stats: Stat[]
  clients: string[]
}

export function Numbers({ t, label, locale, stats, clients }: Props) {
  return (
    <section
      id={SECTIONS.numbers.id}
      data-section={SECTIONS.numbers.n}
      className="theme-ink relative bg-ink pt-20 text-paper md:pt-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.numbers.n} label={label} dur={SECTIONS.numbers.dur} />
      <h2 className="sr-only">{t.title}</h2>
      <dl className="px-gutter mt-10 grid grid-cols-2 gap-px md:mt-14 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label.en} className="flex flex-col-reverse gap-3 border-t border-paper/40 pt-5 pb-10">
            <dt className="mono-label opacity-60">{s.label[locale]}</dt>
            <dd className="font-display text-[clamp(36px,5.4vw,124px)] leading-[0.85] font-black tracking-[-0.05em]">
              <Counter value={s.value} suffix={s.suffix} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 border-t border-paper/40 pt-6 pb-10 md:pb-14">
        <p className="px-gutter mono-label mb-6 opacity-60">{t.clients}</p>
        <Marquee
          items={clients}
          separator="✳"
          speed={-60}
          itemClassName="font-display text-[clamp(32px,5.6vw,104px)] leading-none font-bold uppercase tracking-[-0.03em]"
        />
      </div>
    </section>
  )
}
