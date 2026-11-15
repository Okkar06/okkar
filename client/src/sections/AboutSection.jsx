import { motion, useReducedMotion } from 'framer-motion'
import ArcadeHeading from '../components/ArcadeHeading'
import Ghost from '../components/Ghost'
import MazeCard from '../components/MazeCard'
import PowerDot from '../components/PowerDot'

const ease = [0.22, 1, 0.36, 1]

function AboutSection({ bio, highlights = [], photoSrc, nowText }) {
  const shouldReduceMotion = useReducedMotion()

  const still = { hidden: { opacity: 1 }, visible: { opacity: 1 } }

  const container = shouldReduceMotion
    ? still
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }

  const fadeUp = shouldReduceMotion
    ? still
    : {
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      }

  return (
    <motion.section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-32 px-4 py-20 sm:px-6"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="pink" size={28} drift="drift" className="absolute right-[8%] top-4 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div variants={fadeUp}>
          <ArcadeHeading
            id="about-heading"
            hud="PLAYER PROFILE"
            title="Who's at the controls"
          />
        </motion.div>

        <div className="grid gap-8 md:grid-cols-5 md:items-start">
          <motion.div variants={fadeUp} className="md:col-span-3">
            <MazeCard className="p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-ink-dim sm:text-base">{bio}</p>

              {highlights.length > 0 ? (
                <ul className="mt-7 space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5">
                        <PowerDot size="sm" />
                      </span>
                      <span className="text-sm leading-relaxed text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {nowText ? (
                <div className="mt-7 rounded-tile border-2 border-wall/40 bg-floor/60 p-4">
                  <p className="hud-label">NOW PLAYING</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">{nowText}</p>
                </div>
              ) : null}
            </MazeCard>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-2">
            <MazeCard className="overflow-hidden p-2">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-tile bg-floor">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt="Okkar Hein"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                ) : null}
              </div>
            </MazeCard>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default AboutSection
