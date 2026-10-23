// =====================================================================
//  16x16 TILES for the "extras" tileset (used in Tiled).
//  `solid: true` means the starter-map generator marks the tile with
//  the Tiled property collides=true.
// =====================================================================

import { PixelCanvas, seededRandom } from '../lib/PixelCanvas.mjs'

// ---------------------------------------------------------------------
//  Cliff: a two-tile-tall rock wall with a grassy lip, forming the
//  village's north boundary. Rounded boulders, lit from the top-left.
// ---------------------------------------------------------------------
function boulders(c, top, bottom, seed) {
  const random = seededRandom(seed)
  c.rect(0, top, 16, bottom - top, 'slate') // dark crevices between rocks
  for (let k = 0; k < 9; k++) {
    const rx = 2.2 + random() * 2.6
    const ry = 1.8 + random() * 1.8
    const cx = random() * 16
    const cy = top + ry + random() * (bottom - top - ry * 2)
    c.ellipse(cx, cy, rx, ry, 'stone')
    c.ellipse(cx - rx * 0.35, cy - ry * 0.4, rx * 0.45, ry * 0.35, 'stoneHi') // lit top-left
    for (let x = Math.floor(cx - rx + 1); x <= Math.ceil(cx + rx - 1); x++) {
      c.set(x, Math.round(cy + ry), 'stoneDark') // shaded bottom edge
    }
  }
}

function cliffTop(seed) {
  const c = new PixelCanvas(16, 16)
  boulders(c, 3, 16, seed)
  // Grassy lip hanging over the edge, wavy, with a few hanging vines.
  const random = seededRandom(seed + 7)
  for (let x = 0; x < 16; x++) {
    const hang = 2 + Math.floor(random() * 3)
    c.vline(x, 0, hang, 'grass')
    c.set(x, hang, 'grassDark')
    c.set(x, hang + 1, 'ink')
    if (random() < 0.18) {
      const vine = 2 + Math.floor(random() * 5)
      c.vline(x, hang + 1, vine, 'grassMid')
      c.set(x, hang + 1 + vine, 'grassDark')
    }
  }
  c.hline(0, 0, 16, 'grassHi')
  return c
}

function cliffBottom(seed) {
  const c = new PixelCanvas(16, 16)
  boulders(c, 0, 12, seed)
  const random = seededRandom(seed + 3)
  for (let x = 0; x < 16; x++) {
    const edge = 11 + Math.floor(random() * 2) // uneven base
    c.vline(x, edge, 1, 'stoneDark')
    c.set(x, edge + 1, 'ink')
    c.set(x, edge + 2, 'ink', 70) // soft shadow on the grass
    c.set(x, edge + 3, 'ink', 35)
  }
  return c
}

// Darker, leaf-littered grass for the forest edges (adds depth).
function forestFloor(seed) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'grassMid')
  const random = seededRandom(seed)
  for (let k = 0; k < 14; k++) {
    const x = Math.floor(random() * 16)
    const y = Math.floor(random() * 16)
    c.set(x, y, random() < 0.6 ? 'grassDark' : 'grass')
  }
  for (let k = 0; k < 2; k++) c.set(Math.floor(random() * 16), Math.floor(random() * 16), 'orange') // a fallen leaf
  return c
}

// Tilled soil for the crop field (furrows run left-right).
function soil(seed) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'wood')
  const random = seededRandom(seed)
  for (let y = 0; y < 16; y += 4) {
    c.hline(0, y, 16, 'woodDark') // furrow shadow
    c.hline(0, y + 1, 16, 'sandDark') // ridge highlight
  }
  for (let k = 0; k < 6; k++) c.set(Math.floor(random() * 16), Math.floor(random() * 16), 'woodLight')
  return c
}

// Cobblestones for the village square.
function cobble(seed) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'sandDark') // mortar
  const random = seededRandom(seed)
  for (let y = 0; y < 16; y += 4) {
    let x = (y / 4) % 2 === 0 ? 0 : -3
    while (x < 16) {
      const w = 4 + Math.floor(random() * 3)
      c.rect(x + 1, y + 1, w - 1, 3, 'stoneHi')
      c.hline(x + 1, y + 3, w - 1, 'stone')
      c.set(x + 1, y + 1, 'white')
      x = x + w
    }
  }
  return c
}

export function tiles() {
  return [
    { name: 'cliff_top_a', canvas: cliffTop(11), solid: true },
    { name: 'cliff_top_b', canvas: cliffTop(29), solid: true },
    { name: 'cliff_bottom_a', canvas: cliffBottom(5), solid: true },
    { name: 'cliff_bottom_b', canvas: cliffBottom(17), solid: true },
    { name: 'forest_floor_a', canvas: forestFloor(3) },
    { name: 'forest_floor_b', canvas: forestFloor(9) },
    { name: 'soil_a', canvas: soil(4) },
    { name: 'soil_b', canvas: soil(8) },
    { name: 'cobble_a', canvas: cobble(2) },
    { name: 'cobble_b', canvas: cobble(6) },
  ]
}
