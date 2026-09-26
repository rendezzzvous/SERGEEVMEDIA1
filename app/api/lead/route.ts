import * as z from 'zod'
import { leadSchema, type Lead } from '@/lib/lead-schema'
import { rateLimit } from '@/lib/rate-limit'
import { readSecret } from '@/lib/secrets'
import { escapeHtml, sendTelegramMessage, TELEGRAM_LIMIT } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIN_FILL_MS = 3000

const json = (body: unknown, init?: ResponseInit) => Response.json(body, init)

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

// Сравниваем Origin с Host/X-Forwarded-Host, а не с SITE_URL: забытая переменная не должна ломать форму
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // curl / серверные клиенты; браузер для POST всегда шлёт Origin
  const host = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function formatLead(lead: Lead, ip: string): string {
  const head = [
    '<b>🎬 Новая заявка — SERGEEV</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Контакт:</b> ${escapeHtml(lead.contact)}`,
    lead.budget ? `<b>Бюджет:</b> ${escapeHtml(lead.budget)}` : null,
    `<b>Язык:</b> ${lead.locale.toUpperCase()} · <code>${escapeHtml(ip)}</code>`,
    '',
  ]
    .filter((l) => l !== null)
    .join('\n')
  const room = TELEGRAM_LIMIT - head.length - 1
  let body = escapeHtml(lead.message)
  // Режем по экранированной строке и не оставляем обрубок сущности вроде «&am»
  if (body.length > room) body = body.slice(0, room - 1).replace(/&[a-z]*$/, '') + '…'
  return `${head}\n${body}`
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, { status: 403 })

  const ip = clientIp(req)
  const limited = rateLimit(ip)
  if (!limited.ok) {
    return json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(limited.retryAfter) } },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ ok: false, error: 'bad_json' }, { status: 400 })
  }

  // Honeypot проверяем до схемы: бот не должен учиться по 400
  const hp = (raw as { hp?: unknown } | null)?.hp
  if (typeof hp === 'string' && hp !== '') return json({ ok: true })

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    return json(
      { ok: false, error: 'invalid', fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    )
  }
  const lead = parsed.data

  // Форма отправлена быстрее человека → тихий «успех»
  if (Date.now() - lead.t < MIN_FILL_MS) return json({ ok: true })

  const token = readSecret('TELEGRAM_BOT_TOKEN')
  const chatId = readSecret('TELEGRAM_CHAT_ID')
  if (!token || !chatId) {
    console.error('[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not configured')
    return json({ ok: false, error: 'not_configured' }, { status: 503 })
  }

  const delivered = await sendTelegramMessage(token, chatId, formatLead(lead, ip))
  return delivered ? json({ ok: true }) : json({ ok: false, error: 'delivery_failed' }, { status: 502 })
}
