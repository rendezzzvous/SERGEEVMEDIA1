import type { Locale } from './config'
import en from './dictionaries/en'
import ru, { type Dictionary } from './dictionaries/ru'

const dictionaries: Record<Locale, Dictionary> = { ru, en }

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale]
export type { Dictionary }
