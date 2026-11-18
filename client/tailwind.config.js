/** @type {import('tailwindcss').Config} */

// Every colour is a CSS custom property (a channel triplet such as
// `59 130 246`) that src/theme/palette.js derives from the colour picked in
// the colour bar. This file only gives those tokens utility names. Components
// must use these names — never a raw hex / rgb() value.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`

// ── Footer chase: one 10s loop shared by every part (components/FooterChase.jsx).
// The mascot walks the divider from 5% to 55% of the loop; each pellet blinks
// out at the moment the mascot's mouth reaches it. The last one is the power
// pellet: at 55% the ghost turns frightened, flees, and is caught at 70% (+200).
// Everything is back in its starting place by 92%, then a short pause.
// The 0% and 100% frames are identical, and are the still frame shown under
// prefers-reduced-motion.
export const CHASE_EATEN_AT = [12.5, 21, 29.5, 38, 46.5, 55]
const chasePellet = (at) => ({
  '0%': { opacity: '1', transform: 'scale(1)' },
  [`${at}%`]: { opacity: '1', transform: 'scale(1)' },
  [`${at + 0.8}%`]: { opacity: '0', transform: 'scale(0.2)' },
  '86%': { opacity: '0', transform: 'scale(0.2)' },
  '90%, 100%': { opacity: '1', transform: 'scale(1)' },
})
const chasePelletKeyframes = Object.fromEntries(
  CHASE_EATEN_AT.map((at, index) => [`chase-pellet-${index}`, chasePellet(at)]),
)
const chasePelletAnimations = Object.fromEntries(
  CHASE_EATEN_AT.map((_, index) => [`chase-pellet-${index}`, `chase-pellet-${index} 10s linear infinite`]),
)

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-mode="dark"]'],
  theme: {
    extend: {
      screens: {
        // Laptop-height screens (1366×768 and the like): the projects
        // timeline tightens up so the whole section fits on one screen.
        short: { raw: '(max-height: 820px)' },
      },
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
          // A frightened ghost (after a power pellet). Steers clear of the
          // picked colour's hue so it never blends into the walls.
          scared: token('--c-ghost-scared'),
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

        // ── Hero arcade sprites (components/HeroArcade.jsx) ──
        // A ghost slowly patrolling side to side.
        'ghost-sway': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(18px, 0, 0)' },
        },
        // Power pellets breathing on and off. Ends lit (reduced-motion frame).
        'pellet-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        // Mostly a dim glint, now and then a bright twinkle.
        twinkle: {
          '0%, 84%, 100%': { opacity: '0.35', transform: 'scale(0.7)' },
          '91%': { opacity: '1', transform: 'scale(1.2)' },
        },
        // Now and then a ghost glides across the right side and off screen.
        // Ends hidden, so it never shows under reduced motion.
        'ghost-flyby': {
          '0%': { opacity: '0', transform: 'translate3d(0, 0, 0)' },
          '4%': { opacity: '1', transform: 'translate3d(4vw, -6px, 0)' },
          '32%': { opacity: '1', transform: 'translate3d(55vw, 6px, 0)' },
          '33%, 100%': { opacity: '0', transform: 'translate3d(55vw, 0, 0)' },
        },

        // ── Footer chase (see CHASE_EATEN_AT above) ──
        // On full-width wrappers, so a percentage is a share of the track.
        'chase-mascot': {
          '0%, 5%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
          '55%': { opacity: '1', transform: 'translate3d(72%, 0, 0)' },
          '70%': { opacity: '1', transform: 'translate3d(90%, 0, 0)' },
          '78%': { opacity: '1', transform: 'translate3d(92%, 0, 0)' },
          '82%': { opacity: '0', transform: 'translate3d(92%, 0, 0)' },
          '86%': { opacity: '0', transform: 'translate3d(0, 0, 0)' },
          '92%, 100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'chase-ghost': {
          '0%, 55%': { opacity: '1', transform: 'translate3d(88%, 0, 0)' },
          '55.5%, 88%': { opacity: '0', transform: 'translate3d(88%, 0, 0)' },
          '92%, 100%': { opacity: '1', transform: 'translate3d(88%, 0, 0)' },
        },
        'chase-scared': {
          '0%, 55%': { opacity: '0', transform: 'translate3d(88%, 0, 0)' },
          '55.5%': { opacity: '1', transform: 'translate3d(88%, 0, 0)' },
          '70%': { opacity: '1', transform: 'translate3d(96%, 0, 0)' },
          '70.5%, 100%': { opacity: '0', transform: 'translate3d(88%, 0, 0)' },
        },
        'chase-score': {
          '0%, 70%': { opacity: '0', transform: 'translate3d(0, 4px, 0) scale(0.6)' },
          '72%': { opacity: '1', transform: 'translate3d(0, -4px, 0) scale(1.1)' },
          '80%': { opacity: '1', transform: 'translate3d(0, -10px, 0) scale(1)' },
          '84%, 100%': { opacity: '0', transform: 'translate3d(0, -14px, 0) scale(1)' },
        },
        ...chasePelletKeyframes,

        // ── Projects timeline chomper (components/timeline/TimelineChase.jsx) ──
        // All on full-width layers, so 100% is the timeline's width. The
        // runner and the "ahead" window move together; the window's content
        // moves back by the same amount, so the pellets stay put and vanish
        // as the runner reaches them. The "behind" window trails 160px back,
        // so pellets reappear behind him.
        'tl-run': {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(100%, 0, 0)' },
        },
        'tl-run-counter': {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-100%, 0, 0)' },
        },
        'tl-trail': {
          from: { transform: 'translate3d(calc(-100% - 160px), 0, 0)' },
          to: { transform: 'translate3d(-160px, 0, 0)' },
        },
        'tl-trail-counter': {
          from: { transform: 'translate3d(calc(100% + 160px), 0, 0)' },
          to: { transform: 'translate3d(160px, 0, 0)' },
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
        'ghost-sway': 'ghost-sway 6s ease-in-out infinite',
        'pellet-blink': 'pellet-blink 1.6s ease-in-out infinite',
        twinkle: 'twinkle 5s ease-in-out infinite',
        'ghost-flyby': 'ghost-flyby 13s linear 3s infinite backwards',
        'chase-mascot': 'chase-mascot 10s linear infinite',
        'chase-ghost': 'chase-ghost 10s linear infinite',
        'chase-scared': 'chase-scared 10s linear infinite',
        'chase-score': 'chase-score 10s linear infinite',
        ...chasePelletAnimations,
        'tl-run': 'tl-run 18s linear infinite',
        'tl-run-counter': 'tl-run-counter 18s linear infinite',
        'tl-trail': 'tl-trail 18s linear infinite',
        'tl-trail-counter': 'tl-trail-counter 18s linear infinite',
      },
    },
  },
  plugins: [],
}
