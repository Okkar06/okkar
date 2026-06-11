import { motion, useReducedMotion } from 'framer-motion'

function AnimatedName({ text, baseDelay }) {
  const shouldReduceMotion = useReducedMotion()
  if (shouldReduceMotion) return <>{text}</>
  return (
    <>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: baseDelay + i * 0.048,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </>
  )
}

function HeroSection({ firstName, lastName, tagline }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="top" className="relative h-screen overflow-hidden">

      {/* Background panels */}
      <div
        aria-hidden="true"
        className="hero-bg-top absolute inset-0"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 52%, 0 84%)' }}
      />
      <div
        aria-hidden="true"
        className="hero-bg-bottom absolute inset-0"
        style={{ clipPath: 'polygon(0 84%, 100% 52%, 100% 100%, 0 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-8 md:px-16 lg:px-24">

        {/* Name (left) + tagline (right) */}
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1
              aria-label={firstName}
              className="hero-text-primary font-display font-black leading-none tracking-tighter"
              style={{ fontSize: 'clamp(4.5rem, 13vw, 11rem)' }}
            >
              <span className="block overflow-hidden">
                <AnimatedName text={firstName} baseDelay={0.1} />
              </span>
            </h1>
            <div
              aria-label={lastName}
              className="hero-text-accent font-display font-black leading-none tracking-tighter block"
              style={{ fontSize: 'clamp(4rem, 12vw, 9.5rem)' }}
            >
              <span className="block overflow-hidden">
                {/* "Hein" starts only after "Okkar" finishes (~1.1 s) */}
                <AnimatedName text={lastName} baseDelay={1.1} />
              </span>
            </div>
          </div>

          {tagline && (
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 0.65, x: 0 }}
              transition={{ duration: 0.7, delay: 2.2, ease: 'easeOut' }}
              className="hidden max-w-[260px] text-right text-base leading-relaxed md:block lg:max-w-[300px] lg:text-lg"
              style={{ color: 'var(--color-hero-name)' }}
            >
              {tagline}
            </motion.p>
          )}
        </div>

        {/* CTAs */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.6 }}
          className="flex flex-wrap items-center gap-4 pb-14"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold tracking-wide backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50"
            style={{
              color: 'var(--color-cta-text)',
              borderColor: 'var(--color-cta-border)',
              background: 'var(--color-cta-bg)',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            See my work <span aria-hidden="true">→</span>
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold tracking-wide underline underline-offset-4"
            style={{
              color: 'var(--color-cta-link)',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
