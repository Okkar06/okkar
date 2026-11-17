import { normalizeHex } from './color.js'
import { PALETTE_VERSION } from './palette.js'
import { DEFAULT_THEME, THEME_MODES, findPreset } from './presets.js'

/**
 * Persistence for the theme choice. The stored record also carries the derived
 * custom properties, so public/theme-init.js can paint the right colours
 * before the app bundle has loaded — without duplicating the palette maths.
 *
 * Everything read back is validated: storage can be edited by hand, shared by
 * an older build, or blocked entirely, and none of that may break the page.
 */
export const THEME_STORAGE_KEY = 'okkar-theme'

// Written by builds that only had a dark/light switch.
const LEGACY_MODE_KEY = 'color-mode'

const isMode = (value) => THEME_MODES.includes(value)

/**
 * Coerces anything into a valid { color, mode } theme. Only the picker's
 * presets are valid colours, so a custom colour saved by an older build
 * falls back to the default instead of lingering with no way to re-pick it.
 */
export function sanitizeTheme(candidate) {
  const color = findPreset(normalizeHex(candidate?.color))?.color ?? DEFAULT_THEME.color
  const mode = isMode(candidate?.mode) ? candidate.mode : DEFAULT_THEME.mode
  return { color, mode }
}

export function parseStoredTheme(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return sanitizeTheme(parsed)
  } catch {
    return null
  }
}

export function readStoredTheme() {
  try {
    const stored = parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY))
    if (stored) return stored

    const legacyMode = localStorage.getItem(LEGACY_MODE_KEY)
    if (isMode(legacyMode)) return { ...DEFAULT_THEME, mode: legacyMode }
  } catch {
    // Storage can be blocked (private mode, strict settings): use the default.
  }
  return { ...DEFAULT_THEME }
}

export function writeStoredTheme(theme, palette) {
  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        v: PALETTE_VERSION,
        color: theme.color,
        mode: theme.mode,
        vars: palette.vars,
        themeColor: palette.themeColor,
      }),
    )
    localStorage.removeItem(LEGACY_MODE_KEY)
  } catch {
    // Not being able to remember the choice is not an error worth surfacing.
  }
}
