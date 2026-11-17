import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { derivePalette } from '../palette'
import { THEME_PRESETS } from '../presets'
import { THEME_STORAGE_KEY } from '../storage'

/**
 * public/theme-init.js runs before the bundle to stop a flash of the wrong
 * theme. It is a classic script, so it is evaluated here exactly as the
 * browser would run it.
 */
const source = readFileSync(join(process.cwd(), 'public', 'theme-init.js'), 'utf8')
const runInitScript = () => new Function(source)()

const root = document.documentElement
const cssVar = (name) => root.style.getPropertyValue(name)

function addThemeColorMeta() {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', 'default')
  document.head.append(meta)
  return meta
}

describe('theme-init.js (pre-paint bootstrap)', () => {
  it('uses the dark default when nothing is stored', () => {
    runInitScript()

    expect(root).toHaveAttribute('data-mode', 'dark')
    expect(root.getAttribute('style')).toBeNull()
  })

  it('replays the cached palette before first paint', () => {
    const palette = derivePalette(THEME_PRESETS[3].color, 'light')
    const meta = addThemeColorMeta()
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ color: palette.seed, mode: 'light', vars: palette.vars, themeColor: palette.themeColor }),
    )

    runInitScript()

    expect(root).toHaveAttribute('data-mode', 'light')
    for (const [name, value] of Object.entries(palette.vars)) expect(cssVar(name)).toBe(value)
    expect(meta).toHaveAttribute('content', palette.themeColor)
  })

  it('honours the old dark/light-only setting', () => {
    localStorage.setItem('color-mode', 'light')

    runInitScript()

    expect(root).toHaveAttribute('data-mode', 'light')
  })

  it('refuses anything that is not a theme token', () => {
    const meta = addThemeColorMeta()
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        mode: 'dark; background: url(//evil.example)',
        themeColor: 'red"><script>',
        vars: {
          '--c-void': '1 2 3',
          '--c-ink': 'url(https://evil.example/x.png)',
          '--c-wall': '999999 0 0; position: fixed',
          'background-image': '1 2 3',
          '--not-ours': '1 2 3',
          '--c-panel': 12,
        },
      }),
    )

    runInitScript()

    expect(root).toHaveAttribute('data-mode', 'dark')
    expect(cssVar('--c-void')).toBe('1 2 3')
    expect(cssVar('--c-ink')).toBe('')
    expect(cssVar('--c-wall')).toBe('')
    expect(cssVar('--c-panel')).toBe('')
    expect(cssVar('--not-ours')).toBe('')
    expect(root.style.backgroundImage).toBe('')
    expect(meta).toHaveAttribute('content', 'default')
  })

  it.each(['{{{', '"just a string"', '[1,2,3]', '42'])('shrugs off corrupt storage: %s', (value) => {
    localStorage.setItem(THEME_STORAGE_KEY, value)

    expect(runInitScript).not.toThrow()
    expect(root).toHaveAttribute('data-mode', 'dark')
  })
})
