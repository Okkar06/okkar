import { motion, useReducedMotion } from 'framer-motion'
import Marquee from '../components/Marquee'

function AboutSection({ bio, skills, marqueeItems, photoSrc, nowText }) {
  const shouldReduceMotion = useReducedMotion()

  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } }

  return (
    <motion.section
      id="about"
      className="scroll-mt-24 px-6 py-28"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:items-start">
        {/* Left: bio + Now */}
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">About</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-100 md:text-4xl">
              A developer focused on clean systems and crisp interfaces.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-400 md:text-lg">
              {bio}
            </p>
          </div>

          {/* Now card — inspired by Gianmarco Cavallo's "Now" section */}
          {nowText && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Now</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{nowText}</p>
            </div>
          )}
        </div>

        {/* Right: photo + stack + marquee */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 via-bg to-bg p-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent/20 via-white/5 to-bg">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Okkar Hein"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
            </div>
          </div>

          {/* Stack */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-neutral-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Marquee */}
          {marqueeItems?.length ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Tools &amp; More</p>
              <Marquee items={marqueeItems} />
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}

export default AboutSection
