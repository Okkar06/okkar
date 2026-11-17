import { random01 } from './pixelMosaic.js'

/**
 * Tile particles for the pixel portrait's hover effects. Each tile has a home
 * (its place in the mosaic) and is pulled back to it by a damped spring.
 *
 * - repel(): the cursor pushes nearby tiles away; they spring home after.
 * - scatter(): every tile is flung outward (staggered by distance from the
 *   cursor) and drifts free of its spring...
 * - reassemble(): ...until this re-attaches the springs, nearest tiles first.
 *
 * step() advances one frame and reports whether anything is still moving, so
 * the caller can stop its animation loop the moment everything is at rest.
 * Positions are tile centres in CSS pixels, relative to the portrait box.
 */

export const PHYSICS = {
  stiffness: 0.07, // spring pull home, per frame
  damping: 0.8, // velocity kept per frame while sprung
  drift: 0.986, // velocity kept per frame while scattered
  repel: 2.2, // push at the cursor's centre, for force = 1
  scatter: 9, // launch speed in px/frame, for force = 1
  maxSpeed: 38, // px/frame; keeps a long reassembly from overshooting wildly
  tilt: 0.025, // radians of tilt per px/frame of sideways speed
  stagger: 0.55, // ms of delay per px of distance from the cursor
  maxStagger: 240, // ms
  rest: 0.03, // below this (px, px/frame, rad) a tile counts as still
}

// A frame is "one 60fps frame"; longer gaps are capped so a stall can't fling.
const FRAME_MS = 1000 / 60
const MAX_FRAMES = 3
const QUARTER_TURN = Math.PI / 2

export function createParticles(tiles) {
  const count = tiles.length
  const particles = {
    count,
    hx: new Float32Array(count),
    hy: new Float32Array(count),
    x: new Float32Array(count),
    y: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    rot: new Float32Array(count),
    spin: new Float32Array(count),
    // Free = off its spring (scattered).
    free: new Uint8Array(count),
    // Timestamps (ms) of a pending launch / spring re-attachment; 0 = none.
    launchAt: new Float64Array(count),
    kickX: new Float32Array(count),
    kickY: new Float32Array(count),
    returnAt: new Float64Array(count),
  }
  tiles.forEach((tile, i) => {
    const cx = tile.x + tile.size / 2
    const cy = tile.y + tile.size / 2
    particles.hx[i] = cx
    particles.hy[i] = cy
    particles.x[i] = cx
    particles.y[i] = cy
  })
  return particles
}

const staggerFor = (distance) => Math.min(PHYSICS.maxStagger, distance * PHYSICS.stagger)

/** Flings every tile away from (ox, oy). Nearer tiles go first. */
export function scatter(p, ox, oy, { force = 1, now = 0 } = {}) {
  for (let i = 0; i < p.count; i += 1) {
    const dx = p.hx[i] - ox
    const dy = p.hy[i] - oy
    const distance = Math.hypot(dx, dy)
    const angle = (distance > 0.001 ? Math.atan2(dy, dx) : random01(i, 3) * Math.PI * 2) + (random01(i, 5) - 0.5) * 1.1
    const speed = PHYSICS.scatter * force * (0.55 + random01(i, 11) * 0.9)
    p.kickX[i] = Math.cos(angle) * speed
    p.kickY[i] = Math.sin(angle) * speed
    p.launchAt[i] = now + staggerFor(distance)
    p.returnAt[i] = 0
  }
}

/** Re-attaches the springs, nearest to (ox, oy) first, so the portrait rebuilds outward-in. */
export function reassemble(p, ox, oy, { now = 0 } = {}) {
  for (let i = 0; i < p.count; i += 1) {
    const distance = Math.hypot(p.hx[i] - ox, p.hy[i] - oy)
    p.launchAt[i] = 0
    p.returnAt[i] = now + staggerFor(distance)
  }
}

/** Puts every tile home, still. */
export function settle(p) {
  p.x.set(p.hx)
  p.y.set(p.hy)
  p.vx.fill(0)
  p.vy.fill(0)
  p.rot.fill(0)
  p.spin.fill(0)
  p.free.fill(0)
  p.launchAt.fill(0)
  p.returnAt.fill(0)
}

/**
 * Advances one frame.
 * @param {number} dt milliseconds since the last frame
 * @param {{ pointer?: {x, y} | null, radius?: number, force?: number, now?: number }} options
 * @returns {boolean} true while anything is still moving
 */
export function step(p, dt, { pointer = null, radius = 90, force = 1, now = 0 } = {}) {
  const f = Math.min(Math.max(dt, 0) / FRAME_MS, MAX_FRAMES)
  if (f === 0) return true

  const damping = PHYSICS.damping ** f
  const drift = PHYSICS.drift ** f
  const push = PHYSICS.repel * force
  const rest = PHYSICS.rest
  let moving = false

  for (let i = 0; i < p.count; i += 1) {
    if (p.launchAt[i] && now >= p.launchAt[i]) {
      p.vx[i] += p.kickX[i]
      p.vy[i] += p.kickY[i]
      p.spin[i] = (random01(i, 13) - 0.5) * 0.16
      p.free[i] = 1
      p.launchAt[i] = 0
    }
    if (p.returnAt[i] && now >= p.returnAt[i]) {
      p.free[i] = 0
      p.returnAt[i] = 0
      // A square looks the same every quarter turn: level out the short way.
      p.rot[i] -= Math.round(p.rot[i] / QUARTER_TURN) * QUARTER_TURN
    }

    let vx = p.vx[i]
    let vy = p.vy[i]

    if (pointer && radius > 0) {
      const dx = p.x[i] - pointer.x
      const dy = p.y[i] - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance < radius) {
        const falloff = (1 - distance / radius) ** 2
        const nx = distance > 0.001 ? dx / distance : Math.cos(random01(i, 17) * Math.PI * 2)
        const ny = distance > 0.001 ? dy / distance : Math.sin(random01(i, 17) * Math.PI * 2)
        vx += nx * push * falloff * f
        vy += ny * push * falloff * f
      }
    }

    if (p.free[i]) {
      vx *= drift
      vy *= drift
    } else {
      vx = (vx + (p.hx[i] - p.x[i]) * PHYSICS.stiffness * f) * damping
      vy = (vy + (p.hy[i] - p.y[i]) * PHYSICS.stiffness * f) * damping
    }

    const speed = Math.hypot(vx, vy)
    if (speed > PHYSICS.maxSpeed) {
      vx *= PHYSICS.maxSpeed / speed
      vy *= PHYSICS.maxSpeed / speed
    }

    p.x[i] += vx * f
    p.y[i] += vy * f
    p.vx[i] = vx
    p.vy[i] = vy

    // Free tiles tumble; sprung ones tilt with their sideways speed and
    // level out as they slow, so nothing ever wobbles in place.
    if (p.free[i]) {
      p.rot[i] += p.spin[i] * f
      p.spin[i] *= drift
    } else {
      const target = Math.max(-0.6, Math.min(0.6, vx * PHYSICS.tilt))
      p.rot[i] += (target - p.rot[i]) * Math.min(1, 0.25 * f)
    }

    const still = Math.abs(vx) < rest && Math.abs(vy) < rest
    const spinning = p.free[i] ? Math.abs(p.spin[i]) > 0.0005 : Math.abs(p.rot[i]) > 0.002
    const pending = p.launchAt[i] !== 0 || p.returnAt[i] !== 0
    // With no cursor, a sprung tile isn't done until it is home. (With one,
    // it may rest displaced, balanced against the push.)
    const away = !pointer && !p.free[i] && Math.abs(p.x[i] - p.hx[i]) + Math.abs(p.y[i] - p.hy[i]) > rest

    if (!still || spinning || pending || away) {
      moving = true
    } else if (!pointer && !p.free[i]) {
      // Snap the last fraction of a pixel, so the next draw is crisp.
      p.x[i] = p.hx[i]
      p.y[i] = p.hy[i]
      p.vx[i] = 0
      p.vy[i] = 0
      p.rot[i] = 0
    }
  }

  return moving
}

/** True if any tile is away from home (so the overlay canvas is still needed). */
export function anyFree(p) {
  for (let i = 0; i < p.count; i += 1) if (p.free[i] || p.launchAt[i] || p.returnAt[i]) return true
  return false
}
