'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/get-dictionary'
import { cn } from '@/lib/cn'
import { leadSchema, type LeadField } from '@/lib/lead-schema'

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'limited'
type T = Dictionary['contact']['form']

const FIELDS: LeadField[] = ['name', 'contact', 'message', 'budget']

export function LeadForm({ t, locale }: { t: T; locale: Locale }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({})
  const [sentAt, setSentAt] = useState(0)
  const startedAt = useRef(0)
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const showErrors = (fields: Partial<Record<string, unknown>>) => {
    const next: Partial<Record<LeadField, string>> = {}
    for (const f of FIELDS) if (fields[f]) next[f] = t.errors[f]
    setErrors(next)
    const first = FIELDS.find((f) => next[f])
    if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    return Object.keys(next).length > 0
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    const fd = new FormData(e.currentTarget)
    const parsed = leadSchema.safeParse({
      name: String(fd.get('name') ?? ''),
      contact: String(fd.get('contact') ?? ''),
      message: String(fd.get('message') ?? ''),
      budget: String(fd.get('budget') ?? ''),
      hp: String(fd.get('website') ?? ''),
      locale,
      t: startedAt.current,
    })
    if (!parsed.success) {
      showErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), true])))
      return
    }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (res.ok) {
        form.current?.reset()
        setSentAt(Date.now())
        setStatus('sent')
      } else if (res.status === 429) {
        setStatus('limited')
      } else if (res.status === 400) {
        const body = (await res.json().catch(() => ({}))) as { fields?: Record<string, unknown> }
        setStatus(showErrors(body.fields ?? {}) ? 'idle' : 'error')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="flex min-h-[420px] flex-col justify-between border-t border-ink pt-6">
        <div>
          <p className="font-display text-[clamp(48px,7vw,120px)] leading-[0.85] font-black tracking-[-0.04em]">
            {t.sent}
          </p>
          <SentClock since={sentAt} />
          <p className="mt-6 max-w-[30ch] text-xl leading-snug">{t.sentNote}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now()
            setStatus('idle')
          }}
          className="mono-label self-start border border-ink px-4 py-3 transition-colors hover:bg-ink hover:text-paper"
        >
          {t.again}
        </button>
      </div>
    )
  }

  const field = (name: LeadField, index: string, label: string, input: React.ReactNode, hint?: string) => (
    <label className="block border-t border-ink pt-4 pb-5">
      <span className="mono-label flex justify-between gap-4">
        <span>
          {index} — {label}
          {hint && <span className="opacity-50"> · {hint}</span>}
        </span>
        {errors[name] && (
          <span id={`${name}-error`} className="bg-ink px-1.5 py-0.5 text-paper">
            {errors[name]}
          </span>
        )}
      </span>
      {input}
    </label>
  )
  const inputCls =
    'mt-3 w-full resize-none bg-transparent text-[clamp(20px,1.9vw,30px)] leading-tight outline-none placeholder:text-ink/30'
  const aria = (name: LeadField) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form ref={form} noValidate onSubmit={onSubmit} className="relative">
      {field(
        'name',
        '01',
        t.name,
        <input name="name" autoComplete="name" maxLength={80} className={inputCls} {...aria('name')} />,
      )}
      {field(
        'contact',
        '02',
        t.contact,
        <input
          name="contact"
          autoComplete="email"
          maxLength={120}
          placeholder={t.contactHint}
          className={inputCls}
          {...aria('contact')}
        />,
      )}
      {field(
        'message',
        '03',
        t.message,
        <textarea
          name="message"
          rows={3}
          maxLength={1500}
          placeholder={t.messageHint}
          className={inputCls}
          {...aria('message')}
        />,
      )}
      {field(
        'budget',
        '04',
        t.budget,
        <input name="budget" maxLength={80} className={inputCls} {...aria('budget')} />,
        t.optional,
      )}

      {/* honeypot: людям не виден, боты заполняют */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className={cn(
          'font-display group mt-2 flex w-full items-center justify-between bg-ink px-5 py-5 text-left text-[clamp(20px,2vw,32px)] font-bold text-paper uppercase transition-colors hover:bg-paper hover:text-ink hover:outline hover:outline-1 hover:outline-ink disabled:opacity-60',
        )}
      >
        <span>{status === 'sending' ? t.sending : t.submit}</span>
        <span aria-hidden className="transition-transform group-hover:translate-x-2">
          →
        </span>
      </button>
      <p role="alert" className="mono-label mt-3 min-h-[1.2em]">
        {status === 'error' && t.error}
        {status === 'limited' && t.rateLimited}
      </p>
    </form>
  )
}

/** Таймкод с момента отправки: SENT ✓ 00:00:01 */
function SentClock({ since }: { since: number }) {
  const el = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const tick = () => {
      const s = Math.max(1, Math.floor((Date.now() - since) / 1000))
      if (el.current)
        el.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [since])
  return (
    <p className="mono-label mt-4 tabular-nums">
      ● REC <span ref={el}>00:00:01</span>
    </p>
  )
}
