import ArcadeButton from '../components/ArcadeButton'
import BonusIcon from '../components/BonusIcon'
import Ghost from '../components/Ghost'
import HeroArcade from '../components/HeroArcade'
import Mascot from '../components/Mascot'
import PowerDot from '../components/PowerDot'
import SideArcade from '../components/SideArcade'

const CHASE_DOTS = 10

// The left-margin crew. Only shown from 1400px wide, where the margin beside
// the content is wide enough that they can never sit on the text.
const LEFT_CREW = [
  { key: 'ghost-orange', ghost: 'orange', position: 'left-[3%] top-[18%]', delay: 0.3 },
  { key: 'bonus-orbs', shape: 'twinOrb', color: 'red', position: 'left-[5%] top-[38%]', delay: 1.1 },
  { key: 'bonus-key', shape: 'key', color: 'mascot', position: 'left-[2.5%] top-[58%]', delay: 0.6 },
  { key: 'ghost-pink', ghost: 'pink', position: 'left-[5%] top-[76%]', delay: 1.8 },
]

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

function HeroSection({ firstName, lastName, tagline, available, onStart }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-36"
    >
      {/* Decorative maze floor + ghost crew */}
      <div aria-hidden="true" className="maze-floor pointer-events-none absolute inset-0 opacity-70" />
      {/* Right-hand side: the arcade crowd, with parallax and a fly-by ghost. */}
      <HeroArcade />
      {/* The left margin, on wide screens. */}
      <SideArcade scene="hero" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {LEFT_CREW.map((member) =>
          member.ghost ? (
            <Ghost
              key={member.key}
              color={member.ghost}
              size={28}
              drift="drift"
              delay={member.delay}
              className={`absolute hidden min-[1400px]:block ${member.position}`}
            />
          ) : (
            <span
              key={member.key}
              className={`absolute hidden motion-safe:animate-ghost-float min-[1400px]:block ${member.position}`}
              style={{ animationDelay: `${member.delay}s` }}
            >
              <BonusIcon shape={member.shape} color={member.color} size={26} />
            </span>
          ),
        )}
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
          <span className="mt-2 block text-neon drop-shadow-glow-neon">{lastName}</span>
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

        {/* PRESS START plays the attract-mode tour of the whole site. Without a
            handler it falls back to a plain jump to the projects. */}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ArcadeButton
            {...(onStart
              ? { onClick: onStart, 'aria-label': 'Press start: play an automatic tour of the site' }
              : { href: '#projects' })}
            variant="primary"
            size="lg"
          >
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
