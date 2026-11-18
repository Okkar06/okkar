/**
 * Ghost — an original drifting creature: soft dome, three-wave hem, visor brow
 * and a single antenna bead. Four colourways from the theme tokens, plus a
 * frightened one (`scared`) with a worried face, for after a power pellet.
 * Decoration only: aria-hidden and never focusable. The drift is CSS and
 * stops under prefers-reduced-motion.
 */
const FILLS = {
  red: 'fill-ghost-red',
  pink: 'fill-ghost-pink',
  cyan: 'fill-ghost-cyan',
  orange: 'fill-ghost-orange',
  scared: 'fill-ghost-scared',
}

const STROKES = {
  red: 'stroke-ghost-red',
  pink: 'stroke-ghost-pink',
  cyan: 'stroke-ghost-cyan',
  orange: 'stroke-ghost-orange',
  scared: 'stroke-ghost-scared',
}

const DRIFTS = {
  float: 'motion-safe:animate-ghost-float',
  drift: 'motion-safe:animate-ghost-drift',
  none: '',
}

function Ghost({ color = 'red', size = 40, drift = 'float', delay = 0, className = '' }) {
  const fill = FILLS[color] ?? FILLS.red
  const stroke = STROKES[color] ?? STROKES.red

  return (
    <svg
      viewBox="0 0 56 64"
      width={size}
      height={size * (64 / 56)}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none shrink-0 ${DRIFTS[drift] ?? DRIFTS.float} ${className}`}
      // Per-instance offset so a crew of ghosts never bobs in unison.
      style={delay ? { animationDelay: `${delay}s` } : undefined}
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

      {color === 'scared' ? (
        <>
          {/* Worried face: small eyes and a wobbling mouth */}
          <rect x="17" y="29" width="6" height="6" rx="1" className="fill-eye" />
          <rect x="33" y="29" width="6" height="6" rx="1" className="fill-eye" />
          <path
            d="M12 46 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4"
            fill="none"
            className="stroke-eye"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Eyes */}
          <circle cx="20" cy="33" r="7" className="fill-eye" />
          <circle cx="37" cy="33" r="7" className="fill-eye" />
          <circle cx="22" cy="34" r="3.2" className="fill-on-mascot" />
          <circle cx="39" cy="34" r="3.2" className="fill-on-mascot" />
        </>
      )}
    </svg>
  )
}

export default Ghost
