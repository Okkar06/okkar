import { motion, useReducedMotion } from 'framer-motion'

const BIO =
  "I'm a Year 3 IT student at Singapore Polytechnic — a builder at heart who turns ideas into full-stack products. From React interfaces to Python backends and SQL databases, I design and ship end-to-end web applications that are fast, practical, and built to last. I bring initiative, craft, and a bias for shipping things that actually work."

const SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Python',
  'Node.js', 'Express', 'PostgreSQL', 'Prisma',
  'Tailwind', 'JWT', 'REST APIs', 'Git',
]

const ease = [0.22, 1, 0.36, 1]

function AboutSection({ photoSrc }) {
  const shouldReduceMotion = useReducedMotion()

  const reduced = { hidden: { opacity: 1 }, visible: { opacity: 1 } }

  const container = shouldReduceMotion
    ? reduced
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.15, delayChildren: 0.05 },
        },
      }

  const fadeUp = shouldReduceMotion
    ? reduced
    : {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }

  const slideLeft = shouldReduceMotion
    ? reduced
    : {
        hidden: { opacity: 0, x: -52 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
      }

  const slideRight = shouldReduceMotion
    ? reduced
    : {
        hidden: { opacity: 0, x: 52, scale: 0.96 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.9, ease } },
      }

  const skillContainer = shouldReduceMotion
    ? {}
    : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
      }

  const skillItem = shouldReduceMotion
    ? {}
    : {
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
      }

  return (
    <motion.section
      id="about"
      className="about-section scroll-mt-24 px-6 py-28"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Label */}
        <motion.p
          className="mb-10 text-sm font-bold uppercase tracking-[0.38em]"
          style={{ color: 'var(--color-text-secondary)' }}
          variants={fadeUp}
        >
          About Me
        </motion.p>

        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          {/* Left: heading + bio + skills */}
          <motion.div className="space-y-6" variants={slideLeft}>
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
              variants={skillContainer}
            >
              {SKILLS.map((skill) => (
                <motion.span
                  key={skill}
                  className="skill-tag"
                  variants={skillItem}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: portrait photo */}
          <motion.div
            variants={slideRight}
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
