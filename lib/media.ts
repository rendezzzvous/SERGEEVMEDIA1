import { CDN_BASE } from '@/content/site'

/** Путь из content/videos.ts → полный URL на CDN. Абсолютные URL и пути от корня отдаются как есть. */
export function cdn(path: string): string
export function cdn(path: string | undefined): string | undefined
export function cdn(path: string | undefined) {
  if (!path) return undefined
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path
  return `${CDN_BASE}/${path.replace(/^\//, '')}`
}
