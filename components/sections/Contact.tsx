import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import type { ContactLink } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'
import { LeadForm } from './LeadForm'

interface Props {
  t: Dictionary['contact']
  label: string
  locale: Locale
  contacts: ContactLink[]
}

export function Contact({ t, label, locale, contacts }: Props) {
  return (
    <section
      id={SECTIONS.contact.id}
      data-section={SECTIONS.contact.n}
      className="relative bg-paper py-20 text-ink md:py-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.contact.n} label={label} dur={SECTIONS.contact.dur} />
      <h2 className="px-gutter font-display mt-10 text-[clamp(40px,15.2vw,440px)] leading-[0.8] font-black tracking-[-0.055em] whitespace-nowrap md:mt-14">
        {t.headline}
      </h2>
      <p className="px-gutter mt-8 max-w-[40ch] text-[clamp(18px,1.6vw,26px)] leading-snug">{t.lead}</p>

      <div className="px-gutter mt-12 grid gap-16 md:mt-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <LeadForm t={t.form} locale={locale} />
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="mono-label mb-4 opacity-60">{t.direct}</p>
          <ul className="border-b border-ink">
            {contacts.map((l) => {
              const body = (
                <span className="flex flex-col gap-1">
                  <span className="font-display text-[clamp(22px,2.2vw,36px)] leading-none font-bold uppercase">
                    {l.name}
                  </span>
                  <span className="mono-label opacity-60">
                    {l.url ? l.handle : t.soon}
                    {l.note && ` · ${l.note[locale]}`}
                  </span>
                </span>
              )
              return (
                <li key={l.id} className="border-t border-ink">
                  {l.url ? (
                    <a
                      href={l.url}
                      target={l.url.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="group -mx-3 flex items-center justify-between gap-4 px-3 py-5 transition-colors hover:bg-ink hover:text-paper"
                    >
                      {body}
                      <span
                        aria-hidden
                        className="text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      >
                        ↗
                      </span>
                    </a>
                  ) : (
                    <div className="py-5 opacity-40">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
