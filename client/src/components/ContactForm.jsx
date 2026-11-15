import { useState } from 'react'
import { submitContact } from '../lib/api'
import PowerDot from './PowerDot'

// Mirrors the server-side schema. Client validation is for UX only — the
// server is the authority and re-validates everything.
const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 1000 },
}

const CONTROL_CHARS = /[\r\n\t\0]/
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

const EMPTY = { name: '', email: '', message: '', website: '' }

function validate(values) {
  const errors = {}

  const name = values.name.trim()
  if (name.length < LIMITS.name.min) {
    errors.name = `Please enter at least ${LIMITS.name.min} characters.`
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Keep this under ${LIMITS.name.max} characters.`
  } else if (CONTROL_CHARS.test(values.name)) {
    errors.name = 'Line breaks are not allowed here.'
  }

  const email = values.email.trim()
  if (email.length === 0) {
    errors.email = 'Please enter your email address.'
  } else if (email.length > LIMITS.email.max || !EMAIL_SHAPE.test(email)) {
    errors.email = 'That does not look like a valid email address.'
  }

  const message = values.message.trim()
  if (message.length < LIMITS.message.min) {
    errors.message = `Please write at least ${LIMITS.message.min} characters.`
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Keep this under ${LIMITS.message.max} characters.`
  }

  return errors
}

const FAILURE_COPY = {
  rate_limited: 'Too many messages from here. Please try again in a little while.',
  validation: 'Please check the highlighted fields and try again.',
  network: 'Unable to connect. Please check your connection and try again.',
  server: 'Something went wrong on my side. Please try again, or email me directly.',
}

const fieldClass =
  'w-full rounded-tile border-2 border-wall/50 bg-floor px-3.5 py-3 font-sans text-sm text-ink transition-colors duration-200 hover:border-wall focus:border-wall'
const labelClass = 'block font-pixel text-[0.5rem] uppercase tracking-hud text-hud sm:text-[0.55rem]'
const errorClass = 'mt-2 text-xs font-medium text-ghost-red'

function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState(null)

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error')
      setFailure('validation')
      return
    }

    setStatus('submitting')
    setFailure(null)

    try {
      const { ok, status: httpStatus, body } = await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        website: values.website,
      })

      if (ok) {
        setStatus('success')
        setValues(EMPTY)
        return
      }

      setStatus('error')

      if (httpStatus === 429) {
        setFailure('rate_limited')
      } else if (httpStatus === 400) {
        setFailure('validation')
        const fields = body?.error?.fields
        if (fields && typeof fields === 'object') {
          // Only known field names are read back, so the response cannot
          // introduce unexpected keys into form state.
          const mapped = {}
          for (const field of ['name', 'email', 'message']) {
            if (typeof fields[field] === 'string') mapped[field] = fields[field]
          }
          if (Object.keys(mapped).length > 0) setErrors(mapped)
        }
      } else {
        setFailure('server')
      }
    } catch {
      setStatus('error')
      setFailure('network')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-tile border-2 border-ghost-cyan bg-floor p-7 text-center" role="status">
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          <PowerDot size="sm" />
          <PowerDot power tone="cyan" />
          <PowerDot size="sm" />
        </div>
        <p className="mt-5 font-pixel text-[0.7rem] uppercase leading-[1.8] text-ghost-cyan">
          STAGE CLEAR!
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          Your message is in. I usually reply within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setFailure(null)
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-tile border-2 border-wall px-4 py-2.5 font-pixel text-[0.5rem] uppercase tracking-hud text-ink transition-transform duration-200 hover:-translate-y-0.5"
        >
          SEND ANOTHER
        </button>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          ENTER YOUR NAME
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={values.name}
          onChange={update('name')}
          required
          maxLength={LIMITS.name.max}
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={`${fieldClass} mt-3 ${errors.name ? 'border-ghost-red' : ''}`}
        />
        {errors.name ? (
          <p id="contact-name-error" className={errorClass}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          YOUR EMAIL
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={values.email}
          onChange={update('email')}
          required
          maxLength={LIMITS.email.max}
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={`${fieldClass} mt-3 ${errors.email ? 'border-ghost-red' : ''}`}
        />
        {errors.email ? (
          <p id="contact-email-error" className={errorClass}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          YOUR MESSAGE
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={update('message')}
          required
          maxLength={LIMITS.message.max}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={
            errors.message ? 'contact-message-error contact-message-hint' : 'contact-message-hint'
          }
          className={`${fieldClass} mt-3 resize-y ${errors.message ? 'border-ghost-red' : ''}`}
        />
        <p id="contact-message-hint" className="mt-2 text-xs text-ink-dim">
          {values.message.trim().length}/{LIMITS.message.max} characters
        </p>
        {errors.message ? (
          <p id="contact-message-error" className={errorClass}>
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot: off-screen, skipped by keyboard and assistive tech. A real
          visitor never fills this in; the server rejects submissions that do. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update('website')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2.5 rounded-tile border-maze border-mascot bg-mascot px-5 py-3 font-pixel text-[0.55rem] uppercase tracking-hud text-on-mascot shadow-glow-mascot transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:text-[0.65rem]"
        >
          {submitting ? 'SENDING...' : 'SUBMIT SCORE'}
        </button>
        {submitting ? (
          <span className="hud-label" role="status">
            SAVING...
          </span>
        ) : null}
      </div>

      <p role="alert" className="min-h-[1rem]">
        {status === 'error' && failure ? (
          <span className="text-sm font-medium text-ghost-red">{FAILURE_COPY[failure]}</span>
        ) : null}
      </p>
    </form>
  )
}

export default ContactForm
