/** @type {import('tailwindcss').Config} */

// Every themeable colour is a CSS custom property declared in src/index.css
// (channel triplets, e.g. `59 130 246`) so the same token name works in both
// the night-arcade and arcade-daylight modes. Components must only ever use
// these token names — never raw hex values.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "'Courier New'", 'monospace'],
        sans: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Cabinet / surfaces
        void: token('--c-void'),
        panel: token('--c-panel'),
        floor: token('--c-floor'),
        // Maze walls
        wall: token('--c-wall'),
        'wall-soft': token('--c-wall-soft'),
        // Pellets + HUD
        dot: token('--c-dot'),
        hud: token('--c-hud'),
        // Mascot
        mascot: token('--c-mascot'),
        'mascot-deep': token('--c-mascot-deep'),
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
      },
      borderRadius: {
        maze: '1.25rem',
        tile: '0.625rem',
      },
      borderWidth: {
        maze: '3px',
        'maze-thick': '4px',
      },
      boxShadow: {
        'glow-wall': '0 0 0 1px rgb(var(--c-wall) / 0.35), 0 0 12px rgb(var(--c-wall) / 0.45)',
        'glow-wall-lg':
          '0 0 0 1px rgb(var(--c-wall) / 0.5), 0 0 18px rgb(var(--c-wall) / 0.6), 0 0 44px rgb(var(--c-wall) / 0.3)',
        'glow-mascot': '0 0 14px rgb(var(--c-mascot) / 0.6), 0 0 34px rgb(var(--c-mascot) / 0.28)',
        'glow-dot': '0 0 8px rgb(var(--c-dot) / 0.75)',
        'glow-hud': '0 0 10px rgb(var(--c-hud) / 0.55)',
        tile: 'inset 0 0 0 1px rgb(var(--c-wall) / 0.3)',
      },
      dropShadow: {
        'glow-mascot': ['0 0 6px rgb(var(--c-mascot) / 0.75)', '0 0 16px rgb(var(--c-mascot) / 0.35)'],
        'glow-wall': ['0 0 5px rgb(var(--c-wall) / 0.7)'],
        'glow-dot': ['0 0 4px rgb(var(--c-dot) / 0.8)'],
      },
      letterSpacing: {
        hud: '0.22em',
        'hud-wide': '0.36em',
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
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'scanline-drift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(0, 6px, 0)' },
        },
      },
      animation: {
        blink: 'blink 0.9s step-end infinite',
        'dot-pulse': 'dot-pulse 1.4s ease-in-out infinite',
        'ghost-float': 'ghost-float 3.4s ease-in-out infinite',
        'ghost-drift': 'ghost-drift 7s ease-in-out infinite',
        'mascot-run': 'mascot-run 0.5s ease-in-out infinite',
        'hud-flicker': 'hud-flicker 6s linear infinite',
        marquee: 'marquee 22s linear infinite',
        'scanline-drift': 'scanline-drift 0.5s linear infinite',
      },
    },
  },
  plugins: [],
}
