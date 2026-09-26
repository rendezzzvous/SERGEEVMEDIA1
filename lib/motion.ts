'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// iOS-тулбар не должен рефрешить pin'ы
ScrollTrigger.config({ ignoreMobileResize: true })

/** Совпадает с `@custom-variant desktop` в globals.css. */
export const DESKTOP_MQ = '(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)'
export const MOTION_MQ = '(prefers-reduced-motion: no-preference)'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, useGSAP }
