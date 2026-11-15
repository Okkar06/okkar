import { useReducedMotion } from 'framer-motion'

/**
 * Ghost — an original drifting creature: soft dome, three-wave hem, visor brow
 * and a single antenna bead. Four colourways from the theme tokens.
 * Decoration only: aria-hidden and never focusable.
 */
const FILLS = {
  red: 'fill-ghost-red',
  pink: 'fill-ghost-pink',
  cyan: 'fill-ghost-cyan',
  orange: 'fill-ghost-orange',
}

const STROKES = {
  red: 'stroke-ghost-red',
  pink: 'stroke-ghost-pink',
  cyan: 'stroke-ghost-cyan',
  orange: 'stroke-ghost-orange',
}

const DRIFTS = {
  float: 'animate-ghost-float',
  drift: 'animate-ghost-drift',
  none: '',
}

function Ghost({ color = 'red', size = 40, drift = 'float', delay = 0, className = '', style }) {
  const shouldReduceMotion = useReducedMotion()
  const fill = FILLS[color] ?? FILLS.red
  const stroke = STROKES[color] ?? STROKES.red
  const motionClass = shouldReduceMotion ? '' : (DRIFTS[drift] ?? DRIFTS.float)

  return (
    <svg
      viewBox="0 0 56 64"
      width={size}
      height={size * (64 / 56)}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none shrink-0 ${motionClass} ${className}`}
      style={{ animationDelay: shouldReduceMotion ? undefined : `${delay}s`, ...style }}
    >
      {/* Antenna */}
      <path d="M28 10 V3" fill="none" className={stroke} strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="2.5" r="2.5" className="fill-dot" />

      {/* Body: dome + three-wave hem */}
      <path
        d="M4 34 a24 24 0 0 1 48 0 V56 q-6 6-12 0 q-6-6-12 0 q-6 6-12 0 q-6-6-12 0 Z"
        className={fill}
      />

      {/* Visor brow */}
      <path
        d="M11 28 q17-9 34 0"
        fill="none"
        className="stroke-on-mascot"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Eyes */}
      <circle cx="20" cy="33" r="7" className="fill-eye" />
      <circle cx="37" cy="33" r="7" className="fill-eye" />
      <circle cx="22" cy="34" r="3.2" className="fill-on-mascot" />
      <circle cx="39" cy="34" r="3.2" className="fill-on-mascot" />
    </svg>
  )
}

export default Ghost
