/**
 * The colour bar's options. Each preset is ONE seed colour — the whole cabinet
 * (background, surfaces, walls, glows, text) is derived from it in palette.js.
 * Add a colour here and it appears in the picker; nothing else needs to change.
 */
export const THEME_PRESETS = [
  { id: 'blue', label: 'Maze Blue', color: '#3b82f6' },
  { id: 'violet', label: 'Warp Violet', color: '#8b5cf6' },
  { id: 'pink', label: 'Bubblegum', color: '#ec4899' },
  { id: 'red', label: 'Cherry Bomb', color: '#ef4444' },
  { id: 'orange', label: 'Tangerine', color: '#f97316' },
  { id: 'green', label: 'Extra Life', color: '#22c55e' },
  { id: 'cyan', label: 'Ice Cyan', color: '#06b6d4' },
]

export const DEFAULT_THEME = Object.freeze({ color: THEME_PRESETS[0].color, mode: 'dark' })

export const THEME_MODES = ['dark', 'light']

/** The preset a colour belongs to, or null for a custom pick. */
export function findPreset(color) {
  return THEME_PRESETS.find((preset) => preset.color === color) ?? null
}

/** How long each colour stays before auto-cycle moves to the next preset. */
export const AUTO_CYCLE_MS = 30_000

/** The preset after `color`, wrapping round (the first one if it is not a preset). */
export function nextPresetColor(color) {
  const index = THEME_PRESETS.findIndex((preset) => preset.color === color)
  return THEME_PRESETS[(index + 1) % THEME_PRESETS.length].color
}
