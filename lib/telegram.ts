import 'server-only'

export const TELEGRAM_LIMIT = 4096

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error('[telegram] sendMessage failed', res.status, await res.text().catch(() => ''))
    return res.ok
  } catch (err) {
    console.error('[telegram] sendMessage error', (err as Error).message)
    return false
  }
}
