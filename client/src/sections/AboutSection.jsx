import { motion, useReducedMotion } from 'framer-motion'
import Marquee from '../components/Marquee'

function AboutSection({ bio, skills, marqueeItems, photoSrc }) {
  const shouldReduceMotion = useReducedMotion()

  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } }

  return (
    <motion.section
      id="about"
      className="scroll-mt-24 px-6 py-24"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">About</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-100 md:text-4xl">
            {/* REPLACE: About headline */}
            A developer focused on clean systems and crisp interfaces.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-neutral-300 md:text-lg">
            {/* REPLACE: About bio */}
            {bio}
          </p>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-bg to-bg p-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent/30 via-white/5 to-bg">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Profile"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
              {/* REPLACE: Photo label */}
              Photo placeholder
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-200/90"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {marqueeItems?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
                {/* REPLACE: Marquee label */}
                Stack &amp; Tools
              </p>
              <div className="mt-4">
                <Marquee items={marqueeItems} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}

export default AboutSection
