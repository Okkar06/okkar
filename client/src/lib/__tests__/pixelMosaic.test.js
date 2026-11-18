import { describe, expect, it } from 'vitest'
import { averageColor, buildMosaic, detectBackground, gridLabels, mixColor, splitThreshold, stylize } from '../pixelMosaic'

const WHITE = [250, 250, 250, 255]
const SKIN = [210, 160, 130, 255]
const DARK = [40, 30, 30, 255]

/** A width × height image painted by paint(x, y) → RGBA. */
function image(width, height, paint) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) pixels.set(paint(x, y), (y * width + x) * 4)
  return { pixels, width, height }
}

/** White background; a flat skin-coloured block (16..48 × 16..64); a checkerboard "eye" in one corner of it. */
const portrait = () =>
  image(64, 64, (x, y) => {
    if (x < 16 || x >= 48 || y < 16) return WHITE
    if (x < 24 && y < 24) return (x + y) % 2 ? DARK : SKIN
    return SKIN
  })

describe('detectBackground', () => {
  it('cuts away a plain background that touches the top or sides', () => {
    const sample = portrait()
    const mask = detectBackground(sample.pixels, 64, 64, 0.12)
    expect(mask[0]).toBe(1)
    expect(mask[20 * 64 + 2]).toBe(1)
    expect(mask[40 * 64 + 30]).toBe(0)
  })

  it('keeps background-coloured areas enclosed by the figure (a white shirt)', () => {
    const sample = image(20, 20, (x, y) => (x > 4 && x < 15 && y > 4 && !(x > 7 && x < 12 && y > 8) ? DARK : WHITE))
    const mask = detectBackground(sample.pixels, 20, 20, 0.12)
    // The white patch inside is reachable only through the bottom edge.
    expect(mask[12 * 20 + 9]).toBe(0)
  })

  it('a threshold of 0 turns removal off; transparent pixels are always background', () => {
    const sample = portrait()
    expect(detectBackground(sample.pixels, 64, 64, 0).every((v) => v === 0)).toBe(true)

    const clear = image(4, 4, () => [0, 0, 0, 0])
    expect(detectBackground(clear.pixels, 4, 4, 0).every((v) => v === 1)).toBe(true)
  })

  it('a higher threshold removes more', () => {
    const sample = image(10, 10, (x) => [250 - x * 6, 250 - x * 6, 250 - x * 6, 255])
    const count = (t) => detectBackground(sample.pixels, 10, 10, t).reduce((a, b) => a + b, 0)
    expect(count(0.3)).toBeGreaterThan(count(0.05))
  })
})

describe('averageColor', () => {
  it('averages only the figure, never the background around it', () => {
    const sample = portrait()
    const mask = detectBackground(sample.pixels, 64, 64, 0.12)
    // A rectangle half over the white background, half over the skin block.
    expect(averageColor(sample.pixels, 64, 64, mask, { x: 40, y: 40, w: 16, h: 8 })).toEqual(SKIN.slice(0, 3))
    expect(averageColor(sample.pixels, 64, 64, mask, { x: 0, y: 0, w: 8, h: 8 })).toBeNull()
  })
})

describe('buildMosaic', () => {
  const tilesOf = (options) => buildMosaic(portrait(), { tileMin: 4, tileMax: 16, ...options }).tiles

  it('leaves the background empty', () => {
    const tiles = tilesOf()
    expect(tiles.length).toBeGreaterThan(0)
    for (const tile of tiles) {
      expect(tile.x + tile.size, 'right of the background strip').toBeGreaterThan(16)
      expect(tile.y + tile.size).toBeGreaterThan(16)
    }
  })

  it('uses big tiles for flat areas and small ones where there is detail', () => {
    const tiles = tilesOf()
    const at = (x, y) => tiles.find((t) => x >= t.x && x < t.x + t.size && y >= t.y && y < t.y + t.size)

    expect(at(40, 56).size).toBe(16) // flat skin
    expect(at(17, 17).size).toBe(4) // the checkerboard "eye"
  })

  it('keeps every tile between tileMin and tileMax, inside the box, without overlaps', () => {
    const tiles = tilesOf({ tileMin: 2, tileMax: 32 })
    const covered = new Uint8Array(64 * 64)
    for (const tile of tiles) {
      expect(tile.size).toBeGreaterThanOrEqual(2)
      expect(tile.size).toBeLessThanOrEqual(32)
      expect(tile.x).toBeGreaterThanOrEqual(0)
      expect(tile.y).toBeGreaterThanOrEqual(0)
      for (let y = tile.y; y < tile.y + tile.size; y += 1) {
        for (let x = tile.x; x < tile.x + tile.size; x += 1) {
          if (x < 64 && y < 64) {
            expect(covered[y * 64 + x], `${x},${y}`).toBe(0)
            covered[y * 64 + x] = 1
          }
        }
      }
    }
  })

  it('a smaller tileMin gives a finer mosaic', () => {
    expect(tilesOf({ tileMin: 2 }).length).toBeGreaterThan(tilesOf({ tileMin: 8 }).length)
  })

  it('caps the tile count for low-end devices', () => {
    const noise = image(64, 64, (x, y) => [(x * 97 + y * 31) % 256, (x * 13 + y * 71) % 256, (x * y) % 256, 255])
    const free = buildMosaic(noise, { tileMin: 1, tileMax: 16, bgThreshold: 0, maxTiles: 100000 }).tiles.length
    const capped = buildMosaic(noise, { tileMin: 1, tileMax: 16, bgThreshold: 0, maxTiles: 60 }).tiles.length

    expect(free).toBeGreaterThan(1000)
    expect(capped).toBeLessThanOrEqual(60)
  })

  it('maps samples to CSS pixels with `unit`', () => {
    const { tiles, width, height } = buildMosaic(portrait(), { unit: 2, tileMin: 8, tileMax: 32 })
    expect([width, height]).toEqual([128, 128])
    expect(Math.max(...tiles.map((t) => t.size))).toBe(32)
  })

  it('is deterministic', () => {
    expect(tilesOf()).toEqual(tilesOf())
  })
})

/** Hue in degrees and HSL saturation of an RGB colour. */
function hueSat([r, g, b]) {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { hue: 0, sat: 0 }
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let hue
  if (max === r / 255) hue = ((g - b) / 255 / d + 6) % 6
  else if (max === g / 255) hue = (b - r) / 255 / d + 2
  else hue = (r - g) / 255 / d + 4
  return { hue: hue * 60, sat }
}

describe('colour grade', () => {
  const still = { hueJitter: 0 }

  it('turns dark greys into rich blues and purples, not mud', () => {
    for (const dark of [[30, 30, 30], [45, 40, 38], [60, 60, 66]]) {
      const { hue, sat } = hueSat(stylize(dark, still))
      expect(hue, String(dark)).toBeGreaterThanOrEqual(200)
      expect(hue, String(dark)).toBeLessThanOrEqual(290)
      expect(sat, String(dark)).toBeGreaterThan(0.4)
    }
  })

  it('keeps lit skin warm and makes it vivid', () => {
    const { hue, sat } = hueSat(stylize([225, 180, 150], still))
    expect(hue).toBeLessThanOrEqual(45)
    expect(sat).toBeGreaterThan(hueSat([225, 180, 150]).sat)
  })

  it('pulls grey clothing toward teal and blue', () => {
    const { hue, sat } = hueSat(stylize([140, 140, 145], still))
    expect(hue).toBeGreaterThanOrEqual(160)
    expect(hue).toBeLessThanOrEqual(260)
    expect(sat).toBeGreaterThan(0.3)
  })

  it('saturation is a dial', () => {
    const muted = hueSat(stylize([180, 120, 100], { ...still, saturation: 0.6 })).sat
    const bold = hueSat(stylize([180, 120, 100], { ...still, saturation: 2.5 })).sat
    expect(bold).toBeGreaterThan(muted)
  })

  it('posterizes to a small, bold palette — fewer levels, fewer colours', () => {
    const distinct = (levels) => {
      const colours = new Set()
      for (let r = 0; r < 256; r += 15) for (let g = 0; g < 256; g += 15) for (let b = 0; b < 256; b += 30) {
        colours.add(stylize([r, g, b], { ...still, levels }).join())
      }
      return colours.size
    }
    expect(distinct(4)).toBeLessThan(distinct(10))
    expect(distinct(6)).toBeLessThanOrEqual(24 * 4 * 6)
  })

  it('jitters hue per tile, stably, so flat areas are not one block', () => {
    const flat = [200, 120, 90]
    const jittered = new Set()
    for (let seed = 0; seed < 40; seed += 1) jittered.add(stylize(flat, { seed, hueJitter: 20 }).join())
    expect(jittered.size).toBeGreaterThan(1)
    expect(stylize(flat, { seed: 7 })).toEqual(stylize(flat, { seed: 7 }))

    const plain = new Set()
    for (let seed = 0; seed < 40; seed += 1) plain.add(stylize(flat, { seed, hueJitter: 0 }).join())
    expect(plain.size).toBe(1)
  })

  it('mixes toward a tint colour', () => {
    expect(mixColor([0, 0, 0], [100, 200, 50], 0.5)).toEqual([50, 100, 25])
    expect(mixColor([10, 10, 10], [100, 200, 50], 0)).toEqual([10, 10, 10])
  })
})

describe('detail', () => {
  it('big tiles split at a lower variance than small ones', () => {
    expect(splitThreshold(0.01, 32, 4)).toBeLessThan(splitThreshold(0.01, 8, 4))
    expect(splitThreshold(0.01, 4, 4)).toBeCloseTo(0.01)
  })

  it('breaks up a gently textured area (a suit) instead of one big block', () => {
    const suit = image(64, 64, (x, y) => {
      const v = 70 + ((x * 7 + y * 13) % 25)
      return [v, v, v + 6, 255]
    })
    const sizes = buildMosaic(suit, { tileMin: 4, tileMax: 32, bgThreshold: 0 }).tiles.map((t) => t.size)
    expect(Math.max(...sizes)).toBeLessThan(32)
  })
})

describe('gridLabels', () => {
  it('places stable coordinate labels on grid cells inside the box', () => {
    const labels = gridLabels(320, 400, 32, 12)
    expect(labels).toHaveLength(12)
    expect(gridLabels(320, 400, 32, 12)).toEqual(labels)
    for (const label of labels) {
      expect(label.x % 32).toBe(0)
      expect(label.y % 32).toBe(0)
      expect(label.x).toBeLessThan(320)
      expect(label.y).toBeLessThan(400)
      expect(label.text).toMatch(/^\d{2}\.\d{2}$/)
    }
  })

  it('copes with a box too small for the grid', () => {
    expect(gridLabels(10, 10, 32, 5)).toEqual([])
  })
})
