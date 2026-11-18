import PixelSprite from '../PixelSprite'

const BUTTON = 'maze-tile chomp grid h-9 w-9 place-items-center'

/**
 * Pixel-style timeline controls: previous / pause-play / next. The pause
 * button is the WCAG "way to stop" for the moving timeline; it is left out
 * when nothing moves on its own (reduced motion).
 */
function TimelineControls({ paused, onTogglePause, onPrevious, onNext, showPause = true }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={BUTTON} aria-label="Previous stage" onClick={onPrevious}>
        <PixelSprite name="arrowLeft" size={12} />
      </button>
      {showPause ? (
        <button
          type="button"
          className={BUTTON}
          aria-label={paused ? 'Play timeline' : 'Pause timeline'}
          onClick={onTogglePause}
        >
          <PixelSprite name={paused ? 'play' : 'pause'} size={12} />
        </button>
      ) : null}
      <button type="button" className={BUTTON} aria-label="Next stage" onClick={onNext}>
        <PixelSprite name="arrowRight" size={12} />
      </button>
    </div>
  )
}

export default TimelineControls
