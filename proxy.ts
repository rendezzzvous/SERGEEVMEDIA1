import { NextResponse, type NextRequest } from 'next/server'
import { hasLocale, LOCALE_COOKIE } from '@/i18n/config'
import { negotiateLocale } from '@/i18n/negotiate'

// Всё без локали → /ru или /en: сначала cookie, затем Accept-Language
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (hasLocale(pathname.split('/')[1])) return NextResponse.next()

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = hasLocale(cookie) ? cookie : negotiateLocale(request.headers.get('accept-language'))

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  const res = NextResponse.redirect(url)
  res.headers.set('vary', 'accept-language, cookie')
  res.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 31_536_000, sameSite: 'lax' })
  return res
}

export const config = {
  // api, статика Next и любые файлы с расширением (robots.txt, sitemap.xml, icon.svg…) — мимо
  matcher: ['/((?!api|_next/static|_next/image|apple-icon|icon|.*\\..*).*)'],
}
