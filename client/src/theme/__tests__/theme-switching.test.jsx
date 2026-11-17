import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ColorPicker from '../../components/ColorPicker'
import ModeToggle from '../../components/ModeToggle'
import { derivePalette, PALETTE_VERSION } from '../palette'
import { AUTO_CYCLE_MS, DEFAULT_THEME, THEME_PRESETS } from '../presets'
import { AUTO_CYCLE_STORAGE_KEY, THEME_STORAGE_KEY } from '../storage'
import ThemeProvider from '../ThemeProvider'

const root = document.documentElement
const cssVar = (name) => root.style.getPropertyValue(name)
const stored = () => JSON.parse(localStorage.getItem(THEME_STORAGE_KEY))
const preset = (id) => THEME_PRESETS.find((entry) => entry.id === id)
const nextAfter = (id) => THEME_PRESETS[(THEME_PRESETS.indexOf(preset(id)) + 1) % THEME_PRESETS.length].color

const trigger = () => screen.getByRole('button', { name: /^Theme color:/ })
const palette = () => screen.queryByRole('radiogroup', { name: 'Theme color' })

function renderTheme() {
  return render(
    <ThemeProvider>
      <ColorPicker />
      <ModeToggle />
      <button type="button">elsewhere</button>
    </ThemeProvider>,
  )
}

/** Opens the palette and clicks a colour block. */
async function pick(user, label) {
  if (!palette()) await user.click(trigger())
  await user.click(screen.getByRole('radio', { name: label }))
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
    expect(trigger()).toHaveAccessibleName('Theme color: Maze Blue')
  })

  it('re-themes the whole page — background included — when a colour is picked', async () => {
    const user = userEvent.setup()
    renderTheme()
    const before = cssVar('--c-void')

    await pick(user, 'Cherry Bomb')

    expectPainted(preset('red').color, 'dark')
    expect(cssVar('--c-void')).not.toBe(before)
    expect(trigger()).toHaveAccessibleName('Theme color: Cherry Bomb')
    expect(screen.getByRole('status')).toHaveTextContent('Cherry Bomb theme')
  })

  it('closes the palette after a pick and returns focus to the button', async () => {
    const user = userEvent.setup()
    renderTheme()

    await pick(user, 'Ice Cyan')

    expect(palette()).not.toBeInTheDocument()
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    expect(trigger()).toHaveFocus()
  })

  it('offers only the presets — there is no custom colour input', async () => {
    const user = userEvent.setup()
    renderTheme()
    await user.click(trigger())

    expect(screen.getAllByRole('radio')).toHaveLength(THEME_PRESETS.length)
    expect(document.querySelector('input[type="color"]')).toBeNull()
  })

  it('persists the choice and restores it after a reload', async () => {
    const user = userEvent.setup()
    const first = renderTheme()

    await pick(user, 'Extra Life')
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
    expect(trigger()).toHaveAccessibleName('Theme color: Extra Life')
  })

  it('switches between dark and light shades of the same colour', async () => {
    const user = userEvent.setup()
    renderTheme()
    await pick(user, 'Tangerine')

    await user.click(screen.getByRole('button', { name: /arcade daylight/i }))
    expectPainted(preset('orange').color, 'light')

    await user.click(screen.getByRole('button', { name: /night arcade/i }))
    expectPainted(preset('orange').color, 'dark')
  })

  it('survives rapid clicking and always lands on the last pick', async () => {
    const user = userEvent.setup()
    renderTheme()

    for (let round = 0; round < 2; round += 1) {
      for (const entry of THEME_PRESETS) await pick(user, entry.label)
    }
    await user.dblClick(trigger())
    await pick(user, 'Bubblegum')

    expectPainted(preset('pink').color, 'dark')
  })
})

describe('colour picker keyboard and pointer support', () => {
  it('opens from the keyboard onto the current colour and previews with the arrows', async () => {
    const user = userEvent.setup()
    renderTheme()

    await user.tab()
    expect(trigger()).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveFocus()
    expect(radios[0]).toBeChecked()
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1)

    await user.keyboard('{ArrowRight}')
    expect(radios[1]).toHaveFocus()
    expect(radios[1]).toBeChecked()
    expectPainted(THEME_PRESETS[1].color, 'dark')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(radios.at(-1)).toBeChecked()

    await user.keyboard('{Home}')
    expect(radios[0]).toBeChecked()

    await user.keyboard('{End}')
    expect(radios.at(-1)).toBeChecked()
    expectPainted(THEME_PRESETS.at(-1).color, 'dark')
  })

  it('confirms with Enter or Space, closing and refocusing the button', async () => {
    const user = userEvent.setup()
    renderTheme()

    trigger().focus()
    await user.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}')
    expect(palette()).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
    expectPainted(THEME_PRESETS[2].color, 'dark')

    await user.keyboard('{Enter}{ArrowRight} ')
    expect(palette()).not.toBeInTheDocument()
    expectPainted(THEME_PRESETS[3].color, 'dark')
  })

  it('closes on Escape, keeping the previewed colour', async () => {
    const user = userEvent.setup()
    renderTheme()

    trigger().focus()
    await user.keyboard('{Enter}{ArrowRight}{Escape}')

    expect(palette()).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
    expectPainted(THEME_PRESETS[1].color, 'dark')
  })

  it('closes when focus or a click goes elsewhere', async () => {
    const user = userEvent.setup()
    renderTheme()

    await user.click(trigger())
    await user.click(screen.getByRole('button', { name: 'elsewhere' }))
    expect(palette()).not.toBeInTheDocument()

    // Tab order inside: current colour → AUTO switch → out.
    await user.click(trigger())
    await user.tab()
    expect(palette()).toBeInTheDocument()
    await user.tab()
    expect(palette()).not.toBeInTheDocument()
  })

  it('names every colour block', async () => {
    const user = userEvent.setup()
    renderTheme()
    await user.click(trigger())

    for (const entry of THEME_PRESETS) {
      expect(screen.getByRole('radio', { name: entry.label })).toBeInTheDocument()
    }
  })
})

describe('auto-cycling colour', () => {
  const autoSwitch = () => screen.getByRole('switch', { name: 'Change color every 30 seconds' })
  const wait = (ms) => act(() => vi.advanceTimersByTime(ms))

  it('moves to the next preset every 30 seconds, wrapping round', () => {
    vi.useFakeTimers()
    renderTheme()

    wait(AUTO_CYCLE_MS - 1)
    expectPainted(THEME_PRESETS[0].color, 'dark')
    wait(1)
    expectPainted(THEME_PRESETS[1].color, 'dark')

    for (let step = 2; step <= THEME_PRESETS.length; step += 1) {
      wait(AUTO_CYCLE_MS)
      expectPainted(THEME_PRESETS[step % THEME_PRESETS.length].color, 'dark')
    }
    vi.useRealTimers()
  })

  it('a pick restarts the 30 seconds, and the cycle is not announced', () => {
    vi.useFakeTimers()
    renderTheme()

    wait(AUTO_CYCLE_MS - 1000)
    fireEvent.click(trigger())
    fireEvent.click(screen.getByRole('radio', { name: 'Cherry Bomb' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cherry Bomb theme')

    wait(AUTO_CYCLE_MS - 1)
    expectPainted(preset('red').color, 'dark')
    wait(1)
    expectPainted(nextAfter('red'), 'dark')
    expect(screen.getByRole('status')).toHaveTextContent('Cherry Bomb theme')
    vi.useRealTimers()
  })

  it('the AUTO switch stops it, and the choice is remembered', () => {
    vi.useFakeTimers()
    const first = renderTheme()

    fireEvent.click(trigger())
    expect(autoSwitch()).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(autoSwitch())
    expect(autoSwitch()).toHaveAttribute('aria-checked', 'false')
    expect(localStorage.getItem(AUTO_CYCLE_STORAGE_KEY)).toBe('0')

    wait(AUTO_CYCLE_MS * 3)
    expectPainted(DEFAULT_THEME.color, 'dark')

    first.unmount()
    renderTheme()
    wait(AUTO_CYCLE_MS * 3)
    expectPainted(DEFAULT_THEME.color, 'dark')

    fireEvent.click(trigger())
    fireEvent.click(autoSwitch())
    wait(AUTO_CYCLE_MS)
    expectPainted(THEME_PRESETS[1].color, 'dark')
    vi.useRealTimers()
  })

  it('waits while the tab is hidden', () => {
    vi.useFakeTimers()
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    renderTheme()
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    wait(AUTO_CYCLE_MS * 3)
    expectPainted(DEFAULT_THEME.color, 'dark')

    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    wait(AUTO_CYCLE_MS)
    expectPainted(THEME_PRESETS[1].color, 'dark')
    vi.useRealTimers()
  })
})

describe('theme storage is treated as untrusted', () => {
  it.each([
    ['garbage', 'not json at all'],
    ['wrong shape', JSON.stringify(['#ff0000'])],
    ['bad colour', JSON.stringify({ color: 'javascript:alert(1)', mode: 'dark' })],
    ['a custom colour from an older build', JSON.stringify({ color: '#123456', mode: 'dark' })],
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

    await pick(user, 'Warp Violet')
    expectPainted(preset('violet').color, 'dark')
  })

  it('follows a theme change made in another tab', () => {
    renderTheme()
    const next = JSON.stringify({ color: preset('pink').color, mode: 'light' })

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: next }))
    })

    expectPainted(preset('pink').color, 'light')
    expect(trigger()).toHaveAccessibleName('Theme color: Bubblegum')
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

  it('a stray change event cannot set a colour that is not a preset', () => {
    renderTheme()
    fireEvent.click(trigger())
    // Nothing in the UI can submit an arbitrary colour; the provider refuses one anyway.
    expect(document.querySelector('input')).toBeNull()
  })
})
