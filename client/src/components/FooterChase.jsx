import { useRef } from 'react'
import { usePlayback } from '../hooks/usePlayback'
import Ghost from './Ghost'
import Mascot from './Mascot'
import PixelSprite from './PixelSprite'

// Where each pellet sits along the track, and its "eaten" animation. The
// timings live in tailwind.config.js (CHASE_EATEN_AT), matched to these
// positions; class names are written out in full so Tailwind can see them.
const PELLETS = [
  { left: 'left-[15%]', animation: 'motion-safe:animate-chase-pellet-0' },
  { left: 'left-[27%]', animation: 'motion-safe:animate-chase-pellet-1' },
  { left: 'left-[39%]', animation: 'motion-safe:animate-chase-pellet-2' },
  { left: 'left-[51%]', animation: 'motion-safe:animate-chase-pellet-3' },
  { left: 'left-[63%]', animation: 'motion-safe:animate-chase-pellet-4' },
]
const POWER_PELLET = { left: 'left-[75%]', animation: 'motion-safe:animate-chase-pellet-5' }

/**
 * FooterChase — the footer divider's little loop: the mascot chomps along,
 * eating the pellets one by one; the last is a power pellet, so the ghost
 * turns frightened and flees, the mascot catches it (+200), the pellets
 * come back and it starts again.
 *
 * One CSS timeline (10s) drives every part, transform and opacity only. It
 * waits until the footer is on screen, pauses offscreen or in a hidden tab,
 * and is a still frame under prefers-reduced-motion. Decoration only.
 */
function FooterChase() {
  const ref = useRef(null)
  const playing = usePlayback(ref)

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="footer-chase"
      data-playing={playing}
      className={`pointer-events-none relative h-6 w-[13.5rem] sm:h-7 sm:w-[18rem] ${playing ? '' : 'anim-paused'}`}
    >
      {/* Pellets */}
      {PELLETS.map((pellet) => (
        <span
          key={pellet.left}
          className={`absolute top-1/2 -mt-[3px] h-1.5 w-1.5 rounded-full bg-dot shadow-glow-dot ${pellet.left} ${pellet.animation}`}
        />
      ))}
      <span className={`absolute top-1/2 -mt-[5px] ${POWER_PELLET.left}`}>
        <span className={`block ${POWER_PELLET.animation}`}>
          <PixelSprite name="pellet" size={10} className="motion-safe:animate-pellet-blink" />
        </span>
      </span>

      {/* The ghost, then its frightened self. Each wrapper spans the track
          (minus the sprite), so a translate percentage is a share of it. */}
      <div className="absolute inset-y-0 left-0 right-[18px] translate-x-[88%] motion-safe:animate-chase-ghost">
        <Ghost color="cyan" size={16} drift="none" className="absolute top-1/2 -translate-y-1/2" />
      </div>
      <div className="absolute inset-y-0 left-0 right-[18px] opacity-0 motion-safe:animate-chase-scared">
        <Ghost color="scared" size={16} drift="none" className="absolute top-1/2 -translate-y-1/2" />
      </div>

      {/* The mascot */}
      <div className="absolute inset-y-0 left-0 right-[22px] motion-safe:animate-chase-mascot">
        <Mascot size={20} className="absolute top-1/2 -translate-y-1/2 sm:scale-110" />
      </div>

      {/* +200 where the ghost is caught */}
      <span className="absolute -top-3 left-[86%] opacity-0 motion-safe:animate-chase-score">
        <span className="font-pixel text-pixel-xs text-neon drop-shadow-glow-neon">+200</span>
      </span>
    </div>
  )
}

export default FooterChase
