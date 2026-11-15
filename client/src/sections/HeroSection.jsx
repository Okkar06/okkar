import { motion, useReducedMotion } from 'framer-motion'
import Ghost from '../components/Ghost'
import Mascot from '../components/Mascot'
import PowerDot from '../components/PowerDot'

const CHASE_DOTS = 10
const CHASE_SECONDS = 6

/**
 * ChaseLane — the mascot runs left to right across the hero and the pellets
 * blank out as it passes. Pure decoration: nothing here responds to input.
 */
function ChaseLane() {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div aria-hidden="true" className="pointer-events-none mt-10 flex items-center gap-3">
        <Mascot size={34} chomping={false} />
        {Array.from({ length: CHASE_DOTS }, (_, i) => (
          <PowerDot key={i} size="sm" />
        ))}
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mt-10 h-10 w-full max-w-md overflow-hidden"
    >
      {/* Pellets: each one blanks out as the mascot reaches it. */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between pl-12 pr-2">
        {Array.from({ length: CHASE_DOTS }, (_, i) => {
          const pass = (i + 1) / (CHASE_DOTS + 1)
          return (
            <motion.span
              key={i}
              className="h-2 w-2 shrink-0 rounded-full bg-dot shadow-glow-dot"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{
                duration: CHASE_SECONDS,
                times: [0, pass, Math.min(pass + 0.03, 1), 1],
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )
        })}
      </div>

      {/* The runner */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        animate={{ x: ['0%', '92%'] }}
        transition={{ duration: CHASE_SECONDS, repeat: Infinity, ease: 'linear' }}
      >
        <div className="animate-mascot-run">
          <Mascot size={34} />
        </div>
      </motion.div>
    </div>
  )
}

function HeroSection({ firstName, lastName, tagline, available }) {
  const shouldReduceMotion = useReducedMotion()

  const rise = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      }

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-36"
    >
      {/* Decorative maze floor + ghost crew */}
      <div aria-hidden="true" className="maze-floor pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* All four sit in the empty right-hand half, so they never cross the
            name, the tagline or the buttons at any width. */}
        <Ghost color="pink" size={30} delay={0.7} className="absolute right-[8%] top-[22%] hidden md:block" />
        <Ghost color="cyan" size={28} drift="drift" delay={1.4} className="absolute right-[24%] top-[52%] hidden lg:block" />
        <Ghost color="red" size={32} drift="drift" className="absolute right-[12%] bottom-[24%] hidden lg:block" />
        <Ghost color="orange" size={26} delay={2.1} className="absolute right-[34%] top-[16%] hidden xl:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div variants={rise} initial="hidden" animate="visible">
          <div className="flex flex-wrap items-center gap-2.5">
            <PowerDot power />
            <span className="hud-label animate-hud-flicker">PLAYER 1 — FULL STACK</span>
          </div>

          <h1
            id="hero-heading"
            className="mt-6 font-pixel uppercase leading-[1.35] text-ink drop-shadow-glow-wall"
            style={{ fontSize: 'clamp(1.6rem, 8.5vw, 5rem)' }}
          >
            <span className="block">{firstName}</span>
            <span className="mt-2 block text-mascot-ink drop-shadow-glow-mascot">{lastName}</span>
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-relaxed text-ink-dim sm:text-base">
            {tagline}
          </p>

          {available ? (
            <p className="mt-5 inline-flex items-center gap-2.5 rounded-tile border-2 border-ghost-cyan/50 px-3 py-1.5">
              <PowerDot power tone="cyan" />
              <span className="font-pixel text-[0.5rem] uppercase tracking-hud text-ghost-cyan sm:text-[0.6rem]">
                INSERT ROLE — OPEN TO WORK
              </span>
            </p>
          ) : null}

          {/* PRESS START — jumps to the project stages. Decorative blink only. */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 rounded-tile border-maze border-mascot bg-mascot px-6 py-3.5 font-pixel text-[0.6rem] uppercase tracking-hud text-on-mascot shadow-glow-mascot transition-transform duration-200 hover:-translate-y-0.5 sm:text-xs"
            >
              <span className="animate-blink">▶</span>
              PRESS START
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-tile border-2 border-wall px-5 py-3 font-pixel text-[0.55rem] uppercase tracking-hud text-ink transition-colors duration-200 hover:text-hud sm:text-[0.65rem]"
            >
              CONTINUE?
            </a>
          </div>

          <ChaseLane />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
