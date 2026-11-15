/**
 * BonusIcon — original arcade "bonus token" glyphs used as skill markers.
 * Simple geometric shapes drawn from scratch; nothing is traced from any
 * existing game's artwork.
 */
// Both `fill` and `text` are set so that paths drawn with
// stroke="currentColor" match the filled shapes.
const COLORS = {
  dot: 'fill-dot text-dot',
  mascot: 'fill-mascot text-mascot',
  red: 'fill-ghost-red text-ghost-red',
  pink: 'fill-ghost-pink text-ghost-pink',
  cyan: 'fill-ghost-cyan text-ghost-cyan',
  orange: 'fill-ghost-orange text-ghost-orange',
}

const SHAPES = {
  // Twin orbs on a stem — the "double pellet" bonus
  twinOrb: (
    <>
      <path d="M12 4 q6 3 6 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="15.5" r="4.5" />
      <circle cx="16.5" cy="16.5" r="4" />
    </>
  ),
  // Chip / module
  chip: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" className="fill-void" />
    </>
  ),
  // Four-point star
  star: <path d="M12 2 l2.6 7.4 L22 12 l-7.4 2.6 L12 22 l-2.6-7.4 L2 12 l7.4-2.6 Z" />,
  // Shield
  shield: <path d="M12 2 l8 3.2 v6.4 q0 6-8 10.4 q-8-4.4-8-10.4 V5.2 Z" />,
  // Bolt
  bolt: <path d="M13.5 2 L5 13 h5 l-1.5 9 L19 10 h-5.5 Z" />,
  // Key
  key: (
    <>
      <circle cx="8" cy="8" r="5" />
      <circle cx="8" cy="8" r="1.8" className="fill-void" />
      <path d="M11.5 11.5 L21 21 M17 18 l2-2 M14.5 15.5 l2-2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  ),
  // Stacked layers
  layers: (
    <>
      <path d="M12 3 L21 8 L12 13 L3 8 Z" />
      <path d="M12 15 L19.4 10.9 L21 11.8 L12 17 L3 11.8 L4.6 10.9 Z" opacity="0.65" />
      <path d="M12 19 L19.4 14.9 L21 15.8 L12 21 L3 15.8 L4.6 14.9 Z" opacity="0.4" />
    </>
  ),
  // Cube / box
  cube: (
    <>
      <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" />
      <path d="M12 12 L21 7 M12 12 V22 M12 12 L3 7" stroke="currentColor" strokeWidth="1.4" className="fill-none" opacity="0.5" />
    </>
  ),
}

function BonusIcon({ shape = 'chip', color = 'dot', size = 24, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none shrink-0 ${COLORS[color] ?? COLORS.dot} ${className}`}
    >
      {SHAPES[shape] ?? SHAPES.chip}
    </svg>
  )
}

export default BonusIcon
