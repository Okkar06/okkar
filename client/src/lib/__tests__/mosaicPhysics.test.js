import { describe, expect, it } from 'vitest'
import { anyFree, createParticles, reassemble, scatter, settle, step } from '../mosaicPhysics'

const FRAME = 1000 / 60

/** A 10 × 10 grid of 10px tiles: a 100px box. */
const grid = () => {
  const tiles = []
  for (let y = 0; y < 100; y += 10) for (let x = 0; x < 100; x += 10) tiles.push({ x, y, size: 10 })
  return createParticles(tiles)
}

/** Runs frames until nothing moves (or a limit); returns the time reached. */
function run(p, options = {}, { from = 0, limit = 2000 } = {}) {
  let now = from
  for (let frame = 0; frame < limit; frame += 1) {
    now += FRAME
    if (!step(p, FRAME, { ...options, now })) return now
  }
  throw new Error('never came to rest')
}

const atHome = (p) => {
  for (let i = 0; i < p.count; i += 1) {
    if (p.x[i] !== p.hx[i] || p.y[i] !== p.hy[i] || p.rot[i] !== 0) return false
  }
  return true
}

describe('mosaic particles', () => {
  it('start at home, centred on their tiles, and at rest', () => {
    const p = grid()
    expect([p.hx[0], p.hy[0], p.hx[11], p.hy[11]]).toEqual([5, 5, 15, 15])
    expect(step(p, FRAME)).toBe(false)
    expect(atHome(p)).toBe(true)
  })

  it('repel: pushes tiles near the cursor away, leaves far ones, then springs home', () => {
    const p = grid()
    const pointer = { x: 50, y: 50 }
    for (let frame = 0; frame < 20; frame += 1) step(p, FRAME, { pointer, radius: 30, force: 1 })

    const near = 4 * 10 + 5 // tile centred at (55, 45)
    const far = 0
    const before = Math.hypot(p.hx[near] - 50, p.hy[near] - 50)
    expect(Math.hypot(p.x[near] - 50, p.y[near] - 50)).toBeGreaterThan(before + 2)
    expect([p.x[far], p.y[far]]).toEqual([p.hx[far], p.hy[far]])

    run(p, { pointer: null })
    expect(atHome(p)).toBe(true)
  })

  it('repel: a resting cursor lets the loop stop with tiles held aside', () => {
    const p = grid()
    const pointer = { x: 50, y: 50 }
    run(p, { pointer, radius: 30 })
    expect(atHome(p)).toBe(false)
  })

  it('a stronger force pushes further', () => {
    const push = (force) => {
      const p = grid()
      for (let frame = 0; frame < 10; frame += 1) step(p, FRAME, { pointer: { x: 50, y: 50 }, radius: 30, force })
      return Math.hypot(p.x[45] - p.hx[45], p.y[45] - p.hy[45])
    }
    expect(push(2)).toBeGreaterThan(push(1))
  })

  it('scatter: launches near tiles first, drifts them away, and reassembly brings all home', () => {
    const p = grid()
    scatter(p, 0, 0, { force: 1, now: 0 })
    step(p, FRAME, { now: FRAME })

    const corner = 0
    const opposite = p.count - 1
    expect(p.free[corner]).toBe(1)
    expect(p.free[opposite]).toBe(0) // still waiting its turn

    let now = FRAME
    for (let frame = 0; frame < 60; frame += 1) step(p, FRAME, { now: (now += FRAME) })
    expect(Math.hypot(p.x[opposite] - p.hx[opposite], p.y[opposite] - p.hy[opposite])).toBeGreaterThan(100)
    expect(anyFree(p)).toBe(true)

    reassemble(p, 0, 0, { now })
    run(p, {}, { from: now })
    expect(atHome(p)).toBe(true)
    expect(anyFree(p)).toBe(false)
  })

  it('never jumps after a long pause (dt is capped)', () => {
    const p = grid()
    scatter(p, 50, 50, { now: 0 })
    step(p, 5000, { now: 5000 })
    const spread = Math.max(...p.x.map((x, i) => Math.abs(x - p.hx[i])))
    expect(Number.isFinite(spread)).toBe(true)
    expect(spread).toBeLessThan(150)
  })

  it('settle() puts everything home at once', () => {
    const p = grid()
    scatter(p, 50, 50, { now: 0 })
    step(p, FRAME, { now: 300 })
    settle(p)
    expect(atHome(p)).toBe(true)
    expect(anyFree(p)).toBe(false)
  })
})
