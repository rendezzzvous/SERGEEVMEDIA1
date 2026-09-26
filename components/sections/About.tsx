import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import type { About as AboutData } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'
import type { LightboxItem } from '@/components/providers/LightboxProvider'
import { IntroButton } from './IntroButton'
import { Portrait3D } from './Portrait3D'
import { Manifesto } from './Manifesto'

interface Props {
  t: Dictionary['about']
  label: string
  locale: Locale
  about: AboutData
  portrait: { src: string; depth: string }
  intro?: LightboxItem
}

export function About({ t, label, locale, about, portrait, intro }: Props) {
  return (
    <section
      id={SECTIONS.about.id}
      data-section={SECTIONS.about.n}
      className="relative border-t border-ink bg-paper py-20 text-ink md:py-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.about.n} label={label} dur={SECTIONS.about.dur} />
      <div className="px-gutter mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 lg:col-span-4">
          <Portrait3D src={portrait.src} depthSrc={portrait.depth} alt={t.portraitAlt} />
          <p className="mono-label mt-3 flex justify-between opacity-60">
            <span>IMG_0001.DEPTH</span>
            <span>3D · 4×4 BAYER</span>
          </p>
          {intro && <IntroButton item={intro} label={t.intro} />}
        </div>
        <div className="flex flex-col justify-between gap-12 md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
          <h2 className="sr-only">{t.title}</h2>
          <Manifesto text={about.manifesto[locale]} />
          <dl className="grid gap-px border-t border-ink sm:grid-cols-2">
            {about.facts.map((f) => (
              <div key={f.label.en} className="border-b border-ink py-4 sm:odd:pr-6">
                <dt className="mono-label opacity-60">{f.label[locale]}</dt>
                <dd className="mt-2 text-lg leading-snug">{f.value[locale]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
