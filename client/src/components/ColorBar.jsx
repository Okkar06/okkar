import { useId, useRef } from 'react'
import { THEME_PRESETS, findPreset } from '../theme/presets'
import { useTheme } from '../theme/useTheme'

const swatchButton =
  'grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform duration-200 hover:scale-110'

// A swatch shows the colour it selects, so its fill is data, not theme. The
// ink ring keeps every swatch visible against any cabinet colour, and the
// selected one is marked by size and a second ring — never by colour alone.
const swatchDot = (checked) =>
  `block rounded-full ring-1 ring-ink/50 transition-transform duration-200 ${
    checked ? 'h-4 w-4 ring-2 ring-ink ring-offset-2 ring-offset-void' : 'h-3 w-3'
  }`

/**
 * ColorBar — the theme colour picker. One colour is picked here; the theme
 * engine derives the whole cabinet from it (see src/theme/palette.js).
 *
 * Keyboard: the presets are a radio group (Tab to reach it, arrow keys /
 * Home / End to move, which also selects). The custom swatch is a native
 * colour input, so it brings its own keyboard-operable picker.
 */
function ColorBar({ className = '' }) {
  const { color, setColor } = useTheme()
  const labelId = useId()
  const buttonRefs = useRef([])

  const activePreset = findPreset(color)
  const activeIndex = activePreset ? THEME_PRESETS.indexOf(activePreset) : -1
  // Roving tabindex: one tab stop for the group — the checked swatch, or the
  // first one when a custom colour is active.
  const tabStop = activeIndex === -1 ? 0 : activeIndex

  const select = (index) => {
    const next = (index + THEME_PRESETS.length) % THEME_PRESETS.length
    setColor(THEME_PRESETS[next].color)
    buttonRefs.current[next]?.focus()
  }

  const handleKeyDown = (event) => {
    const current = buttonRefs.current.indexOf(document.activeElement)
    if (current === -1) return

    const moves = {
      ArrowRight: current + 1,
      ArrowDown: current + 1,
      ArrowLeft: current - 1,
      ArrowUp: current - 1,
      Home: 0,
      End: THEME_PRESETS.length - 1,
    }

    if (event.key in moves) {
      event.preventDefault()
      select(moves[event.key])
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span id={labelId} className="sr-only">
        Theme color
      </span>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1"
      >
        {THEME_PRESETS.map((preset, index) => {
          const checked = index === activeIndex
          return (
            <button
              key={preset.id}
              ref={(node) => {
                buttonRefs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={preset.label}
              title={preset.label}
              tabIndex={index === tabStop ? 0 : -1}
              onClick={() => setColor(preset.color)}
              className={swatchButton}
            >
              <span className={swatchDot(checked)} style={{ backgroundColor: preset.color }} />
            </button>
          )
        })}
      </div>

      <label className={`${swatchButton} relative cursor-pointer`} title="Custom color">
        <input
          type="color"
          aria-label="Custom theme color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="peer sr-only"
        />
        {activePreset ? (
          <span
            aria-hidden="true"
            className="grid h-4 w-4 place-items-center rounded-full border border-dashed border-ink-dim font-sans text-xs font-bold leading-none text-ink-dim peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-focus"
          >
            +
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={`${swatchDot(true)} peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-[5px] peer-focus-visible:outline-focus`}
            style={{ backgroundColor: color }}
          />
        )}
      </label>

      {/* Tells screen-reader users the switch happened; sighted users see it. */}
      <span role="status" className="sr-only">
        {activePreset ? `${activePreset.label} theme` : `Custom theme ${color}`}
      </span>
    </div>
  )
}

export default ColorBar
