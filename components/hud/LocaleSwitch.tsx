'use client'

import { LOCALE_COOKIE, locales, type Locale } from '@/i18n/config'
import { cn } from '@/lib/cn'

/** id секции, которая сейчас пересекает середину экрана — чтобы после смены языка вернуться туда же. */
function currentSectionId(): string | undefined {
  const mid = window.innerHeight / 2
  for (const el of document.querySelectorAll<HTMLElement>('[data-section]')) {
    const r = el.getBoundingClientRect()
    if (r.top <= mid && r.bottom >= mid) return el.id || undefined
  }
}

// Разные root layout (/ru и /en) → переход всё равно полный, поэтому обычная навигация браузера
function switchLocale(target: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`
  const section = currentSectionId() ?? window.location.hash.slice(1)
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- нужен полный переход между root layout
  window.location.href = `/${target}${section && section !== 'top' ? `#${section}` : ''}`
}

export function LocaleSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: Locale) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (target !== locale) switchLocale(target)
  }

  return (
    <nav aria-label="Language" className={cn('flex items-center', className)}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 opacity-40">/</span>}
          <a
            href={`/${l}`}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? 'true' : undefined}
            onClick={(e) => go(e, l)}
            className={cn(
              'uppercase',
              l === locale ? 'underline underline-offset-4' : 'opacity-50 hover:opacity-100',
            )}
          >
            {l}
          </a>
        </span>
      ))}
    </nav>
  )
}
