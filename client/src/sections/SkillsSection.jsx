import ArcadeHeading from '../components/ArcadeHeading'
import BonusIcon from '../components/BonusIcon'
import MazeCard from '../components/MazeCard'

/**
 * Skills — a static grid of bonus tokens. No animation, no interaction: each
 * entry is just a labelled original bonus glyph.
 */
function SkillsSection({ groups = [] }) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative scroll-mt-32 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <ArcadeHeading
          id="skills-heading"
          hud="BONUS ITEMS"
          title="Tools in the toolkit"
          subtitle="Collected along the way — the stack I reach for first."
        />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <MazeCard key={group.title} stage={group.stage} className="p-6 pt-8">
              <h3 className="font-pixel text-[0.6rem] uppercase leading-[1.7] text-ink">
                {group.title}
              </h3>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    <BonusIcon shape={item.shape} color={item.color} size={20} />
                    <span className="text-xs leading-snug text-ink-dim sm:text-[0.8rem]">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </MazeCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SkillsSection
