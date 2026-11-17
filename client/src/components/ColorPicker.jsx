import { useEffect, useId, useRef, useState } from 'react'
import { THEME_PRESETS, findPreset } from '../theme/presets'
import { useTheme } from '../theme/useTheme'

// Arrow keys move through the swatches in reading order, wrapping round.
const MOVES = {
  ArrowRight: (index) => index + 1,
  ArrowDown: (index) => index + 1,
  ArrowLeft: (index) => index - 1,
  ArrowUp: (index) => index - 1,
  Home: () => 0,
  End: () => THEME_PRESETS.length - 1,
}

/**
 * ColorPicker — a maze-tile button showing the current theme colour as a
 * dot. It opens a small palette of colour blocks; the theme engine derives
 * the whole cabinet from whichever one is picked (src/theme/palette.js).
 *
 * Keyboard: Enter/Space opens it and focuses the current colour. Arrow keys,
 * Home and End move and preview live; Enter, Space or a click confirms and
 * closes; Escape closes. Focus returns to the button either way.
 */
function ColorPicker() {
  const { color, setColor } = useTheme()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const swatchRefs = useRef([])

  const active = findPreset(color)
  const activeIndex = active ? THEME_PRESETS.indexOf(active) : -1
  const focusIndex = activeIndex === -1 ? 0 : activeIndex
  const name = active?.label ?? 'Custom'

  // Opening, or moving with the arrow keys, puts focus on the chosen swatch.
  useEffect(() => {
    if (open) swatchRefs.current[focusIndex]?.focus()
  }, [open, focusIndex])

  // A press anywhere outside closes the palette.
  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handlePanelKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      // Don't let the same Escape also close the mobile menu around us.
      event.stopPropagation()
      close()
      return
    }

    const move = MOVES[event.key]
    const current = swatchRefs.current.indexOf(document.activeElement)
    if (!move || current === -1) return

    event.preventDefault()
    const next = (move(current) + THEME_PRESETS.length) % THEME_PRESETS.length
    setColor(THEME_PRESETS[next].color)
  }

  // Tabbing away closes it too. (A null relatedTarget is a click on empty
  // space, which the pointerdown handler above already deals with.)
  const handleBlur = (event) => {
    if (open && event.relatedTarget && !wrapperRef.current?.contains(event.relatedTarget)) {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative" onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Theme color: ${name}`}
        aria-expanded={open}
        aria-controls={panelId}
        title="Theme color"
        onClick={() => setOpen((previous) => !previous)}
        className="maze-tile chomp grid h-9 w-9 place-items-center"
      >
        {/* The dot shows the colour it stands for, so its fill is data. */}
        <span
          aria-hidden="true"
          className="block h-4 w-4 rounded-full shadow-glow-wall ring-2 ring-ink/60"
          style={{ backgroundColor: color }}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          onKeyDown={handlePanelKeyDown}
          className="absolute right-0 top-full z-[60] mt-2 w-max rounded-tile border-2 border-wall bg-panel p-3 shadow-glow-wall-lg motion-safe:animate-pop"
        >
          <p aria-hidden="true" className="hud-label mb-3">
            THEME
          </p>

          <div role="radiogroup" aria-label="Theme color" className="grid grid-cols-4 gap-2">
            {THEME_PRESETS.map((preset, index) => {
              const checked = index === activeIndex
              return (
                <button
                  key={preset.id}
                  ref={(node) => {
                    swatchRefs.current[index] = node
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={preset.label}
                  title={preset.label}
                  tabIndex={index === focusIndex ? 0 : -1}
                  onClick={() => {
                    setColor(preset.color)
                    close()
                  }}
                  className={`chomp grid h-9 w-9 place-items-center rounded-tile border-2 bg-floor transition-[transform,border-color,box-shadow] duration-200 ${
                    checked ? 'border-wall shadow-glow-wall' : 'border-wall/30 hover:border-wall'
                  }`}
                >
                  {/* Selected = bigger dot with a ring, never colour alone. */}
                  <span
                    aria-hidden="true"
                    className={`block rounded-full transition-transform duration-200 ${
                      checked ? 'h-5 w-5 ring-2 ring-ink' : 'h-4 w-4 ring-1 ring-ink/40'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                </button>
              )
            })}
          </div>

          <p aria-hidden="true" className="mt-3 font-pixel text-pixel-xs uppercase text-ink-dim">
            {name}
          </p>
        </div>
      ) : null}

      {/* Tells screen-reader users the switch happened; sighted users see it. */}
      <span role="status" className="sr-only">
        {`${name} theme`}
      </span>
    </div>
  )
}

export default ColorPicker
