// =====================================================================
//  INTERIOR ART — floors, walls and furniture for the house and the
//  workshop. Furniture: ink outline, light from the top-left.
//  Flat things on the floor (the rug) have no outline.
// =====================================================================

import { PixelCanvas, seededRandom } from '../lib/PixelCanvas.mjs'

// ---------------------------------------------------------------------
//  Tiles (16x16)
// ---------------------------------------------------------------------
function woodFloor(seed) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'woodLight')
  const random = seededRandom(seed)
  for (let y = 0; y < 16; y += 4) {
    c.hline(0, y + 3, 16, 'wood') // gap between planks
    c.hline(0, y, 16, 'woodHi') // lit plank edge
    const seam = Math.floor(random() * 14) + 1
    c.vline(seam, y, 3, 'wood')
    if (random() < 0.5) c.set(Math.floor(random() * 16), y + 1, 'cream') // grain
  }
  return c
}

function stoneFloor(seed) {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'stoneDark') // grout
  const random = seededRandom(seed)
  const slabs = [[0, 0, 8, 7], [8, 0, 8, 7], [0, 7, 6, 9], [6, 7, 10, 9]]
  for (let i = 0; i < slabs.length; i++) {
    const [x, y, w, h] = slabs[i]
    c.rect(x + 1, y + 1, w - 1, h - 1, random() < 0.5 ? 'stone' : 'stoneHi')
    c.hline(x + 1, y + 1, w - 1, 'stoneHi')
    c.hline(x + 1, y + h - 1, w - 1, 'slate')
  }
  return c
}

// The wall you see in front of you: wallpaper over a wooden wainscot.
function wallpaper() {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'cream')
  for (let x = 1; x < 16; x += 4) c.vline(x, 1, 10, 'paper') // soft stripes
  for (let x = 3; x < 16; x += 4) c.set(x, 5, 'pink') // tiny flower motif
  c.hline(0, 0, 16, 'woodDark') // top trim
  c.rect(0, 11, 16, 5, 'woodLight') // wainscot
  c.hline(0, 11, 16, 'woodHi')
  c.vline(4, 12, 4, 'wood')
  c.vline(12, 12, 4, 'wood')
  c.hline(0, 15, 16, 'woodDark')
  return c
}

function brickWall() {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'sandDark') // mortar
  for (let y = 1; y < 11; y += 3) {
    const offset = (y - 1) % 6 === 0 ? 0 : 4
    for (let x = -offset; x < 16; x += 8) {
      c.rect(x + 1, y, 7, 2, 'red')
      c.hline(x + 1, y, 7, 'redLight')
    }
  }
  c.hline(0, 0, 16, 'woodDark')
  c.rect(0, 11, 16, 5, 'wood') // dark wooden skirting
  c.hline(0, 11, 16, 'woodLight')
  c.hline(0, 15, 16, 'woodDark')
  return c
}

// Upper part of a two-tile-tall wall (no wainscot).
function wallpaperTop() {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'cream')
  for (let x = 1; x < 16; x += 4) c.vline(x, 0, 16, 'paper')
  for (let x = 3; x < 16; x += 4) { c.set(x, 4, 'pink'); c.set(x, 12, 'pink') }
  c.rect(0, 0, 16, 2, 'woodLight') // crown moulding
  c.hline(0, 2, 16, 'woodDark')
  return c
}

function brickTop() {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'sandDark')
  for (let y = 3; y < 16; y += 3) {
    const offset = y % 6 === 0 ? 0 : 4
    for (let x = -offset; x < 16; x += 8) {
      c.rect(x + 1, y, 7, 2, 'red')
      c.hline(x + 1, y, 7, 'redLight')
    }
  }
  c.rect(0, 0, 16, 2, 'wood')
  c.hline(0, 2, 16, 'woodDark')
  return c
}

// The thick dark edge of the walls seen from above (room border).
function wallCap() {
  const c = new PixelCanvas(16, 16)
  c.rect(0, 0, 16, 16, 'woodDark')
  c.rect(0, 0, 16, 1, 'redDark')
  c.set(3, 5, 'redDark')
  c.set(11, 10, 'redDark')
  c.set(7, 13, 'redDark')
  return c
}

// The doorway in the bottom wall (floor continues, dark threshold).
function threshold() {
  const c = woodFloor(99)
  c.rect(0, 12, 16, 4, 'woodDark')
  c.hline(0, 12, 16, 'wood')
  return c
}

export function tiles() {
  return [
    { name: 'floor_wood_a', canvas: woodFloor(1) },
    { name: 'floor_wood_b', canvas: woodFloor(5) },
    { name: 'floor_stone_a', canvas: stoneFloor(2) },
    { name: 'floor_stone_b', canvas: stoneFloor(8) },
    { name: 'wall_paper_top', canvas: wallpaperTop(), solid: true },
    { name: 'wall_paper', canvas: wallpaper(), solid: true },
    { name: 'wall_brick_top', canvas: brickTop(), solid: true },
    { name: 'wall_brick', canvas: brickWall(), solid: true },
    { name: 'wall_cap', canvas: wallCap(), solid: true },
    { name: 'threshold', canvas: threshold() },
  ]
}

// ---------------------------------------------------------------------
//  Furniture sprites
// ---------------------------------------------------------------------
function bed() {
  const c = new PixelCanvas(18, 30)
  c.rect(1, 1, 16, 5, 'wood') // headboard
  c.hline(1, 1, 16, 'woodLight')
  c.rect(2, 6, 14, 22, 'paper') // sheet
  c.rect(3, 7, 12, 5, 'white') // pillow
  c.hline(3, 11, 12, 'stoneHi')
  // Patchwork quilt (red, pink, cream squares)
  const colors = ['red', 'redLight', 'cream', 'pink']
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      c.rect(2 + x * 3.5, 13 + y * 3.5, 4, 4, colors[(x + y) % 4])
    }
  }
  c.hline(2, 13, 14, 'redLight')
  c.hline(2, 27, 14, 'redDark')
  c.rect(1, 27, 16, 2, 'wood') // footboard
  return c.outline()
}

function bookshelf(seed) {
  const c = new PixelCanvas(18, 28)
  c.rect(1, 1, 16, 26, 'wood')
  c.vline(1, 1, 26, 'woodLight')
  c.vline(16, 1, 26, 'woodDark')
  const random = seededRandom(seed)
  const colors = ['red', 'blue', 'purple', 'yellow', 'grassMid', 'redLight', 'navy']
  for (let shelf = 0; shelf < 3; shelf++) {
    const baseY = 9 + shelf * 8
    c.rect(2, baseY - 7, 14, 7, 'woodDark') // back of the shelf
    let x = 2
    while (x < 15) {
      const w = random() < 0.3 ? 2 : 1
      const h = 4 + Math.floor(random() * 3)
      if (random() < 0.12) { x += 1; continue } // a gap
      c.rect(x, baseY - h, w, h, colors[Math.floor(random() * colors.length)])
      x += w
    }
    c.hline(2, baseY, 14, 'woodLight') // shelf board
  }
  return c.outline()
}

function desk() {
  const c = new PixelCanvas(34, 22)
  c.rect(1, 1, 32, 6, 'woodLight') // desktop
  c.hline(1, 1, 32, 'woodHi')
  c.rect(1, 7, 32, 3, 'wood') // front edge
  c.rect(2, 10, 12, 10, 'wood') // drawer unit
  c.hline(3, 13, 10, 'woodDark')
  c.hline(3, 17, 10, 'woodDark')
  c.set(8, 11, 'yellow')
  c.set(8, 15, 'yellow')
  c.rect(29, 10, 3, 10, 'woodDark') // leg
  return c.outline()
}

function laptop() {
  const c = new PixelCanvas(14, 11)
  c.rect(2, 1, 10, 6, 'navy') // screen
  c.rect(3, 2, 8, 4, 'blue')
  c.hline(4, 3, 5, 'blueLight') // code on the screen
  c.hline(4, 4, 3, 'waterFoam')
  c.hline(5, 5, 4, 'blueLight')
  c.rect(1, 7, 12, 2, 'stoneHi') // keyboard base
  c.hline(1, 8, 12, 'stone')
  return c.outline()
}

function mug() {
  const c = new PixelCanvas(8, 8)
  c.rect(1, 2, 4, 5, 'redLight')
  c.vline(1, 2, 5, 'paper')
  c.hline(1, 2, 4, 'woodDark') // coffee
  c.set(5, 3, 'redLight') // handle
  c.set(6, 4, 'redLight')
  c.set(5, 5, 'redLight')
  return c.outline()
}

function armchair() {
  const c = new PixelCanvas(20, 20)
  c.rect(2, 1, 16, 9, 'purple') // back
  c.hline(2, 1, 16, 'pink')
  c.rect(1, 7, 4, 9, 'purple') // arms
  c.rect(15, 7, 4, 9, 'purple')
  c.vline(1, 7, 9, 'pink')
  c.rect(5, 10, 10, 6, 'pinkDark') // seat cushion
  c.hline(5, 10, 10, 'pink')
  c.rect(2, 16, 2, 3, 'woodDark') // legs
  c.rect(16, 16, 2, 3, 'woodDark')
  return c.outline()
}

// A round rug lying on the floor (no outline: it is flat).
function rug() {
  const c = new PixelCanvas(52, 32)
  c.ellipse(25.5, 15.5, 25, 15, 'redDark')
  c.ellipse(25.5, 15.5, 23, 13.5, 'red')
  c.ellipse(25.5, 15.5, 19, 10.5, 'cream')
  c.ellipse(25.5, 15.5, 15, 7.5, 'redLight')
  c.ellipse(25.5, 15.5, 9, 4, 'cream')
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    c.set(25.5 + Math.cos(angle) * 21, 15.5 + Math.sin(angle) * 12, 'yellow')
  }
  return c
}

function fireplace() {
  const c = new PixelCanvas(34, 34)
  c.rect(1, 6, 32, 27, 'stone') // stone surround
  const random = seededRandom(4)
  for (let k = 0; k < 18; k++) {
    const x = 2 + Math.floor(random() * 28)
    const y = 8 + Math.floor(random() * 22)
    c.rect(x, y, 3, 2, random() < 0.5 ? 'stoneHi' : 'stoneDark')
  }
  c.rect(0, 2, 34, 4, 'woodLight') // mantel
  c.hline(0, 2, 34, 'woodHi')
  c.hline(0, 5, 34, 'wood')
  c.rect(9, 14, 16, 18, 'navy') // dark opening
  c.rect(10, 15, 14, 17, 'ink')
  c.rect(11, 28, 12, 3, 'wood') // logs
  c.hline(11, 28, 12, 'woodLight')
  c.set(14, 29, 'woodDark')
  c.set(19, 29, 'woodDark')
  // things on the mantel: a candle and a tiny frame
  c.rect(5, 0, 2, 2, 'paper')
  c.set(6, -1, 'yellow')
  c.rect(26, 0, 4, 2, 'yellow')
  return c.outline()
}

// Fire in the fireplace: 3 frames, no outline (it's light).
function flame(frame) {
  const c = new PixelCanvas(12, 12)
  const shapes = [
    ['....y.....', '...yy..y..', '..yoy..yy.', '..yoyy.oy.', '.yoroyyoy.', '.yorroyoy.', 'yoorrrooy.', 'yoorrroooy'],
    ['.....y....', '..y.yy....', '..yyoy..y.', '.yooyy.yy.', '.yoroyyoy.', 'yoorroooy.', 'yoorrrrooy', '.yorrrrroy'],
    ['...y......', '...yy.y...', '..yoy.yy..', '..yoyyoy..', '.yorooroy.', '.yorrrroy.', 'yoorrrrooy', 'yoorrrrooy'],
  ][frame]
  c.art(1, 3, shapes, { y: 'yellow', o: 'orange', r: 'redBright' })
  return c
}

function frame(kind) {
  const c = new PixelCanvas(14, 12)
  c.rect(1, 1, 12, 10, 'woodLight')
  c.hline(1, 1, 12, 'woodHi')
  c.hline(1, 10, 12, 'wood')
  if (kind === 'landscape') {
    c.rect(3, 3, 8, 6, 'blueLight')
    c.rect(3, 6, 8, 3, 'grassMid')
    c.ellipse(5, 6.5, 2.5, 1.5, 'grass')
    c.set(9, 4, 'yellow')
  } else if (kind === 'photo') {
    c.rect(3, 3, 8, 6, 'cream')
    c.ellipse(7, 5, 1.5, 1.5, 'woodDark') // a person: head and shoulders
    c.rect(5, 7, 4, 2, 'navy')
  } else {
    // diploma: paper with lines and a red seal
    c.rect(3, 3, 8, 6, 'paper')
    c.hline(4, 4, 6, 'stone')
    c.hline(4, 6, 4, 'stone')
    c.set(9, 7, 'red')
    c.set(8, 8, 'redBright')
  }
  return c.outline()
}

function bigPlant() {
  const c = new PixelCanvas(16, 24)
  c.rect(4, 16, 8, 7, 'orange')
  c.vline(4, 16, 7, 'yellow')
  c.hline(3, 16, 10, 'red')
  c.hline(4, 22, 8, 'red')
  // Big leaves
  c.ellipse(4.5, 9, 3.5, 2.5, 'grassMid')
  c.ellipse(11, 7, 3.5, 2.5, 'grassMid')
  c.ellipse(8, 4, 3, 3, 'grass')
  c.ellipse(7, 12, 3, 2, 'grassDark')
  c.ellipse(3.5, 8.5, 1.5, 1, 'grassHi')
  c.ellipse(10, 6, 1.5, 1, 'grassHi')
  c.vline(8, 7, 9, 'grassDark')
  return c.outline()
}

function floorLamp() {
  const c = new PixelCanvas(12, 30)
  c.vline(5, 9, 18, 'slate')
  c.vline(6, 9, 18, 'stone')
  c.rect(3, 26, 6, 2, 'stoneDark')
  c.art(1, 1, [
    '...yyyy...',
    '..yyyyyy..',
    '.yyccyyyy.',
    '.ycccyyyy.',
    'yyyyyyyyyy',
    'oooooooooo',
  ], { y: 'cream', c: 'paper', o: 'yellow' })
  return c.outline()
}

// String lights: two frames so the bulbs twinkle.
function stringLights(frame) {
  const c = new PixelCanvas(66, 9)
  const colors = frame === 0 ? ['yellow', 'pink', 'blueLight'] : ['pink', 'blueLight', 'yellow']
  for (let x = 1; x < 65; x++) {
    const sag = Math.round(Math.sin(((x % 16) / 16) * Math.PI) * 3)
    c.set(x, 1 + sag, 'inkSoft')
    if (x % 8 === 4) {
      const color = colors[(x / 8) % 3 | 0]
      c.set(x, 2 + sag, color)
      c.set(x, 3 + sag, color)
      c.set(x - 1, 2 + sag, 'white')
    }
  }
  return c
}

// Sleeping cat curled on a cushion: frame 1 breathes in.
function cat(frame) {
  const c = new PixelCanvas(20, 13)
  c.ellipse(9.5, 9, 9, 3, 'purple') // cushion
  c.ellipse(9.5, 8.5, 7, 2, 'pink')
  const grow = frame === 1 ? 0.6 : 0
  c.ellipse(9, 6, 5.5 + grow, 3.4 + grow, 'orange') // body
  c.ellipse(8, 5, 3, 1.8, 'yellow')
  c.hline(6, 4, 2, 'woodDark') // stripes
  c.hline(10, 4, 2, 'woodDark')
  c.ellipse(14, 6.5, 2.6, 2.2, 'orange') // head tucked in
  c.set(13, 4, 'orange') // ear
  c.set(15, 4, 'orange')
  c.set(14, 6, 'woodDark') // closed eye
  c.hline(4, 8, 6, 'yellow') // tail
  return c.outline()
}

function sideTable() {
  const c = new PixelCanvas(14, 14)
  c.rect(1, 1, 12, 4, 'woodLight')
  c.hline(1, 1, 12, 'woodHi')
  c.rect(2, 5, 2, 8, 'wood')
  c.rect(10, 5, 2, 8, 'wood')
  c.rect(5, 0, 4, 2, 'stoneHi') // a little book
  return c.outline()
}

// A window on the interior wall (daylight blue; the game adds a glow).
function windowInside() {
  const c = new PixelCanvas(16, 14)
  c.rect(2, 1, 12, 11, 'woodLight')
  c.rect(3, 2, 10, 9, 'blueLight')
  c.hline(3, 6, 10, 'woodLight')
  c.vline(8, 2, 9, 'woodLight')
  c.set(4, 3, 'white')
  c.set(10, 3, 'white')
  c.rect(1, 1, 2, 11, 'pink') // curtains
  c.rect(13, 1, 2, 11, 'pink')
  c.vline(2, 1, 11, 'pinkDark')
  c.vline(13, 1, 11, 'pinkDark')
  c.rect(1, 11, 14, 2, 'woodLight') // sill
  return c.outline()
}

// ---------------------------------------------------------------------
//  Workshop pieces
// ---------------------------------------------------------------------
function toolRack() {
  const c = new PixelCanvas(34, 16)
  c.rect(1, 1, 32, 14, 'woodLight') // pegboard
  for (let y = 3; y < 14; y += 3) for (let x = 3; x < 32; x += 3) c.set(x, y, 'wood')
  c.rect(4, 3, 2, 9, 'wood') // hammer
  c.rect(2, 3, 6, 3, 'stoneDark')
  c.rect(11, 3, 7, 5, 'stoneHi') // saw
  c.rect(16, 8, 3, 4, 'wood')
  c.vline(11, 8, 1, 'stoneHi')
  c.rect(22, 3, 2, 10, 'stone') // wrench
  c.rect(21, 3, 4, 2, 'stone')
  c.rect(28, 3, 2, 6, 'redBright') // screwdriver
  c.rect(28, 9, 2, 4, 'stoneHi')
  return c.outline()
}

function blueprint(variant) {
  const c = new PixelCanvas(20, 15)
  c.rect(1, 1, 18, 13, 'blue')
  c.hline(1, 1, 18, 'blueLight')
  // white line drawing: a house outline or a screen layout
  if (variant === 0) {
    c.hline(5, 7, 10, 'white')
    c.vline(5, 7, 5, 'white')
    c.vline(14, 7, 5, 'white')
    c.hline(5, 11, 10, 'white')
    for (let i = 0; i < 5; i++) { c.set(5 + i, 7 - i, 'white'); c.set(14 - i, 7 - i, 'white') }
  } else {
    c.rect(4, 4, 12, 7, 'waterDeep')
    c.hline(4, 4, 12, 'white')
    c.hline(4, 10, 12, 'white')
    c.vline(4, 4, 7, 'white')
    c.vline(15, 4, 7, 'white')
    c.hline(6, 6, 5, 'blueLight')
    c.hline(6, 8, 7, 'blueLight')
  }
  c.set(2, 2, 'redBright') // pins
  c.set(17, 2, 'redBright')
  return c.outline()
}

function workbench() {
  const c = new PixelCanvas(36, 22)
  c.rect(1, 3, 34, 6, 'woodLight')
  c.hline(1, 3, 34, 'woodHi')
  c.rect(1, 9, 34, 3, 'wood')
  c.rect(2, 12, 3, 9, 'woodDark') // legs
  c.rect(31, 12, 3, 9, 'woodDark')
  c.hline(5, 17, 26, 'wood') // lower shelf
  c.rect(26, 0, 6, 4, 'stone') // vice
  c.rect(27, 1, 4, 2, 'stoneHi')
  c.rect(6, 1, 8, 3, 'paper') // plans
  c.hline(7, 2, 5, 'blue')
  c.rect(17, 2, 5, 2, 'yellow') // a gadget
  return c.outline()
}

// Tiny models that sit on top of each project shelf.
function model(kind) {
  const c = new PixelCanvas(10, 10)
  if (kind === 'house') {
    c.art(1, 1, ['...rr...', '..rrrr..', '.rrrrrr.', '..cccc..', '..cwcc..', '..cwcc..'], { r: 'red', c: 'cream', w: 'woodDark' })
  } else if (kind === 'rocket') {
    c.art(1, 0, ['...w....', '..wrw...', '..wbw...', '..www...', '.rwwwr..', '.r.y.r..', '...o....'], { w: 'white', r: 'redBright', b: 'blueLight', y: 'yellow', o: 'orange' })
  } else if (kind === 'robot') {
    c.art(1, 1, ['...y....', '.ssss...', '.sbsb...', '.ssss...', 'ssssss..', '.s..s...'], { s: 'stoneHi', b: 'blue', y: 'yellow' })
  } else {
    c.art(1, 1, ['..y.y...', '.yyyyy..', 'yyoooyy.', '.yo.oy..', 'yyoooyy.', '.yyyyy..', '..y.y...'], { y: 'yellow', o: 'orange' })
  }
  return c.outline()
}

export function sprites() {
  return [
    { name: 'bed', canvas: bed() },
    { name: 'bookshelf_a', canvas: bookshelf(3) },
    { name: 'bookshelf_b', canvas: bookshelf(12) },
    { name: 'desk', canvas: desk() },
    { name: 'laptop', canvas: laptop() },
    { name: 'mug', canvas: mug() },
    { name: 'armchair', canvas: armchair() },
    { name: 'rug', canvas: rug() },
    { name: 'fireplace', canvas: fireplace() },
    { name: 'flame_0', canvas: flame(0) },
    { name: 'flame_1', canvas: flame(1) },
    { name: 'flame_2', canvas: flame(2) },
    { name: 'frame_landscape', canvas: frame('landscape') },
    { name: 'frame_photo', canvas: frame('photo') },
    { name: 'frame_diploma', canvas: frame('diploma') },
    { name: 'plant_big', canvas: bigPlant() },
    { name: 'floor_lamp', canvas: floorLamp() },
    { name: 'string_lights_0', canvas: stringLights(0) },
    { name: 'string_lights_1', canvas: stringLights(1) },
    { name: 'cat_0', canvas: cat(0) },
    { name: 'cat_1', canvas: cat(1) },
    { name: 'side_table', canvas: sideTable() },
    { name: 'window_inside', canvas: windowInside() },
    { name: 'tool_rack', canvas: toolRack() },
    { name: 'blueprint_a', canvas: blueprint(0) },
    { name: 'blueprint_b', canvas: blueprint(1) },
    { name: 'workbench', canvas: workbench() },
    { name: 'model_house', canvas: model('house') },
    { name: 'model_rocket', canvas: model('rocket') },
    { name: 'model_robot', canvas: model('robot') },
    { name: 'model_gear', canvas: model('gear') },
  ]
}
