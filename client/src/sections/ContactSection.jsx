import { motion, useReducedMotion } from 'framer-motion'
import { useLocalTime } from '../hooks/useLocalTime'

function ContactSection({ email, githubUrl, linkedinUrl }) {
  const shouldReduceMotion = useReducedMotion()
  const localTime = useLocalTime()

  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } }

  return (
    <motion.section
      id="contact"
      className="scroll-mt-24 px-6 py-28"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-card/50 p-8 md:p-14 lg:p-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">

            {/* Left: CTA */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">Contact</p>
              <h2 className="mt-4 font-bold leading-none tracking-tighter text-neutral-100"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Let's work<br />
                <span className="text-neutral-500">together.</span>
              </h2>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-neutral-400">
                Open to full-time roles and freelance projects. I reply within 24 hours.
              </p>

              {/* Email link */}
              <a
                href={`mailto:${email}`}
                className="group mt-8 inline-flex items-center gap-3"
              >
                <span className="break-all text-sm font-semibold text-neutral-200 underline decoration-accent/40 underline-offset-4 transition-colors duration-200 group-hover:text-accent group-hover:decoration-accent">
                  {email}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>

              {/* Social icons */}
              <div className="mt-8 flex items-center gap-3">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition duration-200 hover:border-accent/50 hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  aria-label="GitHub"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.07 1.53 1.07.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.27 2.75 1.05a9.2 9.2 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.56 1.43.21 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.33.68.97.68 1.95 0 1.41-.01 2.55-.01 2.9 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
                  </svg>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition duration-200 hover:border-accent/50 hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.32V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.72C24 .77 23.21 0 22.23 0z" />
                  </svg>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition duration-200 hover:border-accent/50 hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  aria-label="Email"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: info cards */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Location</p>
                <p className="mt-2 text-sm font-semibold text-neutral-200">Singapore</p>
                <p className="mt-0.5 text-xs text-neutral-500">GMT+8 · {localTime}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Availability</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <p className="text-sm font-semibold text-emerald-400">Open to opportunities</p>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">Full-time · Freelance</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">Response time</p>
                <p className="mt-2 text-sm font-semibold text-neutral-200">Within 24 hours</p>
                <p className="mt-0.5 text-xs text-neutral-500">Usually much faster</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default ContactSection
