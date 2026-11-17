/**
 * Turns a photo into a "binary" portrait: a grid of 0s and 1s in the pixel
 * font, brighter where the photo is brighter, with the background cut away.
 *
 * The result is an alpha mask (a PNG data URL). The component paints the
 * theme's colours through it, so the portrait re-colours with the theme —
 * including the 300ms cross-fade — without ever being redrawn.
 *
 * classifyCells() is pure and unit-tested; buildBinaryMask() needs a canvas.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// A cell is "background" if it is this bright and this grey...
const BACKGROUND_LUMA = 0.86
const BACKGROUND_CHROMA = 0.1
// ...and connected to the top, left or right edge through other such cells.
// The bottom edge is excluded on purpose: a white shirt usually touches it.

/** Pseudo-random but stable per cell, so a resize redraws the same digits. */
const hash = (col, row) => (((col + 1) * 73856093) ^ ((row + 1) * 19349663)) >>> 0

export const digitAt = (col, row) => ((hash(col, row) >> 3) & 1 ? '1' : '0')

/**
 * @param {Uint8ClampedArray} pixels RGBA, one pixel per cell (cols × rows)
 * @returns {Float32Array} per cell: -1 for background, else brightness 0–1
 *   stretched across the figure's own range so detail survives.
 */
export function classifyCells(pixels, cols, rows) {
  const count = cols * rows
  const luma = new Float32Array(count)
  const pale = new Uint8Array(count)

  for (let i = 0; i < count; i += 1) {
    const r = pixels[i * 4] / 255
    const g = pixels[i * 4 + 1] / 255
    const b = pixels[i * 4 + 2] / 255
    luma[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const chroma = Math.max(r, g, b) - Math.min(r, g, b)
    pale[i] = luma[i] >= BACKGROUND_LUMA && chroma <= BACKGROUND_CHROMA ? 1 : 0
  }

  // Flood-fill the background in from the top, left and right edges.
  const background = new Uint8Array(count)
  const queue = []
  const seed = (col, row) => {
    const i = row * cols + col
    if (pale[i] && !background[i]) {
      background[i] = 1
      queue.push(i)
    }
  }

  for (let col = 0; col < cols; col += 1) seed(col, 0)
  for (let row = 0; row < rows; row += 1) {
    seed(0, row)
    seed(cols - 1, row)
  }

  while (queue.length > 0) {
    const i = queue.pop()
    const col = i % cols
    const row = (i - col) / cols
    if (col > 0) seed(col - 1, row)
    if (col < cols - 1) seed(col + 1, row)
    if (row > 0) seed(col, row - 1)
    if (row < rows - 1) seed(col, row + 1)
  }

  // Stretch the figure's brightness between its 5th and 95th percentiles.
  const figure = []
  for (let i = 0; i < count; i += 1) if (!background[i]) figure.push(luma[i])
  figure.sort((a, b) => a - b)
  const low = figure.length ? figure[Math.floor(figure.length * 0.05)] : 0
  const high = figure.length ? figure[Math.min(figure.length - 1, Math.floor(figure.length * 0.95))] : 1
  const range = Math.max(high - low, 0.001)

  const levels = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    levels[i] = background[i] ? -1 : clamp((luma[i] - low) / range, 0, 1)
  }
  return levels
}

/** How opaque a cell's digit is. Dark areas stay faintly visible as shape. */
export function cellAlpha(level, col, row) {
  if (level < 0) {
    // A sparse, faint field of digits behind the figure.
    return hash(col, row) % 9 === 0 ? 0.07 : 0
  }
  // A steep curve: shadows (hair, eyes, glasses, suit) recede and the
  // lit face stands out, which is what makes the figure read as a face.
  return 0.14 + 0.86 * level ** 1.6
}

/**
 * Draws the mask for a box of `width` × `height` CSS pixels.
 * @returns {string | null} a PNG data URL, or null if canvas is unavailable.
 */
export function buildBinaryMask(image, { width, height, dpr = 1, font = '"Press Start 2P", monospace' }) {
  const cols = clamp(Math.round(width / 7), 32, 72)
  const cell = width / cols
  const rows = Math.ceil(height / cell)

  // 1. Sample the photo at one pixel per cell (cover-fit, anchored to the top
  //    so the face is never cropped).
  const sample = document.createElement('canvas')
  sample.width = cols
  sample.height = rows
  const sampleContext = sample.getContext('2d', { willReadFrequently: true })
  if (!sampleContext) return null

  const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  sampleContext.imageSmoothingQuality = 'high'
  sampleContext.drawImage(image, (cols - drawWidth) / 2, 0, drawWidth, drawHeight)

  const levels = classifyCells(sampleContext.getImageData(0, 0, cols, rows).data, cols, rows)

  // 2. Draw one digit per cell. Only alpha matters in a mask, so the fill
  //    colour is left at the canvas default.
  const output = document.createElement('canvas')
  output.width = Math.round(width * dpr)
  output.height = Math.round(height * dpr)
  const context = output.getContext('2d')
  if (!context) return null

  context.scale(dpr, dpr)
  context.font = `${(cell * 0.86).toFixed(2)}px ${font}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const alpha = cellAlpha(levels[row * cols + col], col, row)
      if (alpha <= 0) continue
      context.globalAlpha = alpha
      context.fillText(digitAt(col, row), (col + 0.5) * cell, (row + 0.5) * cell)
    }
  }

  return output.toDataURL('image/png')
}
