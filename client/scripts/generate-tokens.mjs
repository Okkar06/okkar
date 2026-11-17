/**
 * Regenerates src/styles/tokens.css from the theme engine.
 *
 *   npm run theme:tokens
 *
 * tokens.css is the static fallback for the default theme: it is what paints
 * before JavaScript runs (and if it never does). The values are NOT edited by
 * hand — they come from derivePalette(), and a unit test fails if the file
 * drifts from the engine.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { derivePalette, THEME_VARIABLES } from '../src/theme/palette.js'
import { DEFAULT_THEME } from '../src/theme/presets.js'

const dark = derivePalette(DEFAULT_THEME.color, 'dark').vars
const light = derivePalette(DEFAULT_THEME.color, 'light').vars

const declarations = (vars) =>
  THEME_VARIABLES.map((name) => `  ${name}: ${vars[name]};`).join('\n')

// Registering each token as a list of numbers is what lets the browser
// interpolate it, so a theme switch cross-fades instead of snapping — including
// inside gradients and shadows, which ordinary colour transitions cannot reach.
const registrations = THEME_VARIABLES.map(
  (name) =>
    `@property ${name} {\n  syntax: '<number>+';\n  inherits: true;\n  initial-value: ${dark[name]};\n}`,
).join('\n\n')

const transitions = THEME_VARIABLES.map(
  (name) => `    ${name} var(--theme-transition) ease`,
).join(',\n')

const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Source of truth: src/theme/palette.js. Regenerate with \`npm run theme:tokens\`.
 *
 * Static fallback for the default theme (seed ${DEFAULT_THEME.color}). At runtime the
 * theme engine overwrites these custom properties on <html> from whichever
 * colour is picked in the colour bar.
 */

${registrations}

:root,
[data-mode='dark'] {
  color-scheme: dark;
${declarations(dark)}
}

[data-mode='light'] {
  color-scheme: light;
${declarations(light)}
}

:root {
  --theme-transition: 300ms;
  transition:
${transitions};
}
`

const target = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
writeFileSync(target, css)
console.log(`Wrote ${target}`)
