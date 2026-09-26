import { Inter_Tight, JetBrains_Mono, Unbounded } from 'next/font/google'

// Имена CSS-переменных НЕ совпадают с именами в @theme (иначе self-reference в `@theme inline`)
export const display = Unbounded({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-unbounded',
})

export const body = Inter_Tight({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter-tight',
})

export const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-jetbrains',
  preload: false,
})
