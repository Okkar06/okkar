import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildTour, playTour } from '../tour'

const viewport = { viewportHeight: 900, headerHeight: 100, maxScroll: 4000 }

describe('buildTour', () => {
  it('stops each section just under the fixed header', () => {
    const plan = buildTour(
      [
        { index: 0, id: 'top', label: 'Title', top: 0, height: 700 },
        { index: 1, id: 'about', label: 'About', top: 800, height: 600 },
      ],
      viewport,
    )

    expect(plan.map((stop) => stop.scrollTo)).toEqual([0, 700])
  })

  it('pans through a section taller than the screen, and not one that fits', () => {
    const [tall, short] = buildTour(
      [
        { index: 0, id: 'projects', label: 'Projects', top: 1000, height: 2000 },
        { index: 1, id: 'skills', label: 'Skills', top: 3000, height: 790 },
      ],
      viewport,
    )

    // 2000 tall in an 800 visible window: pan 1200 further.
    expect(tall).toMatchObject({ scrollTo: 900, pan: 2100 })
    expect(short.pan).toBeNull()
  })

  it('never scrolls past the ends of the page', () => {
    const [last] = buildTour([{ index: 4, id: 'contact', label: 'Contact', top: 3900, height: 1400 }], viewport)

    // The section is 1400 tall but the page ends 200px below the stop, so the
    // pan is clamped to the end of the page rather than running past it.
    expect(last.scrollTo).toBe(3800)
    expect(last.pan).toBe(4000)
  })
})

describe('playTour', () => {
  afterEach(() => vi.useRealTimers())

  const plan = [
    { index: 0, id: 'top', label: 'Title', scrollTo: 0, pan: null },
    { index: 1, id: 'projects', label: 'Projects', scrollTo: 900, pan: 2100 },
    { index: 2, id: 'contact', label: 'Contact', scrollTo: 3000, pan: null },
  ]

  it('visits every stop in order (reduced motion: cuts, no gliding)', async () => {
    vi.useFakeTimers()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const steps = []

    const done = playTour(plan, {
      signal: new AbortController().signal,
      reduceMotion: true,
      onStep: (step) => steps.push(step),
    })
    await vi.runAllTimersAsync()
    await done

    expect(steps).toEqual([0, 1, 2])
    expect(scrollTo.mock.calls.map(([options]) => options.top)).toEqual([0, 900, 2100, 3000])
    expect(scrollTo.mock.calls.every(([options]) => options.behavior === 'instant')).toBe(true)
  })

  it('stops as soon as it is aborted', async () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const controller = new AbortController()
    const steps = []

    const done = playTour(plan, { signal: controller.signal, reduceMotion: true, onStep: (step) => steps.push(step) })
    const settled = expect(done).rejects.toMatchObject({ name: 'AbortError' })
    await vi.advanceTimersByTimeAsync(1000)
    controller.abort()
    await settled

    await vi.runAllTimersAsync()
    expect(steps).toEqual([0])
  })
})
