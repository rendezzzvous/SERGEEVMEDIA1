import { notFound } from 'next/navigation'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { LongForm } from '@/components/sections/LongForm'
import { Marquee } from '@/components/sections/Marquee'
import { Numbers } from '@/components/sections/Numbers'
import { Process } from '@/components/sections/Process'
import { Services } from '@/components/sections/Services'
import { Shorts } from '@/components/sections/Shorts'
import { SectionHeader } from '@/components/hud/SectionHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { about, clients, processSteps, services, stats } from '@/content/data'
import { site } from '@/content/site'
import { hero, intro, longs, shorts } from '@/content/videos'
import { hasLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'
import { cdn } from '@/lib/media'
import { SECTIONS } from '@/lib/sections'

const pad = (n: number) => String(n).padStart(2, '0')

export default async function Page({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const t = getDictionary(locale)
  const labels = t.hud.sections

  const shortItems = shorts.map((v, i) => ({
    id: v.id,
    index: pad(i + 1),
    total: pad(shorts.length),
    title: v.title[locale],
    client: v.client,
    views: v.views,
    duration: v.duration,
    year: v.year,
    src: cdn(v.src),
    preview: cdn(v.preview ?? v.src),
    poster: cdn(v.poster),
  }))
  const longItems = longs.map((v, i) => ({
    id: v.id,
    index: pad(i + 1),
    title: v.title[locale],
    client: v.client,
    year: v.year,
    duration: v.duration,
    src: cdn(v.src),
    preview: cdn(v.preview ?? v.src),
    poster: cdn(v.poster),
  }))

  return (
    <>
      <JsonLd locale={locale} t={t} />
      <main>
        <Hero
          t={t.hero}
          playLabel={t.cursor.play}
          video={{
            bg: cdn(hero.bg),
            poster: cdn(hero.poster),
            full: hero.showreel && {
              src: cdn(hero.showreel.src),
              poster: cdn(hero.showreel.poster),
              title: hero.showreel.title[locale],
              meta: `${hero.showreel.client} · ${hero.showreel.year} · ${hero.showreel.duration}`,
            },
          }}
        />

        <section
          id={SECTIONS.marquee.id}
          data-section={SECTIONS.marquee.n}
          aria-label={t.marquee.join(', ')}
          className="relative bg-paper py-10 text-ink md:py-14"
        >
          <SectionHeader
            n={SECTIONS.marquee.n}
            label={labels['01']}
            dur={SECTIONS.marquee.dur}
            className="mb-6"
          />
          <Marquee
            items={t.marquee}
            itemClassName="font-display text-outline text-[clamp(64px,13vw,260px)] leading-[0.9] font-black uppercase tracking-[-0.04em]"
          />
        </section>

        <Shorts t={t.shorts} label={labels['02']} cursor={t.cursor} items={shortItems} />
        <LongForm t={t.long} label={labels['03']} playLabel={t.cursor.play} items={longItems} />
        <About
          t={t.about}
          label={labels['04']}
          locale={locale}
          about={about}
          portrait={site.portrait}
          intro={{
            src: cdn(intro.src),
            poster: cdn(intro.poster),
            title: intro.title[locale],
            meta: `SERGEEV · ${intro.duration}`,
          }}
        />
        <Services
          t={t.services}
          label={labels['05']}
          locale={locale}
          services={services}
          showPrices={site.showPrices}
        />
        <Process
          t={t.process}
          label={labels['06']}
          locale={locale}
          steps={processSteps}
          rounds={site.revisionRounds}
        />
        <Numbers t={t.numbers} label={labels['07']} locale={locale} stats={stats} clients={clients} />
        <Contact t={t.contact} label={labels['08']} locale={locale} contacts={site.contacts} />
      </main>
      <Footer t={t.footer} locale={locale} />
    </>
  )
}
