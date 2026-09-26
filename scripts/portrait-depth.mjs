// Карта глубины для 3D-портрета (components/sections/Portrait3D.tsx).
// R — глубина от нейросети Depth Anything V2 (больше = ближе), G — мягкая маска силуэта (фон — белый).
//
// Зависимости тяжёлые (~500 MB) и нужны один раз, поэтому не лежат в проекте:
//   mkdir -p /tmp/portrait-depth && cd /tmp/portrait-depth && npm init -y >/dev/null
//   npm pkg set type=module allowScripts.onnxruntime-node=true allowScripts.sharp=true allowScripts.protobufjs=true
//   npm i @huggingface/transformers
//   cp <repo>/scripts/portrait-depth.mjs . && node portrait-depth.mjs <photo.jpg> <repo>/public/portrait-depth.png
// Первый запуск скачивает модель (~100 MB) с huggingface.co.
// Фото лучше на светлом однотонном фоне: маска = белый фон, связанный с краями кадра.
import { pipeline, RawImage } from '@huggingface/transformers'
import sharp from 'sharp'

const [src, out, model = 'onnx-community/depth-anything-v2-small'] = process.argv.slice(2)
const W = 512
const meta = await sharp(src).metadata()
const H = Math.round((W * meta.height) / meta.width)

// 1. Глубина нейросетью (относительная, больше = ближе)
const estimator = await pipeline('depth-estimation', model, { dtype: 'fp32' })
const img = await RawImage.read(src)
const { predicted_depth: pd } = await estimator(img)
const [ph, pw] = pd.dims
let flo = Infinity,
  fhi = -Infinity
for (const v of pd.data) {
  if (v < flo) flo = v
  if (v > fhi) fhi = v
}
const u8 = Buffer.alloc(pw * ph)
for (let i = 0; i < pw * ph; i++) u8[i] = Math.round(((pd.data[i] - flo) / (fhi - flo)) * 255)
const d = await sharp(u8, { raw: { width: pw, height: ph, channels: 1 } })
  .resize(W, H)
  .extractChannel(0)
  .raw()
  .toBuffer()

// 2. Маска: белый фон, связанный с краями кадра (светлая кожа внутри силуэта не считается фоном)
const g = await sharp(src).resize(W, H).extractChannel(0).raw().toBuffer()
const bg = new Uint8Array(W * H)
const stack = []
const push = (x, y) => {
  const i = y * W + x
  if (!bg[i] && g[i] > 236) {
    bg[i] = 1
    stack.push(i)
  }
}
for (let x = 0; x < W; x++) {
  push(x, 0)
  push(x, H - 1)
}
for (let y = 0; y < H; y++) {
  push(0, y)
  push(W - 1, y)
}
while (stack.length) {
  const i = stack.pop()
  const x = i % W,
    y = (i / W) | 0
  if (x > 0) push(x - 1, y)
  if (x < W - 1) push(x + 1, y)
  if (y > 0) push(x, y - 1)
  if (y < H - 1) push(x, y + 1)
}
// нижний край кадра — это срез рубашки, а не фон: не трогаем то, что уже не фон
const mask = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) mask[i] = bg[i] ? 0 : 255
// Широкий блюр: глубина плавно скругляется к краю силуэта, а не обрывается «стеной»
const maskSoft = await sharp(mask, { raw: { width: W, height: H, channels: 1 } })
  .blur(4)
  .extractChannel(0)
  .raw()
  .toBuffer()

for (const [n, b] of Object.entries({ d, g, maskSoft }))
  if (b.length !== W * H) throw new Error(`${n}: ${b.length} != ${W * H}`)
// 3. Нормализация глубины по силуэту
let lo = 255,
  hi = 0
for (let i = 0; i < W * H; i++)
  if (mask[i]) {
    lo = Math.min(lo, d[i])
    hi = Math.max(hi, d[i])
  }
const rgb = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  rgb[i * 3] = mask[i] ? Math.round(((d[i] - lo) / Math.max(1, hi - lo)) * 255) : 0
  rgb[i * 3 + 1] = maskSoft[i]
}
await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .png({ compressionLevel: 9 })
  .toFile(out)
console.log({ W, H, lo, hi })
