# Client

React + Vite + Tailwind. See the root README for setup.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Production build into `dist/`. |
| `npm test` | Vitest (jsdom + Testing Library). `npm run test:watch` to watch. |
| `npm run lint` | ESLint. |
| `npm run theme:tokens` | Regenerate `src/styles/tokens.css` from the theme engine. |

## Layout

```
src/
  data/content.js   everything the site says
  theme/            the theme engine (the only place colour is defined)
  styles/           tokens.css (generated) and the loader styles
  components/       reusable UI
  sections/         the page sections
  lib/              API client, validation, small helpers
  hooks/
```

## How theming works

The colour bar picks **one** colour. `src/theme/palette.js` derives the whole
palette from it (page background, card and input surfaces, walls/borders,
glow, text, focus ring) and writes each value onto `<html>` as a CSS custom
property (`--c-void`, `--c-wall`, ...). Tailwind maps those to class names
(`bg-void`, `border-wall`, ...) in `tailwind.config.js`.

- **Add or change a colour option:** edit `src/theme/presets.js`. Nothing else.
- **Change how shades are derived:** edit `src/theme/palette.js`, bump
  `PALETTE_VERSION`, then run `npm run theme:tokens`.
- **Use a colour in a component:** use a token class (`text-ink`, `bg-panel`,
  `text-danger`) or `rgb(var(--c-wall) / 0.4)` in CSS. Never a hex or `rgb()`
  literal: a test fails if one appears outside `src/theme`.

Guarantees, each enforced by a test:

- Text and controls meet WCAG AA on every surface, for every preset and a
  sweep of custom colours, in both dark and light mode.
- `tokens.css` (the fallback painted before JavaScript runs) matches the engine.
- The choice persists, syncs across tabs, and is replayed before first paint
  by `public/theme-init.js`, so there is no flash of the wrong theme.

## Animation rules

- Decorative loops (mascot, ghosts, pellets) are CSS keyframes on `transform`
  and `opacity`, applied with `motion-safe:` so they stop under
  `prefers-reduced-motion`.
- Scroll reveals use the shared `Reveal` components (Framer Motion, loaded via
  `LazyMotion`; use `m.div`, not `motion.div`).
- Pressable elements take the `chomp` class for press feedback.
