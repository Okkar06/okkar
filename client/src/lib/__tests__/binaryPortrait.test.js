import { describe, expect, it } from 'vitest'
import { cellAlpha, classifyCells, digitAt } from '../binaryPortrait'

const WHITE = [255, 255, 255]
const DARK = [40, 40, 50]
const SKIN = [225, 190, 165]

/** Builds an RGBA buffer from a grid of single-letter codes. */
function image(rows) {
  const palette = { w: WHITE, d: DARK, s: SKIN }
  const pixels = []
  for (const row of rows) for (const code of row) pixels.push(...palette[code], 255)
  return { pixels: new Uint8ClampedArray(pixels), cols: rows[0].length, rows: rows.length }
}

const levelsOf = (grid) => {
  const { pixels, cols, rows } = image(grid)
  const levels = classifyCells(pixels, cols, rows)
  return grid.map((row, r) => [...row].map((_, c) => levels[r * cols + c]))
}

describe('classifyCells', () => {
  it('cuts away a plain background reaching the top and sides', () => {
    const levels = levelsOf([
      'wwwww',
      'wsssw',
      'wdddw',
    ])

    expect(levels[0].every((level) => level === -1)).toBe(true)
    expect(levels[1][0]).toBe(-1)
    expect(levels[1][2]).toBeGreaterThanOrEqual(0)
    expect(levels[2][2]).toBeGreaterThanOrEqual(0)
  })

  it('keeps white enclosed by the figure (a shirt) as part of it', () => {
    const levels = levelsOf([
      'wwwww',
      'wdddw',
      'wdwdw',
      'wdwdw',
    ])

    // Reachable only from the bottom edge, which is not a background seed.
    expect(levels[2][2]).toBeGreaterThanOrEqual(0)
    expect(levels[3][2]).toBeGreaterThanOrEqual(0)
  })

  it('makes lit areas brighter than shadows', () => {
    const levels = levelsOf(['wwwww', 'wsssw', 'wdddw', 'wdddw'])
    expect(levels[1][2]).toBeGreaterThan(levels[2][2])
  })

  it('copes with an image that is all background', () => {
    const levels = levelsOf(['www', 'www'])
    expect([...levels.flat()].every((level) => level === -1)).toBe(true)
  })
})

describe('cellAlpha and digitAt', () => {
  it('draws the figure at least faintly and leaves most of the background empty', () => {
    expect(cellAlpha(0, 3, 3)).toBeGreaterThan(0.1)
    expect(cellAlpha(1, 3, 3)).toBeCloseTo(1)

    let drawn = 0
    for (let row = 0; row < 40; row += 1) for (let col = 0; col < 40; col += 1) if (cellAlpha(-1, col, row) > 0) drawn += 1
    expect(drawn / 1600).toBeLessThan(0.2)
  })

  it('picks a stable mix of 0s and 1s', () => {
    const digits = []
    for (let i = 0; i < 200; i += 1) digits.push(digitAt(i % 20, Math.floor(i / 20)))

    expect(new Set(digits)).toEqual(new Set(['0', '1']))
    expect(digitAt(7, 11)).toBe(digitAt(7, 11))
  })
})
