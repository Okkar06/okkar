/**
 * MazeCard — a panel boxed in by thick rounded neon maze walls, with an
 * optional HUD stage label and a brighter glow on hover or keyboard focus.
 */
function MazeCard({
  as: Tag = 'div',
  stage,
  children,
  className = '',
  interactive = false,
  ...rest
}) {
  const hover = interactive
    ? 'transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-wall hover:shadow-glow-wall-lg focus-within:border-wall focus-within:shadow-glow-wall-lg'
    : ''

  return (
    <Tag className={`maze-wall relative ${hover} ${className}`} {...rest}>
      {stage ? (
        <span className="absolute -top-2.5 left-5 z-10 rounded-sm bg-void px-2 py-0.5 hud-label">
          {stage}
        </span>
      ) : null}
      {children}
    </Tag>
  )
}

export default MazeCard
