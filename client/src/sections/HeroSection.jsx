import { motion, useReducedMotion } from 'framer-motion'

function HeroSection({ firstName, lastName, tagline, ctaLabel }) {
  const shouldReduceMotion = useReducedMotion()

  const container = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.13 } },
      }

  const line = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } } }

  const subline = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

  return (
    <section id="top" className="flex min-h-screen items-center px-6 pb-14 pt-32">
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl">
          <motion.p
            variants={subline}
            className="text-xs font-semibold uppercase tracking-[0.45em] text-neutral-400"
          >
            {/* REPLACE: Hero eyebrow */}
            Developer Portfolio
          </motion.p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-neutral-100 sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden">
              <motion.span className="block" variants={line}>
                {/* REPLACE: First name */}
                {firstName}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block" variants={line}>
                {/* REPLACE: Last name */}
                {lastName}
              </motion.span>
            </span>
          </h1>

          <motion.p variants={subline} className="mt-6 max-w-2xl text-lg text-neutral-300 md:text-xl">
            {/* REPLACE: Tagline */}
            {tagline}
          </motion.p>

          <motion.div variants={subline} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-full border border-accent/40 bg-accent/15 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-100 transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {/* REPLACE: CTA label */}
              {ctaLabel}
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-200 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              About
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
