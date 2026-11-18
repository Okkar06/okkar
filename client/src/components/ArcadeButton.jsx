import { externalProps, isExternal } from '../lib/links'
import PelletLoader from './PelletLoader'

const BASE =
  'chomp inline-flex items-center justify-center gap-2.5 rounded-tile font-pixel uppercase tracking-hud transition-[transform,border-color,color,box-shadow] duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const VARIANTS = {
  // The one neon call to action per view; it takes the theme's colour.
  primary: 'border-maze border-neon bg-neon text-on-neon shadow-glow-neon',
  // Everything else: an outlined maze tile.
  secondary: 'border-2 border-wall text-ink hover:text-hud hover:shadow-glow-wall',
}

const SIZES = {
  xs: 'px-3 py-1.5 text-pixel-xs',
  sm: 'px-4 py-2 text-pixel-sm',
  md: 'px-5 py-3 text-pixel-sm',
  lg: 'px-6 py-3.5 text-pixel-sm sm:text-pixel-md',
}

/**
 * ArcadeButton — the site's one button. Renders a link when given `href`
 * (new-tab links are announced as such) and a <button> otherwise.
 *
 * `pending` disables it and swaps in the pellet loader, so an action can't
 * be fired twice while a request is in flight.
 */
function ArcadeButton({
  href,
  variant = 'secondary',
  size = 'md',
  pending = false,
  pendingLabel,
  className = '',
  children,
  ...rest
}) {
  const classes = `${BASE} ${VARIANTS[variant] ?? VARIANTS.secondary} ${SIZES[size] ?? SIZES.md} ${className}`

  if (href) {
    const external = isExternal(href)
    const { 'aria-label': label, ...linkRest } = rest
    // An aria-label replaces the link's contents as its name, so the
    // new-tab hint has to be carried in the label itself.
    const name = label && external ? `${label} (opens in a new tab)` : label

    return (
      <a href={href} {...externalProps(href)} className={classes} aria-label={name} {...linkRest}>
        {children}
        {external && !label ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    )
  }

  return (
    <button type="button" {...rest} disabled={pending || rest.disabled} aria-busy={pending || undefined} className={classes}>
      {pending ? (
        <>
          {pendingLabel ?? children}
          <PelletLoader />
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default ArcadeButton
