import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToRgb, hueDistance, oklchToRgb, rgbToHex, rgbToOklch } from '../color'
import { derivePalette, THEME_VARIABLES } from '../palette'
import { DEFAULT_THEME, THEME_MODES, THEME_PRESETS } from '../presets'

const rgb = (triplet) => triplet.split(' ').map(Number)

/** Every seed the picker can produce, sampled: the presets, the edge cases,
 *  and a sweep round the colour wheel at three strengths. */
function seeds() {
  const list = THEME_PRESETS.map((preset) => preset.color)
  list.push('#000000', '#ffffff', '#808080', '#ffff00', '#00ff00', '#0000ff', '#ff0000', '#ffd21e')

  for (let hue = 0; hue < 360; hue += 10) {
    for (const [lightness, chroma] of [
      [0.65, 0.2],
      [0.35, 0.12],
      [0.9, 0.08],
    ]) {
      list.push(rgbToHex(oklchToRgb({ l: lightness, c: chroma, h: hue })))
    }
  }

  return [...new Set(list)]
}

// [foreground token, minimum contrast, what it is used for]
const ON_SURFACES = [
  ['--c-ink', 7, 'body text (AAA)'],
  ['--c-ink-dim', 4.5, 'secondary text'],
  ['--c-hud', 4.5, 'HUD labels'],
  ['--c-mascot-ink', 4.5, 'accent text'],
  ['--c-neon', 4.5, 'neon accent text'],
  ['--c-ghost-red', 4.5, 'error text / red tag'],
  ['--c-ghost-pink', 4.5, 'pink tag'],
  ['--c-ghost-cyan', 4.5, 'success text / cyan tag'],
  ['--c-ghost-orange', 4.5, 'orange tag'],
  ['--c-wall', 3, 'borders and controls'],
  ['--c-focus', 3, 'focus ring'],
  ['--c-dot', 3, 'pellets'],
]

const SURFACES = ['--c-void', '--c-panel', '--c-floor']

describe('derivePalette', () => {
  it('returns every theme variable as an "r g b" triplet', () => {
    const { vars } = derivePalette('#3b82f6', 'dark')
    expect(Object.keys(vars)).toEqual(THEME_VARIABLES)
    for (const value of Object.values(vars)) {
      expect(value).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/)
      for (const channel of rgb(value)) expect(channel).toBeLessThanOrEqual(255)
    }
  })

  it('falls back to the default theme for invalid input instead of throwing', () => {
    const fallback = derivePalette(DEFAULT_THEME.color, 'dark')
    for (const bad of ['nope', '', null, undefined, '#fff', 42]) {
      expect(derivePalette(bad, 'dark')).toEqual(fallback)
    }
    expect(derivePalette('#3b82f6', 'sepia').mode).toBe('dark')
  })

  it('drives the background from the picked colour, not just the accents', () => {
    const blue = derivePalette('#3b82f6', 'dark').vars
    const red = derivePalette('#ef4444', 'dark').vars

    for (const token of ['--c-void', '--c-panel', '--c-floor', '--c-wall', '--c-glow', '--c-ink']) {
      expect(red[token], token).not.toBe(blue[token])
    }

    // A red cabinet has a red-leaning background, a blue one a blue-leaning one.
    const [redR, , redB] = rgb(red['--c-void'])
    const [blueR, , blueB] = rgb(blue['--c-void'])
    expect(redR).toBeGreaterThan(redB)
    expect(blueB).toBeGreaterThan(blueR)
  })

  it('keeps the wall on the picked colour when it already works', () => {
    expect(derivePalette('#3b82f6', 'dark').vars['--c-wall']).toBe('59 130 246')
  })

  it('makes dark mode dark and light mode light, with text flipped to match', () => {
    const dark = derivePalette('#22c55e', 'dark').vars
    const light = derivePalette('#22c55e', 'light').vars
    const sum = (triplet) => rgb(triplet).reduce((a, b) => a + b, 0)

    expect(sum(dark['--c-void'])).toBeLessThan(120)
    expect(sum(light['--c-void'])).toBeGreaterThan(640)
    expect(sum(dark['--c-ink'])).toBeGreaterThan(sum(dark['--c-void']))
    expect(sum(light['--c-ink'])).toBeLessThan(sum(light['--c-void']))
  })

  it('layers the surfaces: void, panel and floor are three distinct shades', () => {
    for (const mode of THEME_MODES) {
      const { vars } = derivePalette('#8b5cf6', mode)
      expect(new Set(SURFACES.map((token) => vars[token])).size).toBe(3)
    }
  })

  it('gives a neutral cabinet for a grey seed', () => {
    const [r, g, b] = rgb(derivePalette('#808080', 'dark').vars['--c-void'])
    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(2)
  })

  it('exposes the page background as the browser theme colour', () => {
    const palette = derivePalette('#ec4899', 'light')
    expect(palette.themeColor).toBe(rgbToHex(rgb(palette.vars['--c-void'])))
  })
})

describe('WCAG AA contrast for every pickable colour', () => {
  const all = seeds()

  it('covers a meaningful sample', () => {
    expect(all.length).toBeGreaterThan(100)
  })

  for (const mode of THEME_MODES) {
    it(`text and controls stay readable on every surface (${mode})`, () => {
      const failures = []

      for (const seed of all) {
        const { vars } = derivePalette(seed, mode)

        for (const [token, minimum, what] of ON_SURFACES) {
          for (const surface of SURFACES) {
            const ratio = contrastRatio(rgb(vars[token]), rgb(vars[surface]))
            if (ratio < minimum) {
              failures.push(`${seed} ${mode}: ${what} ${token} on ${surface} = ${ratio.toFixed(2)} < ${minimum}`)
            }
          }
        }

        // Text sitting on a filled accent picks whichever ink reads best.
        for (const [fill, on] of [
          ['--c-mascot', '--c-on-mascot'],
          ['--c-neon', '--c-on-neon'],
          ['--c-wall', '--c-on-wall'],
        ]) {
          const ratio = contrastRatio(rgb(vars[on]), rgb(vars[fill]))
          if (ratio < 4.5) failures.push(`${seed} ${mode}: ${on} on ${fill} = ${ratio.toFixed(2)} < 4.5`)
        }
      }

      expect(failures).toEqual([])
    })
  }

  it('auto-switches the ink on a filled accent between dark and light', () => {
    // Bright wall -> dark ink; deep wall -> light ink.
    expect(derivePalette('#ffd21e', 'dark').vars['--c-on-wall']).toBe('8 9 20')
    expect(derivePalette('#1e3a8a', 'light').vars['--c-on-wall']).toBe('255 255 255')
  })

  it('never lets the focus ring disappear into the walls', () => {
    for (const seed of all) {
      for (const mode of THEME_MODES) {
        const { vars } = derivePalette(seed, mode)
        expect(vars['--c-focus'], `${seed} ${mode}`).not.toBe(vars['--c-wall'])
      }
    }
  })
})

describe('styles/tokens.css (generated fallback)', () => {
  const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8')

  const block = (selector) => {
    const start = css.indexOf(`${selector} {`)
    expect(start, `block ${selector}`).toBeGreaterThan(-1)
    return css.slice(start, css.indexOf('}', start))
  }

  const declared = (text) =>
    Object.fromEntries([...text.matchAll(/(--c-[a-z-]+): ([\d ]+);/g)].map((match) => [match[1], match[2]]))

  it('matches the engine for the default theme (run "npm run theme:tokens" if this fails)', () => {
    expect(declared(block("[data-mode='dark']"))).toEqual(derivePalette(DEFAULT_THEME.color, 'dark').vars)
    expect(declared(block("[data-mode='light']"))).toEqual(derivePalette(DEFAULT_THEME.color, 'light').vars)
  })

  it('registers and transitions every token so a switch cross-fades', () => {
    for (const name of THEME_VARIABLES) {
      expect(css).toContain(`@property ${name} {`)
      expect(css).toContain(`${name} var(--theme-transition) ease`)
    }
    expect(css).toMatch(/--theme-transition: 300ms;/)
  })
})

describe('neon accent', () => {
  it.each(THEME_MODES)('takes the picked colour, so the neon text re-colours with the theme (%s)', (mode) => {
    const neons = new Set()
    for (const preset of THEME_PRESETS) {
      const { vars } = derivePalette(preset.color, mode)
      const neon = rgbToOklch(rgb(vars['--c-neon']))
      expect(hueDistance(neon.h, rgbToOklch(hexToRgb(preset.color)).h), preset.label).toBeLessThan(25)
      // Every text that used to be fixed gold now uses it.
      expect(vars['--c-mascot-ink']).toBe(vars['--c-neon'])
      expect(vars['--c-hud']).toBe(vars['--c-neon'])
      neons.add(vars['--c-neon'])
    }
    expect(neons.size).toBe(THEME_PRESETS.length)
  })
})
