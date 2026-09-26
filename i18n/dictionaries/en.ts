import type { Dictionary } from './ru'

const en = {
  meta: {
    title: 'SERGEEV — video editor',
    description:
      'Shooting and editing Reels, Shorts and TikTok for brands, real estate and artists. Videos that perform — and look beautiful.',
  },
  nav: { work: 'Work', about: 'About', services: 'Services', contact: 'Contact' },
  hud: {
    rec: 'REC',
    sections: {
      '00': 'HERO',
      '01': 'FORMATS',
      '02': 'SHORTS',
      '03': 'HORIZON',
      '04': 'ABOUT',
      '05': 'SERVICES',
      '06': 'PROCESS',
      '07': 'NUMBERS',
      '08': 'CONTACT',
    },
  },
  cursor: { play: 'PLAY', open: 'OPEN', drag: 'DRAG' },
  hero: {
    role: 'монтажёр',
    roleAlt: 'video editor',
    tags: 'reels · youtube · commercial · clips',
    scroll: 'SCROLL ↓',
    work: 'See the work',
    watch: 'Watch the showreel',
  },
  marquee: ['REELS', 'SHORTS', 'YOUTUBE', 'COMMERCIAL', 'MUSIC VIDEO', 'TIKTOK'],
  shorts: {
    title: 'Vertical',
    lead: 'Reels, Shorts, TikTok — the first three seconds decide everything.',
    hint: 'Swipe →',
    views: 'views',
  },
  long: {
    title: 'Horizon',
    lead: 'Horizontal format: YouTube, commercials, vlogs — long distance, precise rhythm.',
    play: 'Watch',
  },
  about: { title: 'About', portraitAlt: 'Portrait of video editor SERGEEV', intro: 'Watch the intro' },
  services: {
    title: 'Services',
    from: 'from',
    onRequest: 'on request',
    currency: 'usd',
    note: 'Price depends on footage volume, graphics and deadline. You get an exact quote after the brief.',
  },
  process: { title: 'Process' },
  numbers: { title: 'Numbers', clients: 'Worked with' },
  contact: {
    headline: 'LET’S CUT',
    lead: 'Tell me about the project — I reply within a day.',
    direct: 'Direct',
    soon: 'coming soon',
    form: {
      name: 'Name',
      contact: 'Contact',
      contactHint: 'Telegram, email or phone',
      message: 'Project',
      messageHint: 'What kind of video, platform, deadline, references',
      budget: 'Budget',
      optional: 'optional',
      submit: 'Send',
      sending: 'Sending…',
      sent: 'SENT ✓',
      sentNote: 'Got it. I’ll get back to you soon.',
      again: 'Send another',
      error: 'Couldn’t send. Please message me on Telegram directly.',
      rateLimited: 'Too many requests in a row. Please try again later.',
      errors: {
        name: 'At least 2 characters',
        contact: 'Tell me how to reach you',
        message: 'A bit more detail please (10+ characters)',
        budget: 'Too long',
      },
    },
  },
  lightbox: { close: 'Close', play: 'Play', pause: 'Pause', mute: 'Mute', unmute: 'Sound', seek: 'Seek' },
  footer: { top: '↑ TOP', rights: 'All rights reserved' },
  localeName: { ru: 'RU', en: 'EN' },
} satisfies Dictionary

export default en
