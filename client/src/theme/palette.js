import {
  clamp,
  ensureContrast,
  hexToRgb,
  hueDistance,
  mostReadable,
  normalizeHex,
  oklchToRgb,
  rgbToHex,
  rgbToOklch,
} from './color.js'
import { DEFAULT_THEME } from './presets.js'

/**
 * THE source of truth for every colour on the site.
 *
 * derivePalette(seed, mode) turns the one colour picked in the colour bar
 * into the full set of CSS custom properties (`--c-*` channel triplets) that
 * Tailwind and index.css consume. Nothing else in the client may contain a
 * colour literal — src/theme/__tests__/no-stray-colors.test.js enforces that.
 *
 * Bump PALETTE_VERSION whenever the recipe changes, so palettes cached in
 * localStorage by an older build are recomputed instead of trusted, and run
 * `npm run theme:tokens` to refresh the static fallback in styles/tokens.css.
 */
export const PALETTE_VERSION = 3

// WCAG 2.1 AA thresholds.
const AA_TEXT = 4.5
const AA_UI = 3
const AAA_TEXT = 7

/**
 * Surface recipes as [lightness, chroma] in OKLCH, at the seed's hue. Dark
 * mode sinks the picked colour into a deep shade of itself; light mode washes
 * it out to a tint. Chroma is scaled by how colourful the seed is, so a grey
 * seed gives a neutral cabinet rather than an arbitrary tint.
 */
const SURFACES = {
  dark: { void: [0.145, 0.04], panel: [0.195, 0.05], floor: [0.245, 0.058] },
  light: { void: [0.955, 0.022], panel: [0.992, 0.006], floor: [0.918, 0.034] },
}

const WALL_LIGHTNESS = { dark: [0.6, 0.82], light: [0.4, 0.56] }
const INK = { dark: [0.965, 0.012], light: [0.21, 0.035] }
const INK_DIM = { dark: [0.77, 0.04], light: [0.44, 0.05] }

// The neon accent — the hero's last name, HUD labels, the PRESS START button.
// It is the picked colour pushed bright on dark cabinets and deep on light
// ones, with at least this much chroma so it always reads as neon.
const NEON_LIGHTNESS = { dark: 0.78, light: 0.5 }
const NEON_MIN_CHROMA = 0.16

/**
 * The cast keeps its own colours whatever the theme — the mascot is always
 * gold, the ghosts keep their four colourways — but each one is still checked
 * against the derived surfaces and nudged until it is readable on them.
 */
const CAST = {
  dark: {
    mascot: '#ffd21e',
    mascotInk: '#ffd21e',
    dot: '#ffe9a8',
    hud: '#ffe347',
    ghostRed: '#ff5d6c',
    ghostPink: '#ff9ade',
    ghostCyan: '#5ee7ff',
    ghostOrange: '#ffb152',
    ghostScared: '#5c6dff',
  },
  light: {
    mascot: '#f5a600',
    mascotInk: '#965a00',
    dot: '#a16207',
    hud: '#8a5a00',
    ghostRed: '#c0273a',
    ghostPink: '#a92f86',
    ghostCyan: '#0a6d8a',
    ghostOrange: '#9a5410',
    ghostScared: '#2c3ad0',
  },
}

// Theme-independent: the two inks that can sit on a filled accent, and the
// white of the characters' eyes.
const ON_FILL_DARK = hexToRgb('#080914')
const ON_FILL_LIGHT = hexToRgb('#ffffff')

const GOLD_HUE = rgbToOklch(hexToRgb(CAST.dark.hud)).h

// The frightened ghost is blue — unless the picked colour is itself close to
// that blue, in which case it swings this far round the wheel (whichever way
// lands further from the picked hue) so it still stands out from the walls.
const SCARED_CLASH = 45
const SCARED_SWING = 60

function scaredHue(baseHue, themeHue, themeIsColourful) {
  if (!themeIsColourful || hueDistance(baseHue, themeHue) >= SCARED_CLASH) return baseHue
  const options = [(baseHue + SCARED_SWING) % 360, (baseHue - SCARED_SWING + 360) % 360]
  return hueDistance(options[0], themeHue) >= hueDistance(options[1], themeHue) ? options[0] : options[1]
}

const triplet = (rgb) => rgb.join(' ')

/**
 * @param {string} seedHex  The picked colour, `#rrggbb`.
 * @param {'dark' | 'light'} mode
 * @returns {{ seed: string, mode: string, vars: Record<string, string>, themeColor: string }}
 */
export function derivePalette(seedHex, mode = DEFAULT_THEME.mode) {
  const seedColor = normalizeHex(seedHex) ?? DEFAULT_THEME.color
  const resolvedMode = mode === 'light' ? 'light' : 'dark'
  const dark = resolvedMode === 'dark'

  const seed = rgbToOklch(hexToRgb(seedColor))
  const hue = seed.h
  const colourfulness = clamp(seed.c / 0.14, 0, 1)

  const shade = ([lightness, chroma]) =>
    oklchToRgb({ l: lightness, c: chroma * colourfulness, h: hue })

  // ── Surfaces: page background, cards, inputs ──
  const recipe = SURFACES[resolvedMode]
  const voidRgb = shade(recipe.void)
  const panel = shade(recipe.panel)
  const floor = shade(recipe.floor)
  const surfaces = [voidRgb, panel, floor]

  const readable = (lch, minimum) => ensureContrast(lch, surfaces, minimum)
  const castMember = (hex, minimum = AA_TEXT) => readable(rgbToOklch(hexToRgb(hex)), minimum)

  // ── Walls (borders + accents): the picked colour itself, pulled into a
  // lightness band that works on this mode's surfaces. ──
  const [wallMin, wallMax] = WALL_LIGHTNESS[resolvedMode]
  const wallLch = { l: clamp(seed.l, wallMin, wallMax), c: seed.c, h: hue }
  const wall = readable(wallLch, dark ? AA_UI : AA_TEXT)

  // ── Glow: a brighter halo of the wall on dark cabinets; on light ones a
  // glow is just a soft tinted shadow, so the wall colour is reused. ──
  const glow = dark
    ? oklchToRgb({ l: Math.min(rgbToOklch(wall).l + 0.07, 0.88), c: seed.c, h: hue })
    : wall

  // ── Text: flips between light and dark with the surfaces. ──
  const ink = readable({ l: INK[resolvedMode][0], c: INK[resolvedMode][1] * colourfulness, h: hue }, AAA_TEXT)
  const inkDim = readable(
    { l: INK_DIM[resolvedMode][0], c: INK_DIM[resolvedMode][1] * colourfulness, h: hue },
    AA_TEXT,
  )

  // ── Cast ──
  const cast = CAST[resolvedMode]
  const mascot = hexToRgb(cast.mascot)

  // ── Neon accent text: follows the picked colour. ──
  const neon = readable(
    { l: NEON_LIGHTNESS[resolvedMode], c: Math.max(seed.c, NEON_MIN_CHROMA) * colourfulness, h: hue },
    AA_TEXT,
  )

  // The focus ring must stand apart from the walls it is drawn next to. Gold
  // does that for every theme except a gold one, where the text ink takes over.
  const wallIsGold = colourfulness > 0.3 && hueDistance(hue, GOLD_HUE) < 45
  const focus = wallIsGold ? ink : castMember(cast.hud)

  const scaredBase = rgbToOklch(hexToRgb(cast.ghostScared))
  const scared = readable({ ...scaredBase, h: scaredHue(scaredBase.h, hue, colourfulness > 0.3) }, AA_UI)

  const vars = {
    '--c-void': triplet(voidRgb),
    '--c-panel': triplet(panel),
    '--c-floor': triplet(floor),

    '--c-wall': triplet(wall),
    '--c-on-wall': triplet(mostReadable(wall, [ON_FILL_DARK, ON_FILL_LIGHT])),
    '--c-glow': triplet(glow),

    '--c-ink': triplet(ink),
    '--c-ink-dim': triplet(inkDim),

    '--c-dot': triplet(castMember(cast.dot, AA_UI)),
    '--c-hud': triplet(neon),
    '--c-neon': triplet(neon),
    '--c-on-neon': triplet(mostReadable(neon, [ON_FILL_DARK, ON_FILL_LIGHT])),
    '--c-focus': triplet(focus),

    '--c-mascot': triplet(mascot),
    '--c-mascot-ink': triplet(neon),
    '--c-on-mascot': triplet(mostReadable(mascot, [ON_FILL_DARK, ON_FILL_LIGHT])),
    '--c-eye': triplet(ON_FILL_LIGHT),

    '--c-ghost-red': triplet(castMember(cast.ghostRed)),
    '--c-ghost-pink': triplet(castMember(cast.ghostPink)),
    '--c-ghost-cyan': triplet(castMember(cast.ghostCyan)),
    '--c-ghost-orange': triplet(castMember(cast.ghostOrange)),
    '--c-ghost-scared': triplet(scared),
  }

  return { seed: seedColor, mode: resolvedMode, vars, themeColor: rgbToHex(voidRgb) }
}

/** Every custom property the theme engine owns, in a stable order. */
export const THEME_VARIABLES = Object.keys(derivePalette(DEFAULT_THEME.color, 'dark').vars)
