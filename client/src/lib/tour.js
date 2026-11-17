/**
 * The attract-mode tour: like an arcade cabinet's demo loop, the page plays
 * itself — gliding to each section, pausing so its entrance animations run,
 * and panning slowly through anything taller than the screen.
 *
 * buildTour() is pure (plain numbers in, a plan out) so it is unit-tested;
 * playTour() runs a plan and stops the moment its signal is aborted.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Pauses long enough for a section's reveal animation to finish and be read.
const TIMING = {
  arrive: { msPerPx: 0.6, min: 700, max: 1600 },
  holdAfterArrive: 1800,
  // Slow pan through a tall section, in pixels per millisecond.
  panSpeed: 0.15,
  pan: { min: 1500, max: 9000 },
  holdAfterPan: 1200,
  // With reduced motion there is no gliding: each stop is a cut, held longer.
  reducedHold: 3000,
}

// Below this, a section "fits" and is not worth panning through.
const MIN_PAN_PX = 40

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

const abortError = () => new DOMException('Tour stopped', 'AbortError')

/**
 * @param {{ index: number, id: string, label: string, top: number, height: number }[]} stops
 *   Each section's position in document coordinates.
 * @param {{ viewportHeight: number, headerHeight: number, maxScroll: number }} viewport
 * @returns {{ index: number, id: string, label: string, scrollTo: number, pan: number | null }[]}
 */
export function buildTour(stops, { viewportHeight, headerHeight, maxScroll }) {
  const visible = Math.max(1, viewportHeight - headerHeight)

  return stops.map((stop) => {
    const scrollTo = clamp(Math.round(stop.top - headerHeight), 0, maxScroll)
    const overflow = stop.height - visible
    const panTo = clamp(Math.round(scrollTo + overflow), 0, maxScroll)

    return {
      index: stop.index,
      id: stop.id,
      label: stop.label,
      scrollTo,
      pan: overflow > MIN_PAN_PX && panTo - scrollTo > MIN_PAN_PX ? panTo : null,
    }
  })
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

// `behavior: 'instant'` overrides the page's CSS smooth scrolling, which
// would otherwise fight the frame-by-frame animation below.
const jumpTo = (top) => window.scrollTo({ top, behavior: 'instant' })

const nextFrame =
  typeof window !== 'undefined' && window.requestAnimationFrame
    ? (callback) => window.requestAnimationFrame(callback)
    : (callback) => setTimeout(() => callback(performance.now()), 16)

const cancelFrame =
  typeof window !== 'undefined' && window.cancelAnimationFrame
    ? (id) => window.cancelAnimationFrame(id)
    : (id) => clearTimeout(id)

function scrollTo(target, duration, signal, ease = easeInOutCubic) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError())

    if (duration <= 0) {
      jumpTo(target)
      return resolve()
    }

    const from = window.scrollY
    const start = performance.now()
    let frame = null

    const onAbort = () => {
      cancelFrame(frame)
      reject(abortError())
    }
    signal.addEventListener('abort', onAbort, { once: true })

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      jumpTo(from + (target - from) * ease(progress))

      if (progress < 1) {
        frame = nextFrame(step)
      } else {
        signal.removeEventListener('abort', onAbort)
        resolve()
      }
    }

    frame = nextFrame(step)
  })
}

/**
 * Plays a plan from buildTour(). Resolves when the tour is over; rejects with
 * an AbortError as soon as `signal` aborts (the visitor took over).
 */
export async function playTour(plan, { signal, reduceMotion = false, onStep = () => {} }) {
  for (const stop of plan) {
    onStep(stop.index)

    const distance = Math.abs(stop.scrollTo - window.scrollY)
    const arrive = reduceMotion
      ? 0
      : clamp(distance * TIMING.arrive.msPerPx, TIMING.arrive.min, TIMING.arrive.max)

    await scrollTo(stop.scrollTo, arrive, signal)
    await sleep(reduceMotion ? TIMING.reducedHold : TIMING.holdAfterArrive, signal)

    if (stop.pan !== null) {
      const pan = reduceMotion
        ? 0
        : clamp((stop.pan - stop.scrollTo) / TIMING.panSpeed, TIMING.pan.min, TIMING.pan.max)

      await scrollTo(stop.pan, pan, signal, easeInOutSine)
      await sleep(reduceMotion ? TIMING.reducedHold : TIMING.holdAfterPan, signal)
    }
  }
}

/** Reads where each section is on the page right now. */
export function measureTour(stops) {
  const header = document.querySelector('header')
  const headerHeight = header ? header.getBoundingClientRect().height : 0
  const viewportHeight = window.innerHeight
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight)

  const measured = stops
    .map((stop, index) => {
      const element = document.getElementById(stop.id)
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return { index, id: stop.id, label: stop.label, top: rect.top + window.scrollY, height: rect.height }
    })
    .filter(Boolean)

  return buildTour(measured, { viewportHeight, headerHeight, maxScroll })
}
