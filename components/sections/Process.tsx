import { Ruler } from '@/components/hud/Ruler'
import { SectionHeader } from '@/components/hud/SectionHeader'
import type { ProcessStep } from '@/content/types'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { SECTIONS } from '@/lib/sections'

interface Props {
  t: Dictionary['process']
  label: string
  locale: Locale
  steps: ProcessStep[]
  rounds: number
}

export function Process({ t, label, locale, steps, rounds }: Props) {
  return (
    <section
      id={SECTIONS.process.id}
      data-section={SECTIONS.process.n}
      className="relative bg-paper py-20 text-ink md:py-28"
    >
      <Ruler />
      <SectionHeader n={SECTIONS.process.n} label={label} dur={SECTIONS.process.dur} />
      <h2 className="px-gutter font-display text-[clamp(40px,11.5vw,220px)] leading-[0.85] font-black tracking-[-0.04em] uppercase mt-10 whitespace-nowrap md:mt-14">
        {t.title}
      </h2>
      <ol className="px-gutter mt-12 grid gap-px md:mt-16 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className="relative flex flex-col gap-4 border-t border-ink pt-5 pb-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pb-0 lg:pl-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display text-outline text-[clamp(72px,9vw,168px)] leading-[0.8] font-black tracking-[-0.05em]">
                {String(i + 1).padStart(2, '0')}
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden className="font-display pr-4 text-3xl font-light">
                  →
                </span>
              )}
            </div>
            <h3 className="font-display text-[clamp(20px,1.8vw,30px)] leading-tight font-bold uppercase">
              {step.title[locale]}
            </h3>
            <p className="max-w-[32ch] text-base leading-snug opacity-80">
              {step.text[locale].replace('{rounds}', String(rounds))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
