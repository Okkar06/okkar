/**
 * Colour maths for the theme engine: sRGB <-> OKLCH conversion and WCAG 2.x
 * contrast. Pure functions, no DOM — everything here is unit-tested.
 *
 * OKLCH is used for derivation because equal steps in its lightness look like
 * equal steps to the eye, so "a darker shade of the picked colour" means the
 * same thing for a yellow as it does for a blue.
 */

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Returns a lowercase `#rrggbb`, or null when the input is not a 6-digit hex. */
export function normalizeHex(value) {
  if (typeof value !== 'string') return null
  const match = HEX_PATTERN.exec(value.trim())
  return match ? `#${match[1].toLowerCase()}` : null
}

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex)
  if (!normalized) throw new TypeError(`Not a #rrggbb colour: ${String(hex)}`)
  const int = Number.parseInt(normalized.slice(1), 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const toLinear = (channel) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

/** sRGB [0-255, 0-255, 0-255] -> { l, c, h } (l 0-1, c ~0-0.4, h degrees). */
export function rgbToOklch([r, g, b]) {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const c = Math.hypot(A, B)
  // A grey has no meaningful hue; pin it so derived shades stay neutral.
  const h = c < 0.002 ? 0 : (Math.atan2(B, A) * 180) / Math.PI
  return { l: L, c, h: (h + 360) % 360 }
}

function oklchToLinear({ l, c, h }) {
  const hr = (h * Math.PI) / 180
  const A = c * Math.cos(hr)
  const B = c * Math.sin(hr)

  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const GAMUT_EPSILON = 0.0005
const inGamut = (linear) =>
  linear.every((channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON)

/**
 * { l, c, h } -> sRGB [r, g, b]. Colours outside the sRGB gamut keep their
 * lightness and hue and give up chroma until they fit, so a derived shade is
 * never silently clipped to a different hue.
 */
export function oklchToRgb({ l, c, h }) {
  const lightness = clamp(l, 0, 1)
  let chroma = Math.max(0, c)
  let linear = oklchToLinear({ l: lightness, c: chroma, h })

  if (!inGamut(linear)) {
    let low = 0
    let high = chroma
    for (let i = 0; i < 20; i += 1) {
      chroma = (low + high) / 2
      if (inGamut(oklchToLinear({ l: lightness, c: chroma, h }))) low = chroma
      else high = chroma
    }
    linear = oklchToLinear({ l: lightness, c: low, h })
  }

  return linear.map((channel) => Math.round(clamp(fromLinear(clamp(channel, 0, 1)), 0, 1) * 255))
}

/** WCAG relative luminance of an sRGB triplet. */
export function luminance([r, g, b]) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** WCAG contrast ratio between two sRGB triplets (1 to 21). */
export function contrastRatio(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** The lowest contrast `color` has against any of `backgrounds`. */
export function worstContrast(color, backgrounds) {
  return Math.min(...backgrounds.map((background) => contrastRatio(color, background)))
}

/**
 * Nudges a colour's lightness — away from the backgrounds it sits on — until
 * it clears `minimum` contrast against every one of them. Hue is kept, so the
 * result is still recognisably the same colour, just readable.
 */
export function ensureContrast(lch, backgrounds, minimum) {
  const averageLuminance =
    backgrounds.reduce((sum, background) => sum + luminance(background), 0) / backgrounds.length
  // 0.179 is the luminance at which black and white text contrast equally.
  const step = averageLuminance < 0.179 ? 0.005 : -0.005

  let current = { ...lch, l: clamp(lch.l, 0, 1) }
  let rgb = oklchToRgb(current)

  while (worstContrast(rgb, backgrounds) < minimum && current.l > 0 && current.l < 1) {
    current = { ...current, l: clamp(current.l + step, 0, 1) }
    rgb = oklchToRgb(current)
  }

  return rgb
}

/** Whichever candidate reads best on `background`. */
export function mostReadable(background, candidates) {
  return candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background) ? candidate : best,
  )
}

/** Smallest angle between two hues, in degrees (0 to 180). */
export function hueDistance(a, b) {
  const delta = Math.abs(a - b) % 360
  return delta > 180 ? 360 - delta : delta
}
