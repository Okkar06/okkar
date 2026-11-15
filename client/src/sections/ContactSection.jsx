import { motion, useReducedMotion } from 'framer-motion'
import ArcadeHeading from '../components/ArcadeHeading'
import ContactForm from '../components/ContactForm'
import Ghost from '../components/Ghost'
import MazeCard from '../components/MazeCard'
import PowerDot from '../components/PowerDot'
import { useLocalTime } from '../hooks/useLocalTime'

const iconLink =
  'grid h-11 w-11 place-items-center rounded-tile border-2 border-wall/50 text-ink transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-wall hover:text-hud'

function ContactSection({ email, githubUrl, linkedinUrl }) {
  const shouldReduceMotion = useReducedMotion()
  const localTime = useLocalTime()

  const rise = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      }

  return (
    <motion.section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-32 px-4 py-20 sm:px-6"
      variants={rise}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="red" size={28} className="absolute right-[12%] top-4 hidden lg:block" />
        <Ghost color="pink" size={26} drift="drift" delay={0.9} className="absolute right-[26%] bottom-5 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <ArcadeHeading
          id="contact-heading"
          hud="ENTER YOUR NAME"
          title="Get in touch"
          subtitle="Open to full-time roles and freelance work. I reply within 24 hours."
        />

        <div className="grid gap-7 lg:grid-cols-5 lg:items-start">
          {/* The cabinet: name-entry screen */}
          <MazeCard className="p-6 sm:p-8 lg:col-span-3" stage="HIGH SCORE ENTRY">
            <div aria-hidden="true" className="mb-6 flex items-center gap-2">
              <PowerDot size="sm" />
              <PowerDot size="sm" />
              <PowerDot power />
              <span className="hud-label animate-hud-flicker ml-1">RANK 1ST</span>
            </div>
            <ContactForm />
          </MazeCard>

          {/* Side panel: direct routes + status */}
          <div className="space-y-5 lg:col-span-2">
            <MazeCard className="p-6">
              <p className="hud-label">DIRECT LINE</p>
              <a
                href={`mailto:${email}`}
                className="mt-4 inline-block break-all text-sm font-semibold text-ink underline decoration-wall decoration-2 underline-offset-4 transition-colors duration-200 hover:text-hud"
              >
                {email}
              </a>

              <div className="mt-6 flex items-center gap-3">
                <a href={githubUrl} target="_blank" rel="noreferrer noopener" className={iconLink} aria-label="GitHub profile">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true" focusable="false">
                    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.07 1.53 1.07.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.27 2.75 1.05a9.2 9.2 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.56 1.43.21 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.33.68.97.68 1.95 0 1.41-.01 2.55-.01 2.9 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
                  </svg>
                </a>
                <a href={linkedinUrl} target="_blank" rel="noreferrer noopener" className={iconLink} aria-label="LinkedIn profile">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true" focusable="false">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.32V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.72C24 .77 23.21 0 22.23 0z" />
                  </svg>
                </a>
                <a href={`mailto:${email}`} className={iconLink} aria-label="Send an email">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true" focusable="false">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </MazeCard>

            <MazeCard className="p-6">
              <p className="hud-label">CABINET STATUS</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-dim">Location</dt>
                  <dd className="font-semibold text-ink">Singapore</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-dim">Local time</dt>
                  <dd className="font-semibold text-ink">GMT+8 · {localTime}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-dim">Availability</dt>
                  <dd className="font-semibold text-ghost-cyan">Open to work</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-dim">Reply time</dt>
                  <dd className="font-semibold text-ink">Within 24 h</dd>
                </div>
              </dl>
            </MazeCard>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default ContactSection
