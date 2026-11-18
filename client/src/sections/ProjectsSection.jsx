import { useMemo } from 'react'
import ArcadeHeading from '../components/ArcadeHeading'
import EmptyState from '../components/EmptyState'
import Ghost from '../components/Ghost'
import { Reveal } from '../components/Reveal'
import HorizontalTimeline from '../components/timeline/HorizontalTimeline'
import VerticalTimeline from '../components/timeline/VerticalTimeline'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { orderStages } from '../lib/timeline'

/**
 * Selected work as a timeline: an endless zigzag that steps through the
 * stages like a slideshow from 768px up, a still vertical list on phones.
 * Stages are numbered oldest first from data/content.js.
 */
function ProjectsSection({ projects = [], holdMs, glideMs }) {
  const stages = useMemo(() => orderStages(projects), [projects])
  const wide = useMediaQuery('(min-width: 768px)')

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative scroll-mt-32 px-4 py-20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="orange" size={28} className="absolute right-[10%] top-5 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <ArcadeHeading
            id="projects-heading"
            hud="STAGE SELECT"
            title="Selected work"
            subtitle="Every stage taught me something new. Here's the run so far."
          />
        </Reveal>

        {stages.length === 0 ? (
          <EmptyState
            title="No stages yet"
            message="Projects are on their way. Check back soon."
            ghost="orange"
          />
        ) : (
          <Reveal>
            {wide ? (
              <HorizontalTimeline stages={stages} holdMs={holdMs} glideMs={glideMs} />
            ) : (
              <VerticalTimeline stages={stages} />
            )}
          </Reveal>
        )}
      </div>
    </section>
  )
}

export default ProjectsSection
