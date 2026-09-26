'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'
import { DitherPortrait } from './DitherPortrait'

/**
 * Объёмный портрет: сетка вершин смещается по карте глубины (public/portrait-depth.png:
 * R — глубина от нейросети Depth Anything V2, G — маска силуэта), бюст поворачивается по скроллу
 * вокруг собственной вертикальной оси. Свет зафиксирован → тени «ползут» по лицу при повороте.
 * Картинка дизерится Bayer 4×4 прямо в шейдере — тот же ink/paper-язык, что и у всего сайта.
 * Нет WebGL / потерян контекст → обычный 2D-дизеринг.
 */

const GRID_X = 160 // колонок сетки; строки — по пропорции фото
const DEPTH = 0.46 // глубина рельефа в долях ширины кадра
const PIVOT = 0.62 // ось вращения — на этой доле глубины (примерно центр головы)
const YAW = 38 // градусов в каждую сторону за проход секции
const PITCH = 5
const STATIC_YAW = -16 // поза для prefers-reduced-motion

const VERT = `
attribute vec3 a_pos;
attribute vec3 a_normal;
attribute vec2 a_uv;
uniform mat4 u_mvp;
uniform mat3 u_rot;
varying vec2 v_uv;
varying vec3 v_n;
void main() {
  v_uv = a_uv;
  v_n = u_rot * a_normal;
  gl_Position = u_mvp * vec4(a_pos, 1.0);
}`

const FRAG = `
precision mediump float;
uniform sampler2D u_color;
uniform sampler2D u_depth;
uniform float u_cell;
uniform vec3 u_light;
varying vec2 v_uv;
varying vec3 v_n;
// Bayer 2×2 → 4×4 без массивов (GLSL ES 1.0 не индексирует их динамически)
float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
void main() {
  if (texture2D(u_depth, v_uv).g < 0.5) discard;
  float lum = dot(texture2D(u_color, v_uv).rgb, vec3(0.299, 0.587, 0.114));
  float diff = max(dot(normalize(v_n), u_light), 0.0);
  float shade = clamp(lum * (0.42 + 0.78 * diff), 0.0, 1.0);
  shade = pow(shade, 1.35);
  float threshold = bayer4(gl_FragCoord.xy / u_cell) + 1.0 / 32.0;
  gl_FragColor = vec4(shade > threshold ? vec3(0.949, 0.949, 0.933) : vec3(0.039), 1.0);
}`

// ── мини-математика матриц (column-major, как ждёт WebGL) ──
type M4 = Float32Array
const mul = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      o[c * 4 + r] = s
    }
  return o
}
const translate = (x: number, y: number, z: number): M4 =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
const rotY = (a: number): M4 => {
  const c = Math.cos(a),
    s = Math.sin(a)
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
}
const rotX = (a: number): M4 => {
  const c = Math.cos(a),
    s = Math.sin(a)
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
}
const perspective = (fovY: number, aspect: number, near: number, far: number): M4 => {
  const f = 1 / Math.tan(fovY / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ])
}
const mat3Of = (m: M4) => new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]])

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Сетка из карты глубины: позиции, нормали, uv, индексы. Считается один раз на CPU. */
function buildMesh(depth: HTMLImageElement, aspectH: number) {
  const dw = depth.naturalWidth
  const dh = depth.naturalHeight
  const c = document.createElement('canvas')
  c.width = dw
  c.height = dh
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(depth, 0, 0)
  const px = ctx.getImageData(0, 0, dw, dh).data

  const gx = GRID_X
  const gy = Math.round(GRID_X * aspectH)
  const cols = gx + 1
  const rows = gy + 1
  const z = new Float32Array(cols * rows)
  const sample = (u: number, v: number) => {
    // билинейная выборка: R — глубина, G — мягкая маска (края силуэта плавно уходят назад)
    const x = u * (dw - 1)
    const y = v * (dh - 1)
    const x0 = Math.floor(x),
      y0 = Math.floor(y)
    const x1 = Math.min(dw - 1, x0 + 1),
      y1 = Math.min(dh - 1, y0 + 1)
    const fx = x - x0,
      fy = y - y0
    const at = (xx: number, yy: number) => {
      const i = (yy * dw + xx) * 4
      return (px[i] / 255) * (px[i + 1] / 255)
    }
    return (
      (at(x0, y0) * (1 - fx) + at(x1, y0) * fx) * (1 - fy) + (at(x0, y1) * (1 - fx) + at(x1, y1) * fx) * fy
    )
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) z[j * cols + i] = sample(i / gx, j / gy) * DEPTH

  const pos = new Float32Array(cols * rows * 3)
  const nor = new Float32Array(cols * rows * 3)
  const uv = new Float32Array(cols * rows * 2)
  const dx = 1 / gx
  const dy = aspectH / gy
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i
      pos[k * 3] = i / gx - 0.5
      pos[k * 3 + 1] = (0.5 - j / gy) * aspectH
      pos[k * 3 + 2] = z[k]
      uv[k * 2] = i / gx
      uv[k * 2 + 1] = j / gy
      const zl = z[j * cols + Math.max(0, i - 1)],
        zr = z[j * cols + Math.min(gx, i + 1)]
      const zu = z[Math.max(0, j - 1) * cols + i],
        zd = z[Math.min(gy, j + 1) * cols + i]
      // y мира растёт вверх, а j — вниз
      let nx = -(zr - zl) / (2 * dx),
        ny = (zd - zu) / (2 * dy),
        nz = 1
      const len = Math.hypot(nx, ny, nz)
      nx /= len
      ny /= len
      nz /= len
      nor[k * 3] = nx
      nor[k * 3 + 1] = ny
      nor[k * 3 + 2] = nz
    }
  const idx = new Uint16Array(gx * gy * 6)
  let t = 0
  for (let j = 0; j < gy; j++)
    for (let i = 0; i < gx; i++) {
      const a = j * cols + i,
        b = a + 1,
        cc = a + cols,
        d = cc + 1
      idx.set([a, cc, b, b, cc, d], t)
      t += 6
    }
  return { pos, nor, uv, idx }
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

function texture(gl: WebGLRenderingContext, img: HTMLImageElement, unit: number) {
  const tex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  // NPOT в WebGL1: только CLAMP и без мипмапов
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
}

export function Portrait3D({
  src,
  depthSrc,
  alt,
  className,
}: {
  src: string
  depthSrc: string
  alt: string
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const cv = canvas.current!
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      setFailed(true)
      return
    }
    let disposed = false
    let cleanup = () => {}

    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    cv.addEventListener('webglcontextlost', onLost)

    Promise.all([loadImage(src), loadImage(depthSrc)])
      .then(([colorImg, depthImg]) => {
        if (disposed) return
        const aspectH = colorImg.naturalHeight / colorImg.naturalWidth
        const mesh = buildMesh(depthImg, aspectH)

        const prog = gl.createProgram()!
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
          throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
        gl.useProgram(prog)

        const attr = (name: string, data: Float32Array, size: number) => {
          const loc = gl.getAttribLocation(prog, name)
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
          gl.enableVertexAttribArray(loc)
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
        }
        attr('a_pos', mesh.pos, 3)
        attr('a_normal', mesh.nor, 3)
        attr('a_uv', mesh.uv, 2)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, gl.STATIC_DRAW)

        texture(gl, colorImg, 0)
        texture(gl, depthImg, 1)
        gl.uniform1i(gl.getUniformLocation(prog, 'u_color'), 0)
        gl.uniform1i(gl.getUniformLocation(prog, 'u_depth'), 1)
        const lx = -0.45,
          ly = 0.5,
          lz = 0.74,
          ll = Math.hypot(lx, ly, lz)
        gl.uniform3f(gl.getUniformLocation(prog, 'u_light'), lx / ll, ly / ll, lz / ll)
        const uMvp = gl.getUniformLocation(prog, 'u_mvp')
        const uRot = gl.getUniformLocation(prog, 'u_rot')
        const uCell = gl.getUniformLocation(prog, 'u_cell')

        gl.enable(gl.DEPTH_TEST)
        gl.clearColor(0.949, 0.949, 0.933, 1)

        const fov = (26 * Math.PI) / 180
        let dirty = true
        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          const w = Math.max(1, Math.round(cv.clientWidth * dpr))
          const h = Math.max(1, Math.round(cv.clientHeight * dpr))
          if (cv.width !== w || cv.height !== h) {
            cv.width = w
            cv.height = h
          }
          gl.viewport(0, 0, w, h)
          // Зерно дизеринга ≈ 1.5 CSS-пикселя — как у 2D-версии
          gl.uniform1f(uCell, Math.max(1, Math.round(dpr * 1.5)))
          dirty = true
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(cv)

        const pivot = DEPTH * PIVOT
        // Камера отъезжает так, чтобы кадр по высоте вписался в холст
        const dist = aspectH / 2 / Math.tan(fov / 2) + 0.08
        const cur = { yaw: STATIC_YAW, pitch: 0 }
        const target = { yaw: STATIC_YAW, pitch: 0 }

        const draw = () => {
          // Ось вращения — внутри головы (z = pivot); камера смотрит на неё с расстояния dist
          const rot = mul(rotX((cur.pitch * Math.PI) / 180), rotY((cur.yaw * Math.PI) / 180))
          const model = mul(rot, translate(0, 0, -pivot))
          const proj = perspective(fov, cv.width / cv.height, 0.1, 10)
          gl.uniformMatrix4fv(uMvp, false, mul(proj, mul(translate(0, 0, -dist), model)))
          gl.uniformMatrix3fv(uRot, false, mat3Of(rot))
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0)
          if (readout.current) {
            const y = cur.yaw
            readout.current.textContent = `YAW ${y >= 0 ? '+' : '−'}${Math.abs(y).toFixed(1).padStart(4, '0')}°`
          }
        }

        const reduce = prefersReducedMotion()
        // Рисуем только когда угол изменился — простаивающий портрет не грузит GPU
        const tick = () => {
          const k = reduce ? 1 : 0.12 // инерция: голова «догоняет» скролл
          const dy = target.yaw - cur.yaw
          const dp = target.pitch - cur.pitch
          if (Math.abs(dy) > 0.01 || Math.abs(dp) > 0.01) {
            cur.yaw += dy * k
            cur.pitch += dp * k
            dirty = true
          }
          if (dirty) {
            dirty = false
            draw()
          }
        }
        gsap.ticker.add(tick)

        let st: ScrollTrigger | undefined
        if (!reduce) {
          st = ScrollTrigger.create({
            trigger: box.current,
            // Весь поворот — пока портрет в кадре, а не на входе/выходе за край экрана
            start: 'top 80%',
            end: 'bottom 20%',
            onUpdate: (s) => {
              target.yaw = (s.progress * 2 - 1) * YAW
              target.pitch = (0.5 - s.progress) * 2 * PITCH
            },
          })
          target.yaw = (st.progress * 2 - 1) * YAW
          cur.yaw = target.yaw
        }
        draw()
        setReady(true)

        cleanup = () => {
          gsap.ticker.remove(tick)
          st?.kill()
          ro.disconnect()
        }
      })
      .catch((err) => {
        console.error('[Portrait3D]', err)
        if (!disposed) setFailed(true)
      })

    return () => {
      disposed = true
      cleanup()
      cv.removeEventListener('webglcontextlost', onLost)
    }
  }, [src, depthSrc])

  if (failed) return <DitherPortrait src={src} alt={alt} className={className} />

  return (
    <div ref={box} className={cn('relative aspect-[3/4] overflow-hidden bg-paper', className)}>
      <canvas
        ref={canvas}
        role="img"
        aria-label={alt}
        className={cn(
          'absolute inset-0 h-full w-full transition-opacity duration-500',
          ready ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        ref={readout}
        aria-hidden
        className="mono-label absolute right-2 bottom-2 tabular-nums opacity-60"
      >
        YAW +00.0°
      </span>
    </div>
  )
}
