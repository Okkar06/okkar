// =====================================================================
//  EFFECT SPRITES — shadows, sparkles, particles, UI-in-world bits.
//  Particles have no outline; objects (bobber, arrow) do.
// =====================================================================

import { PixelCanvas } from '../lib/PixelCanvas.mjs'

const SHADOW_ALPHA = 70 // about 27%: soft, not a hole in the ground

function shadow(width, height) {
  const c = new PixelCanvas(width, height)
  c.ellipse((width - 1) / 2, (height - 1) / 2, width / 2, height / 2, 'ink', SHADOW_ALPHA)
  return c
}

function sparkle() {
  const c = new PixelCanvas(7, 7)
  c.art(0, 0, [
    '...w...',
    '...y...',
    '..yyy..',
    'wyywyyw',
    '..yyy..',
    '...y...',
    '...w...',
  ], { w: 'white', y: 'yellow' })
  return c
}

export function sprites() {
  const list = [
    { name: 'shadow_s', canvas: shadow(10, 4) },
    { name: 'shadow', canvas: shadow(14, 5) },
    { name: 'shadow_l', canvas: shadow(26, 8) },
    { name: 'sparkle', canvas: sparkle() },
  ]
  return list.concat(particles(), worldUi())
}

// ---------------------------------------------------------------------
//  Particles (no outlines)
// ---------------------------------------------------------------------
function particles() {
  const rain = new PixelCanvas(1, 5)
  rain.rect(0, 0, 1, 5, 'waterFoam', 200)

  const snow = new PixelCanvas(3, 3)
  snow.art(0, 0, ['.w.', 'www', '.w.'], { w: 'white' })

  const petal = new PixelCanvas(3, 2)
  petal.art(0, 0, ['pp.', '.pd'], { p: 'pink', d: 'pinkDark' })

  const leaf = new PixelCanvas(3, 3)
  leaf.art(0, 0, ['.o.', 'oyo', '.o.'], { o: 'orange', y: 'yellow' })

  const smoke = new PixelCanvas(6, 6)
  smoke.ellipse(2.5, 2.5, 3, 3, 'stoneHi')
  smoke.rect(1, 1, 2, 1, 'white')

  const dust = new PixelCanvas(2, 2)
  dust.rect(0, 0, 2, 2, 'paper')

  const ember = new PixelCanvas(1, 1)
  ember.set(0, 0, 'yellow')

  // Puddles that appear on the paths when it rains (flat, no outline).
  const puddleA = new PixelCanvas(16, 7)
  puddleA.ellipse(7.5, 3, 7.5, 3, 'waterDeep', 150)
  puddleA.ellipse(7, 2.6, 6, 2.2, 'water', 170)
  puddleA.hline(4, 2, 4, 'waterLight')
  puddleA.set(10, 3, 'waterFoam')
  const puddleB = new PixelCanvas(11, 5)
  puddleB.ellipse(5, 2, 5, 2, 'waterDeep', 150)
  puddleB.ellipse(5, 2, 4, 1.4, 'water', 170)
  puddleB.hline(3, 1, 3, 'waterLight')

  // A little splash where a raindrop lands.
  const splash = new PixelCanvas(5, 3)
  splash.art(0, 0, ['w...w', '.w.w.', '..f..'], { w: 'waterFoam', f: 'white' })

  return [
    { name: 'puddle_a', canvas: puddleA },
    { name: 'puddle_b', canvas: puddleB },
    { name: 'p_splash', canvas: splash },
    { name: 'p_rain', canvas: rain },
    { name: 'p_snow', canvas: snow },
    { name: 'p_petal', canvas: petal },
    { name: 'p_leaf', canvas: leaf },
    { name: 'p_smoke', canvas: smoke },
    { name: 'p_dust', canvas: dust },
    { name: 'p_ember', canvas: ember },
  ]
}

// ---------------------------------------------------------------------
//  Small in-world UI: guide arrow, "!" bubble, fishing bobber
// ---------------------------------------------------------------------
function worldUi() {
  const arrow = new PixelCanvas(11, 9)
  arrow.art(1, 1, [
    '....y....',
    '...yyy...',
    '..yyyyy..',
    '.yyyyyyy.',
    '...yyy...',
    '...yyy...',
    '...ooo...',
  ], { y: 'yellow', o: 'orange' })
  arrow.outline()

  const bang = new PixelCanvas(9, 12)
  bang.rect(1, 1, 7, 8, 'white')
  bang.rect(4, 2, 1, 4, 'redBright')
  bang.set(4, 7, 'redBright')
  bang.rect(3, 9, 2, 1, 'white')
  bang.set(3, 10, 'white')
  bang.outline()

  const bobber = new PixelCanvas(7, 8)
  bobber.art(1, 1, [
    '..s..',
    '.rrr.',
    '.rWr.',
    '.www.',
    '..w..',
  ], { s: 'stone', r: 'redBright', W: 'redLight', w: 'white' })
  bobber.outline()

  return [
    { name: 'guide_arrow', canvas: arrow },
    { name: 'bubble_bang', canvas: bang },
    { name: 'bobber', canvas: bobber },
  ]
}
