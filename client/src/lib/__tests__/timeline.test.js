import { describe, expect, it } from 'vitest'
import { loopLayout, nearestStep, orderStages, parseStageDate, wrap } from '../timeline'

describe('parseStageDate', () => {
  it('reads month-year and year-only dates', () => {
    expect(parseStageDate('Apr 2026')).toBe(2026 * 12 + 3)
    expect(parseStageDate('april 2026')).toBe(2026 * 12 + 3)
    expect(parseStageDate('Sept. 2025')).toBe(2025 * 12 + 8)
    expect(parseStageDate('2024')).toBe(2024 * 12)
  })

  it('returns null for anything else', () => {
    for (const bad of ['', 'soon', 'Foo 2026', '26', null, undefined, 42]) expect(parseStageDate(bad)).toBeNull()
  })
})

describe('orderStages', () => {
  const projects = [
    { title: 'C', date: 'Apr 2026' },
    { title: 'Bonus', placeholder: true },
    { title: 'A', date: 'May 2025' },
    { title: 'Undated' },
    { title: 'B', date: 'Oct 2025' },
  ]

  it('sorts oldest first, numbers the stages, and keeps the bonus stage last', () => {
    const ordered = orderStages(projects)
    expect(ordered.map((p) => p.title)).toEqual(['A', 'B', 'C', 'Undated', 'Bonus'])
    expect(ordered.map((p) => p.stage)).toEqual([1, 2, 3, 4, null])
    expect(new Set(ordered.map((p) => p.key)).size).toBe(ordered.length)
  })

  it('copes with nothing', () => {
    expect(orderStages()).toEqual([])
    expect(orderStages([null])).toEqual([])
  })
})

describe('loopLayout', () => {
  it.each([1, 2, 3, 5, 6, 7])('alternates sides across the loop seam for %i stages', (count) => {
    const { unit, items } = loopLayout(count)
    expect(unit).toBeGreaterThanOrEqual(8)
    expect(items).toHaveLength(unit * 3)
    // The unit is a whole number of passes and an even number of slots, so
    // wrapping by one unit lands on the same project, on the same side.
    expect(unit % count).toBe(0)
    expect(unit % 2).toBe(0)
    for (let slot = 0; slot < unit * 2; slot += 1) {
      expect(items[slot + unit].source).toBe(items[slot].source)
      expect(items[slot + unit].side).toBe(items[slot].side)
    }
    for (let slot = 1; slot < items.length; slot += 1) expect(items[slot].side).not.toBe(items[slot - 1].side)
  })

  it('keeps one real pass, in order, at the start of the middle unit; the rest are copies', () => {
    const { unit, items } = loopLayout(5)
    const real = items.filter((item) => !item.copy)
    expect(real.map((item) => item.source)).toEqual([0, 1, 2, 3, 4])
    expect(real[0].slot).toBe(unit)
  })

  it('is empty for no stages', () => {
    expect(loopLayout(0)).toEqual({ unit: 0, items: [] })
  })
})

describe('loop arithmetic', () => {
  it('wraps offsets into one loop', () => {
    expect(wrap(9, 8)).toBe(1)
    expect(wrap(-1, 8)).toBe(7)
    expect(wrap(3, 0)).toBe(0)
  })

  it('takes the short way round', () => {
    expect(nearestStep(7, 0, 8)).toBe(8)
    expect(nearestStep(1, 7, 8)).toBe(-1)
    expect(nearestStep(2, 4, 8)).toBe(4)
  })
})
