import { useRef } from 'react'
import { isSafeHref } from '../lib/links'
import { TAG_TONES, fittedChipCount, stageLabel } from '../lib/projectMeta'
import ArcadeButton from './ArcadeButton'
import MazeCard from './MazeCard'
import PowerDot from './PowerDot'

// A preview card shows up to this many tech chips (as many as fit on one
// row), then "+N". Monospaced and tightly spaced: see lib/projectMeta.js.
const MAX_CHIPS = 4
const CHIP = 'rounded-sm border px-1 py-1 font-pixel text-pixel-xs uppercase leading-none'

/**
 * ProjectCard — a compact preview of one project for the timeline: stage and
 * date, title, a short clamped description, up to four tech chips (one
 * row) and the demo link. Everything else (the full write-up, every chip, the source
 * code) is one press away in the details popup (ProjectDetails), opened by
 * DETAILS or by clicking the card itself.
 *
 * `focusable={false}` takes its links and buttons out of the Tab order, for
 * the timeline's decorative loop copies, which stay clickable.
 */
function ProjectCard({
  title,
  description,
  tags = [],
  date,
  primaryUrl,
  index = 0,
  stage,
  placeholder = false,
  onDetails,
  focusable = true,
}) {
  const detailsRef = useRef(null)
  const demoUrl = isSafeHref(primaryUrl) ? primaryUrl : null
  const tabIndex = focusable ? undefined : -1

  if (placeholder) {
    return (
      <MazeCard
        as="article"
        stage={stageLabel({ placeholder })}
        className="flex h-full flex-col items-center justify-center gap-3 px-4 pb-4 pt-7 text-center"
      >
        {/* The bonus stage has no popup, so its text is never clamped; the
            dots make room for it on laptop-height screens (≤820px tall) instead. */}
        <div className="flex items-center gap-2 [@media(max-height:820px)]:hidden" aria-hidden="true">
          <PowerDot size="sm" />
          <PowerDot power />
          <PowerDot size="sm" />
        </div>
        <h3 className="font-pixel text-pixel-sm uppercase leading-relaxed text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-dim">{description}</p>
        {demoUrl ? (
          <ArcadeButton href={demoUrl} size="xs" tabIndex={tabIndex}>
            VIEW GITHUB
          </ArcadeButton>
        ) : null}
      </MazeCard>
    )
  }

  const shown = tags.slice(0, fittedChipCount(tags, MAX_CHIPS))
  const hidden = tags.length - shown.length

  // A click anywhere on the card but its buttons opens the details too.
  const handleCardClick = (event) => {
    if (!onDetails || event.target.closest('a, button')) return
    onDetails(detailsRef.current)
  }

  return (
    <MazeCard
      as="article"
      stage={stageLabel({ stage, index, date })}
      interactive
      onClick={handleCardClick}
      className={`flex h-full min-w-0 flex-col px-4 pb-4 pt-7 ${onDetails ? 'cursor-pointer' : ''}`}
    >
      <h3 className="font-pixel text-pixel-sm uppercase leading-relaxed text-ink line-clamp-2">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-ink-dim line-clamp-3 [@media(max-height:820px)]:line-clamp-2">{description}</p>

      {shown.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1" aria-label="Built with">
          {shown.map((tag, i) => (
            <li key={tag} className={`${CHIP} ${TAG_TONES[i % TAG_TONES.length]}`}>
              {tag}
            </li>
          ))}
          {hidden > 0 ? (
            <li className={`${CHIP} border-wall/45 text-ink-dim`}>
              <span aria-hidden="true">+{hidden}</span>
              <span className="sr-only">and {hidden} more</span>
            </li>
          ) : null}
        </ul>
      ) : null}

      {demoUrl || onDetails ? (
        // mt-auto pins the buttons to the bottom, so a row of cards lines up.
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          {demoUrl ? (
            <ArcadeButton
              href={demoUrl}
              variant="primary"
              size="xs"
              tabIndex={tabIndex}
              aria-label={`Play demo: ${title}`}
            >
              PLAY DEMO
            </ArcadeButton>
          ) : null}
          {onDetails ? (
            <ArcadeButton
              ref={detailsRef}
              size="xs"
              tabIndex={tabIndex}
              aria-haspopup="dialog"
              aria-label={`Details: ${title}`}
              onClick={() => onDetails(detailsRef.current)}
            >
              DETAILS
            </ArcadeButton>
          ) : null}
        </div>
      ) : null}
    </MazeCard>
  )
}

export default ProjectCard
