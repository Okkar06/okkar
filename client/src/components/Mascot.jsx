/**
 * Mascot — an original round chomping character: warm yellow disc, a single
 * forward-looking eye and a developer headset (band + ear cup + mic boom).
 * Purely decorative: it is never user-controlled and never focusable.
 *
 * The chomp is two half-discs rotating about the centre — a CSS keyframe on
 * `transform` only, so a dozen mascots cost no JavaScript. It holds still
 * (slightly open) when `chomping` is off or the visitor prefers reduced
 * motion.
 */
const JAW = 'origin-center fill-mascot'

function Mascot({ size = 48, facing = 'right', chomping = true, className = '' }) {
  const upper = chomping ? 'motion-safe:animate-chomp-top' : ''
  const lower = chomping ? 'motion-safe:animate-chomp-bottom' : ''

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none shrink-0 ${facing === 'left' ? '-scale-x-100' : ''} ${className}`}
    >
      <path d="M32 32 L58 32 A26 26 0 0 0 6 32 Z" className={`${JAW} -rotate-[4deg] ${upper}`} />
      <path d="M32 32 L58 32 A26 26 0 0 1 6 32 Z" className={`${JAW} rotate-[4deg] ${lower}`} />

      {/* Headset band + ear cup + mic boom — the mascot's own trademark */}
      <path
        d="M9 29 A23 23 0 0 1 49 15"
        fill="none"
        className="stroke-wall"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="2" y="25" width="10" height="15" rx="5" className="fill-wall" />
      <path
        d="M12 36 q9 5 13 11"
        fill="none"
        className="stroke-wall"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="25" cy="47" r="2.6" className="fill-ghost-cyan" />

      {/* Eye */}
      <circle cx="37" cy="19" r="3.6" className="fill-on-mascot" />
      <circle cx="38.3" cy="17.8" r="1.2" className="fill-eye" />
    </svg>
  )
}

export default Mascot
