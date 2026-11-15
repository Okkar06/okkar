import PowerDot from './PowerDot'

/**
 * ArcadeHeading — a section title in the pixel font with an arcade HUD strip
 * above it. The HUD text ("1UP", "HIGH SCORE", "READY!") is decoration: there
 * is no real score anywhere in this site.
 */
function ArcadeHeading({ hud, title, subtitle, id, align = 'left', level = 2 }) {
  const Tag = `h${level}`
  const centred = align === 'center'

  return (
    <div className={`mb-10 ${centred ? 'text-center' : 'text-left'}`}>
      <div
        className={`flex items-center gap-2.5 ${centred ? 'justify-center' : 'justify-start'}`}
      >
        <PowerDot power />
        {hud ? <span className="hud-label animate-hud-flicker">{hud}</span> : null}
        <PowerDot size="sm" />
        <PowerDot size="sm" />
      </div>

      <Tag
        id={id}
        className="mt-4 font-pixel text-base uppercase leading-[1.5] text-ink drop-shadow-glow-wall sm:text-xl md:text-2xl"
      >
        {title}
      </Tag>

      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl text-sm leading-relaxed text-ink-dim sm:text-base ${
            centred ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export default ArcadeHeading
