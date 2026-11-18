import { describe, expect, it } from 'vitest'
import { BUILD, buildY, planBuild } from '../mosaicBuild'

/** A 100 × 200 box of 10px tiles. */
const tiles = []
for (let y = 0; y < 200; y += 10) for (let x = 0; x < 100; x += 10) tiles.push({ x, y, size: 10 })
const home = (i) => tiles[i].y + tiles[i].size / 2
const plan = planBuild(tiles, { height: 200, duration: 2600 })
const rowLandings = (y) => tiles.map((t, i) => [t, i]).filter(([t]) => t.y === y).map(([, i]) => plan.landAt[i])
const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length

describe('planBuild / buildY', () => {
  it('every tile starts above the frame, hidden', () => {
    tiles.forEach((tile, i) => {
      expect(plan.fromY[i] + tile.size / 2).toBeLessThanOrEqual(0)
      expect(buildY(plan, i, home(i), 0)).toBe(plan.fromY[i])
      expect(plan.startAt[i]).toBeGreaterThanOrEqual(0)
    })
  })

  it('builds bottom-up: lower rows land first', () => {
    expect(mean(rowLandings(190))).toBeLessThan(mean(rowLandings(100)))
    expect(mean(rowLandings(100))).toBeLessThan(mean(rowLandings(0)))
  })

  it('staggers tiles within a row, so it fills in pixel by pixel', () => {
    expect(new Set(rowLandings(100).map(Math.round)).size).toBeGreaterThan(5)
  })

  it('falls with gravity: faster and faster', () => {
    const i = tiles.length - 1
    const at = (t) => buildY(plan, i, home(i), plan.startAt[i] + t)
    expect(at(300) - at(250)).toBeGreaterThan((at(100) - at(50)) * 2)
  })

  it('lands with a small hop of at most 2px, then stays home', () => {
    tiles.forEach((tile, i) => {
      for (let t = plan.landAt[i]; t < plan.landAt[i] + BUILD.bounceMs; t += 20) {
        const y = buildY(plan, i, home(i), t)
        expect(y).toBeLessThanOrEqual(home(i))
        expect(home(i) - y).toBeLessThanOrEqual(2)
      }
      expect(buildY(plan, i, home(i), plan.end)).toBe(home(i))
    })
  })

  it('never passes its home on the way down', () => {
    for (let t = 0; t < plan.end; t += 5) expect(buildY(plan, 55, home(55), t)).toBeLessThanOrEqual(home(55))
  })

  it('takes about the requested duration', () => {
    expect(plan.end).toBeLessThanOrEqual(2600)
    expect(plan.end).toBeGreaterThan(2600 * 0.85)
    expect(planBuild(tiles, { height: 200, duration: 1200 }).end).toBeLessThanOrEqual(1200)
  })

  it('is deterministic', () => {
    expect(planBuild(tiles, { height: 200, duration: 2600 })).toEqual(plan)
  })
})
