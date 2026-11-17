/** @type {import('tailwindcss').Config} */

// Every colour is a CSS custom property (a channel triplet such as
// `59 130 246`) that src/theme/palette.js derives from the colour picked in
// the colour bar. This file only gives those tokens utility names. Components
// must use these names — never a raw hex / rgb() value.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "'Courier New'", 'monospace'],
        sans: ["'Inter Variable'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      // The pixel font's type scale. It is a wide, low-resolution face, so it
      // never goes below 8px, and anything a visitor has to read or press is
      // at least `pixel-sm`. Use these instead of arbitrary text-[…] sizes.
      fontSize: {
        'pixel-xs': ['0.5rem', { lineHeight: '1.6' }], // 8px — HUD decoration, tags
        'pixel-sm': ['0.625rem', { lineHeight: '1.7' }], // 10px — nav, buttons, labels
        'pixel-md': ['0.75rem', { lineHeight: '1.8' }], // 12px — card titles
        // The hero name: fluid, so it fills a phone without overflowing it.
        'pixel-hero': ['clamp(1.6rem, 8.5vw, 5rem)', { lineHeight: '1.35' }],
      },
      colors: {
        // Cabinet / surfaces
        void: token('--c-void'),
        panel: token('--c-panel'),
        floor: token('--c-floor'),
        // Maze walls (borders + accents) and their neon halo
        wall: token('--c-wall'),
        'on-wall': token('--c-on-wall'),
        glow: token('--c-glow'),
        // Pellets + HUD
        dot: token('--c-dot'),
        hud: token('--c-hud'),
        // Neon accent text and the one filled call to action (follows the theme)
        neon: token('--c-neon'),
        'on-neon': token('--c-on-neon'),
        // Mascot
        mascot: token('--c-mascot'),
        'mascot-ink': token('--c-mascot-ink'),
        'on-mascot': token('--c-on-mascot'),
        eye: token('--c-eye'),
        // Ghost crew
        ghost: {
          red: token('--c-ghost-red'),
          pink: token('--c-ghost-pink'),
          cyan: token('--c-ghost-cyan'),
          orange: token('--c-ghost-orange'),
        },
        // Type
        ink: token('--c-ink'),
        'ink-dim': token('--c-ink-dim'),
        // Focus ring
        focus: token('--c-focus'),
        // Meaning, not character: use these for state, the ghost names for art.
        danger: token('--c-ghost-red'),
        success: token('--c-ghost-cyan'),
      },
      borderRadius: {
        maze: '1.25rem',
        tile: '0.625rem',
      },
      borderWidth: {
        maze: '3px',
      },
      boxShadow: {
        // --glow-strength (index.css) dims every halo in daylight mode.
        'glow-wall':
          '0 0 0 1px rgb(var(--c-wall) / 0.35), 0 0 12px rgb(var(--c-glow) / calc(0.5 * var(--glow-strength)))',
        'glow-wall-lg':
          '0 0 0 1px rgb(var(--c-wall) / 0.5), 0 0 18px rgb(var(--c-glow) / calc(0.65 * var(--glow-strength))), 0 0 44px rgb(var(--c-glow) / calc(0.32 * var(--glow-strength)))',
        'glow-mascot':
          '0 0 14px rgb(var(--c-mascot) / calc(0.6 * var(--glow-strength))), 0 0 34px rgb(var(--c-mascot) / calc(0.28 * var(--glow-strength)))',
        'glow-neon':
          '0 0 14px rgb(var(--c-neon) / calc(0.6 * var(--glow-strength))), 0 0 34px rgb(var(--c-neon) / calc(0.28 * var(--glow-strength)))',
        'glow-dot': '0 0 8px rgb(var(--c-dot) / calc(0.75 * var(--glow-strength)))',
      },
      dropShadow: {
        'glow-mascot': [
          '0 0 6px rgb(var(--c-mascot) / calc(0.75 * var(--glow-strength)))',
          '0 0 16px rgb(var(--c-mascot) / calc(0.35 * var(--glow-strength)))',
        ],
        'glow-neon': [
          '0 0 6px rgb(var(--c-neon) / calc(0.75 * var(--glow-strength)))',
          '0 0 16px rgb(var(--c-neon) / calc(0.35 * var(--glow-strength)))',
        ],
        'glow-wall': ['0 0 5px rgb(var(--c-glow) / calc(0.7 * var(--glow-strength)))'],
      },
      letterSpacing: {
        hud: '0.22em',
      },
      keyframes: {
        // Transform / opacity only — never layout properties.
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'dot-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.45)', opacity: '1' },
        },
        'ghost-float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -9px, 0)' },
        },
        'ghost-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '33%': { transform: 'translate3d(7px, -6px, 0)' },
          '66%': { transform: 'translate3d(-6px, 5px, 0)' },
        },
        'mascot-run': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -4px, 0)' },
        },
        'hud-flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '95%': { opacity: '0.55' },
          '97%': { opacity: '1' },
        },
        // The mascot's jaws: two half-discs rotating about the centre.
        'chomp-top': {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(-22deg)' },
        },
        'chomp-bottom': {
          '0%, 100%': { transform: 'rotate(4deg)' },
          '50%': { transform: 'rotate(22deg)' },
        },
        // Hero chase lane. The window slides right while the pellet row
        // inside it slides left by the same amount, so the pellets stand
        // still and the window's edge "eats" them. 2.125rem = the runner.
        'chase-window': {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(calc(100% - 2.125rem), 0, 0)' },
        },
        'chase-counter': {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(calc(-100% + 2.125rem), 0, 0)' },
        },
        // Pending indicator: pellets blank out one after another.
        'pellet-wave': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '40%': { opacity: '0.15', transform: 'scale(0.4)' },
        },
        // One short sideways nudge when a validation error appears.
        nudge: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '30%': { transform: 'translate3d(-3px, 0, 0)' },
          '65%': { transform: 'translate3d(3px, 0, 0)' },
        },
        // Arrival of a result panel (form sent, 404, crash screen).
        pop: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // First paint of the hero.
        rise: {
          from: { opacity: '0', transform: 'translate3d(0, 22px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        blink: 'blink 0.9s step-end infinite',
        'dot-pulse': 'dot-pulse 1.4s ease-in-out infinite',
        'ghost-float': 'ghost-float 3.4s ease-in-out infinite',
        'ghost-drift': 'ghost-drift 7s ease-in-out infinite',
        'mascot-run': 'mascot-run 0.5s ease-in-out infinite',
        'hud-flicker': 'hud-flicker 6s linear infinite',
        'chomp-top': 'chomp-top 0.34s ease-in-out infinite',
        'chomp-bottom': 'chomp-bottom 0.34s ease-in-out infinite',
        'chase-window': 'chase-window 6s linear infinite',
        'chase-counter': 'chase-counter 6s linear infinite',
        'pellet-wave': 'pellet-wave 0.9s ease-in-out infinite',
        nudge: 'nudge 0.28s ease-in-out 1',
        pop: 'pop 0.3s ease-out 1 both',
        rise: 'rise 0.6s ease-out 1 both',
      },
    },
  },
  plugins: [],
}
