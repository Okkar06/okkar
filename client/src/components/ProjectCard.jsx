function ProjectCard({ name, description, tags, githubUrl, liveUrl }) {
  return (
    <article className="rounded-xl border border-gray-700 bg-card p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-accent">
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      <p className="mt-3 text-gray-300">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-gray-600 px-3 py-1 text-xs font-medium text-gray-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex gap-4 text-sm font-medium">
        <a className="text-accent hover:text-blue-300" href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="text-accentAlt hover:text-purple-300" href={liveUrl} target="_blank" rel="noreferrer">
          Live Demo
        </a>
      </div>
    </article>
  )
}

export default ProjectCard
