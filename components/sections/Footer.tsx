import { LocaleSwitch } from '@/components/hud/LocaleSwitch'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'

export function Footer({ t, locale }: { t: Dictionary['footer']; locale: Locale }) {
  const year = new Date().getFullYear()
  return (
    <footer className="theme-ink relative bg-ink pt-16 pb-24 text-paper md:pb-20">
      <p
        aria-hidden
        className="font-display text-outline px-gutter text-center text-[clamp(48px,15.2vw,420px)] leading-[0.8] font-black tracking-[-0.015em] whitespace-nowrap select-none"
      >
        SERGEEV
      </p>
      <div className="px-gutter mono-label mt-12 grid grid-cols-2 items-center gap-y-4 border-t border-paper/40 pt-5 md:grid-cols-4">
        <span>
          © {year} SERGEEV · {t.rights}
        </span>
        <span className="tabular-nums opacity-60 md:text-center">02:00:00:00 · END OF REEL</span>
        <LocaleSwitch locale={locale} className="md:justify-center" />
        <a href={`#${SECTIONS.hero.id}`} className="justify-self-end hover:underline">
          {t.top}
        </a>
      </div>
    </footer>
  )
}
