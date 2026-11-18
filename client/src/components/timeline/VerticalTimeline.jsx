import PowerDot from '../PowerDot'
import ProjectCard from '../ProjectCard'

/**
 * VerticalTimeline — the phone layout: one line down the left, the stages
 * stacked to its right, newest first (the BONUS STAGE, being what's next,
 * leads). Nothing moves on its own. Cards open the same details popup as
 * the desktop timeline.
 */
function VerticalTimeline({ stages, onDetails }) {
  const newestFirst = [...stages].reverse()

  return (
    <ol aria-label="Project timeline, newest first" className="relative space-y-9 pl-10">
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-[18.5px] top-3 w-[3px] rounded-full bg-wall shadow-glow-wall"
      />
      {newestFirst.map((stage) => (
        <li key={stage.key} className="relative">
          <span aria-hidden="true" className="absolute -left-10 top-7 flex w-10 items-center justify-center">
            <PowerDot power />
          </span>
          <ProjectCard {...stage} onDetails={onDetails && ((opener) => onDetails(stage, opener))} />
        </li>
      ))}
    </ol>
  )
}

export default VerticalTimeline
