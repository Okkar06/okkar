import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ColorBar from '../../components/ColorBar'
import ModeToggle from '../../components/ModeToggle'
import { derivePalette, PALETTE_VERSION } from '../palette'
import { DEFAULT_THEME, THEME_PRESETS } from '../presets'
import { THEME_STORAGE_KEY } from '../storage'
import ThemeProvider from '../ThemeProvider'

const root = document.documentElement
const cssVar = (name) => root.style.getPropertyValue(name)
const stored = () => JSON.parse(localStorage.getItem(THEME_STORAGE_KEY))
const preset = (id) => THEME_PRESETS.find((entry) => entry.id === id)

function renderTheme() {
  return render(
    <ThemeProvider>
      <ColorBar />
      <ModeToggle />
    </ThemeProvider>,
  )
}

function expectPainted(color, mode) {
  const { vars, themeColor } = derivePalette(color, mode)
  expect(root).toHaveAttribute('data-mode', mode)
  for (const [name, value] of Object.entries(vars)) {
    expect(cssVar(name), name).toBe(value)
  }
  expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', themeColor)
}

describe('theme switching', () => {
  it('paints the default theme on first visit', () => {
    renderTheme()

    expectPainted(DEFAULT_THEME.color, DEFAULT_THEME.mode)
    expect(screen.getByRole('radio', { name: 'Maze Blue' })).toBeChecked()
  })

  it('re-themes the whole page — background included — when a colour is picked', async () => {
    const user = userEvent.setup()
    renderTheme()
    const before = cssVar('--c-void')

    await user.click(screen.getByRole('radio', { name: 'Cherry Bomb' }))

    expectPainted(preset('red').color, 'dark')
    expect(cssVar('--c-void')).not.toBe(before)
    expect(screen.getByRole('radio', { name: 'Cherry Bomb' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Maze Blue' })).not.toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent('Cherry Bomb theme')
  })

  it('persists the choice and restores it after a reload', async () => {
    const user = userEvent.setup()
    const first = renderTheme()

    await user.click(screen.getByRole('radio', { name: 'Extra Life' }))
    await user.click(screen.getByRole('button', { name: /arcade daylight/i }))

    expect(stored()).toMatchObject({
      v: PALETTE_VERSION,
      color: preset('green').color,
      mode: 'light',
      vars: derivePalette(preset('green').color, 'light').vars,
    })

    // "Reload": throw the page away and boot again from storage alone.
    first.unmount()
    root.removeAttribute('style')
    root.removeAttribute('data-mode')
    renderTheme()

    expectPainted(preset('green').color, 'light')
    expect(screen.getByRole('radio', { name: 'Extra Life' })).toBeChecked()
  })

  it('switches between dark and light shades of the same colour', async () => {
    const user = userEvent.setup()
    renderTheme()
    await user.click(screen.getByRole('radio', { name: 'Tangerine' }))

    await user.click(screen.getByRole('button', { name: /arcade daylight/i }))
    expectPainted(preset('orange').color, 'light')

    await user.click(screen.getByRole('button', { name: /night arcade/i }))
    expectPainted(preset('orange').color, 'dark')
  })

  it('accepts a custom colour from the native picker', () => {
    renderTheme()
    const custom = derivePalette('nonsense', 'dark').seed === '#123456' ? '#654321' : '#123456'

    fireEvent.change(screen.getByLabelText('Custom theme color'), { target: { value: custom } })

    expectPainted(custom, 'dark')
    expect(stored().color).toBe(custom)
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent(`Custom theme ${custom}`)
  })

  it('survives rapid clicking and always lands on the last pick', async () => {
    const user = userEvent.setup()
    renderTheme()

    for (let round = 0; round < 3; round += 1) {
      for (const entry of THEME_PRESETS) {
        await user.click(screen.getByRole('radio', { name: entry.label }))
      }
    }
    await user.dblClick(screen.getByRole('radio', { name: 'Bubblegum' }))

    expectPainted(preset('pink').color, 'dark')
    expect(screen.getAllByRole('radio').filter((radio) => radio.getAttribute('aria-checked') === 'true')).toHaveLength(1)
  })
})

describe('colour bar keyboard support', () => {
  it('is a single tab stop and moves with the arrow keys, Home and End', async () => {
    const user = userEvent.setup()
    renderTheme()
    const radios = screen.getAllByRole('radio')

    expect(screen.getByRole('radiogroup', { name: 'Theme color' })).toBeInTheDocument()
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1)

    await user.tab()
    expect(radios[0]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(radios[1]).toHaveFocus()
    expect(radios[1]).toBeChecked()
    expectPainted(THEME_PRESETS[1].color, 'dark')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(radios.at(-1)).toHaveFocus()
    expect(radios.at(-1)).toBeChecked()

    await user.keyboard('{Home}')
    expect(radios[0]).toBeChecked()

    await user.keyboard('{End}')
    expect(radios.at(-1)).toBeChecked()
    expectPainted(THEME_PRESETS.at(-1).color, 'dark')

    // Tab leaves the group for the custom picker, then the mode toggle.
    await user.tab()
    expect(screen.getByLabelText('Custom theme color')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /arcade daylight/i })).toHaveFocus()
  })

  it('selects with Space and Enter', async () => {
    const user = userEvent.setup()
    renderTheme()
    const radios = screen.getAllByRole('radio')

    radios[3].focus()
    await user.keyboard(' ')
    expect(radios[3]).toBeChecked()

    radios[5].focus()
    await user.keyboard('{Enter}')
    expect(radios[5]).toBeChecked()
  })

  it('names every swatch', () => {
    renderTheme()
    for (const entry of THEME_PRESETS) {
      expect(screen.getByRole('radio', { name: entry.label })).toBeInTheDocument()
    }
  })
})

describe('theme storage is treated as untrusted', () => {
  it.each([
    ['garbage', 'not json at all'],
    ['wrong shape', JSON.stringify(['#ff0000'])],
    ['bad colour', JSON.stringify({ color: 'javascript:alert(1)', mode: 'dark' })],
    ['bad mode', JSON.stringify({ color: DEFAULT_THEME.color, mode: 'neon' })],
    ['null', 'null'],
  ])('falls back to the default theme for %s', (_label, value) => {
    localStorage.setItem(THEME_STORAGE_KEY, value)

    renderTheme()

    expectPainted(DEFAULT_THEME.color, DEFAULT_THEME.mode)
  })

  it('ignores cached variables and recomputes from the stored colour', () => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ color: preset('cyan').color, mode: 'dark', vars: { '--c-void': '255 0 255' } }),
    )

    renderTheme()

    expectPainted(preset('cyan').color, 'dark')
  })

  it('migrates the old dark/light-only setting', () => {
    localStorage.setItem('color-mode', 'light')

    renderTheme()

    expectPainted(DEFAULT_THEME.color, 'light')
    expect(localStorage.getItem('color-mode')).toBeNull()
  })

  it('still works when storage is blocked', async () => {
    const blocked = () => {
      throw new DOMException('denied', 'SecurityError')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked)
    const user = userEvent.setup()

    renderTheme()
    expectPainted(DEFAULT_THEME.color, DEFAULT_THEME.mode)

    await user.click(screen.getByRole('radio', { name: 'Warp Violet' }))
    expectPainted(preset('violet').color, 'dark')
  })

  it('follows a theme change made in another tab', () => {
    renderTheme()
    const next = JSON.stringify({ color: preset('pink').color, mode: 'light' })

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: next }))
    })

    expectPainted(preset('pink').color, 'light')
    expect(screen.getByRole('radio', { name: 'Bubblegum' })).toBeChecked()
  })

  it('ignores unrelated or malformed storage events', () => {
    renderTheme()

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: '{}' }))
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: '{{{' }))
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: null }))
    })

    expectPainted(DEFAULT_THEME.color, DEFAULT_THEME.mode)
  })
})
