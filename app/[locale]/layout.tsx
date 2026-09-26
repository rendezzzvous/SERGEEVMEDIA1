import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { body, display, mono } from '@/app/fonts'
import '@/app/globals.css'
import { Cursor } from '@/components/fx/Cursor'
import { Grain } from '@/components/fx/Grain'
import { Header } from '@/components/hud/Header'
import { TimelineHud } from '@/components/hud/TimelineHud'
import { LightboxProvider } from '@/components/providers/LightboxProvider'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { SITE_URL } from '@/content/site'
import { hasLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'light dark',
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const t = getDictionary(locale)
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ru: '/ru', en: '/en', 'x-default': '/ru' },
    },
    openGraph: {
      type: 'website',
      siteName: 'SERGEEV',
      url: `/${locale}`,
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description },
    formatDetection: { telephone: false },
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const t = getDictionary(locale)

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        <SmoothScroll>
          <LightboxProvider labels={t.lightbox}>
            <Header locale={locale} t={t} />
            {children}
          </LightboxProvider>
        </SmoothScroll>
        <TimelineHud labels={t.hud.sections} rec={t.hud.rec} />
        <Cursor openLabel={t.cursor.open} />
        <Grain />
      </body>
    </html>
  )
}
