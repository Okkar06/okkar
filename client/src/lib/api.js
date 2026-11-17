// Single place that knows where the API lives. VITE_API_BASE_URL is a public
// build-time value (never a secret); empty means "same origin", which is how
// the server serves the built client in production.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export const CONTACT_ENDPOINT = `${API_BASE_URL}/api/contacts`

// Long enough for a free-tier server to wake from sleep, short enough that
// nobody is left watching a spinner forever.
export const CONTACT_TIMEOUT_MS = 20_000

const FIELD_NAMES = ['name', 'email', 'message']

/** Only known field names with string messages are read back from the server. */
function readFieldErrors(body) {
  const fields = body?.error?.fields
  if (!fields || typeof fields !== 'object') return {}

  const errors = {}
  for (const name of FIELD_NAMES) {
    if (typeof fields[name] === 'string') errors[name] = fields[name]
  }
  return errors
}

function readRetryAfter(response) {
  const seconds = Number(response.headers.get('retry-after'))
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

/**
 * POSTs the contact form and reports WHAT HAPPENED rather than raw HTTP, so
 * the UI never has to interpret a status code or show a raw error:
 *
 *   sent          stored (201 with the success envelope)
 *   validation    400 — `fields` maps field name -> message
 *   rate_limited  429 — `retryAfterSeconds` when the server said
 *   too_large     413
 *   unavailable   503 — the server is up but cannot store messages right now
 *   server        any other response, including a 2xx that is not ours
 *   timeout       no answer within `timeoutMs`
 *   network       the request never completed (offline, DNS, CORS, reset)
 *   aborted       cancelled by the caller's `signal` (e.g. on unmount)
 *
 * It never throws.
 */
export async function submitContact(payload, { signal, timeoutMs = CONTACT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  let timedOut = false

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const forwardAbort = () => controller.abort()
  if (signal?.aborted) forwardAbort()
  signal?.addEventListener('abort', forwardAbort, { once: true })

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    let body = null
    try {
      body = await response.json()
    } catch {
      // Not JSON (a proxy error page, an HTML shell): handled by status below.
    }

    if (response.ok) {
      // A 2xx only counts if it is the API's own success envelope — an HTML
      // page served with 200 must not be reported as "message sent".
      return body?.success === true ? { outcome: 'sent' } : { outcome: 'server' }
    }

    switch (response.status) {
      case 400:
      case 422:
        return { outcome: 'validation', fields: readFieldErrors(body) }
      case 413:
        return { outcome: 'too_large' }
      case 429:
        return { outcome: 'rate_limited', retryAfterSeconds: readRetryAfter(response) }
      case 503:
        return { outcome: 'unavailable' }
      default:
        return { outcome: 'server' }
    }
  } catch {
    if (timedOut) return { outcome: 'timeout' }
    if (signal?.aborted) return { outcome: 'aborted' }
    return { outcome: 'network' }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}
