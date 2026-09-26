// Секции-«клипы»: номер для HUD/лейблов и условная длительность клипа на таймлайне.
export const SECTIONS = {
  hero: { n: '00', id: 'top', dur: '00:08' },
  marquee: { n: '01', id: 'formats', dur: '00:04' },
  shorts: { n: '02', id: 'shorts', dur: '00:24' },
  long: { n: '03', id: 'long-form', dur: '00:20' },
  about: { n: '04', id: 'about', dur: '00:16' },
  services: { n: '05', id: 'services', dur: '00:14' },
  process: { n: '06', id: 'process', dur: '00:10' },
  numbers: { n: '07', id: 'numbers', dur: '00:10' },
  contact: { n: '08', id: 'contact', dur: '00:14' },
} as const

export type SectionKey = keyof typeof SECTIONS
