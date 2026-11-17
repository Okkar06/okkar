/**
 * Contact form rules. These mirror server/src/validation/contactSchema.js —
 * the server is the authority and re-validates everything; this copy exists
 * so a visitor gets an answer per field, instantly, without a round trip.
 * If you change a limit, change it in both places.
 */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 1000 },
}

export const CONTACT_FIELDS = ['name', 'email', 'message']

export const EMPTY_CONTACT = Object.freeze({ name: '', email: '', message: '' })

/* eslint-disable no-control-regex -- matching control characters is the point */
// Single-line fields: no control characters at all.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/
// The message may contain tabs and line breaks, but nothing else from that range.
const MESSAGE_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
/* eslint-enable no-control-regex */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

const VALIDATORS = {
  name(value) {
    const name = value.trim()
    if (name.length === 0) return 'Please enter your name.'
    if (CONTROL_CHARS.test(value)) return 'Line breaks are not allowed here.'
    if (name.length < CONTACT_LIMITS.name.min) {
      return `Please enter at least ${CONTACT_LIMITS.name.min} characters.`
    }
    if (name.length > CONTACT_LIMITS.name.max) {
      return `Keep this under ${CONTACT_LIMITS.name.max} characters.`
    }
    return null
  },

  email(value) {
    const email = value.trim()
    if (email.length === 0) return 'Please enter your email address.'
    if (CONTROL_CHARS.test(value)) return 'Line breaks are not allowed here.'
    if (email.length > CONTACT_LIMITS.email.max || !EMAIL_SHAPE.test(email)) {
      return 'That does not look like a valid email address (name@example.com).'
    }
    return null
  },

  message(value) {
    const message = value.trim()
    if (message.length === 0) return 'Please write a message.'
    if (MESSAGE_CONTROL_CHARS.test(value)) return 'The message contains characters that are not allowed.'
    if (message.length < CONTACT_LIMITS.message.min) {
      return `Please write at least ${CONTACT_LIMITS.message.min} characters.`
    }
    if (message.length > CONTACT_LIMITS.message.max) {
      return `Keep this under ${CONTACT_LIMITS.message.max} characters.`
    }
    return null
  },
}

const asText = (value) => (typeof value === 'string' ? value : '')

/** The error message for one field, or null when it is valid. */
export function validateField(field, value) {
  const validator = VALIDATORS[field]
  return validator ? validator(asText(value)) : null
}

/** `{ field: message }` for every invalid field; an empty object means valid. */
export function validateContact(values) {
  const errors = {}
  for (const field of CONTACT_FIELDS) {
    const error = validateField(field, values?.[field])
    if (error) errors[field] = error
  }
  return errors
}

/** What is actually sent: trimmed fields plus the honeypot, nothing else. */
export function toContactPayload(values, honeypot = '') {
  return {
    name: asText(values?.name).trim(),
    email: asText(values?.email).trim(),
    message: asText(values?.message).trim(),
    website: asText(honeypot),
  }
}
