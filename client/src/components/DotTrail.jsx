/**
 * DotTrail — a line of pellets. `eaten` blanks out the leading dots, which is
 * how the scroll-progress rail shows how far down the page the reader is.
 * Decoration only: aria-hidden, pointer-events disabled.
 */
function DotTrail({
  count = 12,
  eaten = 0,
  orientation = 'horizontal',
  gap = 'gap-2',
  dotClass = 'h-1.5 w-1.5',
  className = '',
}) {
  const layout = orientation === 'vertical' ? 'flex-col' : 'flex-row'

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none flex items-center ${layout} ${gap} ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`shrink-0 rounded-full bg-dot shadow-glow-dot transition-[opacity,transform] duration-200 ${dotClass} ${
            i < eaten ? 'scale-[0.2] opacity-0' : 'scale-100 opacity-90'
          }`}
        />
      ))}
    </span>
  )
}

export default DotTrail
