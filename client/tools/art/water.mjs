// =====================================================================
//  WATER ART — lake tiles (2 animation frames), sandy shore, the dock,
//  and lake life: lily pads, reeds, bubbles, fish, dragonflies.
//
//  Shore tiles are "autotiles": 13 variants, named by which side faces
//  OUTSIDE the region (same rule as Kenney's dirt paths):
//    c = middle   n/s/e/w = one edge   nw/ne/sw/se = outer corner
//    inw/ine/isw/ise = inner corner (only the diagonal is outside)
//  The map generator picks the right variant for each cell.
// =====================================================================

import { PixelCanvas, seededRandom } from '../lib/PixelCanvas.mjs'

export const AUTOTILE_CLASSES = ['c', 'n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se', 'inw', 'ine', 'isw', 'ise']

// Which sides/corners of a 16x16 tile are "outside" for each class.
function sidesFor(cls) {
  return {
    n: cls === 'n' || cls === 'nw' || cls === 'ne',
    s: cls === 's' || cls === 'sw' || cls === 'se',
    w: cls === 'w' || cls === 'nw' || cls === 'sw',
    e: cls === 'e' || cls === 'ne' || cls === 'se',
    inw: cls === 'inw', ine: cls === 'ine', isw: cls === 'isw', ise: cls === 'ise',
  }
}

// Paint a band `depth` pixels thick along each outside side, using
// colours[0] at the very edge, colours[1] for the next pixel, etc.
function bands(c, sides, colours) {
  for (let d = 0; d < colours.length; d++) {
    const col = colours[d]
    if (!col) continue
    if (sides.n) c.hline(0, d, 16, col)
    if (sides.s) c.hline(0, 15 - d, 16, col)
    if (sides.w) c.vline(d, 0, 16, col)
    if (sides.e) c.vline(15 - d, 0, 16, col)
  }
  // Inner corners: a small rounded patch in that corner.
  const corners = [['inw', 0, 0, 1, 1], ['ine', 15, 0, -1, 1], ['isw', 0, 15, 1, -1], ['ise', 15, 15, -1, -1]]
  for (let k = 0; k < corners.length; k++) {
    const [key, cx, cy, sx, sy] = corners[k]
    if (!sides[key]) continue
    for (let d = 0; d < colours.length; d++) {
      if (!colours[d]) continue
      const size = colours.length - d
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - i; j++) c.set(cx + sx * i, cy + sy * j, colours[d])
      }
    }
  }
}

// Round off outer corners with the "outside" colour.
function roundCorners(c, cls, colour) {
  const corners = { nw: [0, 0, 1, 1], ne: [15, 0, -1, 1], sw: [0, 15, 1, -1], se: [15, 15, -1, -1] }
  const corner = corners[cls]
  if (!corner) return
  const [x, y, sx, sy] = corner
  // A quarter circle of radius ~4px, so the shoreline curves.
  const shape = [4, 3, 2, 1] // how many pixels to fill on each row from the corner
  for (let j = 0; j < shape.length; j++) {
    for (let i = 0; i < shape[j]; i++) c.set(x + sx * i, y + sy * j, colour)
  }
}

// ---------------------------------------------------------------------
//  Water: deep blue with drifting wave dashes; shallows and foam where
//  it meets the sand. Frame 1 shifts the waves and foam (animation).
// ---------------------------------------------------------------------
function waterTile(cls, frame) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'water')
  const random = seededRandom(31)
  for (let k = 0; k < 4; k++) {
    const x = Math.floor(random() * 12) + frame * 2
    const y = Math.floor(random() * 14) + 1
    c.hline(x % 14, y, 3, 'waterLight')
    c.set((x + 5) % 15, (y + 5) % 15, 'waterDeep')
  }
  const sides = sidesFor(cls)
  // edge -> inwards: wet sand, foam, shallow water
  bands(c, sides, ['cream', frame === 0 ? 'waterFoam' : 'waterLight', 'waterLight', null])
  // dotted foam that moves between frames
  for (let x = frame; x < 16; x += 3) {
    if (sides.n) c.set(x, 1, 'white')
    if (sides.s) c.set(x, 14, 'white')
  }
  for (let y = frame; y < 16; y += 3) {
    if (sides.w) c.set(1, y, 'white')
    if (sides.e) c.set(14, y, 'white')
  }
  roundCorners(c, cls, 'cream')
  return c
}

// Sand: warm cream with specks; grass creeps in along the outside edges.
function sandTile(cls) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'cream')
  const random = seededRandom(57)
  for (let k = 0; k < 10; k++) {
    c.set(Math.floor(random() * 16), Math.floor(random() * 16), random() < 0.5 ? 'sandDark' : 'woodHi')
  }
  const sides = sidesFor(cls)
  bands(c, sides, ['grass', 'grass', 'grassMid'])
  // Ragged grass edge: a few tufts poke further into the sand.
  for (let i = 1; i < 15; i += 4) {
    if (sides.n) c.set(i, 3, 'grass')
    if (sides.s) c.set(i, 12, 'grass')
    if (sides.w) c.set(3, i, 'grass')
    if (sides.e) c.set(12, i, 'grass')
  }
  roundCorners(c, cls, 'grass')
  return c
}

// Dock planks run across the dock; posts on the outer sides.
// side: 'l' (left edge), 'r' (right edge) or 'c' (middle of a wide platform)
function dockTile(side, end) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'water')
  const x0 = side === 'l' ? 2 : 0
  const w = side === 'c' ? 16 : 14
  const h = end ? 14 : 16
  c.rect(x0, 0, w, h, 'woodLight')
  for (let y = 0; y < h; y += 4) {
    c.hline(x0, y, w, 'woodHi')
    c.hline(x0, y + 3, w, 'wood')
  }
  if (side !== 'c') {
    const postX = side === 'l' ? 1 : 14
    c.rect(postX, 2, 2, 3, 'woodDark') // posts
    c.rect(postX, 10, 2, 3, 'woodDark')
    c.vline(side === 'l' ? 2 : 15, 0, h, 'woodDark') // edge shadow
  }
  if (end) {
    c.hline(x0, 14, w, 'woodDark')
    c.hline(x0, 15, w, 'waterDeep')
  }
  return c
}

// A little rowboat moored at the harbour (flat on the water).
function rowboat() {
  const c = new PixelCanvas(30, 14)
  c.ellipse(14.5, 7, 13.5, 5.5, 'wood')
  c.ellipse(14.5, 6.5, 11.5, 4, 'woodLight')
  c.ellipse(14.5, 7, 9, 2.6, 'woodDark') // inside of the hull
  c.rect(9, 4, 2, 6, 'woodLight') // seats
  c.rect(19, 4, 2, 6, 'woodLight')
  c.hline(5, 11, 20, 'woodDark')
  c.outline()
  c.hline(4, 13, 22, 'waterFoam') // a line of foam along the hull
  return c
}

export function tiles() {
  const list = []
  for (let i = 0; i < AUTOTILE_CLASSES.length; i++) {
    const cls = AUTOTILE_CLASSES[i]
    list.push({ name: 'water_' + cls + '_0', canvas: waterTile(cls, 0), solid: true })
    list.push({ name: 'water_' + cls + '_1', canvas: waterTile(cls, 1), solid: true })
  }
  for (let i = 0; i < AUTOTILE_CLASSES.length; i++) {
    list.push({ name: 'sand_' + AUTOTILE_CLASSES[i], canvas: sandTile(AUTOTILE_CLASSES[i]) })
  }
  list.push({ name: 'dock_l', canvas: dockTile('l', false) })
  list.push({ name: 'dock_r', canvas: dockTile('r', false) })
  list.push({ name: 'dock_end_l', canvas: dockTile('l', true) })
  list.push({ name: 'dock_end_r', canvas: dockTile('r', true) })
  list.push({ name: 'dock_c', canvas: dockTile('c', false) })
  list.push({ name: 'dock_end_c', canvas: dockTile('c', true) })
  return list
}

// ---------------------------------------------------------------------
//  Lake life sprites
// ---------------------------------------------------------------------
function lilyPad(flower) {
  const c = new PixelCanvas(12, 8)
  c.ellipse(5.5, 4, 5, 3, 'grassMid')
  c.ellipse(4.5, 3.4, 2.5, 1.4, 'grassHi')
  c.set(6, 4, 'water') // the notch
  c.set(7, 4, 'water')
  c.set(8, 4, 'water')
  if (flower) {
    c.art(3, 0, ['.p.', 'pyp', '.p.'], { p: 'pink', y: 'yellow' })
  }
  return c.outline('grassDark')
}

function reeds(frame) {
  const c = new PixelCanvas(12, 16)
  const stalks = [[2, 4], [5, 1], [8, 3]]
  for (let i = 0; i < stalks.length; i++) {
    const [x, top] = stalks[i]
    for (let y = top; y < 15; y++) {
      const lean = frame === 1 && y < top + 4 ? 1 : 0
      c.set(x + lean, y, 'grassMid')
    }
    const lean = frame === 1 ? 1 : 0
    c.rect(x + lean - 1 + 1, top + 1, 2, 4, 'woodDark') // cattail head
    c.set(x + lean + 1, top + 1, 'wood')
  }
  c.hline(1, 14, 10, 'grassDark')
  return c.outline()
}

function bubble(stage) {
  const c = new PixelCanvas(7, 7)
  if (stage === 0) {
    c.set(3, 3, 'waterFoam')
  } else if (stage === 1) {
    c.art(2, 2, ['.w.', 'wbw', '.w.'], { w: 'waterFoam', b: 'white' })
  } else {
    c.art(0, 0, ['.f...f.', 'f.....f', '.......', '.......', '.......', 'f.....f', '.f...f.'], { f: 'waterFoam' })
  }
  return c
}

function fishShadow() {
  const c = new PixelCanvas(14, 6)
  c.ellipse(5, 3, 5, 2, 'waterDeep')
  c.art(9, 1, ['.dd', 'dd.', '.dd'], { d: 'waterDeep' })
  return c
}

function dragonfly(frame) {
  const c = new PixelCanvas(11, 8)
  c.hline(2, 4, 7, 'blue')
  c.set(9, 4, 'navy')
  c.set(8, 4, 'blueLight')
  if (frame === 0) {
    c.art(3, 1, ['ww.ww', '.....', '.....', '.....', 'ww.ww'], { w: 'waterFoam' })
  } else {
    c.art(3, 2, ['w..w.', '.....', '.....', 'w..w.'], { w: 'waterFoam' })
  }
  return c
}

// The fish you can catch (shown in the catch card and above the player).
function fish(body, belly, fin) {
  const c = new PixelCanvas(16, 10)
  c.ellipse(6.5, 5, 5.5, 3, body)
  c.ellipse(6, 6, 4, 1.4, belly)
  c.art(12, 2, ['f..', 'ff.', 'fff', 'ff.', 'f..'], { f: fin })
  c.set(3, 4, 'ink') // eye
  c.set(3, 3, 'white')
  c.set(7, 2, fin) // top fin
  c.set(8, 2, fin)
  return c.outline()
}

function dockStool() {
  const c = new PixelCanvas(12, 13)
  c.rect(1, 1, 10, 4, 'woodLight')
  c.hline(1, 1, 10, 'woodHi')
  c.rect(2, 5, 2, 7, 'wood')
  c.rect(8, 5, 2, 7, 'wood')
  c.hline(2, 8, 8, 'woodDark')
  return c.outline()
}

function bucket() {
  const c = new PixelCanvas(11, 11)
  c.rect(2, 4, 7, 6, 'stone')
  c.vline(2, 4, 6, 'stoneHi')
  c.hline(2, 6, 7, 'stoneDark')
  c.ellipse(5, 4, 3.5, 1.2, 'water')
  c.set(4, 4, 'waterFoam')
  c.hline(3, 1, 5, 'slate') // handle
  c.set(2, 2, 'slate')
  c.set(8, 2, 'slate')
  return c.outline()
}

export function sprites() {
  return [
    { name: 'lily_pad', canvas: lilyPad(false) },
    { name: 'lily_flower', canvas: lilyPad(true) },
    { name: 'reeds_0', canvas: reeds(0) },
    { name: 'reeds_1', canvas: reeds(1) },
    { name: 'bubble_0', canvas: bubble(0) },
    { name: 'bubble_1', canvas: bubble(1) },
    { name: 'bubble_2', canvas: bubble(2) },
    { name: 'fish_shadow', canvas: fishShadow() },
    { name: 'dragonfly_0', canvas: dragonfly(0) },
    { name: 'dragonfly_1', canvas: dragonfly(1) },
    { name: 'fish_orange', canvas: fish('orange', 'yellow', 'redBright') },
    { name: 'fish_blue', canvas: fish('blue', 'blueLight', 'navy') },
    { name: 'fish_green', canvas: fish('grassMid', 'grassHi', 'grassDark') },
    { name: 'fish_pink', canvas: fish('pink', 'white', 'purple') },
    { name: 'dock_stool', canvas: dockStool() },
    { name: 'rowboat', canvas: rowboat() },
    { name: 'bucket', canvas: bucket() },
  ]
}
