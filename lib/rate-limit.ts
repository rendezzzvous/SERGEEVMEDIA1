import 'server-only'

// In-memory sliding window: один инстанс контейнера — этого достаточно.
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const hits = new Map<string, number[]>()
let calls = 0

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number }

export function rateLimit(key: string, now = Date.now()): RateLimitResult {
  if (++calls % 500 === 0) {
    for (const [k, list] of hits) if (!list.some((t) => now - t < WINDOW_MS)) hits.delete(k)
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= LIMIT) {
    hits.set(key, recent)
    return { ok: false, retryAfter: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) }
  }
  recent.push(now)
  hits.set(key, recent)
  return { ok: true }
}
