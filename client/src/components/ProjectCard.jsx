import { isSafeHref } from '../lib/links'
import ArcadeButton from './ArcadeButton'
import MazeCard from './MazeCard'
import PowerDot from './PowerDot'

// Tag colourways cycle through the ghost crew palette.
const TAG_TONES = [
  'border-ghost-red/55 text-ghost-red',
  'border-ghost-pink/55 text-ghost-pink',
  'border-ghost-cyan/55 text-ghost-cyan',
  'border-ghost-orange/55 text-ghost-orange',
]

const titleClass = 'font-pixel text-pixel-md uppercase text-ink'

function ProjectCard({
  title,
  description,
  tags = [],
  date,
  primaryUrl,
  secondaryUrl,
  index = 0,
  placeholder = false,
}) {
  const demoUrl = isSafeHref(primaryUrl) ? primaryUrl : null
  const sourceUrl = isSafeHref(secondaryUrl) ? secondaryUrl : null

  if (placeholder) {
    return (
      <MazeCard
        as="article"
        stage="BONUS STAGE"
        className="flex h-full min-h-[260px] flex-col items-center justify-center gap-5 p-7 text-center"
      >
        <div className="flex items-center gap-2" aria-hidden="true">
          <PowerDot size="sm" />
          <PowerDot power />
          <PowerDot size="sm" />
        </div>
        <h3 className={titleClass}>{title}</h3>
        <p className="text-sm leading-relaxed text-ink-dim">{description}</p>
        {demoUrl ? (
          <ArcadeButton href={demoUrl} size="sm">
            VIEW GITHUB
          </ArcadeButton>
        ) : null}
      </MazeCard>
    )
  }

  return (
    <MazeCard
      as="article"
      stage={`STAGE ${index + 1}`}
      interactive
      className="flex h-full min-w-0 flex-col p-6 pt-8 sm:p-7 sm:pt-9"
    >
      {date ? <p className="hud-label mb-3">{date}</p> : null}
      <h3 className={titleClass}>{title}</h3>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-dim">{description}</p>

      {tags.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Built with">
          {tags.map((tag, i) => (
            <li
              key={tag}
              className={`rounded-sm border px-2 py-1 font-pixel text-pixel-xs uppercase leading-none tracking-hud ${
                TAG_TONES[i % TAG_TONES.length]
              }`}
            >
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
  )
}

export default ProjectCard
