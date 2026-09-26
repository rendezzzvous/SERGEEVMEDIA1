import type { L10n, VideoItem } from './types'

// Портфолио. Пути относительно CDN_BASE (см. content/site.ts) — так их кладёт scripts/encode-portfolio.sh.
// Порядок в массиве = порядок на сайте. Id совпадают с именами файлов в out-media/.
// prettier-ignore
export const videos: VideoItem[] = [
  // ── Вертикальные: Reels / Shorts / TikTok ──
  {
    id: 'inresta-villa', kind: 'short', src: 'shorts/inresta-villa.mp4', preview: 'previews/inresta-villa.mp4', poster: 'posters/inresta-villa.jpg',
    title: { ru: 'Люкс-вилла', en: 'Luxury villa' }, client: 'Inresta Real Estate', year: 2025, duration: '0:58',
  },
  {
    id: 'baran-sea', kind: 'short', src: 'shorts/baran-sea.mp4', preview: 'previews/baran-sea.mp4', poster: 'posters/baran-sea.jpg',
    title: { ru: 'Сниппет у моря', en: 'Seaside snippet' }, client: 'Baran', year: 2026, duration: '0:25',
  },
  {
    id: 'lebo-artfact', kind: 'short', src: 'shorts/lebo-artfact.mp4', preview: 'previews/lebo-artfact.mp4', poster: 'posters/lebo-artfact.jpg',
    title: { ru: 'Art&Fact × Lebo: 14 февраля', en: 'Art&Fact × Lebo: Valentine’s' }, client: 'Lebo Coffee', year: 2025, duration: '0:14',
  },
  {
    id: 'lebo-recipe', kind: 'short', src: 'shorts/lebo-recipe.mp4', preview: 'previews/lebo-recipe.mp4', poster: 'posters/lebo-recipe.jpg',
    title: { ru: 'Повтори рецепт', en: 'Repeat the recipe' }, client: 'Lebo Coffee', year: 2025, duration: '0:50',
  },
  {
    id: 'baran-yacht', kind: 'short', src: 'shorts/baran-yacht.mp4', preview: 'previews/baran-yacht.mp4', poster: 'posters/baran-yacht.jpg',
    title: { ru: 'Сниппет на яхте', en: 'Yacht snippet' }, client: 'Baran', year: 2026, duration: '0:37',
  },
  {
    id: 'toma-street-math', kind: 'short', src: 'shorts/toma-street-math.mp4', preview: 'previews/toma-street-math.mp4', poster: 'posters/toma-street-math.jpg',
    title: { ru: 'Математика на улице', en: 'Street math quiz' }, client: 'Тома', year: 2026, duration: '1:46',
  },
  {
    id: 'lebo-box', kind: 'short', src: 'shorts/lebo-box.mp4', preview: 'previews/lebo-box.mp4', poster: 'posters/lebo-box.jpg',
    title: { ru: 'Коробка на ножках', en: 'Box on legs' }, client: 'Lebo Coffee', year: 2025, duration: '0:13',
  },
  {
    id: 'cyprus-life-horizon', kind: 'short', src: 'shorts/cyprus-life-horizon.mp4', preview: 'previews/cyprus-life-horizon.mp4', poster: 'posters/cyprus-life-horizon.jpg',
    title: { ru: 'Рум-тур: Horizon', en: 'Room tour: Horizon' }, client: 'Cyprus Life', year: 2026, duration: '0:59',
  },
  {
    id: 'luxbeauty-before-after', kind: 'short', src: 'shorts/luxbeauty-before-after.mp4', preview: 'previews/luxbeauty-before-after.mp4', poster: 'posters/luxbeauty-before-after.jpg',
    title: { ru: 'До / после', en: 'Before / after' }, client: 'Lux Beauty', year: 2026, duration: '0:16',
  },
  {
    id: 'toma-sims', kind: 'short', src: 'shorts/toma-sims.mp4', preview: 'previews/toma-sims.mp4', poster: 'posters/toma-sims.jpg',
    title: { ru: 'Репетитор в The Sims', en: 'Tutor in The Sims' }, client: 'Тома', year: 2026, duration: '0:17',
  },
  {
    id: 'inresta-ny2025', kind: 'short', src: 'shorts/inresta-ny2025.mp4', preview: 'previews/inresta-ny2025.mp4', poster: 'posters/inresta-ny2025.jpg',
    title: { ru: 'С Новым годом', en: 'Happy New Year' }, client: 'Inresta Real Estate', year: 2025, duration: '0:59',
  },
  {
    id: 'lebo-march8', kind: 'short', src: 'shorts/lebo-march8.mp4', preview: 'previews/lebo-march8.mp4', poster: 'posters/lebo-march8.jpg',
    title: { ru: 'Не забыл про подарок?', en: 'Didn’t forget the gift?' }, client: 'Lebo Coffee', year: 2025, duration: '0:08',
  },
  {
    id: 'lebo-top3', kind: 'short', src: 'shorts/lebo-top3.mp4', preview: 'previews/lebo-top3.mp4', poster: 'posters/lebo-top3.jpg',
    title: { ru: 'Топ-3 самых дорогих сортов', en: 'Top 3 priciest coffees' }, client: 'Lebo Coffee', year: 2025, duration: '0:42',
  },

  // ── Горизонтальные ──
  {
    id: 'cyprus-life-loyalty', kind: 'long', src: 'long/cyprus-life-loyalty.mp4', preview: 'previews/cyprus-life-loyalty.mp4', poster: 'posters/cyprus-life-loyalty.jpg',
    title: { ru: 'Программа лояльности VIP Club', en: 'VIP Club loyalty program' }, client: 'Cyprus Life', year: 2026, duration: '1:16',
  },
  {
    id: 'my-blog', kind: 'long', src: 'long/my-blog.mp4', preview: 'previews/my-blog.mp4', poster: 'posters/my-blog.jpg',
    title: { ru: 'Влог: пока-пока', en: 'Vlog: bye-bye' }, client: 'SERGEEV', year: 2026, duration: '2:31',
  },
]

export const shorts = videos.filter((v) => v.kind === 'short')
export const longs = videos.filter((v) => v.kind === 'long')

/**
 * Первый экран. Шоурила пока нет → немой автомонтаж из вертикалок (scripts/encode-portfolio.sh).
 * Появится шоурил → положить его в `showreel`: кнопка hero начнёт открывать его со звуком.
 */
export const hero: { bg: string; poster: string; showreel?: VideoItem } = {
  bg: 'hero/montage.mp4',
  poster: 'posters/hero.jpg',
}

/** Интро «Обо мне» — видео-знакомство на камеру. */
export const intro: { src: string; poster: string; duration: string; title: L10n } = {
  src: 'intro/intro.mp4',
  poster: 'posters/intro.jpg',
  duration: '0:57',
  title: { ru: 'Знакомство', en: 'Intro' },
}
