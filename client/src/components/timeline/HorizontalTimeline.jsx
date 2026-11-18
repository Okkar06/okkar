import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePlayback } from '../../hooks/usePlayback'
import { loopLayout, nearestStep, wrap } from '../../lib/timeline'
import PowerDot from '../PowerDot'
import ProjectCard from '../ProjectCard'
import TimelineChase from './TimelineChase'
import TimelineControls from './TimelineControls'

// Where a stage comes to rest: this far in from the left, clear of the fade.
const REST_INSET = 56
// A press that moves less than this is a click, not a drag.
const DRAG_THRESHOLD = 6

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * The scroll engine. Its state changes every frame, so it lives outside
 * React: one requestAnimationFrame loop, running only during a glide, writes
 * `transform` on the track. `x` is how far the view has moved along the
 * loop, in px; a stage rests at every multiple of `half`.
 */
function createEngine() {
  const state = { x: 0, half: 0, anim: null, frame: 0, track: null }
  const settings = { current: { unit: 0, glideMs: 0, reducedMotion: false } }
  const length = () => settings.current.unit * state.half

  const paint = () => {
    const track = state.track
    if (!track || !state.half) return
    // The view always sits on the middle of three copies (lib/timeline.js).
    const offset = REST_INSET - length() - wrap(state.x, length())
    track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`
  }

  const stop = () => {
    cancelAnimationFrame(state.frame)
    state.frame = 0
    state.anim = null
  }

  const tick = (now) => {
    const anim = state.anim
    if (!anim) return
    if (anim.start === null) anim.start = now
    const t = Math.min(1, (now - anim.start) / anim.duration)
    state.x = anim.from + (anim.to - anim.from) * easeInOut(t)
    paint()
    if (t < 1) {
      state.frame = requestAnimationFrame(tick)
      return
    }
    state.anim = null
    state.frame = 0
    state.x = wrap(state.x, length())
    anim.done?.()
  }

  const glideTo = (to, done) => {
    stop()
    const duration = settings.current.reducedMotion ? 0 : settings.current.glideMs
    if (!state.half || duration <= 0) {
      state.x = to
      paint()
      done?.()
      return
    }
    state.anim = { from: state.x, to, duration, start: null, done }
    state.frame = requestAnimationFrame(tick)
  }

  const step = () => (state.half ? Math.round(state.x / state.half) : 0)

  return {
    paint,
    stop,
    /** Latest { unit, glideMs, reducedMotion } from the component. */
    configure(next) {
      settings.current = next
    },
    get x() {
      return state.x
    },
    setX(x) {
      stop()
      state.x = x
      paint()
    },
    /** Takes the track element and measures one column (half a card). */
    measure(track) {
      state.track = track
      const first = track?.querySelector('[data-slot="0"]')
      const second = track?.querySelector('[data-slot="1"]')
      state.half = first && second ? second.offsetLeft - first.offsetLeft : 0
      paint()
    },
    /** Glide `delta` stages along (1 = next). */
    move(delta, done) {
      glideTo((step() + delta) * state.half, done)
    },
    /** Glide the short way round to the real card at `index`. */
    show(index) {
      glideTo(nearestStep(step(), index, settings.current.unit) * state.half)
    },
    /** Settle on the nearest stage (after a drag or a swipe). */
    snap() {
      glideTo(step() * state.half)
    },
  }
}

function Node({ column, side, date, nodeRef }) {
  const above = side === 'above'
  return (
    <div
      ref={nodeRef}
      aria-hidden="true"
      style={{ gridColumn: column, gridRow: 2 }}
      className="relative flex items-center justify-center"
    >
      {/* Connector from the card to the line */}
      <span
        className={`absolute left-1/2 w-[3px] -translate-x-1/2 bg-wall shadow-glow-wall ${above ? 'top-0 h-1/2' : 'bottom-0 h-1/2'}`}
      />
      <PowerDot power className="relative" />
      <span
        className={`absolute left-1/2 ml-4 whitespace-nowrap font-pixel text-pixel-xs uppercase leading-none tracking-hud text-hud ${
          above ? 'top-1/2 mt-2.5' : 'bottom-1/2 mb-2.5'
        }`}
      >
        {date || 'NEXT'}
      </span>
    </div>
  )
}

/**
 * HorizontalTimeline — the projects as an endless zigzag along a glowing
 * line, stepping from stage to stage like a slideshow.
 *
 * It holds on a stage for `holdMs`, then glides (`glideMs`) to the next. It
 * waits while hovered, while a card has keyboard focus, and for
 * `resumeAfterMs` after any drag, swipe, trackpad scroll or arrow press; the
 * pause button stops it (and the mascot) until pressed again. Nothing moves
 * on its own offscreen, in a hidden tab, or under prefers-reduced-motion.
 *
 * Copies that make the loop endless are aria-hidden and inert, so screen
 * readers and the Tab key meet every project exactly once, in order.
 */
function HorizontalTimeline({ stages, holdMs = 3500, glideMs = 900, resumeAfterMs = 3000 }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { unit, items } = useMemo(() => loopLayout(stages.length), [stages.length])

  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const nodeRef = useRef(null)
  const playing = usePlayback(viewportRef)

  const [userPaused, setUserPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [lineTop, setLineTop] = useState(null)

  // Created once; it is handed the latest settings and the track element.
  const [engine] = useState(createEngine)
  useLayoutEffect(() => {
    engine.configure({ unit, glideMs, reducedMotion })
  }, [engine, unit, glideMs, reducedMotion])

  const idleTimer = useRef(0)
  const wheelTimer = useRef(0)
  const drag = useRef(null)
  const suppressClick = useRef(false)

  // Any hands-on input holds the slideshow for `resumeAfterMs`.
  const poke = useCallback(() => {
    setInteracting(true)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setInteracting(false), resumeAfterMs)
  }, [resumeAfterMs])

  // Measure the column width and where the line runs; again on resize.
  useLayoutEffect(() => {
    const measure = () => {
      engine.measure(trackRef.current)
      const node = nodeRef.current
      const track = trackRef.current
      if (node && track) setLineTop(track.offsetTop + node.offsetTop + node.offsetHeight / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [engine, items.length])

  // The slideshow: hold, glide to the next stage, repeat.
  const autoplay = playing && !userPaused && !hovering && !focusWithin && !interacting && !reducedMotion
  useEffect(() => {
    if (!autoplay) return undefined
    let timer = 0
    let cancelled = false
    const next = () => {
      timer = setTimeout(() => engine.move(1, () => !cancelled && next()), holdMs)
    }
    next()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [autoplay, holdMs, engine])

  // Trackpad sideways scroll (and Shift + wheel). Vertical wheel is left to
  // the page. Non-passive, so it can stop the page scrolling sideways.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    const handleWheel = (event) => {
      const dx = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0
      if (!dx) return
      event.preventDefault()
      engine.setX(engine.x + dx)
      poke()
      clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => engine.snap(), 160)
    }
    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [engine, poke])

  useEffect(
    () => () => {
      engine.stop()
      clearTimeout(idleTimer.current)
      clearTimeout(wheelTimer.current)
    },
    [engine],
  )

  // Drag / swipe.
  const handlePointerDown = (event) => {
    if (event.button !== 0) return
    drag.current = { id: event.pointerId, startX: event.clientX, from: engine.x, moved: false }
    engine.stop()
    poke()
  }
  const handlePointerMove = (event) => {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    const dx = event.clientX - current.startX
    if (!current.moved && Math.abs(dx) < DRAG_THRESHOLD) return
    if (!current.moved) {
      current.moved = true
      viewportRef.current?.setPointerCapture?.(event.pointerId)
    }
    engine.setX(current.from - dx)
    poke()
  }
  const handlePointerEnd = (event) => {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    drag.current = null
    // A drag that ends over a button must not also press it.
    if (current.moved) {
      suppressClick.current = true
      setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }
    engine.snap()
  }
  const handleClickCapture = (event) => {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  // Keyboard: whichever card takes focus is brought into view.
  const handleFocus = (event) => {
    setFocusWithin(true)
    const slot = event.target.closest?.('[data-slot]')?.dataset.slot
    if (slot !== undefined) engine.show(Number(slot) - unit)
  }
  const handleBlur = (event) => {
    if (!viewportRef.current?.contains(event.relatedTarget)) setFocusWithin(false)
  }

  const chasePaused = userPaused || !playing

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <TimelineControls
          paused={userPaused}
          showPause={!reducedMotion}
          onTogglePause={() => setUserPaused((paused) => !paused)}
          onPrevious={() => {
            poke()
            engine.move(-1)
          }}
          onNext={() => {
            poke()
            engine.move(1)
          }}
        />
      </div>

      <div
        ref={viewportRef}
        role="group"
        aria-label="Project timeline, oldest first"
        data-testid="timeline-viewport"
        data-autoplay={autoplay}
        className="edge-fade-x relative touch-pan-y select-none overflow-x-clip"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        // Hover holds it (a mouse or pen; a tap is handled as interaction).
        onPointerEnter={(event) => event.pointerType !== 'touch' && setHovering(true)}
        onPointerLeave={(event) => event.pointerType !== 'touch' && setHovering(false)}
        onClickCapture={handleClickCapture}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {lineTop !== null ? (
          <div className="absolute inset-x-0 -translate-y-1/2" style={{ top: lineTop }}>
            <TimelineChase layer="track" paused={chasePaused} />
          </div>
        ) : null}

        <div
          ref={trackRef}
          className="relative grid w-max pb-2 pt-4 [--half:9.75rem] [grid-auto-columns:var(--half)] [grid-template-rows:auto_4.5rem_auto] lg:[--half:12rem]"
        >
          {items.map((item) => {
            const stage = stages[item.source]
            const column = `${item.slot + 1} / span 2`
            return (
              <Fragment key={item.slot}>
                <div
                  data-slot={item.slot}
                  style={{ gridColumn: column, gridRow: item.side === 'above' ? 1 : 3 }}
                  className={`min-w-0 px-3 ${item.side === 'above' ? 'self-end' : 'self-start pt-2'}`}
                  aria-hidden={item.copy || undefined}
                  inert={item.copy || undefined}
                >
                  <ProjectCard {...stage} />
                </div>
                <Node
                  column={column}
                  side={item.side}
                  date={stage.date}
                  nodeRef={item.slot === 0 ? nodeRef : undefined}
                />
              </Fragment>
            )
          })}
        </div>

        {lineTop !== null ? (
          <div className="pointer-events-none absolute inset-x-0 -translate-y-1/2" style={{ top: lineTop }}>
            <TimelineChase layer="runner" paused={chasePaused} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default HorizontalTimeline
