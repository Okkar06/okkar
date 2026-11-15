/**
 * Boots the Express app on an ephemeral port. Each test file sets its own
 * environment before calling this, because the app reads config (rate limits,
 * allowed origins) once at require time.
 */
function startServer() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test'

  // Required lazily so the caller's env assignments are visible to the app.
  const app = require('../../src/app')
  const server = app.listen(0)

  const { port } = server.address()

  return {
    server,
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

/** POSTs JSON (or an arbitrary raw body) and returns status, headers and body. */
async function post(url, body, { headers = {}, raw = false } = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: raw ? body : JSON.stringify(body),
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  return { status: response.status, headers: response.headers, body: payload }
}

const validPayload = () => ({
  name: 'Okkar Hein',
  email: 'Okkar.Hein@Example.COM',
  message: 'Hello — I would like to talk about a full-stack role.',
})

module.exports = { startServer, post, validPayload }
