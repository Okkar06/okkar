function ProjectCard({ title, description, tags, date, primaryUrl, secondaryUrl, index = 0, placeholder = false }) {
  const num = String(index + 1).padStart(2, '0')

  if (placeholder) {
    return (
      <article
        className="card-glass group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border-dashed text-center"
        style={{ minHeight: '260px', borderStyle: 'dashed' }}
      >
        <div className="bg-card-accent-glow pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-4 p-8">
          <span
            className="text-4xl leading-none"
            style={{ color: 'rgb(var(--accent) / 0.35)' }}
            aria-hidden="true"
          >
            ✦
          </span>
          <h3 className="section-heading text-base font-semibold leading-snug tracking-tight">
            {title}
          </h3>
          <p className="section-subtext text-sm leading-relaxed">
            {description}
          </p>
          {primaryUrl && (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="card-tag mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition duration-200 hover:opacity-80"
            >
              View GitHub →
            </a>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="hover-shadow-accent card-glass group relative flex h-full flex-col overflow-hidden rounded-2xl hover:-translate-y-2 hover:border-accent/35"
      style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }}>

      {/* Card header: number + date */}
      <div className="card-inner-header relative flex items-end justify-between overflow-hidden px-6 py-8">
        <span
          className="select-none text-[5.5rem] font-bold leading-none tracking-tighter"
          style={{ color: 'rgb(var(--accent) / 0.07)' }}
          aria-hidden="true"
        >
          {num}
        </span>
        <span className="section-label text-[0.65rem]">{date}</span>
        <div className="bg-card-accent-glow pointer-events-none absolute inset-0" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="section-heading text-base font-semibold leading-snug tracking-tight">
          {title}
        </h3>
        <p className="section-subtext mt-3 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags && tags.map((tag) => (
            <span
              key={tag}
              className="card-tag rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {primaryUrl && primaryUrl !== '#' && (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2 text-xs font-semibold tracking-wide transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Live demo
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          )}
          {secondaryUrl ? (
            <a
              href={secondaryUrl}
              target="_blank"
              rel="noreferrer"
              className="card-tag inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2"
            >
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
