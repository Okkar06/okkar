const { z } = require('zod')

/**
 * Contact payload schema — the single source of truth for what the endpoint
 * accepts. `.strict()` rejects unknown fields, every string is trimmed and
 * length-capped, and control characters are refused outright so that a value
 * can never be used to smuggle extra lines into a header or a log entry
 * (CR/LF injection), even once an email transport is added later.
 */

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

const noControlChars = (value) => !CONTROL_CHARS.test(value)
const controlCharMessage = 'Line breaks and control characters are not allowed.'

const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 1000 },
  honeypot: { max: 200 },
}

const contactSchema = z
  .object({
    name: z
      .string()
      .refine(noControlChars, controlCharMessage)
      .transform((value) => value.trim())
      .refine((value) => value.length >= LIMITS.name.min, {
        message: `Name must be at least ${LIMITS.name.min} characters.`,
      })
      .refine((value) => value.length <= LIMITS.name.max, {
        message: `Name must be at most ${LIMITS.name.max} characters.`,
      }),

    email: z
      .string()
      .refine(noControlChars, controlCharMessage)
      .transform((value) => value.trim().toLowerCase())
      .refine((value) => value.length <= LIMITS.email.max, {
        message: `Email must be at most ${LIMITS.email.max} characters.`,
      })
      .refine((value) => z.email().safeParse(value).success, {
        message: 'Email must be a valid email address.',
      }),

    message: z
      .string()
      // Newlines are legitimate inside a message body, but NUL bytes and other
      // control characters are not.
      .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), {
        message: 'Message contains characters that are not allowed.',
      })
      .transform((value) => value.trim())
      .refine((value) => value.length >= LIMITS.message.min, {
        message: `Message must be at least ${LIMITS.message.min} characters.`,
      })
      .refine((value) => value.length <= LIMITS.message.max, {
        message: `Message must be at most ${LIMITS.message.max} characters.`,
      }),

    // Honeypot. The form renders this field off-screen, so a real visitor
    // leaves it empty. A non-empty value is handled by the controller, which
    // answers like a success and stores nothing — a 400 here would tell the
    // bot exactly which field gave it away. The cap only stops the field
    // being used to pad the request.
    website: z.string().max(LIMITS.honeypot.max).optional(),
  })
  .strict()

/**
 * Flattens zod issues into a per-field map of plain messages, safe to show to
 * the user. Unknown-field issues are reported against the payload as a whole.
 */
function toFieldErrors(error) {
  const fields = {}

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_payload'
    if (!fields[key]) fields[key] = issue.message
  }

  return fields
}

module.exports = { contactSchema, toFieldErrors, LIMITS }
