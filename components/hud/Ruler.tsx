/** Линейка с тиками вдоль левого края секции (цвет — currentColor секции). */
export function Ruler() {
  return (
    <div
      aria-hidden
      className="ruler pointer-events-none absolute top-0 left-0 hidden h-full w-[14px] md:block"
    />
  )
}
