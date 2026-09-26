import * as z from 'zod'

// Общая схема для клиента и сервера
export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(1500),
  budget: z.string().trim().max(80).default(''),
  locale: z.enum(['ru', 'en']).default('ru'),
  // honeypot: схема НЕ должна на нём падать, иначе бот учится по 400
  hp: z.string().max(500).default(''),
  // Date.now() при монтировании формы
  t: z.number().int().nonnegative(),
})

export type LeadInput = z.input<typeof leadSchema>
export type Lead = z.output<typeof leadSchema>
export type LeadField = 'name' | 'contact' | 'message' | 'budget'
