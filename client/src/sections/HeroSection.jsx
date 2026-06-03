import { motion, useReducedMotion } from 'framer-motion'
import { useLocalTime } from '../hooks/useLocalTime'

function HeroSection({ firstName, lastName, tagline, ctaLabel, available = true }) {
  const shouldReduceMotion = useReducedMotion()
  const localTime = useLocalTime()

  const container = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
      }

  const fadeUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

  const nameLine = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }

  return (
    <section id="top" className="flex min-h-screen items-center px-6 pb-16 pt-36">
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Meta bar: availability + location */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
          {available && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Open to opportunities
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
            </svg>
            Singapore · {localTime} GMT+8
          </span>
        </motion.div>

        {/* Name — oversized, clamp-based */}
        <div>
          <h1 className="font-bold leading-none tracking-tighter" style={{ fontSize: 'clamp(4rem, 13vw, 9.5rem)' }}>
            <span className="block overflow-hidden">
              <motion.span className="block text-neutral-100" variants={nameLine}>
                {firstName}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block text-neutral-500" variants={nameLine}>
                {lastName}.
              </motion.span>
            </span>
          </h1>
        </div>

        {/* Tagline + CTAs */}
        <motion.div variants={fadeUp} className="max-w-2xl space-y-8">
          <p className="text-lg leading-relaxed text-neutral-300 md:text-xl">
            {tagline}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/15 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-100 transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {ctaLabel}
              <span aria-hidden="true" className="text-accent/80 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-200 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Get in touch
            </a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <div className="h-px w-12 bg-white/15" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-600">
            Scroll to explore
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
