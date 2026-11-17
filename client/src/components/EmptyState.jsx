import Ghost from './Ghost'

/**
 * EmptyState — shown where a list has nothing in it yet. A lone ghost floats
 * over the message so an empty section reads as "nothing here yet" rather
 * than as a broken page.
 */
function EmptyState({ title, message, ghost = 'cyan', children }) {
  return (
    <div className="maze-wall mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
      <Ghost color={ghost} size={44} />
      <p className="font-pixel text-pixel-md uppercase text-ink">{title}</p>
      {message ? <p className="text-sm leading-relaxed text-ink-dim">{message}</p> : null}
      {children}
    </div>
  )
}

export default EmptyState
