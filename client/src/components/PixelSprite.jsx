import { INK, SPRITES } from '../lib/pixelSprites'

/**
 * PixelSprite — small original pixel-art sprites, drawn from character grids
 * as crisp SVG rectangles. Every colour is a theme token, so they recolour
 * with the theme picker. Nothing here is traced from any existing game.
 *
 * Decoration only: aria-hidden, never focusable, never takes a click.
 */

/** Collapses each row into runs of one colour, so a sprite is a few rects. */
function toRuns(rows) {
  const runs = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const char = row[x]
      let end = x + 1
      while (end < row.length && row[end] === char) end += 1
      if (INK[char]) runs.push({ x, y, width: end - x, className: INK[char] })
      x = end
    }
  })
  return runs
}

const RUNS = Object.fromEntries(Object.entries(SPRITES).map(([name, rows]) => [name, toRuns(rows)]))

/**
 * @param {{ name: keyof typeof SPRITES, size?: number, className?: string, style?: object }} props
 * `size` is the rendered height in px; width follows the sprite's own shape.
 */
function PixelSprite({ name, size = 24, className = '', style }) {
  const rows = SPRITES[name]
  if (!rows) return null
  const height = rows.length
  const width = rows[0].length

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={(size * width) / height}
      height={size}
      shapeRendering="crispEdges"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none shrink-0 ${className}`}
      style={style}
      data-sprite={name}
    >
      {RUNS[name].map((run) => (
        <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height="1" className={run.className} />
      ))}
    </svg>
  )
}

export default PixelSprite
