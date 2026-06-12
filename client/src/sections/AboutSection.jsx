import { motion, useReducedMotion } from 'framer-motion'

const BIO =
  "I'm a Year 3 IT student at Singapore Polytechnic — a builder at heart who turns ideas into full-stack products. From React interfaces to Python backends and SQL databases, I design and ship end-to-end web applications that are fast, practical, and built to last. I bring initiative, craft, and a bias for shipping things that actually work."

const SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Python',
  'Node.js', 'Express', 'PostgreSQL', 'Prisma',
  'Tailwind', 'JWT', 'REST APIs', 'Git',
]

function AboutSection({ photoSrc }) {
  const shouldReduceMotion = useReducedMotion()

  const reduced = { hidden: { opacity: 1 }, visible: { opacity: 1 } }

  const sectionVariants = shouldReduceMotion
    ? reduced
    : { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

  const leftVariants = shouldReduceMotion
    ? reduced
    : { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } }

  const rightVariants = shouldReduceMotion
    ? reduced
    : { hidden: { opacity: 0, x: 60, scale: 0.97 }, visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }

  return (
    <motion.section
      id="about"
      className="about-section scroll-mt-24 px-6 py-28"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mx-auto max-w-6xl">

        <motion.p
          className="mb-10 text-sm font-bold uppercase tracking-[0.38em]"
          style={{ color: 'var(--color-text-secondary)' }}
          variants={sectionVariants}
        >
          About Me
        </motion.p>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          {/* Left: heading + bio + skills */}
          <motion.div
            className="space-y-6"
            variants={leftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2
              className="section-heading font-display font-bold leading-tight tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              Full-stack developer<br />from Singapore.
            </h2>

            <p className="section-subtext text-base leading-relaxed md:text-[1.05rem]">
              {BIO}
            </p>

            <motion.div
              className="flex flex-wrap gap-2.5"
              variants={
                shouldReduceMotion
                  ? {}
                  : { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }
              }
            >
              {SKILLS.map((skill) => (
                <motion.span
                  key={skill}
                  className="skill-tag"
                  variants={
                    shouldReduceMotion
                      ? {}
                      : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
                  }
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: portrait photo */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="overflow-hidden rounded-2xl shadow-2xl"
            style={{ border: '1px solid rgb(var(--accent) / 0.18)' }}
          >
            <div
              className="relative aspect-[3/4] w-full overflow-hidden"
              style={{ background: 'rgb(var(--accent) / 0.08)' }}
            >
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Okkar Hein"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="lazy"
                />
              ) : null}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section>
  )
}

export default AboutSection
