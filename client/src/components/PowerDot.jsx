const SIZES = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2.5 w-2.5',
  lg: 'h-4 w-4',
}

// Explicit tone classes (never composed at runtime) so Tailwind can see them
// and so two background utilities never fight over specificity.
const TONES = {
  dot: 'bg-dot shadow-glow-dot',
  mascot: 'bg-mascot shadow-glow-mascot',
  wall: 'bg-wall shadow-glow-wall',
  success: 'bg-success',
}

/**
 * PowerDot — a maze pellet. `power` makes it a larger pulsing power pellet
 * (the pulse is CSS and stops under prefers-reduced-motion).
 * Decorative by default; pass `label` only when it carries meaning.
 */
function PowerDot({ size = 'md', power = false, tone = 'dot', className = '', label }) {
  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      className={`pointer-events-none inline-block shrink-0 rounded-full ${TONES[tone] ?? TONES.dot} ${
        SIZES[power ? 'lg' : size] ?? SIZES.md
      } ${power ? 'motion-safe:animate-dot-pulse' : ''} ${className}`}
    />
  )
}

export default PowerDot
