/**
 * Small shared bits for the project card (components/ProjectCard.jsx) and
 * its details popup (components/ProjectDetails.jsx).
 */

// Tag colourways cycle through the ghost crew palette.
export const TAG_TONES = [
  'border-ghost-red/55 text-ghost-red',
  'border-ghost-pink/55 text-ghost-pink',
  'border-ghost-cyan/55 text-ghost-cyan',
  'border-ghost-orange/55 text-ghost-orange',
]

export const CHIP_CLASS = 'rounded-sm border px-1.5 py-1 font-pixel text-pixel-xs uppercase leading-none tracking-hud'

// Preview-card chips (ProjectCard): the pixel font is monospaced, so a
// chip's width is known from its text: 8px a character plus 10px of padding
// and border, 4px apart. CARD_CHIP_ROOM is the narrowest timeline card's
// inner width (288px on tablets, less its 3px walls and 16px padding each
// side), so the chips stay on one row at every size.
const CHAR_PX = 8
const CHIP_PAD_PX = 10
const CHIP_GAP_PX = 4
const CARD_CHIP_ROOM = 250

const chipWidth = (text) => String(text).length * CHAR_PX + CHIP_PAD_PX

/**
 * How many of `tags` (at most `max`) a preview card shows, so they and the
 * "+N" chip for the rest fit on one row. Always at least one.
 */
export function fittedChipCount(tags = [], max = 4, room = CARD_CHIP_ROOM) {
  const fits = (n) => {
    const shown = tags.slice(0, n)
    const rest = tags.length - n
    const chips = rest > 0 ? [...shown, `+${rest}`] : shown
    const width = chips.reduce((sum, chip) => sum + chipWidth(chip), 0) + CHIP_GAP_PX * (chips.length - 1)
    return width <= room
  }
  let n = Math.min(max, tags.length)
  while (n > 1 && !fits(n)) n -= 1
  return n
}

/** "STAGE 3 · APR 2026", the label on a card's top wall. */
export function stageLabel({ stage, index = 0, date, placeholder } = {}) {
  if (placeholder) return 'BONUS STAGE'
  const number = `STAGE ${stage ?? index + 1}`
  return date ? `${number} · ${date}` : number
}
