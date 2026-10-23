// =====================================================================
//  PALETTE — the ONE list of colours used by the whole village.
//
//  Most colours were sampled straight from Kenney's Tiny Town / Tiny
//  Dungeon tiles, so new art matches the tiles. A few were added for
//  things Kenney doesn't have (water, petals, warm light); each new one
//  sits between existing tones so it doesn't look out of place.
//
//  Used by:
//    - tools/build-art.mjs   (draws the generated sprites)
//    - Phaser code           (tints, particles, glows) via hex('name')
//  See .claude/skills/pixel-art-direction/SKILL.md for the rules.
// =====================================================================

export const palette = {
  // Outlines and darkest shadow (Kenney's outline colour)
  ink: '#3f2631',
  inkSoft: '#5a3d47', // outline for small, light objects

  // Grass and leaves
  grassHi: '#8bd87d',
  grass: '#84c669',
  grassMid: '#65a556',
  grassDark: '#479f4a',
  pineDark: '#2f6b45', // added: pine needles in shade (between grassDark and ink)

  // Wood (fences, furniture, floors)
  woodHi: '#fcbc8f',
  woodLight: '#eaa56c',
  wood: '#bd6c4a',
  woodDark: '#763b36',

  // Cream / sand / paper
  cream: '#fec99c',
  paper: '#fdf3dc',
  sandDark: '#cf8254',

  // Stone and metal
  stoneHi: '#c0cbdc',
  stone: '#8b9bb4',
  stoneDark: '#5a6988',
  slate: '#52607c',
  navy: '#262b44',

  // Reds and warm accents
  redLight: '#f28462',
  red: '#c34b35',
  redBright: '#e84537',
  redDark: '#773833',
  yellow: '#fdbe53',
  orange: '#e38628',

  // Blues (Kenney's blue + new water tones in between)
  blue: '#009adc',
  blueLight: '#76e4ff',
  waterDeep: '#23649e', // added: deep lake water
  water: '#2f86c8', // added: lake water
  waterLight: '#5fb8e8', // added: wave highlights
  waterFoam: '#c9f2ff', // added: foam and sparkles

  // Extra accents (added)
  pink: '#f7a8c8', // petals, flowers
  pinkDark: '#d9638f',
  purple: '#8e5bb5', // villager's dress, books
  white: '#ffffff',

  // Light and atmosphere (used for glows/tints, not inside sprites)
  warmLight: '#ffd38a',
  night: '#1b2a5c',
  dusk: '#ff8a3d',
  storm: '#3a4560',
  fog: '#e8eef5',

  // UI accent of the old React site (no longer used by the redesign, which
  // uses lamplight 'yellow' as its one accent; kept for reference)
  accent: '#5b42f5',
}

// Phaser wants colours as numbers like 0x3f2631.
export function hex(name) {
  const value = palette[name]
  if (!value) throw new Error('Unknown palette colour: ' + name)
  return parseInt(value.slice(1), 16)
}

// [r, g, b] array (used by the art tool).
export function rgb(name) {
  const value = palette[name]
  if (!value) throw new Error('Unknown palette colour: ' + name)
  return [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
  ]
}
