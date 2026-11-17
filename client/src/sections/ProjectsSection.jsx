import ArcadeHeading from '../components/ArcadeHeading'
import EmptyState from '../components/EmptyState'
import Ghost from '../components/Ghost'
import ProjectCard from '../components/ProjectCard'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'

function ProjectsSection({ projects = [] }) {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative scroll-mt-32 px-4 py-20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="orange" size={28} className="absolute right-[10%] top-5 hidden lg:block" />
        <Ghost color="cyan" size={26} drift="drift" delay={1.1} className="absolute bottom-5 right-[22%] hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <ArcadeHeading
            id="projects-heading"
            hud="STAGE SELECT"
            title="Selected work"
            subtitle="Every stage taught me something new. Clear them in any order."
          />
        </Reveal>

        {projects.length === 0 ? (
          <EmptyState
            title="No stages yet"
            message="Projects are on their way. Check back soon."
            ghost="orange"
          />
        ) : (
          <RevealGroup className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <RevealItem key={project.title} className="h-full min-w-0">
                <ProjectCard {...project} index={i} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}

export default ProjectsSection
