const pad = (n: number) => String(n).padStart(2, '0')

/** Секунды → SMPTE-подобный таймкод HH:MM:SS:FF. */
export function toTimecode(seconds: number, fps = 24): string {
  const totalFrames = Math.max(0, Math.floor(seconds * fps))
  const ff = totalFrames % fps
  const s = Math.floor(totalFrames / fps)
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`
}
