import { useReducedMotion } from 'framer-motion'

/**
 * DotTrail — a line of pellets. `eaten` blanks out the leading dots, which is
 * how the scroll-progress rail shows how far down the page the reader is.
 * Decoration only: aria-hidden, pointer-events disabled.
 */
function DotTrail({
  count = 12,
  eaten = 0,
  orientation = 'horizontal',
  gap = 'gap-2',
  dotClass = 'h-1.5 w-1.5',
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion()
  const layout = orientation === 'vertical' ? 'flex-col' : 'flex-row'

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none flex items-center ${layout} ${gap} ${className}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const isEaten = i < eaten
        return (
          <span
            key={i}
            className={`shrink-0 rounded-full bg-dot shadow-glow-dot ${dotClass}`}
            style={{
              opacity: isEaten ? 0 : 0.9,
              transform: isEaten ? 'scale(0.2)' : 'scale(1)',
              transition: shouldReduceMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease',
            }}
          />
        )
      })}
    </span>
  )
}

export default DotTrail
