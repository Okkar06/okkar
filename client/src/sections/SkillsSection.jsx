import ArcadeHeading from '../components/ArcadeHeading'
import BonusIcon from '../components/BonusIcon'
import EmptyState from '../components/EmptyState'
import MazeCard from '../components/MazeCard'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'

/** Skills — a grid of bonus tokens: each entry is a labelled original glyph. */
function SkillsSection({ groups = [] }) {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative scroll-mt-32 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <ArcadeHeading
            id="skills-heading"
            hud="BONUS ITEMS"
            title="Tools in the toolkit"
            subtitle="Collected along the way — the stack I reach for first."
          />
        </Reveal>

        {groups.length === 0 ? (
          <EmptyState title="No items yet" message="The toolkit is being restocked." ghost="pink" />
        ) : (
          <RevealGroup className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <RevealItem key={group.title} className="min-w-0">
                <MazeCard stage={group.stage} className="h-full p-6 pt-8">
                  <h3 className="font-pixel text-pixel-md uppercase text-ink">{group.title}</h3>
                  <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5">
                    {(group.items ?? []).map((item) => (
                      <li key={item.label} className="flex min-w-0 items-center gap-2.5">
                        <BonusIcon shape={item.shape} color={item.color} size={20} />
                        <span className="min-w-0 text-xs leading-snug text-ink-dim sm:text-sm">
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </MazeCard>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}

export default SkillsSection
