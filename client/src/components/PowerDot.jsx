import { useReducedMotion } from 'framer-motion'

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
  red: 'bg-ghost-red',
  pink: 'bg-ghost-pink',
  cyan: 'bg-ghost-cyan',
  orange: 'bg-ghost-orange',
}

/**
 * PowerDot — a maze pellet. `power` makes it a larger pulsing power pellet.
 * Decorative by default; pass `label` only when it carries meaning.
 */
function PowerDot({ size = 'md', power = false, tone = 'dot', className = '', label, style }) {
  const shouldReduceMotion = useReducedMotion()
  const pulse = power && !shouldReduceMotion ? 'animate-dot-pulse' : ''

  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      className={`pointer-events-none inline-block shrink-0 rounded-full ${
        TONES[tone] ?? TONES.dot
      } ${SIZES[power ? 'lg' : size] ?? SIZES.md} ${pulse} ${className}`}
      style={style}
    />
  )
}

export default PowerDot
