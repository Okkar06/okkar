import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { isSafeHref } from '../lib/links'
import { CHIP_CLASS, TAG_TONES, stageLabel } from '../lib/projectMeta'
import ArcadeButton from './ArcadeButton'
import MazeCard from './MazeCard'
import PixelSprite from './PixelSprite'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * ProjectDetails — the arcade-style popup behind a card's DETAILS button: the
 * full description, every tech chip, and the demo and source links.
 *
 * A modal dialog: Tab stays inside it, Esc, the close button or a click
 * outside closes it, the page behind doesn't scroll, and focus goes back to
 * `returnFocus` (the card's DETAILS button) when it closes. Rendered into
 * <body>, so the moving timeline it was opened from can't clip or shift it.
 */
function ProjectDetails({ project, onClose, returnFocus }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const pressedInside = useRef(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!project) return undefined
    closeRef.current?.focus()

    // Lock the page scroll; pad for the scrollbar so nothing jumps sideways.
    const root = document.documentElement
    const { overflow, paddingRight } = root.style
    const scrollbar = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('keydown', handleKey)
      root.style.overflow = overflow
      root.style.paddingRight = paddingRight
      returnFocus?.focus({ preventScroll: true })
    }
  }, [project, returnFocus])

  if (!project) return null

  const { title, description, tags = [], primaryUrl, secondaryUrl } = project
  const demoUrl = isSafeHref(primaryUrl) ? primaryUrl : null
  const sourceUrl = isSafeHref(secondaryUrl) ? secondaryUrl : null

  return createPortal(
    <div
      data-testid="details-backdrop"
      className="fixed inset-0 z-[65] grid place-items-center overflow-y-auto bg-void/80 p-4 backdrop-blur-sm"
      // Only a press that starts and ends on the backdrop closes it, so
      // selecting text inside and letting go outside doesn't.
      onMouseDown={(event) => {
        pressedInside.current = event.target !== event.currentTarget
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pressedInside.current) onClose()
        pressedInside.current = false
      }}
    >
      <MazeCard
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        stage={stageLabel(project)}
        className="relative my-auto w-full max-w-lg p-6 pt-9 motion-safe:animate-pop sm:p-8 sm:pt-10"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="maze-tile chomp absolute right-3 top-3 grid h-9 w-9 place-items-center"
        >
          <PixelSprite name="close" size={12} />
        </button>

        <h2 id={titleId} className="pr-12 font-pixel text-pixel-md uppercase leading-relaxed text-ink">
          {title}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-ink-dim sm:text-base sm:leading-relaxed">{description}</p>

        {tags.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Built with">
            {tags.map((tag, i) => (
              <li key={tag} className={`${CHIP_CLASS} ${TAG_TONES[i % TAG_TONES.length]}`}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {demoUrl || sourceUrl ? (
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {demoUrl ? (
              <ArcadeButton href={demoUrl} variant="primary" size="sm" aria-label={`Play demo: ${title}`}>
                PLAY DEMO
              </ArcadeButton>
            ) : null}
            {sourceUrl ? (
              <ArcadeButton href={sourceUrl} size="sm" aria-label={`Source code: ${title}`}>
                SOURCE
              </ArcadeButton>
            ) : null}
          </div>
        ) : null}
      </MazeCard>
    </div>,
    document.body,
  )
}

export default ProjectDetails
