import MazeCard from './MazeCard'
import PowerDot from './PowerDot'

// Tag colourways cycle through the ghost crew palette.
const TAG_TONES = [
  'border-ghost-red/55 text-ghost-red',
  'border-ghost-pink/55 text-ghost-pink',
  'border-ghost-cyan/55 text-ghost-cyan',
  'border-ghost-orange/55 text-ghost-orange',
]

const linkBase =
  'inline-flex items-center gap-2 rounded-tile border-2 px-4 py-2 font-pixel text-[0.5rem] uppercase tracking-hud transition-transform duration-200 hover:-translate-y-0.5'

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
  const stage = placeholder ? 'BONUS STAGE' : `STAGE ${index + 1}`

  if (placeholder) {
    return (
      <MazeCard
        as="article"
        stage={stage}
        className="flex h-full min-h-[260px] flex-col items-center justify-center gap-5 p-7 text-center"
      >
        <div className="flex items-center gap-2" aria-hidden="true">
          <PowerDot size="sm" />
          <PowerDot power />
          <PowerDot size="sm" />
        </div>
        <h3 className="font-pixel text-[0.65rem] uppercase leading-[1.7] text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-dim">{description}</p>
        {primaryUrl ? (
          <a href={primaryUrl} target="_blank" rel="noreferrer noopener" className={`${linkBase} border-wall text-ink`}>
            VIEW GITHUB
          </a>
        ) : null}
      </MazeCard>
    )
  }

  return (
    <MazeCard as="article" stage={stage} interactive className="flex h-full flex-col p-6 pt-8 sm:p-7 sm:pt-9">
      {date ? <p className="hud-label mb-3">{date}</p> : null}
      <h3 className="font-pixel text-[0.65rem] uppercase leading-[1.8] text-ink">{title}</h3>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-dim">{description}</p>

      {tags.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <li
              key={tag}
              className={`rounded-sm border px-2 py-1 font-pixel text-[0.4rem] uppercase tracking-hud ${
                TAG_TONES[i % TAG_TONES.length]
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        {primaryUrl && primaryUrl !== '#' ? (
          <a
            href={primaryUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={`${linkBase} border-mascot bg-mascot text-on-mascot`}
          >
            PLAY DEMO
          </a>
        ) : null}
        {secondaryUrl ? (
          <a
            href={secondaryUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={`${linkBase} border-wall text-ink`}
          >
            SOURCE
          </a>
        ) : null}
      </div>
    </MazeCard>
  )
}

export default ProjectCard
