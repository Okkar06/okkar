// =====================================================================
//  NATURE SPRITES — tall grass, flowers, stones, stumps, mushrooms...
//  Free-standing things get an ink outline; things lying flat on the
//  ground (flowers, clover, pebbles) don't. Light from the top-left.
// =====================================================================

import { PixelCanvas } from '../lib/PixelCanvas.mjs'

// Tall grass tufts: frame 0 upright, frame 1 with the tips leaning
// right (the game swaps frames to make it sway in the wind).
const GRASS_TUFTS = [
  [
    '...h....h.',
    '..hg...hg.',
    'h.gg..hgg.',
    'gggg.hgg..',
    'gmggmggg.h',
    'mggmggmggg',
    'gmgmgmgmgm',
    '.mmmmmmmm.',
  ],
  [
    '.h.....h..',
    '.g..h..g..',
    '.gg.g.hg..',
    'hgg.gggg.h',
    'ggmgmggmgg',
    'mgggmggmgm',
    'gmgmmgmgm.',
    '.mmmmmmm..',
  ],
]

function tallGrass(variant, frame) {
  const c = new PixelCanvas(12, 10)
  const rows = GRASS_TUFTS[variant].slice()
  if (frame === 1) {
    // Lean the top three rows one pixel to the right.
    for (let i = 0; i < 3; i++) rows[i] = '.' + rows[i].slice(0, -1)
  }
  c.art(1, 1, rows, { g: 'grassMid', m: 'grassDark', h: 'grassHi' })
  return c.outline()
}

// Little flowers painted on the grass (no outline).
function flower(petal, centre) {
  const c = new PixelCanvas(5, 5)
  c.art(0, 0, [
    '.p...',
    'pcp..',
    '.p.p.',
    '..pcp',
    '...p.',
  ], { p: petal, c: centre })
  return c
}

function flowerPatch() {
  const c = new PixelCanvas(13, 9)
  c.art(0, 0, [
    '..p......y...',
    '.pcp....ycy..',
    '..p..g...y...',
    '.....g.......',
    '...g...w.....',
    '..b...wcw..p.',
    '.bcb...w..pcp',
    '..b...g....p.',
    '..g..........',
  ], { p: 'pink', c: 'yellow', y: 'yellow', b: 'blueLight', w: 'white', g: 'grassDark' })
  // yellow flowers need an orange centre to read as flowers
  c.set(9, 1, 'orange')
  return c
}

function stone(size) {
  if (size === 'small') {
    const c = new PixelCanvas(8, 6)
    c.ellipse(3.5, 3, 3, 2, 'stone')
    c.hline(2, 1, 3, 'stoneHi')
    c.hline(2, 4, 4, 'stoneDark')
    return c.outline()
  }
  const c = new PixelCanvas(13, 10)
  c.ellipse(6, 5, 5, 3.6, 'stone')
  c.ellipse(4.5, 3.5, 2.5, 1.5, 'stoneHi')
  c.hline(4, 8, 6, 'stoneDark')
  c.hline(8, 7, 3, 'stoneDark')
  c.set(7, 4, 'stoneDark') // a little crack
  c.set(8, 5, 'stoneDark')
  return c.outline()
}

function pebbles() {
  const c = new PixelCanvas(9, 4)
  c.art(0, 0, [
    '.sS......',
    '.......sS',
    '...sS....',
    '......d..',
  ], { s: 'stoneHi', S: 'stone', d: 'stoneDark' })
  return c
}

function clover() {
  const c = new PixelCanvas(9, 5)
  c.art(0, 0, [
    '.g...g...',
    'gHg.gHg..',
    '.g...g.g.',
    '......gHg',
    '.......g.',
  ], { g: 'grassDark', H: 'grassMid' })
  return c
}

function stump() {
  const c = new PixelCanvas(14, 11)
  c.rect(2, 4, 10, 6, 'wood') // bark
  c.vline(2, 4, 6, 'woodLight')
  c.vline(11, 4, 6, 'woodDark')
  c.vline(5, 6, 3, 'woodDark')
  c.vline(8, 5, 4, 'woodDark')
  c.ellipse(6.5, 3.5, 5, 2, 'woodHi') // cut top with rings
  c.ellipse(6.5, 3.5, 3, 1, 'woodLight')
  c.set(6, 3, 'wood')
  c.set(7, 3, 'wood')
  c.set(1, 9, 'wood') // roots
  c.set(12, 9, 'wood')
  return c.outline()
}

function mushroom() {
  const c = new PixelCanvas(9, 8)
  c.art(1, 1, [
    '.rrrr..',
    'rWrrWr.',
    'rrrrrr.',
    '..cc...',
    '..cc.r.',
    '....rrr',
  ], { r: 'red', W: 'white', c: 'cream' })
  c.set(6, 6, 'cream')
  return c.outline()
}

function bush() {
  const c = new PixelCanvas(16, 12)
  c.ellipse(7.5, 6.5, 6.5, 4.5, 'grassMid')
  c.ellipse(6, 5, 4, 3, 'grass')
  c.ellipse(5, 4, 2, 1.4, 'grassHi')
  c.hline(4, 10, 8, 'grassDark')
  c.set(10, 5, 'red') // berries
  c.set(4, 8, 'red')
  c.set(9, 8, 'redBright')
  return c.outline()
}

// Crops for the field north of the square.
function crop(type) {
  if (type === 'sprout') {
    const c = new PixelCanvas(8, 7)
    c.art(1, 1, ['.h..h.', '.gh.g.', '..gg..', '..g...'], { g: 'grassMid', h: 'grassHi' })
    return c.outline()
  }
  if (type === 'cabbage') {
    const c = new PixelCanvas(12, 10)
    c.ellipse(5.5, 5, 4.5, 3.6, 'grassMid')
    c.ellipse(5.5, 4.5, 3, 2.4, 'grassHi')
    c.ellipse(5.5, 5, 1.4, 1.2, 'grass')
    c.hline(3, 8, 6, 'grassDark')
    return c.outline()
  }
  if (type === 'carrot') {
    const c = new PixelCanvas(10, 10)
    c.art(1, 1, ['.h..h...', '.gh.gh..', '..ggg...', '..ggh...', '..ooo...', '...o....'], {
      g: 'grassMid', h: 'grassHi', o: 'orange',
    })
    return c.outline()
  }
  // sunflower (tall)
  const c = new PixelCanvas(12, 22)
  c.vline(5, 8, 13, 'grassDark')
  c.vline(6, 8, 13, 'grassMid')
  c.art(1, 12, ['hgg.....', '.hgg....', '..g.....'], { g: 'grassMid', h: 'grassHi' })
  c.art(5, 15, ['..ggh', '.ggh.', '..g..'], { g: 'grassMid', h: 'grassHi' })
  c.ellipse(5.5, 5, 4.5, 4.5, 'yellow')
  c.ellipse(4.5, 4, 2, 2, 'white', 120)
  c.ellipse(5.5, 5, 2.2, 2.2, 'woodDark')
  c.set(5, 4, 'wood')
  return c.outline()
}

export function sprites() {
  return [
    { name: 'crop_sprout', canvas: crop('sprout') },
    { name: 'crop_cabbage', canvas: crop('cabbage') },
    { name: 'crop_carrot', canvas: crop('carrot') },
    { name: 'crop_sunflower', canvas: crop('sunflower') },
    { name: 'tallgrass_a_0', canvas: tallGrass(0, 0) },
    { name: 'tallgrass_a_1', canvas: tallGrass(0, 1) },
    { name: 'tallgrass_b_0', canvas: tallGrass(1, 0) },
    { name: 'tallgrass_b_1', canvas: tallGrass(1, 1) },
    { name: 'flower_pink', canvas: flower('pink', 'yellow') },
    { name: 'flower_blue', canvas: flower('blueLight', 'white') },
    { name: 'flower_yellow', canvas: flower('yellow', 'orange') },
    { name: 'flower_white', canvas: flower('white', 'yellow') },
    { name: 'flower_patch', canvas: flowerPatch() },
    { name: 'stone_s', canvas: stone('small') },
    { name: 'stone_m', canvas: stone('medium') },
    { name: 'pebbles', canvas: pebbles() },
    { name: 'clover', canvas: clover() },
    { name: 'stump', canvas: stump() },
    { name: 'mushroom', canvas: mushroom() },
    { name: 'bush_berry', canvas: bush() },
  ]
}
