import { useEffect, useState } from 'react'

const STORAGE_KEY = 'color-mode'

function readInitialMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be blocked; fall through to the default.
  }
  return 'dark'
}

/**
 * Switches between the night arcade (dark) and arcade daylight (light) themes
 * by flipping `data-mode` on <html>, which swaps the whole token set.
 */
function DarkModeToggle() {
  const [mode, setMode] = useState(readInitialMode)
  const isDark = mode === 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Not being able to remember the choice is not an error worth surfacing.
    }
  }, [mode])

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to arcade daylight mode' : 'Switch to night arcade mode'}
      aria-pressed={isDark}
      className="maze-tile grid h-9 w-9 place-items-center text-hud"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
      )}
    </button>
  )
}

export default DarkModeToggle
