/**
 * Turns a photo into a pixel mosaic: square tiles of variable size, each
 * filled with the vivid, slightly posterized average colour of its patch.
 *
 * Tile sizes come from a quadtree. Every tile starts at `tileMax` and splits
 * into four while the photo underneath it has detail (colour variance above
 * `detail`) or sits on the edge of the silhouette, down to `tileMin`. Flat
 * areas keep big tiles; eyes, mouth and hair edges get small ones.
 *
 * The photo's background (near-uniform colour connected to the top, left or
 * right edge) is cut away, so only the figure is tiled.
 *
 * Everything here is pure apart from sampleImage(), which needs a canvas.
 * Colours from the photo are data, not theme colours, so they live here and
 * never in a stylesheet.
 */

export const MOSAIC_DEFAULTS = {
  tileMin: 4,
  tileMax: 32,
  // Colour variance (0–1) above which a smallest-size tile still splits.
  // Lower = more small tiles. Bigger tiles split at a lower variance (see
  // splitThreshold), so big flat blocks are rare.
  detail: 0.0016,
  // How far (0–1 of the full RGB distance) a pixel may be from the photo's
  // edge colour and still count as background. 0 turns background removal off.
  bgThreshold: 0.12,
  // Saturation multiplier after the colour grade (1 = unchanged).
  saturation: 1.8,
  // Lightness steps after posterizing (fewer = bolder).
  levels: 6,
  // Random hue shift per tile, ± degrees, so flat areas aren't one block.
  hueJitter: 14,
  maxTiles: 1800,
}

// The colour grade's anchors, as hues in 0–1.
const SHADOW_HUE = 0.7 // blue-violet
const NEUTRAL_HUE = 0.55 // teal-blue
const WARM_HUE = 0.07 // orange
const HUE_STEPS = 24 // posterized hues: 15° apart
const TAU = Math.PI * 2
const SATURATION_STEPS = 4

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const MAX_DISTANCE = Math.sqrt(3 * 255 * 255)

/** A stable pseudo-random integer per (a, b), so decorations never flicker. */
export const hash = (a, b = 0) => (((Math.floor(a) + 1) * 73856093) ^ ((Math.floor(b) + 1) * 19349663)) >>> 0

/** Stable pseudo-random number in [0, 1). */
export const random01 = (a, b = 0) => (hash(a, b) % 10007) / 10007

/**
 * Draws the photo into a `width` × `height` grid of samples (cover-fit,
 * anchored to the top so the face is never cropped).
 * @returns {{ pixels: Uint8ClampedArray, width: number, height: number } | null}
 */
export function sampleImage(image, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, (width - drawWidth) / 2, 0, drawWidth, image.naturalHeight * scale)
  return { pixels: context.getImageData(0, 0, width, height).data, width, height }
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

/**
 * Marks background samples: close to the median colour of the top and side
 * edges, and connected to one of those edges. The bottom edge is not a seed —
 * shoulders and a shirt usually touch it. Transparent pixels are background.
 * @returns {Uint8Array} 1 = background
 */
export function detectBackground(pixels, width, height, threshold = MOSAIC_DEFAULTS.bgThreshold) {
  const count = width * height
  const background = new Uint8Array(count)
  if (count === 0) return background

  const edge = []
  for (let x = 0; x < width; x += 1) edge.push(x)
  for (let y = 1; y < height; y += 1) edge.push(y * width, y * width + width - 1)
  const reference = [0, 1, 2].map((channel) => median(edge.map((i) => pixels[i * 4 + channel])))

  const near = new Uint8Array(count)
  for (let i = 0; i < count; i += 1) {
    const o = i * 4
    if (pixels[o + 3] < 16) {
      near[i] = 1
      continue
    }
    if (threshold <= 0) continue
    const dr = pixels[o] - reference[0]
    const dg = pixels[o + 1] - reference[1]
    const db = pixels[o + 2] - reference[2]
    near[i] = Math.sqrt(dr * dr + dg * dg + db * db) / MAX_DISTANCE < threshold ? 1 : 0
  }

  const queue = []
  const seed = (i) => {
    if (near[i] && !background[i]) {
      background[i] = 1
      queue.push(i)
    }
  }
  edge.forEach(seed)
  while (queue.length > 0) {
    const i = queue.pop()
    const x = i % width
    if (x > 0) seed(i - 1)
    if (x < width - 1) seed(i + 1)
    if (i >= width) seed(i - width)
    if (i < count - width) seed(i + width)
  }
  return background
}

/**
 * Summed-area tables over the figure's samples, so the colour statistics of
 * any rectangle cost four lookups however big it is.
 */
function buildIntegrals(pixels, width, height, background) {
  const stride = width + 1
  const size = stride * (height + 1)
  const n = new Float64Array(size)
  const r = new Float64Array(size)
  const g = new Float64Array(size)
  const b = new Float64Array(size)
  const sq = new Float64Array(size)

  for (let y = 0; y < height; y += 1) {
    let rowN = 0
    let rowR = 0
    let rowG = 0
    let rowB = 0
    let rowSq = 0
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x
      if (!background[i]) {
        const o = i * 4
        rowN += 1
        rowR += pixels[o]
        rowG += pixels[o + 1]
        rowB += pixels[o + 2]
        rowSq += pixels[o] ** 2 + pixels[o + 1] ** 2 + pixels[o + 2] ** 2
      }
      const at = (y + 1) * stride + x + 1
      const above = y * stride + x + 1
      n[at] = n[above] + rowN
      r[at] = r[above] + rowR
      g[at] = g[above] + rowG
      b[at] = b[above] + rowB
      sq[at] = sq[above] + rowSq
    }
  }

  const sum = (table, x0, y0, x1, y1) =>
    table[y1 * stride + x1] - table[y0 * stride + x1] - table[y1 * stride + x0] + table[y0 * stride + x0]

  /** Stats for samples x0 ≤ x < x1, y0 ≤ y < y1. */
  return (x0, y0, x1, y1) => {
    const area = Math.max(0, x1 - x0) * Math.max(0, y1 - y0)
    if (area === 0) return { area: 0, figure: 0 }
    const figure = sum(n, x0, y0, x1, y1)
    if (figure === 0) return { area, figure: 0 }
    const mr = sum(r, x0, y0, x1, y1) / figure
    const mg = sum(g, x0, y0, x1, y1) / figure
    const mb = sum(b, x0, y0, x1, y1) / figure
    const variance = (sum(sq, x0, y0, x1, y1) / figure - (mr * mr + mg * mg + mb * mb)) / (3 * 255 * 255)
    return { area, figure, color: [mr, mg, mb], variance: Math.max(0, variance) }
  }
}

/** Average colour of a rectangle of samples, ignoring background. */
export function averageColor(pixels, width, height, background, rect) {
  const stats = buildIntegrals(pixels, width, height, background)(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h)
  return stats.color ? stats.color.map(Math.round) : null
}

function rgbToHsl([r, g, b]) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0)
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return [h / 6, s, l]
}

function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t) => {
    let u = t
    if (u < 0) u += 1
    if (u > 1) u -= 1
    if (u < 1 / 6) return p + (q - p) * 6 * u
    if (u < 1 / 2) return q
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6
    return p
  }
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255]
}

/** Moves hue `h` toward `target` by `amount`, the short way round (all in 0–1). */
function towardHue(h, target, amount) {
  let delta = target - h
  if (delta > 0.5) delta -= 1
  if (delta < -0.5) delta += 1
  return (h + delta * clamp(amount, 0, 1) + 1) % 1
}

/**
 * The mosaic's colour grade, applied to one tile's average colour:
 *
 * 1. Shadows take on blue-violet, so dark hair and a dark suit read as rich
 *    blues and purples instead of muddy grey.
 * 2. Greyish mid-tones (clothing, a white shirt) take on teal-blue.
 * 3. Warm highlights (lit skin) push toward orange.
 * 4. Saturation is multiplied by `saturation`; darks are lifted a little so
 *    they still show against the dark background.
 * 5. A stable random hue shift of ±`hueJitter`° per tile (`seed`).
 * 6. Posterize: 24 hues, 4 saturations and `levels` lightness steps — a bold,
 *    blocky palette.
 */
export function stylize(
  rgb,
  {
    saturation = MOSAIC_DEFAULTS.saturation,
    levels = MOSAIC_DEFAULTS.levels,
    hueJitter = MOSAIC_DEFAULTS.hueJitter,
    seed = 0,
  } = {},
) {
  let [h, s, l] = rgbToHsl(rgb)

  const shadow = clamp((0.45 - l) / 0.45, 0, 1)
  const neutral = 1 - clamp(s / 0.3, 0, 1)
  const highlight = clamp((l - 0.5) / 0.4, 0, 1)
  const warm = s > 0.12 && (h < 0.15 || h > 0.95)

  // The grade adds colour like mixing paint: each anchor hue is added as a
  // vector on the colour wheel. A near-grey takes on the anchor's hue; a
  // strong colour only leans toward it. (Rotating the hue instead would take
  // a pale yellow through green on its way to teal.)
  let a = s * Math.cos(h * TAU)
  let b = s * Math.sin(h * TAU)
  const add = (hue, amount) => {
    a += amount * Math.cos(hue * TAU)
    b += amount * Math.sin(hue * TAU)
  }
  add(SHADOW_HUE, shadow * 0.55)
  add(NEUTRAL_HUE, neutral * (1 - shadow) * 0.35)
  if (warm) h = towardHue(Math.atan2(b, a) / TAU + 1, WARM_HUE, highlight * 0.45)
  else h = (Math.atan2(b, a) / TAU + 1) % 1
  s = Math.hypot(a, b)

  s = clamp(s * saturation, 0, 1)
  l = 0.12 + l * 0.84

  h = (h + ((random01(seed, 23) - 0.5) * 2 * hueJitter) / 360 + 1) % 1

  const lightSteps = Math.max(2, Math.round(levels)) - 1
  h = (Math.round(h * HUE_STEPS) % HUE_STEPS) / HUE_STEPS
  s = Math.round(s * (SATURATION_STEPS - 1)) / (SATURATION_STEPS - 1)
  l = Math.round(l * lightSteps) / lightSteps

  return hslToRgb([h, s, l]).map((channel) => clamp(Math.round(channel), 0, 255))
}

/** Mixes `rgb` toward `target` by `amount` (0–1). */
export const mixColor = (rgb, target, amount) =>
  rgb.map((channel, i) => Math.round(channel + (target[i] - channel) * clamp(amount, 0, 1)))

/**
 * Bigger tiles split at a lower variance than small ones (∝ √(min / size)),
 * so the gentle texture of a suit or a cheek breaks up big blocks, while only
 * real detail — eyes, brows, mouth, hair edges — goes down to the smallest.
 */
export const splitThreshold = (detail, size, tileMin) => detail * Math.sqrt(Math.max(tileMin, 1) / size)

/**
 * One quadtree pass over a box of `width` × `height` CSS pixels.
 * `unit` is how many CSS pixels one sample covers.
 */
function quadtree(stats, { width, height, unit, tileMin, tileMax, detail }) {
  const tiles = []

  const visit = (x, y, size) => {
    const x0 = Math.round(x / unit)
    const y0 = Math.round(y / unit)
    const x1 = Math.min(Math.round((x + size) / unit), Math.round(width / unit))
    const y1 = Math.min(Math.round((y + size) / unit), Math.round(height / unit))
    const cell = stats(x0, y0, x1, y1)
    if (cell.area === 0) return

    const share = cell.figure / cell.area
    const canSplit = size / 2 >= tileMin
    // Mostly background: drop it, unless splitting can trace an edge.
    if (share < 0.5 && (!canSplit || share < 0.02)) return

    // Silhouette edges split down to twice the smallest size; past that, only
    // real detail splits them further.
    const onEdge = share < 0.98 && size / 2 >= tileMin * 2
    if (canSplit && (onEdge || cell.variance > splitThreshold(detail, size, tileMin))) {
      const half = size / 2
      visit(x, y, half)
      visit(x + half, y, half)
      visit(x, y + half, half)
      visit(x + half, y + half, half)
      return
    }
    tiles.push({ x, y, size, color: cell.color, variance: cell.variance })
  }

  for (let y = 0; y < height; y += tileMax) {
    for (let x = 0; x < width; x += tileMax) visit(x, y, tileMax)
  }
  return tiles
}

/**
 * Builds the mosaic for a box of `width` × `height` CSS pixels from samples
 * covering it at `unit` CSS pixels per sample.
 *
 * If the result has more than `maxTiles` tiles, the detail threshold and the
 * smallest tile size are raised until it fits, so a low-end device gets a
 * coarser mosaic instead of a slow one.
 *
 * @returns {{ tiles: Array<{ x, y, size, rgb: number[], fine: boolean }>, width, height }}
 */
export function buildMosaic(sample, options = {}) {
  const settings = { ...MOSAIC_DEFAULTS, ...options }
  const { pixels, width: sw, height: sh } = sample
  const unit = settings.unit ?? 1
  const width = settings.width ?? sw * unit
  const height = settings.height ?? sh * unit
  const tileMax = Math.max(1, settings.tileMax)
  const background = detectBackground(pixels, sw, sh, settings.bgThreshold)
  const stats = buildIntegrals(pixels, sw, sh, background)

  let tileMin = clamp(settings.tileMin, 1, tileMax)
  let detail = settings.detail
  let raw = quadtree(stats, { width, height, unit, tileMin, tileMax, detail })
  // Small steps, so the result lands close under the cap, not far below it.
  // Raise the detail threshold first — that keeps the finest tiles on the
  // strongest features — and only coarsen the smallest size as a last resort.
  for (let attempt = 0; raw.length > settings.maxTiles && attempt < 60; attempt += 1) {
    if (attempt < 24) detail *= 1.2
    else tileMin = Math.min(tileMax, tileMin * 1.08)
    raw = quadtree(stats, { width, height, unit, tileMin, tileMax, detail })
  }

  const tiles = raw.map((tile) => {
    // Seeded by position, so a tile keeps its colour across rebuilds.
    const seed = hash(Math.round(tile.x * 4), Math.round(tile.y * 4) + tile.size)
    return {
      x: tile.x,
      y: tile.y,
      size: tile.size,
      rgb: stylize(tile.color, { ...settings, seed }),
      // A few large tiles get a fine inner grid (decoration only).
      fine: tile.size >= 16 && random01(seed, 7) < 0.07,
    }
  })

  return { tiles, width, height }
}

/**
 * Tiny coordinate labels scattered over the background grid: `count` cells
 * of a `step` grid, chosen stably, each labelled with its column and row.
 */
export function gridLabels(width, height, step, count) {
  const cols = Math.floor(width / step)
  const rows = Math.floor(height / step)
  const total = cols * rows
  if (total === 0 || count <= 0) return []

  const picked = new Set()
  for (let i = 0; picked.size < Math.min(count, total) && i < count * 20; i += 1) {
    picked.add(hash(i, 31) % total)
  }
  return [...picked].map((cell) => {
    const col = cell % cols
    const row = Math.floor(cell / cols)
    return {
      x: col * step,
      y: row * step,
      text: `${String(col).padStart(2, '0')}.${String(row).padStart(2, '0')}`,
    }
  })
}
