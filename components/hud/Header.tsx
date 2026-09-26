import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'
import { LocaleSwitch } from './LocaleSwitch'

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `#${SECTIONS.shorts.id}`, label: t.nav.work },
    { href: `#${SECTIONS.about.id}`, label: t.nav.about },
    { href: `#${SECTIONS.services.id}`, label: t.nav.services },
    { href: `#${SECTIONS.contact.id}`, label: t.nav.contact },
  ]
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between p-3 md:p-4">
      <a
        href={`#${SECTIONS.hero.id}`}
        className="chip font-display pointer-events-auto text-[13px] font-black tracking-tight"
        aria-label="SERGEEV — top"
      >
        SERGEEV
      </a>
      <div className="flex items-start gap-1">
        <nav aria-label="Sections" className="hidden gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="chip mono-label pointer-events-auto transition-colors hover:bg-paper hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <LocaleSwitch locale={locale} className="chip mono-label pointer-events-auto" />
      </div>
    </header>
  )
}
