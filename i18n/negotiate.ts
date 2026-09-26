import { defaultLocale, hasLocale, type Locale } from './config'

/** Accept-Language по q-весам, без зависимостей: `en-US,en;q=0.9,ru;q=0.8` → 'en'. */
export function negotiateLocale(header: string | null): Locale {
  if (!header) return defaultLocale
  const ranked = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';')
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      const weight = q ? Number.parseFloat(q.slice(2)) : 1
      return { tag: tag.trim(), weight: Number.isFinite(weight) ? weight : 0, index }
    })
    .filter((r) => r.tag && r.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)

  for (const { tag } of ranked) {
    if (hasLocale(tag)) return tag
    const base = tag.split('-')[0]
    if (hasLocale(base)) return base
  }
  return defaultLocale
}
