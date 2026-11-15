// Single place that knows where the API lives. VITE_API_BASE_URL is a public
// build-time value (never a secret); empty means "same origin", which is how
// the server serves the built client in production.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export const CONTACT_ENDPOINT = `${API_BASE_URL}/api/contacts`

/**
 * POSTs the contact form. Resolves with the parsed body plus the HTTP status so
 * callers can tell validation errors (400) and rate limiting (429) apart from
 * a genuine failure. Never surfaces raw errors to the UI.
 */
export async function submitContact(payload, { signal } = {}) {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return { ok: response.ok, status: response.status, body }
}
