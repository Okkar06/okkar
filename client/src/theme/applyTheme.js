import { derivePalette } from './palette.js'

function setThemeColorMeta(color) {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.append(meta)
  }
  meta.setAttribute('content', color)
}

/**
 * Paints a theme: derives the palette from the picked colour and writes every
 * token onto <html> as a CSS custom property. This is the only place the app
 * touches colour at runtime; the CSS transition on :root (styles/tokens.css)
 * turns the change into a ~300 ms cross-fade.
 */
export function applyTheme(theme, root = document.documentElement) {
  const palette = derivePalette(theme.color, theme.mode)

  root.setAttribute('data-mode', palette.mode)
  for (const [name, value] of Object.entries(palette.vars)) {
    root.style.setProperty(name, value)
  }
  setThemeColorMeta(palette.themeColor)

  return palette
}
