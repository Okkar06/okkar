import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import SectionTitle from '../components/SectionTitle'

const initialForm = { name: '', email: '', message: '' }

function ContactSection({ email, githubUrl, linkedinUrl }) {
  const [formData, setFormData] = useState(initialForm)
  const [status, setStatus] = useState('')
  const shouldReduceMotion = useReducedMotion()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } }

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('')

    const subject = encodeURIComponent(`Portfolio contact from ${formData.name || 'Someone'}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}\n`,
    )

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    setStatus('opened')
  }

  return (
    <motion.section
      id="contact"
      className="scroll-mt-24 px-6 py-24"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="mx-auto max-w-3xl">
        <SectionTitle
          label="Contact"
          align="center"
          title={
            <>
              {/* REPLACE: Contact title */}
              Get in touch
            </>
          }
          subtitle={
            <>
              {/* REPLACE: Contact subtitle */}
              Drop a message and I’ll reply as soon as I can.
            </>
          }
        />

        <form onSubmit={handleSubmit} className="mx-auto rounded-2xl border border-white/10 bg-card/70 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-300/90">
              {/* REPLACE: Name label */}Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-3 w-full rounded-xl border border-white/10 bg-bg/80 px-4 py-3 text-sm font-medium text-neutral-100 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/40"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-300/90">
              {/* REPLACE: Email label */}Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-3 w-full rounded-xl border border-white/10 bg-bg/80 px-4 py-3 text-sm font-medium text-neutral-100 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/40"
              />
            </label>
          </div>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.35em] text-neutral-300/90">
            {/* REPLACE: Message label */}Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="mt-3 w-full rounded-xl border border-white/10 bg-bg/80 px-4 py-3 text-sm font-medium text-neutral-100 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/40"
            />
          </label>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-accent/40 bg-accent/15 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-100 transition duration-200 hover:border-accent/70 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {/* REPLACE: Send button label */}
              Send message
            </button>

            <div className="flex items-center gap-3">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition hover:border-accent/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
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
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition hover:border-accent/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.32V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.72C24 .77 23.21 0 22.23 0z" />
                </svg>
              </a>
              <a
                href={`mailto:${email}`}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition hover:border-accent/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                aria-label="Email"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            </div>
          </div>

          {status === 'opened' ? (
            <p className="mt-6 text-sm text-neutral-400">
              {/* REPLACE: Mailto note */}
              Your email client should open with the message pre-filled.
            </p>
          ) : null}
        </form>
      </div>
    </motion.section>
  )
}

export default ContactSection
