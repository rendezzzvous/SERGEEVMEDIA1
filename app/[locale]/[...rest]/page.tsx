import { notFound } from 'next/navigation'

// Любой неизвестный путь внутри локали → локализованный layout + not-found.tsx
export default function CatchAll() {
  notFound()
}
