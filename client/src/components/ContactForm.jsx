import { useEffect, useRef, useState } from 'react'
import { submitContact } from '../lib/api'
import { clearDraft, readDraft, writeDraft } from '../lib/contactDraft'
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  toContactPayload,
  validateContact,
  validateField,
} from '../lib/contactValidation'
import ArcadeButton from './ArcadeButton'
import FormField from './FormField'
import PowerDot from './PowerDot'

/** Plain-language copy for every way a submission can fail. */
function failureMessage(failure, { fallbackEmail, retryAfterSeconds }) {
  const direct = fallbackEmail ? `, or email me directly at ${fallbackEmail}` : ''

  switch (failure) {
    case 'validation':
      return 'Please check the highlighted fields and try again.'
    case 'offline':
      return 'You appear to be offline. Your message is still here — reconnect and try again.'
    case 'network':
      return 'Unable to reach the server. Please check your connection and try again.'
    case 'timeout':
      return `The server is taking too long to answer. Your message is still here — please try again${direct}.`
    case 'rate_limited': {
      const minutes = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : null
      const wait = minutes ? `in about ${minutes} minute${minutes === 1 ? '' : 's'}` : 'in a little while'
      return `Too many messages from here. Please try again ${wait}${direct}.`
    }
    case 'too_large':
      return 'That message is too large to send. Please shorten it and try again.'
    case 'unavailable':
      return `Messages can't be saved right now. Please try again later${direct}.`
    default:
      return `Something went wrong on my side. Please try again${direct}.`
  }
}

function ContactForm({ fallbackEmail }) {
  const [values, setValues] = useState(readDraft)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [failure, setFailure] = useState(null)

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const messageRef = useRef(null)
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef }
  const successRef = useRef(null)
  // A ref, not state: two submit events in the same tick both see the same
  // rendered `status`, but only the first can take the lock.
  const inFlight = useRef(null)
  const refocusName = useRef(false)

  const submitting = status === 'submitting'

  // Cancel a request that is still running if the form goes away.
  useEffect(() => () => inFlight.current?.abort(), [])

  // Leaving mid-send would lose the result, so ask first — only while sending.
  useEffect(() => {
    if (!submitting) return undefined
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [submitting])

  // Keyboard and screen-reader focus follows the outcome: onto the
  // confirmation when it replaces the form, and back to the first field when
  // the visitor asks to send another.
  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus()
    } else if (status === 'idle' && refocusName.current) {
      refocusName.current = false
      nameRef.current?.focus()
    }
  }, [status])

  const setField = (field, value) => {
    setValues((previous) => {
      const next = { ...previous, [field]: value }
      writeDraft(next)
      return next
    })
    // Once a field has been flagged, re-check it as the visitor types so the
    // error clears the moment it is fixed.
    if (errors[field]) {
      const error = validateField(field, value)
      setErrors((previous) => {
        const next = { ...previous }
        if (error) next[field] = error
        else delete next[field]
        return next
      })
    }
  }

  // Validate a field when the visitor leaves it — but not an untouched,
  // empty one: tabbing through the form should not light everything up.
  const handleBlur = (field) => () => {
    if (submitting || values[field].length === 0) return
    const error = validateField(field, values[field])
    setErrors((previous) => {
      if ((previous[field] ?? null) === error) return previous
      const next = { ...previous }
      if (error) next[field] = error
      else delete next[field]
      return next
    })
  }

  const fail = (code, extra = {}) => {
    setStatus('error')
    setFailure({ code, ...extra })
  }

  const focusFirstInvalid = (invalid) => {
    const first = CONTACT_FIELDS.find((field) => invalid[field])
    if (first) fieldRefs[first].current?.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (inFlight.current) return

    const invalid = validateContact(values)
    setErrors(invalid)
    if (Object.keys(invalid).length > 0) {
      fail('validation')
      focusFirstInvalid(invalid)
      return
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      fail('offline')
      return
    }

    const controller = new AbortController()
    inFlight.current = controller
    setStatus('submitting')
    setFailure(null)

    const result = await submitContact(toContactPayload(values, honeypot), {
      signal: controller.signal,
    })

    inFlight.current = null
    if (result.outcome === 'aborted') return // unmounted; nothing left to update

    if (result.outcome === 'sent') {
      clearDraft()
      setValues({ ...EMPTY_CONTACT })
      setHoneypot('')
      setErrors({})
      setStatus('success')
      return
    }

    if (result.outcome === 'validation') {
      const fields = result.fields ?? {}
      setErrors(fields)
      fail('validation')
      focusFirstInvalid(fields)
      return
    }

    fail(result.outcome, { retryAfterSeconds: result.retryAfterSeconds })
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-tile border-2 border-success bg-floor p-7 text-center motion-safe:animate-pop"
        role="status"
      >
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          <PowerDot size="sm" />
          <PowerDot power tone="success" />
          <PowerDot size="sm" />
        </div>
        <p
          ref={successRef}
          tabIndex={-1}
          className="mt-5 font-pixel text-pixel-md uppercase text-success"
        >
          STAGE CLEAR!
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          Your message is in. I usually reply within 24 hours.
        </p>
        <ArcadeButton
          className="mt-6"
          onClick={() => {
            refocusName.current = true
            setStatus('idle')
            setFailure(null)
          }}
        >
          SEND ANOTHER
        </ArcadeButton>
      </div>
    )
  }

  const messageLength = values.message.trim().length
  const nearLimit = messageLength >= CONTACT_LIMITS.message.max * 0.9

  const fieldProps = (field) => ({
    name: field,
    value: values[field],
    error: errors[field],
    onChange: (event) => setField(field, event.target.value),
    onBlur: handleBlur(field),
    required: true,
    readOnly: submitting,
  })

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="relative space-y-5">
      <p className="text-xs text-ink-dim">All three fields are required.</p>

      <FormField
        id="contact-name"
        label="ENTER YOUR NAME"
        type="text"
        autoComplete="name"
        maxLength={CONTACT_LIMITS.name.max}
        ref={nameRef}
        {...fieldProps('name')}
      />

      <FormField
        id="contact-email"
        label="YOUR EMAIL"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={CONTACT_LIMITS.email.max}
        ref={emailRef}
        {...fieldProps('email')}
      />

      <FormField
        id="contact-message"
        label="YOUR MESSAGE"
        as="textarea"
        rows={5}
        maxLength={CONTACT_LIMITS.message.max}
        className="max-h-96 min-h-[7.5rem] resize-y"
        hint={
          <span className={nearLimit ? 'font-semibold text-danger' : undefined}>
            {messageLength}/{CONTACT_LIMITS.message.max} characters
            {nearLimit ? ' — almost at the limit' : ''}
          </span>
        }
        ref={messageRef}
        {...fieldProps('message')}
      />

      {/* Honeypot: off-screen, skipped by keyboard and assistive tech. A real
          visitor never fills this in; the server discards submissions that do. */}
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
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <ArcadeButton
          type="submit"
          variant="primary"
          size="lg"
          pending={submitting}
          pendingLabel="SENDING"
        >
          SUBMIT SCORE
        </ArcadeButton>
      </div>

      {/* Always in the DOM so assistive tech is already watching it when a
          message arrives. */}
      <div role="alert" className="min-h-[1.25rem]">
        {status === 'error' && failure ? (
          <p className="text-sm font-medium text-danger motion-safe:animate-nudge">
            {failureMessage(failure.code, {
              fallbackEmail,
              retryAfterSeconds: failure.retryAfterSeconds,
            })}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default ContactForm
