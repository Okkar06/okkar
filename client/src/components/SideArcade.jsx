import { useRef } from 'react'
import { usePlayback } from '../hooks/usePlayback'
import Ghost from './Ghost'
import PixelSprite from './PixelSprite'

/*
 * Sprites for the empty margins either side of the page's 72rem content
 * column, one list per scene. `top` is % of the section's height.
 *
 * `col` picks the lane: 'inner' sits 3.5rem outside the content edge (shown
 * from 1360px wide, where the margins first have room for it, and clear of
 * the scroll rail on the far right); 'outer' sits 8rem out (from 1600px).
 */
const SCENES = {
  hero: [
    { side: 'left', col: 'inner', top: 18, sprite: 'pellet', size: 12, motion: 'blink' },
    { side: 'left', col: 'inner', top: 46, sprite: 'sparkle', size: 14, motion: 'twinkle', delay: 1.2 },
    { side: 'left', col: 'inner', top: 74, ghost: 'cyan', size: 24, motion: 'float', delay: 0.6 },
    { side: 'left', col: 'outer', top: 30, sprite: 'cherry', size: 20, motion: 'bob', duration: 4.6 },
    { side: 'left', col: 'outer', top: 62, sprite: 'star', size: 10, motion: 'twinkle', delay: 2.4 },
  ],
  about: [
    { side: 'left', col: 'inner', top: 20, sprite: 'strawberry', size: 22, motion: 'bob', duration: 4.4 },
    { side: 'left', col: 'inner', top: 48, sprite: 'pellet', size: 12, motion: 'blink', delay: 0.4 },
    { side: 'left', col: 'inner', top: 76, ghost: 'scared', size: 24, motion: 'sway' },
    { side: 'right', col: 'inner', top: 34, sprite: 'bell', size: 22, motion: 'bob', duration: 3.8, delay: 0.8 },
    { side: 'right', col: 'inner', top: 62, sprite: 'sparkle', size: 12, motion: 'twinkle', delay: 2.1 },
    { side: 'right', col: 'inner', top: 88, sprite: 'pellet', size: 10, motion: 'blink', delay: 1.3 },
    { side: 'left', col: 'outer', top: 36, sprite: 'key', size: 22, motion: 'bob', duration: 5, delay: 1.5 },
    { side: 'right', col: 'outer', top: 50, ghost: 'pink', size: 26, motion: 'float', delay: 1.1 },
  ],
  projects: [
    { side: 'left', col: 'inner', top: 24, sprite: 'orange', size: 20, motion: 'bob', duration: 4.8 },
    { side: 'left', col: 'inner', top: 56, sprite: 'sparkle', size: 12, motion: 'twinkle', delay: 0.9 },
    { side: 'left', col: 'inner', top: 84, sprite: 'pellet', size: 12, motion: 'blink', delay: 0.2 },
    { side: 'right', col: 'inner', top: 40, ghost: 'red', size: 24, motion: 'drift', delay: 0.5 },
    { side: 'right', col: 'inner', top: 72, sprite: 'star', size: 10, motion: 'twinkle', delay: 3.1 },
    { side: 'left', col: 'outer', top: 44, ghost: 'cyan', size: 24, motion: 'float', delay: 2 },
    { side: 'right', col: 'outer', top: 22, sprite: 'cherry', size: 20, motion: 'bob', duration: 4.2 },
    { side: 'right', col: 'outer', top: 66, sprite: 'pellet', size: 12, motion: 'blink', delay: 0.8 },
  ],
  skills: [
    { side: 'left', col: 'inner', top: 22, ghost: 'pink', size: 24, motion: 'float', delay: 0.3 },
    { side: 'left', col: 'inner', top: 54, sprite: 'star', size: 10, motion: 'twinkle', delay: 1.7 },
    { side: 'left', col: 'inner', top: 82, sprite: 'bell', size: 20, motion: 'bob', duration: 4 },
    { side: 'right', col: 'inner', top: 28, sprite: 'pellet', size: 12, motion: 'blink' },
    { side: 'right', col: 'inner', top: 58, sprite: 'strawberry', size: 20, motion: 'bob', duration: 4.6, delay: 1 },
    { side: 'right', col: 'inner', top: 86, sprite: 'sparkle', size: 12, motion: 'twinkle', delay: 2.6 },
    { side: 'left', col: 'outer', top: 38, sprite: 'pellet', size: 10, motion: 'blink', delay: 0.9 },
    { side: 'right', col: 'outer', top: 44, ghost: 'scared', size: 24, motion: 'sway', delay: 1.4 },
  ],
  contact: [
    { side: 'left', col: 'inner', top: 26, sprite: 'key', size: 20, motion: 'bob', duration: 4.4 },
    { side: 'left', col: 'inner', top: 60, sprite: 'pellet', size: 12, motion: 'blink', delay: 0.6 },
    { side: 'left', col: 'inner', top: 86, sprite: 'sparkle', size: 12, motion: 'twinkle', delay: 1.9 },
    { side: 'right', col: 'inner', top: 36, sprite: 'orange', size: 20, motion: 'bob', duration: 3.9, delay: 0.7 },
    { side: 'right', col: 'inner', top: 68, ghost: 'cyan', size: 24, motion: 'drift', delay: 1.2 },
    { side: 'left', col: 'outer', top: 46, ghost: 'orange', size: 24, motion: 'float', delay: 0.4 },
    { side: 'right', col: 'outer', top: 54, sprite: 'star', size: 10, motion: 'twinkle', delay: 2.2 },
  ],
  footer: [
    { side: 'left', col: 'inner', top: 46, ghost: 'red', size: 20, motion: 'sway' },
    { side: 'right', col: 'inner', top: 46, sprite: 'cherry', size: 18, motion: 'bob', duration: 4 },
    { side: 'left', col: 'outer', top: 40, sprite: 'pellet', size: 10, motion: 'blink', delay: 0.5 },
    { side: 'right', col: 'outer', top: 40, sprite: 'sparkle', size: 12, motion: 'twinkle', delay: 1.5 },
  ],
}

const LANES = {
  inner: { offset: '3.5rem', show: 'hidden min-[1360px]:block' },
  outer: { offset: '8rem', show: 'hidden min-[1600px]:block' },
}

const MOTION = {
  bob: 'motion-safe:animate-ghost-float',
  float: 'motion-safe:animate-ghost-float',
  drift: 'motion-safe:animate-ghost-drift',
  sway: 'motion-safe:animate-ghost-sway',
  blink: 'motion-safe:animate-pellet-blink',
  twinkle: 'motion-safe:animate-twinkle',
}

function SideSprite({ item }) {
  const lane = LANES[item.col] ?? LANES.inner
  // Centred on a line `offset` outside the content column's edge.
  const position = {
    top: `${item.top}%`,
    [item.side]: `calc((100% - 72rem) / 2 - ${lane.offset})`,
    transform: `translate(${item.side === 'left' ? '-50%' : '50%'}, -50%)`,
  }
  const timing = {
    ...(item.duration ? { animationDuration: `${item.duration}s` } : null),
    ...(item.delay ? { animationDelay: `${item.delay}s` } : null),
  }
  return (
    <span className={`absolute ${lane.show}`} style={position}>
      <span className={`block ${MOTION[item.motion] ?? ''}`} style={timing}>
        {item.ghost ? (
          <Ghost color={item.ghost} size={item.size} drift="none" />
        ) : (
          <PixelSprite
            name={item.sprite}
            size={item.size}
            className={item.sprite === 'sparkle' ? 'drop-shadow-glow-neon' : ''}
          />
        )}
      </span>
    </span>
  )
}

/**
 * SideArcade — little arcade sprites (fruit, ghosts, pellets, sparkles) in
 * the empty margins left and right of a section, for `scene` in SCENES.
 * Only on screens wide enough to have margins, so they never cover content.
 * Paused offscreen and in hidden tabs; still under prefers-reduced-motion.
 * Decoration only: hidden from assistive tech and never takes a click.
 */
function SideArcade({ scene }) {
  const ref = useRef(null)
  const playing = usePlayback(ref)
  const items = SCENES[scene] ?? []

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid={`side-arcade-${scene}`}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${playing ? '' : 'anim-paused'}`}
    >
      {items.map((item) => (
        <SideSprite key={`${item.side}-${item.col}-${item.top}`} item={item} />
      ))}
    </div>
  )
}

export default SideArcade
