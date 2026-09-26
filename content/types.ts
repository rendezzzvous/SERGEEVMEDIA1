import type { Locale } from '@/i18n/config'

/** Любое текстовое поле, которое показывается в обеих версиях сайта. */
export type L10n = Record<Locale, string>

export type VideoKind = 'short' | 'long'

export interface VideoItem {
  id: string
  kind: VideoKind
  /** Путь относительно CDN_BASE (или абсолютный URL) — полная версия со звуком для лайтбокса */
  src: string
  /** Немое короткое превью: автоплей в карточке шорта / hover-превью long-form */
  preview?: string
  /** JPG-постер */
  poster: string
  title: L10n
  client: string
  year: number
  /** Хронометраж, как показывать: '0:34', '12:40' */
  duration: string
  /** Просмотры, как показывать: '1.2M' */
  views?: string
}

export interface ContactLink {
  id: string
  name: string
  handle: string
  /** null → строка без ссылки с пометкой «скоро» */
  url: string | null
  /** Подпись под ником, например «агентство» / «личный» */
  note?: L10n
}

export interface Service {
  id: string
  title: L10n
  /** Цена «от»: ₽ для RU-версии, $ для EN */
  price: { rub: number; usd: number }
  includes: L10n
}

export interface ProcessStep {
  title: L10n
  text: L10n
}

export interface Stat {
  value: number
  suffix: string
  label: L10n
}

export interface Fact {
  label: L10n
  value: L10n
}

export interface About {
  manifesto: L10n
  facts: Fact[]
}
