import { useEffect, useRef } from 'react'
import { usePlayback } from '../hooks/usePlayback'
import Ghost from './Ghost'
import PixelSprite from './PixelSprite'

/*
 * Every sprite sits in the hero's right-hand side (or, on small screens, in
 * the corners the text never reaches), so none can cover the name, the
 * tagline, the buttons or the nav. Positions are % of the hero.
 *
 * `depth` picks the parallax layer: far ones barely move, near ones most.
 * `motion` is the idle animation; `duration`/`delay` stagger them so no two
 * bob in unison.
 */
const DESKTOP = [
  // The original four ghosts, where they always were.
  { ghost: 'pink', size: 30, at: 'right-[8%] top-[22%]', show: 'hidden md:block', depth: 2, motion: 'float', delay: 0.7 },
  { ghost: 'cyan', size: 28, at: 'right-[24%] top-[52%]', show: 'hidden lg:block', depth: 1, motion: 'drift', delay: 1.4 },
  { ghost: 'red', size: 32, at: 'right-[12%] bottom-[24%]', show: 'hidden lg:block', depth: 2, motion: 'drift' },
  { ghost: 'orange', size: 26, at: 'right-[34%] top-[16%]', show: 'hidden xl:block', depth: 0, motion: 'float', delay: 2.1 },

  // Bonus fruit and items.
  { sprite: 'strawberry', size: 26, at: 'right-[20%] top-[30%]', show: 'hidden md:block', depth: 1, motion: 'bob', duration: 4.4 },
  { sprite: 'bell', size: 26, at: 'right-[6%] top-[42%]', show: 'hidden md:block', depth: 2, motion: 'bob', duration: 3.6, delay: 0.8 },
  { sprite: 'orange', size: 24, at: 'right-[22%] top-[78%]', show: 'hidden md:block', depth: 0, motion: 'bob', duration: 5.2, delay: 1.6 },
  { sprite: 'key', size: 24, at: 'right-[36%] top-[36%]', show: 'hidden xl:block', depth: 0, motion: 'bob', duration: 4.8, delay: 0.4 },

  // A frightened ghost on patrol.
  { ghost: 'scared', size: 26, at: 'right-[32%] top-[62%]', show: 'hidden lg:block', depth: 1, motion: 'sway' },

  // Power pellets.
  { sprite: 'pellet', size: 12, at: 'right-[16%] top-[17%]', show: 'hidden md:block', depth: 1, motion: 'blink' },
  { sprite: 'pellet', size: 12, at: 'right-[38%] top-[52%]', show: 'hidden xl:block', depth: 0, motion: 'blink', delay: 0.5 },
  { sprite: 'pellet', size: 12, at: 'right-[8%] top-[84%]', show: 'hidden lg:block', depth: 2, motion: 'blink', delay: 1.1 },

  // Sparkles and stars. (Clear of the scroll rail on the far right.)
  { sprite: 'sparkle', size: 14, at: 'right-[28%] top-[24%]', show: 'hidden lg:block', depth: 1, motion: 'twinkle', delay: 0.3 },
  { sprite: 'sparkle', size: 12, at: 'right-[14%] top-[44%]', show: 'hidden md:block', depth: 2, motion: 'twinkle', delay: 2.4 },
  { sprite: 'sparkle', size: 12, at: 'right-[7%] top-[32%]', show: 'hidden lg:block', depth: 2, motion: 'twinkle', delay: 3.7 },
  { sprite: 'sparkle', size: 14, at: 'right-[40%] top-[80%]', show: 'hidden xl:block', depth: 0, motion: 'twinkle', delay: 1.5 },
  { sprite: 'star', size: 10, at: 'right-[10%] top-[62%]', show: 'hidden lg:block', depth: 1, motion: 'twinkle', delay: 4.2 },
  { sprite: 'star', size: 8, at: 'right-[30%] top-[88%]', show: 'hidden lg:block', depth: 0, motion: 'twinkle', delay: 2.9 },
]

// Phones: a few small ones, beside the short HUD line at the top and in the
// space under the chase lane.
const COMPACT = [
  { sprite: 'bell', size: 16, at: 'right-5 top-[8.6rem]', show: 'md:hidden', depth: 1, motion: 'bob', duration: 3.6 },
  { sprite: 'sparkle', size: 10, at: 'right-[18%] top-[7.4rem]', show: 'md:hidden', depth: 2, motion: 'twinkle', delay: 1.2 },
  { sprite: 'strawberry', size: 16, at: 'right-[10%] bottom-7', show: 'md:hidden', depth: 1, motion: 'bob', duration: 4.4, delay: 0.6 },
  { sprite: 'pellet', size: 8, at: 'right-[30%] bottom-9', show: 'md:hidden', depth: 0, motion: 'blink' },
]

const MOTION = {
  bob: 'motion-safe:animate-ghost-float',
  float: 'motion-safe:animate-ghost-float',
  drift: 'motion-safe:animate-ghost-drift',
  sway: 'motion-safe:animate-ghost-sway',
  blink: 'motion-safe:animate-pellet-blink',
  twinkle: 'motion-safe:animate-twinkle',
}

// Parallax: how far (px) each layer shifts at the edge of the screen.
const LAYER_SHIFT = [6, 12, 20]

function Sprite({ item }) {
  const timing = {
    ...(item.duration ? { animationDuration: `${item.duration}s` } : null),
    ...(item.delay ? { animationDelay: `${item.delay}s` } : null),
  }
  return (
    <span className={`absolute ${item.at} ${item.show}`}>
      <span className={`block ${MOTION[item.motion] ?? ''}`} style={timing}>
        {item.ghost ? (
          <Ghost color={item.ghost} size={item.size} drift="none" />
        ) : (
          <PixelSprite name={item.sprite} size={item.size} className={item.sprite === 'sparkle' ? 'drop-shadow-glow-neon' : ''} />
        )}
      </span>
    </span>
  )
}

/**
 * The cursor nudges each layer a little the other way, deeper layers less.
 * One requestAnimationFrame loop, which only runs while it is easing toward
 * the pointer, only while the hero is on screen, and not at all for touch or
 * reduced motion.
 */
function useParallax(layers, active) {
  useEffect(() => {
    if (!active || typeof window.matchMedia !== 'function') return undefined
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduced) return undefined

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = 0

    const paint = () => {
      layers.current.forEach((layer, index) => {
        if (!layer) return
        const shift = LAYER_SHIFT[index]
        layer.style.transform = `translate3d(${(-current.x * shift).toFixed(2)}px, ${(-current.y * shift).toFixed(2)}px, 0)`
      })
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08
      paint()
      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002
      frame = settled ? 0 : requestAnimationFrame(tick)
    }

    const handleMove = (event) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2
      target.y = (event.clientY / window.innerHeight - 0.5) * 2
      if (!frame) frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handleMove)
      cancelAnimationFrame(frame)
    }
  }, [layers, active])
}

/**
 * HeroArcade — the hero's decorative arcade crowd: ghosts, bonus fruit,
 * power pellets and sparkles, with mouse parallax and a ghost that glides
 * across now and then. Paused offscreen and in hidden tabs; still under
 * prefers-reduced-motion. Decoration only: hidden from assistive tech and
 * never takes a click.
 */
function HeroArcade() {
  const ref = useRef(null)
  const layers = useRef([])
  const playing = usePlayback(ref)
  useParallax(layers, playing)

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="hero-arcade"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${playing ? '' : 'anim-paused'}`}
    >
      {LAYER_SHIFT.map((_, depth) => (
        <div
          key={depth}
          ref={(node) => {
            layers.current[depth] = node
          }}
          className="absolute inset-0"
        >
          {[...DESKTOP, ...COMPACT]
            .filter((item) => item.depth === depth)
            .map((item) => (
              <Sprite key={`${item.ghost ?? item.sprite}-${item.at}`} item={item} />
            ))}
        </div>
      ))}

      {/* Every ~13s a ghost glides across the right side and off screen. */}
      <span className="absolute left-[56%] top-[86%] hidden opacity-0 lg:block motion-safe:animate-ghost-flyby">
        <Ghost color="pink" size={24} drift="float" />
      </span>
    </div>
  )
}

export default HeroArcade
