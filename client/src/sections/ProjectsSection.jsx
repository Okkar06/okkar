import { motion, useReducedMotion } from 'framer-motion'
import ArcadeHeading from '../components/ArcadeHeading'
import Ghost from '../components/Ghost'
import ProjectCard from '../components/ProjectCard'

function ProjectsSection({ projects, title, subtitle }) {
  const shouldReduceMotion = useReducedMotion()

  const still = { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }

  const section = shouldReduceMotion
    ? still
    : {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      }

  const container = shouldReduceMotion
    ? { hidden: {}, visible: {} }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

  const item = shouldReduceMotion
    ? still
    : {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
      }

  return (
    <motion.section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative scroll-mt-32 px-4 py-20 sm:px-6"
      variants={section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="orange" size={28} className="absolute right-[10%] top-5 hidden lg:block" />
        <Ghost color="cyan" size={26} drift="drift" delay={1.1} className="absolute right-[22%] bottom-5 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <ArcadeHeading
          id="projects-heading"
          hud="STAGE SELECT"
          title={title || 'Selected work'}
          subtitle={subtitle || "Every stage taught me something new. Clear them in any order."}
        />

        <motion.div
          className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {projects.map((project, i) => (
            <motion.div key={project.title} variants={item} className="h-full">
              <ProjectCard {...project} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ProjectsSection
