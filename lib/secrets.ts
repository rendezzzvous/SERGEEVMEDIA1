import 'server-only'
import { existsSync, readFileSync } from 'node:fs'

// VAR → VAR_FILE → /run/secrets/<var> → /run/secrets/<VAR>. Работает и с compose `secrets:`, и с env из панели.
const cache = new Map<string, string | undefined>()

export function readSecret(name: string): string | undefined {
  if (cache.has(name)) return cache.get(name)
  let value = process.env[name]?.trim() || undefined
  if (!value) {
    for (const path of [
      process.env[`${name}_FILE`],
      `/run/secrets/${name.toLowerCase()}`,
      `/run/secrets/${name}`,
    ]) {
      if (!path || !existsSync(/*turbopackIgnore: true*/ path)) continue
      try {
        value = readFileSync(/*turbopackIgnore: true*/ path, 'utf8').trim() || undefined
      } catch (err) {
        // Частая причина — права файла: compose file-secret = bind mount, uid/gid/mode не применяются
        console.error(`[secrets] cannot read ${path}:`, (err as Error).message)
      }
      if (value) break
    }
  }
  // Пустое значение не кэшируем: секрет могут подложить без рестарта
  if (value) cache.set(name, value)
  return value
}

export function requireSecret(name: string): string {
  const value = readSecret(name)
  if (!value) throw new Error(`Missing secret ${name}`)
  return value
}
