import { useCallback, useMemo, useState } from 'react'
import ArcadeHeading from '../components/ArcadeHeading'
import EmptyState from '../components/EmptyState'
import Ghost from '../components/Ghost'
import ProjectDetails from '../components/ProjectDetails'
import { Reveal } from '../components/Reveal'
import HorizontalTimeline from '../components/timeline/HorizontalTimeline'
import VerticalTimeline from '../components/timeline/VerticalTimeline'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { orderStages } from '../lib/timeline'

/**
 * Selected work as a timeline: an endless zigzag that steps through the
 * stages like a slideshow from 768px up, a still vertical list on phones.
 * Stages are numbered oldest first from data/content.js. Each card is a
 * short preview; DETAILS opens the full write-up in a popup.
 *
 * From 768px up the section is sized to fit on one screen below the fixed
 * header (about 90px tall, hence the scroll margin), even at 1366×768.
 */
function ProjectsSection({ projects = [], holdMs, glideMs }) {
  const stages = useMemo(() => orderStages(projects), [projects])
  const wide = useMediaQuery('(min-width: 768px)')
  // { project, opener }: the open popup and the button to hand focus back to.
  const [details, setDetails] = useState(null)

  const openDetails = useCallback((project, opener) => setDetails({ project, opener }), [])
  const closeDetails = useCallback(() => setDetails(null), [])

  const heading = (
    <ArcadeHeading
      id="projects-heading"
      hud="STAGE SELECT"
      title="Selected work"
      subtitle="Every stage taught me something new. Here's the run so far."
      className={wide ? 'mb-0' : 'mb-10'}
    />
  )

  let body
  if (stages.length === 0) {
    body = (
      <>
        {heading}
        <EmptyState title="No stages yet" message="Projects are on their way. Check back soon." ghost="orange" />
      </>
    )
  } else if (wide) {
    body = (
      <HorizontalTimeline
        stages={stages}
        heading={heading}
        onDetails={openDetails}
        detailsOpen={details !== null}
        holdMs={holdMs}
        glideMs={glideMs}
      />
    )
  } else {
    body = (
      <>
        {heading}
        <VerticalTimeline stages={stages} onDetails={openDetails} />
      </>
    )
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative scroll-mt-32 px-4 py-20 sm:px-6 md:scroll-mt-[5.625rem] md:py-[clamp(0.75rem,2.5vh,4rem)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="orange" size={28} className="absolute right-[10%] top-5 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>{body}</Reveal>
      </div>

      <ProjectDetails project={details?.project} returnFocus={details?.opener} onClose={closeDetails} />
    </section>
  )
}

export default ProjectsSection
