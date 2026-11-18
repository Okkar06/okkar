/**
 * Pure helpers for the projects timeline (components/timeline/*).
 *
 * Projects keep a human date string such as 'Apr 2026' in data/content.js;
 * these turn that list into the order, stage numbers and zigzag layout the
 * timeline draws.
 */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * 'Apr 2026', 'April 2026' or '2026' → a sortable month number
 * (year * 12 + month), or null if it can't be read.
 */
export function parseStageDate(text) {
  if (typeof text !== 'string') return null
  const match = text.trim().match(/^(?:([a-z]{3})[a-z]*\.?\s+)?(\d{4})$/i)
  if (!match) return null
  const year = Number(match[2])
  if (!match[1]) return year * 12
  const month = MONTHS.indexOf(match[1].toLowerCase())
  return month === -1 ? null : year * 12 + month
}

/**
 * Oldest first, numbered from Stage 1. Undated projects follow the dated
 * ones, in their original order; placeholders (the BONUS STAGE) always come
 * last and get no number.
 *
 * @returns {Array<object & { stage: number | null, key: string }>}
 */
export function orderStages(projects = []) {
  const real = []
  const bonus = []
  projects.forEach((project, position) => {
    if (!project) return
    ;(project.placeholder ? bonus : real).push({ project, position, when: parseStageDate(project.date) })
  })

  real.sort((a, b) => {
    if (a.when === null && b.when === null) return a.position - b.position
    if (a.when === null) return 1
    if (b.when === null) return -1
    return a.when - b.when || a.position - b.position
  })

  return [
    ...real.map(({ project }, index) => ({ ...project, stage: index + 1, key: `stage-${index + 1}` })),
    ...bonus.map(({ project }, index) => ({ ...project, stage: null, key: `bonus-${index}` })),
  ]
}

// A loop unit is at least this many half-columns wide, so one unit is always
// wider than the screen (and there is always somewhere to scroll to).
const MIN_UNIT = 8

/**
 * The zigzag for an endless horizontal loop of `count` stages.
 *
 * Cards alternate above/below the line. With an odd count, one pass would
 * end on the same side it starts, so the repeating unit is the list twice
 * (the second time with sides flipped); it is then repeated until it is at
 * least MIN_UNIT long. Three units are drawn and the view stays on the
 * middle one, wrapping by exactly one unit, so there are cards on both sides
 * of the view, the seam is invisible and the alternation never breaks.
 *
 * The real cards are the first pass of the middle unit (slots `unit` to
 * `unit + count - 1`); every other slot is a decorative copy (aria-hidden,
 * and out of the Tab order).
 *
 * @returns {{ unit: number, items: Array<{ slot: number, source: number, side: 'above' | 'below', copy: boolean }> }}
 */
export function loopLayout(count) {
  if (!Number.isInteger(count) || count <= 0) return { unit: 0, items: [] }
  let unit = count % 2 === 0 ? count : count * 2
  while (unit < MIN_UNIT) unit += count % 2 === 0 ? count : count * 2

  const items = Array.from({ length: unit * 3 }, (_, slot) => ({
    slot,
    source: slot % count,
    side: slot % 2 === 0 ? 'above' : 'below',
    copy: slot < unit || slot >= unit + count,
  }))
  return { unit, items }
}

/** Wraps any offset into [0, length). */
export function wrap(value, length) {
  if (!(length > 0)) return 0
  return ((value % length) + length) % length
}

/**
 * The step to glide to so `from` reaches `target` the short way round a loop
 * of `unit` steps: e.g. from 7 to 0 in a loop of 8 is +1, not -7.
 */
export function nearestStep(from, target, unit) {
  if (!(unit > 0)) return target
  const delta = wrap(target - from + unit / 2, unit) - unit / 2
  return from + delta
}
