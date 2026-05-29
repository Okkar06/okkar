function ProjectCard({ title, description, tags, date, primaryUrl, secondaryUrl }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 transition duration-200 hover:-translate-y-1.5 hover:border-accent/40 hover:bg-card/90 hover:shadow-[0_18px_70px_-30px_rgba(91,66,245,0.65)]">
      <div className="relative aspect-video w-full overflow-hidden border-b border-white/10 bg-gradient-to-br from-white/10 via-bg to-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,66,245,0.22),transparent_55%)] opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-bg/90 to-transparent" />
        <p className="absolute left-4 top-4 rounded-full border border-white/10 bg-bg/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-200/90">
          {/* REPLACE: Thumbnail label */}
          Screenshot
        </p>
        <p className="absolute right-4 top-4 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-300/80">
          {/* REPLACE: Month + year */}
          {date}
        </p>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold tracking-tight text-neutral-100">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-200/85"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-100 transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <span>{/* REPLACE: Primary button label */}View</span>
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>

          {secondaryUrl ? (
            <a
              href={secondaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-200 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <span>{/* REPLACE: Secondary button label */}Code</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
