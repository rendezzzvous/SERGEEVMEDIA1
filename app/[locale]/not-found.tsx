import Link from 'next/link'

// Рендерится внутри locale-layout; язык берём из <html lang> на клиенте нельзя — показываем обе строки
export default function NotFound() {
  return (
    <main className="theme-ink flex min-h-svh flex-col justify-between bg-ink px-[clamp(16px,3.2vw,56px)] pt-24 pb-24 text-paper">
      <p className="mono-label">[404] NO SIGNAL · 00:00:00:00</p>
      <h1 className="font-display text-[clamp(64px,19vw,420px)] leading-[0.8] font-black tracking-[-0.055em]">
        404
      </h1>
      <div className="flex flex-col gap-3 text-xl">
        <p>Кадр не найден · Frame not found</p>
        <p className="mono-label flex gap-4">
          <Link href="/ru" className="underline underline-offset-4">
            ← На главную
          </Link>
          <Link href="/en" className="underline underline-offset-4">
            ← Home
          </Link>
        </p>
      </div>
    </main>
  )
}
