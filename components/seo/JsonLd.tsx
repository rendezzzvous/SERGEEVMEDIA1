import { SITE_URL, site } from '@/content/site'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'

export function JsonLd({ locale, t }: { locale: Locale; t: Dictionary }) {
  const url = `${SITE_URL}/${locale}`
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: site.name,
        jobTitle: locale === 'ru' ? 'Видеомонтажёр' : 'Video editor',
        url,
        image: `${SITE_URL}/${locale}/opengraph-image`,
        sameAs: site.contacts.filter((c) => c.url && !c.url.startsWith('mailto:')).map((c) => c.url),
        knowsLanguage: ['ru', 'en'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: site.name,
        url,
        description: t.meta.description,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#person` },
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      // JSON-LD; `<` экранирован
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
