import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePlayback } from '../../hooks/usePlayback'
import { loopLayout, nearestStep, wrap } from '../../lib/timeline'
import PowerDot from '../PowerDot'
import ProjectCard from '../ProjectCard'
import TimelineChase from './TimelineChase'
import TimelineControls from './TimelineControls'

// The edge fade's width (keep in step with .edge-fade-x in index.css). A
// stage comes to rest just inside it, fully clear.
const FADE = 0.12
const REST_GAP = 8
// A press that moves less than this is a click, not a drag.
const DRAG_THRESHOLD = 6

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/** True unless focus arrived from a mouse or touch press (or a script after one). */
function isKeyboardFocus(element) {
  try {
    return element.matches(':focus-visible')
  } catch {
    return true
  }
}

/**
 * The scroll engine. Its state changes every frame, so it lives outside
 * React: one requestAnimationFrame loop, running only during a glide, writes
 * `transform` on the track. `x` is how far the view has moved along the
 * loop, in px; a stage rests at every multiple of `half`. After the last
 * stage the next pass simply follows, one step on, so the run starts over
 * without a break.
 */
function createEngine() {
  const state = { x: 0, half: 0, inset: 0, anim: null, frame: 0, track: null }
  const settings = { current: { unit: 0, glideMs: 0, reducedMotion: false } }
  const length = () => settings.current.unit * state.half

  const paint = () => {
    const track = state.track
    if (!track || !state.half) return
    // The view always sits on the middle of three copies (lib/timeline.js).
    const offset = state.inset - length() - wrap(state.x, length())
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

  const here = () => (state.half ? Math.round(state.x / state.half) : 0)
  const xOf = (k) => k * state.half

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
    /**
     * Measures one column (half a card step) and where a resting card sits:
     * its left edge just clear of the viewport's edge fade.
     */
    measure(track, viewport) {
      state.track = track
      const first = track?.querySelector('[data-slot="0"]')
      const second = track?.querySelector('[data-slot="1"]')
      state.half = first && second ? second.offsetLeft - first.offsetLeft : 0
      const card = first?.querySelector('article')
      const cardOffset = card ? card.offsetLeft - first.offsetLeft : 0
      state.inset = (viewport?.clientWidth ?? 0) * FADE + REST_GAP - cardOffset
      paint()
    },
    /** Glide `delta` stages along (1 = next). */
    move(delta, done) {
      glideTo(xOf(here() + delta), done)
    },
    /** Glide the short way round to the real card at `index`. */
    show(index) {
      glideTo(xOf(nearestStep(here(), index, settings.current.unit)))
    },
    /** Settle on the nearest stage (after a drag or a swipe). */
    snap() {
      glideTo(xOf(here()))
    },
  }
}

const gridColumn = (slot) => `${slot + 1} / span 2`

function Node({ slot, side, date, nodeRef }) {
  const above = side === 'above'
  return (
    <div
      ref={nodeRef}
      aria-hidden="true"
      style={{ gridColumn: gridColumn(slot), gridRow: 2 }}
      className="relative flex items-center justify-center"
    >
      {/* Connector from the card to the line */}
      <span
        className={`absolute left-1/2 w-[3px] -translate-x-1/2 bg-wall shadow-glow-wall ${above ? 'top-0 h-1/2' : 'bottom-0 h-1/2'}`}
      />
      <PowerDot power className="relative" />
      {date ? (
        <span
          className={`absolute left-1/2 ml-4 whitespace-nowrap font-pixel text-pixel-xs uppercase leading-none tracking-hud text-hud ${
            above ? 'top-1/2 mt-2' : 'bottom-1/2 mb-2'
          }`}
        >
          {date}
        </span>
      ) : null}
    </div>
  )
}

/**
 * HorizontalTimeline — the projects as an endless zigzag along a glowing
 * line, stepping from stage to stage like a slideshow. `heading` is drawn
 * beside the controls, at the top.
 *
 * It holds on a stage for `holdMs`, then glides (`glideMs`) to the next. It
 * waits while hovered, while a card has keyboard focus, while the details
 * popup is open (`detailsOpen`), and for `resumeAfterMs` after any drag,
 * swipe, trackpad scroll or arrow press; the pause button stops it (and the
 * mascot) until pressed again. Nothing moves on its own offscreen, in a
 * hidden tab, or under prefers-reduced-motion.
 *
 * The copies that make the loop endless are aria-hidden and out of the Tab
 * order, so screen readers and the keyboard meet every project exactly once,
 * in order; they still answer a mouse click like the real thing.
 */
function HorizontalTimeline({
  stages,
  heading,
  onDetails,
  detailsOpen = false,
  holdMs = 3500,
  glideMs = 900,
  resumeAfterMs = 3000,
}) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const count = stages.length
  const { unit, items } = useMemo(() => loopLayout(count), [count])

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
      const track = trackRef.current
      engine.measure(track, viewportRef.current)
      const node = nodeRef.current
      if (node && track) setLineTop(track.offsetTop + node.offsetTop + node.offsetHeight / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [engine, items.length])

  // The slideshow: hold, glide to the next stage, repeat.
  const autoplay =
    playing && !userPaused && !hovering && !focusWithin && !interacting && !detailsOpen && !reducedMotion
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

  // Keyboard: whichever card takes focus is brought into view and held
  // there. (Focus from a click, or handed back by the popup after one, is
  // left alone: hover already covers the mouse.)
  const handleFocus = (event) => {
    if (!isKeyboardFocus(event.target)) return
    setFocusWithin(true)
    const slot = event.target.closest?.('[data-slot]')?.dataset.slot
    if (slot !== undefined) engine.show(Number(slot) - unit)
  }
  const handleBlur = (event) => {
    if (!viewportRef.current?.contains(event.relatedTarget)) setFocusWithin(false)
  }

  const chasePaused = userPaused || !playing || detailsOpen

  return (
    <div>
      <div className="mb-[clamp(1rem,3.5vh,2.5rem)] flex items-end justify-between gap-6">
        <div className="min-w-0">{heading}</div>
        <div className="shrink-0 pb-0.5">
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

        {/* --card: card width; --half: half the step from one card to the
            next, so neighbours on the same side sit 2 × --half apart. */}
        <div
          ref={trackRef}
          className="relative grid w-max pb-2 pt-3 [--card:18rem] [--half:11rem] [grid-auto-columns:var(--half)] [grid-template-rows:auto_clamp(2.25rem,5vh,3rem)_auto] lg:[--card:19rem] lg:[--half:13rem] xl:[--half:14rem]"
        >
          {items.map((item) => {
            const stage = stages[item.source]
            const above = item.side === 'above'
            return (
              <Fragment key={item.slot}>
                <div
                  data-slot={item.slot}
                  style={{ gridColumn: gridColumn(item.slot), gridRow: above ? 1 : 3 }}
                  className={`flex min-w-0 justify-center ${above ? '' : 'pt-3'}`}
                  aria-hidden={item.copy || undefined}
                >
                  <div className="w-[var(--card)] min-w-0">
                    <ProjectCard
                      {...stage}
                      focusable={!item.copy}
                      onDetails={onDetails && ((opener) => onDetails(stage, opener))}
                    />
                  </div>
                </div>
                <Node
                  slot={item.slot}
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
