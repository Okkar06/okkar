// Static class names (never built at runtime) so Tailwind can see them.
const DELAYS = ['', '[animation-delay:150ms]', '[animation-delay:300ms]']

/**
 * PelletLoader — the pending indicator: three pellets blanking out in turn,
 * as if being eaten. Drawn in the current text colour. Decorative; pair it
 * with visible text ("SENDING") or an aria-busy region.
 */
function PelletLoader({ className = '' }) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center gap-1 ${className}`}>
      {DELAYS.map((delay) => (
        <span
          key={delay}
          className={`h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pellet-wave ${delay}`}
        />
      ))}
    </span>
  )
}

export default PelletLoader
