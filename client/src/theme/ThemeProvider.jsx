import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { applyTheme } from './applyTheme.js'
import { normalizeHex } from './color.js'
import { AUTO_CYCLE_MS, THEME_MODES, findPreset, nextPresetColor } from './presets.js'
import {
  AUTO_CYCLE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  parseAutoCycle,
  parseStoredTheme,
  readAutoCycle,
  readStoredTheme,
  writeAutoCycle,
  writeStoredTheme,
} from './storage.js'
import { ThemeContext } from './ThemeContext.js'

const sameTheme = (a, b) => a.color === b.color && a.mode === b.mode

const pageVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden'

/**
 * Owns the one piece of theme state — { color, mode } — and keeps <html>, the
 * stored choice and every open tab in step with it.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme)
  const [autoCycle, setAutoCycleState] = useState(readAutoCycle)
  const [visible, setVisible] = useState(pageVisible)

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
      if (event.key === AUTO_CYCLE_STORAGE_KEY) setAutoCycleState(parseAutoCycle(event.newValue))
    }

    const handleVisibility = () => setVisible(pageVisible())

    // Restored from the back/forward cache: the choice may have changed since.
    const handlePageShow = (event) => {
      if (event.persisted) adopt(readStoredTheme())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  // Auto-cycle: move to the next preset after AUTO_CYCLE_MS. The timer restarts
  // whenever the colour changes (a pick, or another tab), and waits while the
  // tab is hidden so a background tab does not churn through colours.
  useEffect(() => {
    if (!autoCycle || !visible) return undefined
    const timer = setTimeout(() => {
      setTheme((current) => ({ ...current, color: nextPresetColor(current.color) }))
    }, AUTO_CYCLE_MS)
    return () => clearTimeout(timer)
  }, [autoCycle, visible, theme.color])

  const setAutoCycle = useCallback((enabled) => {
    const next = Boolean(enabled)
    setAutoCycleState(next)
    writeAutoCycle(next)
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
    () => ({ color: theme.color, mode: theme.mode, autoCycle, setColor, setMode, toggleMode, setAutoCycle }),
    [theme, autoCycle, setColor, setMode, toggleMode, setAutoCycle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
