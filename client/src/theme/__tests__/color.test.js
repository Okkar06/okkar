import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  ensureContrast,
  hexToRgb,
  hueDistance,
  mostReadable,
  normalizeHex,
  oklchToRgb,
  rgbToHex,
  rgbToOklch,
} from '../color'

describe('normalizeHex', () => {
  it('accepts 6-digit hex with or without the hash, any case', () => {
    expect(normalizeHex('#3B82F6')).toBe('#3b82f6')
    expect(normalizeHex('3b82f6')).toBe('#3b82f6')
    expect(normalizeHex('  #ffffff ')).toBe('#ffffff')
  })

  it('rejects everything else', () => {
    for (const bad of ['#fff', 'red', '#12345g', '#1234567', '', null, undefined, 42, {}, 'rgb(1,2,3)']) {
      expect(normalizeHex(bad)).toBeNull()
    }
  })
})

describe('sRGB <-> OKLCH', () => {
  it('round-trips colours across the gamut', () => {
    for (const hex of ['#000000', '#ffffff', '#3b82f6', '#ef4444', '#22c55e', '#ffd21e', '#808080', '#ff00ff']) {
      expect(rgbToHex(oklchToRgb(rgbToOklch(hexToRgb(hex))))).toBe(hex)
    }
  })

  it('pins the hue of greys so derived shades stay neutral', () => {
    expect(rgbToOklch([128, 128, 128]).h).toBe(0)
  })

  it('maps out-of-gamut colours back into sRGB by giving up chroma', () => {
    const rgb = oklchToRgb({ l: 0.5, c: 0.9, h: 150 })
    for (const channel of rgb) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    }
    // Still green, not clipped to some other hue.
    expect(hueDistance(rgbToOklch(rgb).h, 150)).toBeLessThan(6)
  })
})

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5)
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBe(1)
    // #767676 on white is the canonical "just passes AA" grey.
    expect(contrastRatio([118, 118, 118], [255, 255, 255])).toBeGreaterThanOrEqual(4.5)
  })

  it('ensureContrast lightens on dark backgrounds and darkens on light ones', () => {
    const midBlue = rgbToOklch(hexToRgb('#3b82f6'))

    const onDark = ensureContrast(midBlue, [[10, 10, 10]], 7)
    expect(contrastRatio(onDark, [10, 10, 10])).toBeGreaterThanOrEqual(7)
    expect(rgbToOklch(onDark).l).toBeGreaterThan(midBlue.l)

    const onLight = ensureContrast(midBlue, [[250, 250, 250]], 7)
    expect(contrastRatio(onLight, [250, 250, 250])).toBeGreaterThanOrEqual(7)
    expect(rgbToOklch(onLight).l).toBeLessThan(midBlue.l)
  })

  it('ensureContrast leaves an already-readable colour untouched', () => {
    const white = rgbToOklch([255, 255, 255])
    expect(ensureContrast(white, [[0, 0, 0]], 4.5)).toEqual([255, 255, 255])
  })

  it('mostReadable picks dark ink for light fills and light ink for dark fills', () => {
    const dark = [8, 9, 20]
    const light = [255, 255, 255]
    expect(mostReadable([255, 210, 30], [dark, light])).toBe(dark)
    expect(mostReadable([20, 40, 120], [dark, light])).toBe(light)
  })
})
