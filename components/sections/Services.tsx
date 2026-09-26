import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import type { Service } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { formatPrice } from '@/lib/format'
import { SECTIONS } from '@/lib/sections'

interface Props {
  t: Dictionary['services']
  label: string
  locale: Locale
  services: Service[]
  showPrices: boolean
}

export function Services({ t, label, locale, services, showPrices }: Props) {
  return (
    <section
      id={SECTIONS.services.id}
      data-section={SECTIONS.services.n}
      className="theme-ink relative bg-ink py-20 text-paper md:py-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.services.n} label={label} dur={SECTIONS.services.dur} />
      <div className="px-gutter mt-10 mb-12 md:mt-14 md:mb-16">
        <h2 className="font-display text-[clamp(40px,11.5vw,220px)] leading-[0.85] font-black tracking-[-0.04em] uppercase whitespace-nowrap">
          {t.title}
        </h2>
        <p className="mt-6 max-w-[36ch] text-base leading-snug opacity-70 md:ml-auto md:w-1/3">{t.note}</p>
      </div>
      <ul className="border-b border-paper/40">
        {services.map((s, i) => (
          <li
            key={s.id}
            className="px-gutter group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 border-t border-paper/40 py-6 transition-colors duration-150 hover:bg-paper hover:text-ink md:grid-cols-[3.5rem_5fr_3fr_5fr] md:items-baseline md:py-8"
          >
            <span className="mono-label tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-display text-[clamp(22px,2.6vw,44px)] leading-none font-bold uppercase">
              {s.title[locale]}
            </span>
            <span className="font-display col-start-2 text-[clamp(20px,2vw,32px)] leading-none font-light tabular-nums md:col-start-auto">
              {showPrices ? (
                <>
                  <span className="mono-label mr-2 align-middle opacity-60">{t.from}</span>
                  {formatPrice(s.price, t.currency)}
                </>
              ) : (
                <span className="mono-label">{t.onRequest}</span>
              )}
            </span>
            <span className="col-start-2 text-base leading-snug opacity-80 md:col-start-auto">
              {s.includes[locale]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
