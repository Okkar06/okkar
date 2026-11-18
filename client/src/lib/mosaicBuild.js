import { random01 } from './pixelMosaic.js'

/**
 * The pixel portrait's "build" intro: every tile drops in from above the
 * frame under gravity and lands on its home, bottom rows first, so the
 * portrait stacks up like falling blocks. Within a row each tile gets a small
 * random delay, so it fills in pixel by pixel rather than row by row.
 *
 * Positions are pure functions of time (no integration), so a dropped frame,
 * a paused tab or a skip can never knock a tile off course.
 */

export const BUILD = {
  firstLanding: 0.3, // share of the duration before the bottom row lands
  jitter: 0.025, // ± share of the duration each tile's landing may shift
  aboveFrame: 40, // px: tiles start up to this far above the top edge
  bounceMs: 170, // the landing hop
  bouncePx: 1.5,
}

/**
 * @param {Array<{ x, y, size }>} tiles
 * @param {{ height: number, duration?: number }} options box height in px, duration in ms
 * @returns {{ startAt, landAt, fromY, gravity, end }} per-tile Float32Arrays (ms / px)
 */
export function planBuild(tiles, { height, duration = 2600 }) {
  const count = tiles.length
  const startAt = new Float32Array(count)
  const landAt = new Float32Array(count)
  const fromY = new Float32Array(count)
  const span = duration - BUILD.bounceMs
  const first = span * BUILD.firstLanding

  // Strong enough that the longest fall (to the bottom row) fits before the
  // first landing; everything else falls a shorter way.
  const gravity = (2 * (height + BUILD.aboveFrame * 2)) / (first * first)
  let end = 0

  tiles.forEach((tile, i) => {
    const homeY = tile.y + tile.size / 2
    const fromBottom = 1 - Math.min(1, Math.max(0, homeY / height))
    const jitter = (random01(i, 41) - 0.5) * 2 * BUILD.jitter * duration
    const start = -tile.size / 2 - random01(i, 43) * BUILD.aboveFrame
    const fall = Math.sqrt((2 * (homeY - start)) / gravity)
    const land = Math.max(fall, Math.min(span, first + (span - first) * fromBottom + jitter))

    fromY[i] = start
    landAt[i] = land
    startAt[i] = land - fall
    end = Math.max(end, land + BUILD.bounceMs)
  })

  return { startAt, landAt, fromY, gravity, end }
}

/**
 * Tile i's centre y at `elapsed` ms into the build: waiting above the frame,
 * falling (accelerating), a small hop on landing, then home.
 */
export function buildY(plan, i, homeY, elapsed) {
  if (elapsed <= plan.startAt[i]) return plan.fromY[i]
  if (elapsed < plan.landAt[i]) {
    const t = elapsed - plan.startAt[i]
    return Math.min(homeY, plan.fromY[i] + 0.5 * plan.gravity * t * t)
  }
  const u = (elapsed - plan.landAt[i]) / BUILD.bounceMs
  return u < 1 ? homeY - BUILD.bouncePx * Math.sin(Math.PI * u) : homeY
}
