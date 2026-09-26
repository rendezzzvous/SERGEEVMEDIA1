// Без 'server-only': используется в proxy и на клиенте
export const locales = ['ru', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ru'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const hasLocale = (v: unknown): v is Locale =>
  typeof v === 'string' && (locales as readonly string[]).includes(v)
