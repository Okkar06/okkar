import ArcadeButton from '../components/ArcadeButton'
import Ghost from '../components/Ghost'
import Mascot from '../components/Mascot'
import PowerDot from '../components/PowerDot'

const CHASE_DOTS = 10

/**
 * ChaseLane — the mascot runs left to right across the hero and the pellets
 * vanish as it reaches them. Pure decoration, and pure CSS: a clipping window
 * slides right while the pellet row inside it slides left by the same amount
 * (see `chase-window` / `chase-counter` in tailwind.config.js), so only
 * `transform` is animated. Under prefers-reduced-motion it is a still frame.
 */
function ChaseLane() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mt-10 h-10 w-full max-w-md overflow-hidden"
    >
      <div className="absolute inset-0 motion-safe:animate-chase-window">
        {/* The clip starts inside the runner, so a pellet disappears behind
            its mouth rather than in front of it. */}
        <div className="absolute inset-y-0 left-5 right-0 overflow-hidden">
          <div className="absolute inset-y-0 -left-5 right-0 flex items-center justify-between pl-12 pr-2 motion-safe:animate-chase-counter">
            {Array.from({ length: CHASE_DOTS }, (_, i) => (
              <span key={i} className="h-2 w-2 shrink-0 rounded-full bg-dot shadow-glow-dot" />
            ))}
          </div>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <div className="motion-safe:animate-mascot-run">
            <Mascot size={34} />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection({ firstName, lastName, tagline, available }) {
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

      <div className="relative mx-auto max-w-6xl motion-safe:animate-rise">
        <div className="flex flex-wrap items-center gap-2.5">
          <PowerDot power />
          <span className="hud-label motion-safe:animate-hud-flicker">PLAYER 1 — FULL STACK</span>
        </div>

        <h1
          id="hero-heading"
          className="mt-6 font-pixel text-pixel-hero uppercase text-ink drop-shadow-glow-wall"
        >
          <span className="block">{firstName}</span>
          <span className="mt-2 block text-mascot-ink drop-shadow-glow-mascot">{lastName}</span>
        </h1>

        <p className="mt-7 max-w-xl text-sm leading-relaxed text-ink-dim sm:text-base">{tagline}</p>

        {available ? (
          <p className="mt-5 inline-flex items-center gap-2.5 rounded-tile border-2 border-success/50 px-3 py-2">
            <PowerDot power tone="success" />
            <span className="font-pixel text-pixel-xs uppercase tracking-hud text-success sm:text-pixel-sm">
              INSERT ROLE — OPEN TO WORK
            </span>
          </p>
        ) : null}

        {/* PRESS START — jumps to the project stages. Decorative blink only. */}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ArcadeButton href="#projects" variant="primary" size="lg">
            <span aria-hidden="true" className="motion-safe:animate-blink">
              ▶
            </span>
            PRESS START
          </ArcadeButton>
          <ArcadeButton href="#contact" size="lg">
            CONTINUE?
          </ArcadeButton>
        </div>

        <ChaseLane />
      </div>
    </section>
  )
}

export default HeroSection
