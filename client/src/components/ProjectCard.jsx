function ProjectCard({ title, description, tags, date, primaryUrl, secondaryUrl, index = 0 }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <article className="hover-shadow-accent group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/70 hover:-translate-y-2 hover:border-accent/35">
      {/* Card header: large number + date */}
      <div className="relative flex items-end justify-between overflow-hidden border-b border-white/10 bg-gradient-to-br from-white/5 via-bg to-bg px-6 py-8">
        <span
          className="select-none text-[5.5rem] font-bold leading-none tracking-tighter text-white/[0.04]"
          aria-hidden="true"
        >
          {num}
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-neutral-500">
          {date}
        </span>
        <div className="bg-card-accent-glow pointer-events-none absolute inset-0" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-base font-semibold leading-snug tracking-tight text-neutral-100">
          {title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-400">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <a
            href={primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2 text-xs font-semibold tracking-wide text-neutral-100 transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Live demo
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
          {secondaryUrl ? (
            <a
              href={secondaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold tracking-wide text-neutral-300 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
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
