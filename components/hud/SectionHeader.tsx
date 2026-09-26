import { cn } from '@/lib/cn'

/** Моно-лейбл секции-«клипа»: `[02] SHORTS ──────── 00:24`. */
export function SectionHeader({
  n,
  label,
  dur,
  className,
}: {
  n: string
  label: string
  dur: string
  className?: string
}) {
  return (
    <div className={cn('px-gutter mono-label flex items-center gap-4', className)}>
      <span>
        [{n}] {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-current opacity-30" />
      <span className="tabular-nums opacity-60">{dur}</span>
    </div>
  )
}
