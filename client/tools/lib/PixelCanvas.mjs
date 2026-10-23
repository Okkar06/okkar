// =====================================================================
//  PIXEL CANVAS — draw pixel art with code, using palette colour names.
//
//    const c = new PixelCanvas(16, 16)
//    c.rect(2, 2, 12, 12, 'wood')    // filled rectangle
//    c.outline()                      // 1px 'ink' outline around everything
//
//  Colours are names from src/theme/palette.js ('ink', 'woodLight' ...).
// =====================================================================

import { rgb } from '../../src/theme/palette.js'

export class PixelCanvas {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.data = new Uint8Array(width * height * 4) // RGBA, all transparent
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  // Set one pixel. `alpha` is 0-255 (255 = solid).
  set(x, y, color, alpha) {
    x = Math.round(x)
    y = Math.round(y)
    if (!this.inside(x, y)) return
    const [r, g, b] = rgb(color)
    const i = (y * this.width + x) * 4
    this.data[i] = r
    this.data[i + 1] = g
    this.data[i + 2] = b
    this.data[i + 3] = alpha === undefined ? 255 : alpha
  }

  alphaAt(x, y) {
    if (!this.inside(x, y)) return 0
    return this.data[(y * this.width + x) * 4 + 3]
  }

  clear(x, y) {
    if (!this.inside(x, y)) return
    this.data[(y * this.width + x) * 4 + 3] = 0
  }

  rect(x, y, w, h, color, alpha) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) this.set(i, j, color, alpha)
    }
  }

  hline(x, y, w, color) {
    this.rect(x, y, w, 1, color)
  }

  vline(x, y, h, color) {
    this.rect(x, y, 1, h, color)
  }

  // Filled ellipse centred on (cx, cy).
  ellipse(cx, cy, rx, ry, color, alpha) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx
        const dy = (y - cy) / ry
        if (dx * dx + dy * dy <= 1) this.set(x, y, color, alpha)
      }
    }
  }

  // String art: each character is a pixel. `key` maps characters to colour
  // names; '.' (or any unmapped character) is transparent.
  art(x, y, rows, key) {
    for (let j = 0; j < rows.length; j++) {
      for (let i = 0; i < rows[j].length; i++) {
        const color = key[rows[j][i]]
        if (color) this.set(x + i, y + j, color)
      }
    }
  }

  // Add a 1px outline around every solid shape (4-neighbour), like Kenney's art.
  outline(color) {
    const outlineColor = color || 'ink'
    const toPaint = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.alphaAt(x, y) !== 0) continue
        if (
          this.alphaAt(x - 1, y) === 255 || this.alphaAt(x + 1, y) === 255 ||
          this.alphaAt(x, y - 1) === 255 || this.alphaAt(x, y + 1) === 255
        ) {
          toPaint.push([x, y])
        }
      }
    }
    for (let i = 0; i < toPaint.length; i++) this.set(toPaint[i][0], toPaint[i][1], outlineColor)
    return this
  }

  // Copy another canvas onto this one (transparent pixels are skipped).
  blit(other, x, y) {
    for (let j = 0; j < other.height; j++) {
      for (let i = 0; i < other.width; i++) {
        const k = (j * other.width + i) * 4
        if (other.data[k + 3] === 0) continue
        if (!this.inside(x + i, y + j)) continue
        const t = ((y + j) * this.width + (x + i)) * 4
        this.data[t] = other.data[k]
        this.data[t + 1] = other.data[k + 1]
        this.data[t + 2] = other.data[k + 2]
        this.data[t + 3] = other.data[k + 3]
      }
    }
    return this
  }

  // A mirrored copy (left <-> right).
  flipX() {
    const copy = new PixelCanvas(this.width, this.height)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const from = (y * this.width + x) * 4
        const to = (y * this.width + (this.width - 1 - x)) * 4
        for (let c = 0; c < 4; c++) copy.data[to + c] = this.data[from + c]
      }
    }
    return copy
  }
}

// Small helper: a seeded random number generator, so generated art is
// identical every time you run the tool.
export function seededRandom(seed) {
  let s = seed >>> 0
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
