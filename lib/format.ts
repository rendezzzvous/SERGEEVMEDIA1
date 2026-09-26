// Детерминированное форматирование (без Intl): сервер и клиент дают одинаковую строку → без hydration mismatch.
export function groupThousands(n: number, sep = ' '): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}

export function formatPrice(price: { rub: number; usd: number }, currency: 'rub' | 'usd'): string {
  return currency === 'rub' ? `${groupThousands(price.rub)} ₽` : `$${groupThousands(price.usd, ',')}`
}
