import Mascot from '../Mascot'

const PELLETS = 32

function PelletRow() {
  return (
    <div className="absolute inset-0 flex items-center justify-between px-6">
      {Array.from({ length: PELLETS }, (_, i) => (
        <span key={i} className="h-[3px] w-[3px] shrink-0 rounded-full bg-dot shadow-glow-dot" />
      ))}
    </div>
  )
}

/**
 * The timeline's line, its pellets and the mascot that runs along it eating
 * them; they come back a little way behind him.
 *
 * Drawn in two layers so the moving cards' nodes sit between them:
 *   layer="track"  — the glowing line and the pellets (under the cards)
 *   layer="runner" — the mascot (over the cards)
 * Both share one 18s CSS timeline (transform only), so they stay in step;
 * `paused` freezes them. Under prefers-reduced-motion it is a still line of
 * pellets with the mascot at the start. Decoration only.
 */
function TimelineChase({ layer, paused = false }) {
  const pause = paused ? 'anim-paused' : ''

  if (layer === 'runner') {
    return (
      <div aria-hidden="true" className={`pointer-events-none relative h-5 w-full overflow-hidden ${pause}`}>
        <div className="absolute inset-0 motion-safe:animate-tl-run">
          <Mascot size={18} className="absolute top-1/2 -ml-3.5 -translate-y-1/2 motion-reduce:ml-1" />
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none relative h-5 w-full overflow-hidden ${pause}`}>
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-wall shadow-glow-wall" />

      {/* Pellets still ahead of him */}
      <div className="absolute inset-0 overflow-hidden motion-safe:animate-tl-run">
        <div className="absolute inset-0 motion-safe:animate-tl-run-counter">
          <PelletRow />
        </div>
      </div>

      {/* Pellets that have come back behind him */}
      <div className="absolute inset-0 -translate-x-full overflow-hidden motion-safe:animate-tl-trail">
        <div className="absolute inset-0 translate-x-full motion-safe:animate-tl-trail-counter">
          <PelletRow />
        </div>
      </div>
    </div>
  )
}

export default TimelineChase
