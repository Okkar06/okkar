process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'

const test = require('node:test')
const assert = require('node:assert/strict')
const { startServer } = require('./helpers/server')

test('GET /api/health returns the standard success envelope', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(body, { success: true, data: { status: 'ok' } })
})

test('unknown /api routes return a JSON 404, never the SPA shell', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/does-not-exist`)
  const body = await response.json()

  assert.equal(response.status, 404)
  assert.equal(body.success, false)
  assert.equal(body.error.code, 'not_found')
  assert.match(response.headers.get('content-type') ?? '', /application\/json/)
})

test('security headers are present on API responses', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`)
  const csp = response.headers.get('content-security-policy') ?? ''

  assert.match(csp, /default-src 'self'/)
  assert.match(csp, /script-src 'self'/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /base-uri 'self'/)
  assert.match(csp, /fonts\.googleapis\.com/)
  assert.match(csp, /fonts\.gstatic\.com/)

  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=31536000/)
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('rate limit headers are advertised on the API', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`)

  assert.ok(response.headers.get('ratelimit') || response.headers.get('ratelimit-limit'))
  assert.equal(response.headers.get('x-ratelimit-limit'), null)
})
