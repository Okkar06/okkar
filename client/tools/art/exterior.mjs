// =====================================================================
//  EXTERIOR SPRITES — signposts, lamp posts, benches and (later) the
//  cosy house decorations. All outlined in ink, light from top-left.
// =====================================================================

import { PixelCanvas } from '../lib/PixelCanvas.mjs'

// A wooden signpost. The text is added in the game as a small label.
function signpost() {
  const c = new PixelCanvas(16, 18)
  c.rect(7, 8, 2, 9, 'wood') // post
  c.vline(7, 8, 9, 'woodLight')
  c.rect(1, 2, 14, 7, 'woodLight') // board
  c.hline(1, 2, 14, 'woodHi')
  c.hline(1, 8, 14, 'wood')
  c.hline(3, 4, 8, 'wood') // scribbled "writing"
  c.hline(3, 6, 6, 'wood')
  c.set(12, 4, 'woodDark') // nails
  c.set(2, 3, 'woodDark')
  return c.outline()
}

// An arrow-shaped sign pointing right (flip it in Phaser for left).
function arrowSign() {
  const c = new PixelCanvas(18, 18)
  c.rect(4, 8, 2, 9, 'wood')
  c.vline(4, 8, 9, 'woodLight')
  c.art(1, 2, [
    '..............',
    'llllllllllll..',
    'lhhhhhhhhhhll.',
    'lwwwwwwwwwwwll',
    'lwwwwwwwwwwll.',
    'llllllllllll..',
  ], { l: 'woodLight', h: 'woodHi', w: 'woodLight' })
  c.hline(3, 5, 7, 'wood')
  return c.outline()
}

// A street lamp: the lantern head glows at night (glow added in Phaser).
function lampPost() {
  const c = new PixelCanvas(10, 28)
  c.rect(4, 9, 2, 17, 'slate') // pole
  c.vline(4, 9, 17, 'stone')
  c.rect(2, 25, 6, 2, 'stoneDark') // base
  c.hline(2, 25, 6, 'stone')
  c.rect(2, 2, 6, 6, 'yellow') // lantern glass
  c.rect(3, 3, 2, 2, 'white')
  c.hline(1, 1, 8, 'slate') // cap
  c.hline(2, 0, 6, 'slate')
  c.hline(2, 8, 6, 'slate')
  c.vline(2, 2, 6, 'slate')
  c.vline(7, 2, 6, 'slate')
  return c.outline()
}

function bench() {
  const c = new PixelCanvas(26, 14)
  c.rect(1, 1, 24, 3, 'woodLight') // backrest
  c.hline(1, 1, 24, 'woodHi')
  c.rect(1, 6, 24, 3, 'woodLight') // seat
  c.hline(1, 6, 24, 'woodHi')
  c.hline(1, 8, 24, 'wood')
  c.rect(2, 4, 2, 2, 'wood') // back supports
  c.rect(22, 4, 2, 2, 'wood')
  c.rect(2, 9, 2, 4, 'woodDark') // legs
  c.rect(22, 9, 2, 4, 'woodDark')
  return c.outline()
}

// The village-square fountain: stone basin, centre pillar, water spray.
// Three frames of spray make it animate.
function fountain(frame) {
  const c = new PixelCanvas(34, 30)
  // Basin (outer stone ring, water inside)
  c.ellipse(16.5, 21, 15, 7, 'stone')
  c.ellipse(16.5, 20, 15, 6, 'stoneHi')
  c.ellipse(16.5, 21, 12, 4.5, 'waterDeep')
  c.ellipse(16.5, 20.5, 11, 3.6, 'water')
  c.hline(9, 19, 6, 'waterLight') // sparkle on the water
  c.hline(20, 22, 4, 'waterLight')
  c.hline(3, 26, 28, 'stoneDark') // basin front shade
  c.hline(5, 27, 24, 'stoneDark')
  // Pillar and top bowl
  c.rect(15, 9, 4, 11, 'stone')
  c.vline(15, 9, 11, 'stoneHi')
  c.vline(18, 9, 11, 'stoneDark')
  c.ellipse(16.5, 9, 5, 2, 'stoneHi')
  c.ellipse(16.5, 9, 3.4, 1, 'water')
  c.outline()
  // Water spray (drawn after the outline: water droplets have no outline).
  c.vline(16, 3, 6, 'waterFoam') // the jet
  c.vline(17, 4 + frame, 4, 'white')
  const arcs = [
    [[16, 1], [17, 1], [16, 2], [17, 3], [14, 3], [19, 4], [13, 5], [20, 6], [12, 8], [21, 9], [11, 12], [22, 13]],
    [[16, 0], [17, 2], [15, 2], [18, 3], [14, 4], [19, 5], [12, 7], [21, 7], [11, 10], [22, 11], [10, 14], [23, 15]],
    [[17, 1], [16, 2], [16, 3], [18, 4], [15, 4], [20, 5], [13, 6], [21, 8], [12, 9], [22, 10], [11, 13], [23, 14]],
  ][frame]
  for (let i = 0; i < arcs.length; i++) {
    c.set(arcs[i][0], arcs[i][1], i % 3 === 0 ? 'white' : 'waterFoam')
  }
  // Splash ripples on the water surface
  c.set(10 + frame * 2, 22, 'waterFoam')
  c.set(23 - frame, 21, 'waterFoam')
  return c
}

// ---------------------------------------------------------------------
//  Cosy house exteriors
// ---------------------------------------------------------------------
function chimney() {
  const c = new PixelCanvas(12, 17)
  c.rect(2, 3, 8, 13, 'red') // bricks
  for (let y = 4; y < 16; y += 3) {
    c.hline(2, y, 8, 'redDark')
    const offset = (y % 2 === 0) ? 4 : 6
    c.vline(offset, y + 1, 2, 'redDark')
  }
  c.vline(2, 3, 13, 'redLight') // lit left side
  c.rect(1, 1, 10, 2, 'stoneDark') // cap
  c.hline(1, 1, 10, 'stone')
  return c.outline()
}

function flowerBox() {
  const c = new PixelCanvas(18, 9)
  c.rect(1, 4, 16, 4, 'wood')
  c.hline(1, 4, 16, 'woodLight')
  c.hline(1, 7, 16, 'woodDark')
  c.art(1, 1, [
    '.p.y..p..y.p..y.',
    'pcpyoypcpyoypcpy',
    'gpgygg.pgygg.pgg',
  ], { p: 'pink', c: 'yellow', y: 'yellow', o: 'orange', g: 'grassMid' })
  return c.outline()
}

function doormat() {
  const c = new PixelCanvas(16, 7)
  c.rect(1, 1, 14, 5, 'red')
  c.hline(1, 1, 14, 'redLight')
  for (let x = 3; x < 14; x += 3) c.vline(x, 2, 3, 'cream')
  c.hline(1, 5, 14, 'redDark')
  return c.outline()
}

// A small wooden porch deck in front of the door (flat, walkable).
function porch() {
  const c = new PixelCanvas(50, 10)
  c.rect(1, 1, 48, 7, 'woodLight')
  for (let x = 1; x < 49; x += 6) c.vline(x, 1, 7, 'wood') // plank seams
  c.hline(1, 1, 48, 'woodHi')
  c.hline(1, 7, 48, 'wood')
  c.hline(1, 8, 48, 'woodDark') // front edge in shadow
  return c.outline()
}

function wallLantern() {
  const c = new PixelCanvas(9, 13)
  c.hline(1, 2, 4, 'slate') // bracket
  c.vline(1, 1, 3, 'slate')
  c.rect(3, 4, 5, 6, 'yellow') // glass
  c.rect(4, 5, 2, 2, 'white')
  c.hline(3, 3, 5, 'slate')
  c.hline(3, 10, 5, 'slate')
  c.vline(3, 4, 6, 'slate')
  c.vline(7, 4, 6, 'slate')
  return c.outline()
}

function pottedPlant() {
  const c = new PixelCanvas(11, 14)
  c.rect(2, 8, 7, 5, 'orange') // terracotta pot
  c.vline(2, 8, 5, 'yellow')
  c.hline(2, 12, 7, 'red')
  c.hline(1, 8, 9, 'red')
  c.ellipse(5, 5, 4, 3.5, 'grassMid') // leaves
  c.ellipse(4, 4, 2, 1.6, 'grassHi')
  c.set(7, 6, 'grassDark')
  c.set(2, 6, 'grassDark')
  return c.outline()
}

// ---------------------------------------------------------------------
//  Market goods
// ---------------------------------------------------------------------
function crate() {
  const c = new PixelCanvas(14, 14)
  c.rect(1, 1, 12, 12, 'woodLight')
  c.hline(1, 1, 12, 'woodHi')
  c.hline(1, 6, 12, 'wood')
  c.hline(1, 12, 12, 'wood')
  c.vline(1, 1, 12, 'wood')
  c.vline(12, 1, 12, 'woodDark')
  for (let i = 0; i < 10; i++) c.set(2 + i, 2 + Math.floor(i / 2.5), 'wood') // diagonal brace
  return c.outline()
}

function hangingGoods() {
  const c = new PixelCanvas(20, 16)
  c.hline(1, 1, 18, 'woodDark') // rope
  // peppers and garlic hanging at different heights
  const items = [[3, 'red', 7], [7, 'white', 5], [11, 'redBright', 8], [15, 'white', 6]]
  for (let i = 0; i < items.length; i++) {
    const x = items[i][0]
    const len = items[i][2]
    c.vline(x, 2, 2, 'grassDark')
    c.rect(x - 1, 4, 3, len, items[i][1])
    c.set(x, 4 + len, items[i][1] === 'white' ? 'cream' : 'redDark')
    c.set(x - 1, 4, items[i][1] === 'white' ? 'paper' : 'redLight')
  }
  return c.outline()
}

function basket() {
  const c = new PixelCanvas(14, 11)
  c.rect(1, 5, 12, 5, 'woodLight')
  for (let x = 2; x < 13; x += 2) c.vline(x, 5, 5, 'wood') // weave
  c.hline(1, 9, 12, 'woodDark')
  c.ellipse(4, 4, 2, 1.6, 'red') // apples
  c.ellipse(8, 3.5, 2, 1.6, 'redBright')
  c.ellipse(10.5, 4.5, 1.6, 1.4, 'grassHi')
  c.set(3, 3, 'redLight')
  c.set(7, 2, 'redLight')
  return c.outline()
}

function sack() {
  const c = new PixelCanvas(12, 13)
  c.ellipse(5.5, 7.5, 5, 4.5, 'cream')
  c.ellipse(4.5, 6.5, 2.5, 2.5, 'paper')
  c.rect(4, 1, 4, 3, 'cream') // tied top
  c.hline(3, 3, 6, 'sandDark')
  c.hline(2, 11, 8, 'sandDark')
  return c.outline()
}

function chalkboard() {
  const c = new PixelCanvas(14, 18)
  c.rect(2, 12, 2, 5, 'wood') // easel legs
  c.rect(10, 12, 2, 5, 'wood')
  c.rect(1, 1, 12, 11, 'navy')
  c.hline(1, 1, 12, 'wood')
  c.hline(1, 11, 12, 'wood')
  c.vline(1, 1, 11, 'wood')
  c.vline(12, 1, 11, 'wood')
  c.hline(3, 4, 7, 'paper') // chalk "writing"
  c.hline(3, 6, 5, 'paper')
  c.hline(3, 8, 6, 'pink')
  return c.outline()
}

export function sprites() {
  return [
    { name: 'chimney', canvas: chimney() },
    { name: 'flowerbox', canvas: flowerBox() },
    { name: 'doormat', canvas: doormat() },
    { name: 'porch', canvas: porch() },
    { name: 'wall_lantern', canvas: wallLantern() },
    { name: 'potted_plant', canvas: pottedPlant() },
    { name: 'crate', canvas: crate() },
    { name: 'hanging_goods', canvas: hangingGoods() },
    { name: 'basket', canvas: basket() },
    { name: 'sack', canvas: sack() },
    { name: 'chalkboard', canvas: chalkboard() },
    { name: 'fountain_0', canvas: fountain(0) },
    { name: 'fountain_1', canvas: fountain(1) },
    { name: 'fountain_2', canvas: fountain(2) },
    { name: 'signpost', canvas: signpost() },
    { name: 'arrow_sign', canvas: arrowSign() },
    { name: 'lamppost', canvas: lampPost() },
    { name: 'bench', canvas: bench() },
  ]
}
