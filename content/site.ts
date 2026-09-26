// Бренд, домен, CDN, контакты, флаги. NEXT_PUBLIC_* инлайнятся при сборке → смена = пересборка.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sergeev.media').replace(/\/$/, '')
export const CDN_BASE = (
  process.env.NEXT_PUBLIC_CDN_BASE ?? 'https://pub-be8d4a5abc704b2191aa35c87855b98e.r2.dev'
).replace(/\/$/, '') // Cloudflare R2, бакет sergeev-media (scripts/upload-r2.sh)

import type { ContactLink } from './types'

const PHONE = '79338933033' // Telegram + WhatsApp

/** Прямые контакты в секции «Контакт»; порядок в массиве = порядок на сайте. */
const contacts: ContactLink[] = [
  // t.me/+<номер> открывает чат по номеру, если в Telegram разрешён поиск по номеру для всех
  { id: 'telegram', name: 'Telegram', handle: '+7 933 893-30-33', url: `https://t.me/+${PHONE}` },
  { id: 'whatsapp', name: 'WhatsApp', handle: '+7 933 893-30-33', url: `https://wa.me/${PHONE}` },
  {
    id: 'instagram-media',
    name: 'Instagram',
    handle: '@sergeev.med1a',
    url: 'https://instagram.com/sergeev.med1a',
    note: { ru: 'агентство · продакшн', en: 'agency · production' },
  },
  {
    id: 'instagram-personal',
    name: 'Instagram',
    handle: '@sergeeev.tim',
    url: 'https://instagram.com/sergeeev.tim',
    note: { ru: 'личный', en: 'personal' },
  },
  // TODO: почта — пока coming soon
  { id: 'email', name: 'Email', handle: '', url: null },
]

export const site = {
  name: 'SERGEEV',
  contacts,
  /**
   * Портрет в public/ (same-origin нужен для canvas/WebGL) и его карта глубины для 3D-поворота:
   * R — глубина, G — маска силуэта. Новое фото → пересобрать карту (scripts/portrait-depth.mjs).
   */
  portrait: { src: '/portrait.jpg', depth: '/portrait-depth.png' },
  /** false → в услугах вместо цен «по запросу» */
  showPrices: true,
  /** Сколько раундов правок включено (показывается в «Процессе») */
  revisionRounds: 2,
}
