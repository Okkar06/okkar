import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { applyTheme } from './applyTheme.js'
import { normalizeHex } from './color.js'
import { THEME_MODES, findPreset } from './presets.js'
import {
  THEME_STORAGE_KEY,
  parseStoredTheme,
  readStoredTheme,
  writeStoredTheme,
} from './storage.js'
import { ThemeContext } from './ThemeContext.js'

const sameTheme = (a, b) => a.color === b.color && a.mode === b.mode

/**
 * Owns the one piece of theme state — { color, mode } — and keeps <html>, the
 * stored choice and every open tab in step with it.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme)

  // Layout effect: the tokens are on <html> before the browser paints.
  useLayoutEffect(() => {
    const palette = applyTheme(theme)
    writeStoredTheme(theme, palette)
  }, [theme])

  useEffect(() => {
    const adopt = (next) => {
      if (next) setTheme((current) => (sameTheme(current, next) ? current : next))
    }

    // Another tab changed the theme.
    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) adopt(parseStoredTheme(event.newValue))
    }

    // Restored from the back/forward cache: the choice may have changed since.
    const handlePageShow = (event) => {
      if (event.persisted) adopt(readStoredTheme())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  const setColor = useCallback((value) => {
    // Only the picker's presets are accepted.
    const color = findPreset(normalizeHex(value))?.color
    if (!color) return
    setTheme((current) => (current.color === color ? current : { ...current, color }))
  }, [])

  const setMode = useCallback((mode) => {
    if (!THEME_MODES.includes(mode)) return
    setTheme((current) => (current.mode === mode ? current : { ...current, mode }))
  }, [])

  const toggleMode = useCallback(() => {
    setTheme((current) => ({ ...current, mode: current.mode === 'dark' ? 'light' : 'dark' }))
  }, [])

  const value = useMemo(
    () => ({ color: theme.color, mode: theme.mode, setColor, setMode, toggleMode }),
    [theme, setColor, setMode, toggleMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
