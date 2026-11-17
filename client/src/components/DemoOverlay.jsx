import ArcadeButton from './ArcadeButton'
import Mascot from './Mascot'

/**
 * DemoOverlay — the HUD shown while the attract-mode tour plays: which stage
 * is on screen, a pellet per stage (eaten as the tour moves on), and a STOP
 * button. After a complete run it says "YOUR TURN" for a moment.
 *
 * The live region is always rendered, so screen readers are already
 * listening when the first announcement arrives.
 */
function DemoOverlay({ status, step, stops, onStop }) {
  const current = stops[step]
  const playing = status === 'playing'

  let announcement = ''
  if (playing && current) {
    announcement = `Demo playing: ${current.label}, stage ${step + 1} of ${stops.length}. Press any key to take over.`
  } else if (status === 'finished') {
    announcement = 'Demo over. Your turn.'
  }

  return (
    <>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {playing && current ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[75] flex justify-center px-4">
          <div className="maze-wall pointer-events-auto flex max-w-full items-center gap-3 px-4 py-3 motion-safe:animate-pop sm:gap-4">
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger motion-safe:animate-blink" />
              <span className="hud-label">DEMO</span>
            </span>

            <span aria-hidden="true" className="min-w-0">
              <span className="block font-pixel text-pixel-sm uppercase text-ink">{current.label}</span>
              <span className="mt-1 hidden text-xs text-ink-dim sm:block">
                Any key, scroll or tap to take over
              </span>
            </span>

            <span aria-hidden="true" className="hidden items-center gap-1.5 sm:flex">
              {stops.map((stop, index) => (
                <span
                  key={stop.id}
                  className={`h-2 w-2 rounded-full transition-[opacity,transform] duration-300 ${
                    index < step ? 'scale-50 bg-dot opacity-30' : 'bg-dot shadow-glow-dot'
                  }`}
                />
              ))}
            </span>

            <ArcadeButton size="sm" onClick={onStop}>
              STOP
            </ArcadeButton>
          </div>
        </div>
      ) : null}

      {status === 'finished' ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-4 z-[75] flex justify-center px-4">
          <div className="maze-wall flex items-center gap-3 px-5 py-3 motion-safe:animate-pop">
            <Mascot size={22} />
            <span className="font-pixel text-pixel-sm uppercase text-mascot-ink">YOUR TURN!</span>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DemoOverlay
