import { random01 } from './pixelMosaic.js'

/**
 * Tile particles for the pixel portrait's hover effects. Each tile has a home
 * (its place in the mosaic) and is pulled toward a target by a slightly
 * under-damped spring, so it arrives with a small overshoot.
 *
 * - Repel: while the cursor is over the portrait, each tile's target is its
 *   home pushed straight out from the cursor by a smooth bell-shaped amount
 *   (strongest at the centre, zero at `radius`). The push is computed from
 *   the HOME position, never the current one, and the curve is gentle enough
 *   that a tile never overtakes its neighbour — so tiles part into separate
 *   pixels instead of piling into slivers.
 * - scatter(): every tile is flung outward (staggered by distance from the
 *   cursor) and drifts free of its spring...
 * - reassemble(): ...until this re-attaches the springs, nearest tiles first.
 *
 * Tiles stay square: they shrink a little as they move (tileScale, never
 * below `minScale`) and tilt at most 12 degrees. Where the push squeezes
 * tiles toward their neighbours, they shrink at least as much, so they
 * cannot overlap into slivers. step() reports whether anything still moves, so the
 * caller can stop its animation loop at rest. Positions are tile centres in
 * CSS pixels, relative to the portrait box.
 */

export const PHYSICS = {
  stiffness: 0.11, // spring pull toward the target, per frame
  damping: 0.8, // velocity kept per frame while sprung (< 1: a slight overshoot)
  drift: 0.986, // velocity kept per frame while scattered
  radius: 75, // px: repel reach (default for the repelRadius prop)
  push: 12, // px: how far the tile under the cursor moves (repelForce)
  scatter: 4.5, // launch speed in px/frame, for scatterForce = 1
  maxSpeed: 38, // px/frame; keeps a long reassembly from overshooting wildly
  maxTilt: 0.21, // radians (12°) — tiles never tilt further than this
  tilt: 0.02, // radians of tilt per px/frame of sideways speed
  minScale: 0.8, // smallest a moving tile gets (minScale prop)
  shrinkOver: 26, // px of displacement over which a tile shrinks to minScale
  stagger: 0.55, // ms of delay per px of distance from the cursor
  maxStagger: 240, // ms
  rest: 0.03, // below this (px, px/frame, rad) a tile counts as still
}

// A frame is "one 60fps frame"; longer gaps are capped so a stall can't fling.
const FRAME_MS = 1000 / 60
const MAX_FRAMES = 3
const QUARTER_TURN = Math.PI / 2

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Repel push as a share of the full push, for t = distance / radius.
 * (1 − t²)² is 1 at the centre, eases to 0 at the edge with no kink, and its
 * steepest slope (≈ −1.54) keeps tiles in order for push ≤ 0.65 × radius.
 */
export const repelFalloff = (t) => (t >= 1 ? 0 : (1 - t * t) ** 2)

/** d/dt of repelFalloff: how much neighbours along a ray are squeezed together. */
const repelSlope = (t) => (t >= 1 ? 0 : -4 * t * (1 - t * t))

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
    // Drawn size (1 = full), eased toward what the squeeze allows.
    scale: new Float32Array(count).fill(1),
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

/**
 * How big tile i is drawn (1 = full size): smaller the further it has moved,
 * and no bigger than the repel squeeze allows, but never below minScale.
 */
export function tileScale(p, i, minScale = PHYSICS.minScale) {
  const moved = Math.hypot(p.x[i] - p.hx[i], p.y[i] - p.hy[i])
  const travel = 1 - (1 - minScale) * Math.min(1, moved / PHYSICS.shrinkOver)
  return Math.max(minScale, Math.min(p.scale[i], travel))
}

const staggerFor = (distance) => Math.min(PHYSICS.maxStagger, distance * PHYSICS.stagger)

/** Flings every tile away from (ox, oy). Nearer tiles go first. */
export function scatter(p, ox, oy, { force = 1, now = 0 } = {}) {
  for (let i = 0; i < p.count; i += 1) {
    const dx = p.hx[i] - ox
    const dy = p.hy[i] - oy
    const distance = Math.hypot(dx, dy)
    const angle = (distance > 0.001 ? Math.atan2(dy, dx) : random01(i, 3) * Math.PI * 2) + (random01(i, 5) - 0.5) * 0.9
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
  p.scale.fill(1)
  p.free.fill(0)
  p.launchAt.fill(0)
  p.returnAt.fill(0)
}

/**
 * Advances one frame.
 * @param {number} dt milliseconds since the last frame
 * @param {{ pointer?: {x, y} | null, radius?: number, push?: number, minScale?: number, now?: number }} options
 *   radius and push in px; push is how far the tile right under the cursor moves.
 * @returns {boolean} true while anything is still moving
 */
export function step(
  p,
  dt,
  { pointer = null, radius = PHYSICS.radius, push = PHYSICS.push, minScale = PHYSICS.minScale, now = 0 } = {},
) {
  const f = Math.min(Math.max(dt, 0) / FRAME_MS, MAX_FRAMES)
  if (f === 0) return true

  const damping = PHYSICS.damping ** f
  const drift = PHYSICS.drift ** f
  const pull = Math.min(1, PHYSICS.stiffness * f)
  const { rest, maxTilt } = PHYSICS
  let moving = false

  for (let i = 0; i < p.count; i += 1) {
    if (p.launchAt[i] && now >= p.launchAt[i]) {
      p.vx[i] += p.kickX[i]
      p.vy[i] += p.kickY[i]
      p.spin[i] = (random01(i, 13) - 0.5) * 0.03
      p.free[i] = 1
      p.launchAt[i] = 0
    }
    if (p.returnAt[i] && now >= p.returnAt[i]) {
      p.free[i] = 0
      p.returnAt[i] = 0
      // A square looks the same every quarter turn: level out the short way.
      p.rot[i] -= Math.round(p.rot[i] / QUARTER_TURN) * QUARTER_TURN
    }

    // Where the spring pulls this tile: home, or home pushed off the cursor.
    let tx = p.hx[i]
    let ty = p.hy[i]
    let fit = 1
    if (pointer && radius > 0 && !p.free[i]) {
      const dx = p.hx[i] - pointer.x
      const dy = p.hy[i] - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance < radius) {
        const t = distance / radius
        const amount = push * repelFalloff(t)
        fit = clamp(1 + (push / radius) * repelSlope(t), minScale, 1)
        const angle = distance > 0.001 ? Math.atan2(dy, dx) : random01(i, 17) * Math.PI * 2
        tx += Math.cos(angle) * amount
        ty += Math.sin(angle) * amount
      }
    }

    let vx = p.vx[i]
    let vy = p.vy[i]
    if (p.free[i]) {
      vx *= drift
      vy *= drift
    } else {
      vx = (vx + (tx - p.x[i]) * pull) * damping
      vy = (vy + (ty - p.y[i]) * pull) * damping
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

    // A gentle tilt, never more than maxTilt: free tiles rock with their
    // spin; sprung ones lean with their sideways speed and level out.
    if (p.free[i]) {
      p.rot[i] = clamp(p.rot[i] + p.spin[i] * f, -maxTilt, maxTilt)
      p.spin[i] *= drift
    } else {
      const target = clamp(vx * PHYSICS.tilt, -maxTilt, maxTilt)
      p.rot[i] += (target - p.rot[i]) * Math.min(1, 0.25 * f)
    }

    p.scale[i] += (fit - p.scale[i]) * Math.min(1, 0.3 * f)

    const still = Math.abs(vx) < rest && Math.abs(vy) < rest && Math.abs(p.scale[i] - fit) < 0.002
    const tilting = !p.free[i] && Math.abs(p.rot[i]) > 0.002
    const pending = p.launchAt[i] !== 0 || p.returnAt[i] !== 0
    const away = !p.free[i] && Math.abs(p.x[i] - tx) + Math.abs(p.y[i] - ty) > rest

    if (!still || tilting || pending || away) {
      moving = true
    } else if (!p.free[i]) {
      // Snap the last fraction of a pixel, so the next draw is crisp.
      p.x[i] = tx
      p.y[i] = ty
      p.vx[i] = 0
      p.vy[i] = 0
      p.rot[i] = 0
      p.scale[i] = fit
    }
  }

  return moving
}

/** True if any tile is scattered or about to be (so the overlay canvas is still needed). */
export function anyFree(p) {
  for (let i = 0; i < p.count; i += 1) if (p.free[i] || p.launchAt[i] || p.returnAt[i]) return true
  return false
}
