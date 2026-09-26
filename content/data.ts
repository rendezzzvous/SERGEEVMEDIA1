import type { About, ProcessStep, Service, Stat } from './types'

// TODO: реальные цены, цифры, клиенты, тексты «обо мне».

export const services: Service[] = [
  {
    id: 'shorts',
    title: { ru: 'Reels / Shorts / TikTok', en: 'Reels / Shorts / TikTok' },
    price: { rub: 5_000, usd: 70 },
    includes: {
      ru: 'Монтаж до 60 сек, субтитры, саунд-дизайн, цвет, 9:16',
      en: 'Up to 60 s, captions, sound design, grading, 9:16',
    },
  },
  {
    id: 'youtube',
    title: { ru: 'YouTube-выпуск', en: 'YouTube episode' },
    price: { rub: 15_000, usd: 200 },
    includes: {
      ru: 'До 20 минут, темп и удержание, графика, музыка, превью-нарезка',
      en: 'Up to 20 min, pacing & retention, graphics, music, cut-downs',
    },
  },
  {
    id: 'ads',
    title: { ru: 'Реклама', en: 'Commercial' },
    price: { rub: 30_000, usd: 400 },
    includes: {
      ru: 'Ролик 15–60 сек, версии под площадки, цветокоррекция, микс',
      en: '15–60 s spot, per-platform versions, colour, mix',
    },
  },
  {
    id: 'clips',
    title: { ru: 'Музыкальный клип', en: 'Music video' },
    price: { rub: 40_000, usd: 550 },
    includes: {
      ru: 'Монтаж под бит, эффекты, цвет, вертикальные тизеры',
      en: 'Cut to the beat, VFX touches, colour, vertical teasers',
    },
  },
  {
    id: 'pack',
    title: { ru: 'Пакет 10 шортсов', en: 'Pack of 10 shorts' },
    price: { rub: 40_000, usd: 550 },
    includes: {
      ru: 'Нарезка из длинного видео, единый стиль, план публикаций',
      en: 'Cut from long-form, one visual style, posting plan',
    },
  },
]

export const processSteps: ProcessStep[] = [
  {
    title: { ru: 'Бриф', en: 'Brief' },
    text: {
      ru: 'Созвон или сообщение: цель, площадка, референсы, сроки.',
      en: 'A call or a message: goal, platform, references, deadline.',
    },
  },
  {
    title: { ru: 'Черновой монтаж', en: 'Rough cut' },
    text: {
      ru: 'Собираю структуру и ритм. Первая версия — через 1–3 дня.',
      en: 'Structure and rhythm first. First version in 1–3 days.',
    },
  },
  {
    title: { ru: 'Правки', en: 'Revisions' },
    text: {
      ru: '{rounds} раунда правок включены в цену. Комментарии — прямо по таймкоду.',
      en: '{rounds} revision rounds included. Comments right on the timecode.',
    },
  },
  {
    title: { ru: 'Финал', en: 'Delivery' },
    text: {
      ru: 'Мастер во всех нужных форматах: 9:16, 1:1, 16:9, с субтитрами и без.',
      en: 'Masters in every format you need: 9:16, 1:1, 16:9, with and without captions.',
    },
  },
]

// Считаем с декабря 2024 — тогда начались первые проекты (с перерывами, профессионально и как хобби)
export const stats: Stat[] = [
  { value: 50, suffix: '+', label: { ru: 'роликов', en: 'videos' } },
  { value: 2, suffix: '', label: { ru: 'года в монтаже', en: 'years editing' } },
  { value: 5, suffix: '+', label: { ru: 'брендов и артистов', en: 'brands & artists' } },
  { value: 4, suffix: '', label: { ru: 'страны в проектах', en: 'countries' } },
]

export const clients: string[] = [
  'LEBO COFFEE',
  'INRESTA REAL ESTATE',
  'CYPRUS LIFE',
  'ТОМА',
  'BARAN',
  'LUX BEAUTY',
]

export const about: About = {
  manifesto: {
    ru: 'Я за ролики, которые работают, — и за то, чтобы они были идеальными. В обычный продакшн приношу смысл и красоту: не просто склейка под тренд, а история, которую хочется досмотреть. Дальше — автоматизация и AI в монтаже и в создании видео.',
    en: 'I’m for videos that perform — and for making them flawless. I bring meaning and beauty into everyday production: not just a cut to the trend, but a story people want to watch to the end. Next up: automation and AI, both in editing and in making video itself.',
  },
  facts: [
    {
      label: { ru: 'База', en: 'Based in' },
      value: { ru: 'Турция · работаю worldwide', en: 'Türkiye · working worldwide' },
    },
    {
      label: { ru: 'В видео с', en: 'Making video since' },
      value: { ru: 'декабря 2024', en: 'December 2024' },
    },
    {
      label: { ru: 'Делаю', en: 'I do' },
      value: { ru: 'Съёмка, монтаж, продакшн под ключ', en: 'Shooting, editing, end-to-end production' },
    },
    {
      label: { ru: 'Дальше', en: 'Next' },
      value: { ru: 'AI в монтаже и создании видео', en: 'AI in editing and video creation' },
    },
  ],
}
