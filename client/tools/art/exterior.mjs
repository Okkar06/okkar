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

export function sprites() {
  return [
    { name: 'fountain_0', canvas: fountain(0) },
    { name: 'fountain_1', canvas: fountain(1) },
    { name: 'fountain_2', canvas: fountain(2) },
    { name: 'signpost', canvas: signpost() },
    { name: 'arrow_sign', canvas: arrowSign() },
    { name: 'lamppost', canvas: lampPost() },
    { name: 'bench', canvas: bench() },
  ]
}
