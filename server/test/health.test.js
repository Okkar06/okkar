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
  // Everything is self-hosted: no third-party host and no inline allowance.
  assert.match(csp, /style-src 'self'(;|$)/)
  assert.match(csp, /font-src 'self'(;|$)/)
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:\/\//)

  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=31536000/)
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('rate limit headers are advertised on the API', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/contacts`)

  assert.ok(response.headers.get('ratelimit') || response.headers.get('ratelimit-limit'))
  assert.equal(response.headers.get('x-ratelimit-limit'), null)
})

test('the health check is never cached and never rate limited', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`)

  assert.equal(response.headers.get('cache-control'), 'no-store')
  // No limiter runs for it, so no limiter headers are attached.
  assert.equal(response.headers.get('ratelimit'), null)
})

test('a real endpoint called with the wrong method returns 405 and an Allow header', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
    const response = await fetch(`${url}/api/contacts`, { method })
    const body = await response.json()

    assert.equal(response.status, 405, method)
    assert.equal(response.headers.get('allow'), 'POST')
    assert.deepEqual(Object.keys(body), ['success', 'error'])
    assert.equal(body.error.code, 'method_not_allowed')
  }
})

test('a malformed URL is a client error in the standard envelope, never a 500', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  for (const route of ['/api/%E0%A4%A', '/api/%', '/api/contacts/%ZZ']) {
    const response = await fetch(`${url}${route}`)
    const body = await response.json()

    assert.ok(response.status >= 400 && response.status < 500, `${route} -> ${response.status}`)
    assert.equal(body.success, false)
    assert.equal(typeof body.error.code, 'string')
    assert.equal(JSON.stringify(body).includes('decode'), false)
  }
})

test('every error response uses the same envelope', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const responses = await Promise.all([
    fetch(`${url}/api/nope`),
    fetch(`${url}/api/contacts`, { method: 'GET' }),
    fetch(`${url}/api/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }),
    fetch(`${url}/api/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
  ])

  for (const response of responses) {
    const body = await response.json()
    assert.equal(body.success, false)
    assert.equal(typeof body.error.code, 'string')
    assert.equal(typeof body.error.message, 'string')
    assert.equal('stack' in body.error, false)
    assert.match(response.headers.get('content-type') ?? '', /application\/json/)
  }
})
