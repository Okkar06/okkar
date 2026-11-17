import { externalProps, isExternal } from '../lib/links'

const SIZES = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
}

/**
 * IconLink — a square maze-tile link that shows only an icon. `label` is its
 * accessible name (and tooltip); new-tab links say so to screen readers.
 */
function IconLink({ href, label, size = 'md', children }) {
  const external = isExternal(href)

  return (
    <a
      href={href}
      {...externalProps(href)}
      aria-label={external ? `${label} (opens in a new tab)` : label}
      title={label}
      className={`chomp grid shrink-0 place-items-center rounded-tile border-2 border-wall/50 text-ink transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-wall hover:text-hud ${
        SIZES[size] ?? SIZES.md
      }`}
    >
      {children}
    </a>
  )
}

export default IconLink
