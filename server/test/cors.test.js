process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example, https://www.okkar.example/'
process.env.CONTACT_RATE_LIMIT_MAX = '500'
process.env.API_RATE_LIMIT_MAX = '500'

const test = require('node:test')
const assert = require('node:assert/strict')
const { startServer } = require('./helpers/server')

test('an allowed origin receives Access-Control-Allow-Origin', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`, {
    headers: { Origin: 'https://okkar.example' },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://okkar.example')
})

test('a trailing slash in ALLOWED_ORIGINS still matches', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`, {
    headers: { Origin: 'https://www.okkar.example' },
  })

  assert.equal(response.headers.get('access-control-allow-origin'), 'https://www.okkar.example')
})

test('a disallowed origin gets no CORS grant', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  for (const origin of [
    'https://evil.example',
    'https://okkar.example.evil.example',
    'http://okkar.example',
    'null',
  ]) {
    const response = await fetch(`${url}/api/health`, { headers: { Origin: origin } })
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      null,
      `${origin} must not be granted`,
    )
  }
})

test('the wildcard origin is never sent', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/health`, { headers: { Origin: 'https://okkar.example' } })
  assert.notEqual(response.headers.get('access-control-allow-origin'), '*')
})

test('a preflight from a disallowed origin is not granted', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/contacts`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://evil.example',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })

  assert.equal(response.headers.get('access-control-allow-origin'), null)
})

test('a preflight from an allowed origin is granted for POST and Content-Type', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/api/contacts`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://okkar.example',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })

  assert.equal(response.headers.get('access-control-allow-origin'), 'https://okkar.example')
  assert.match(response.headers.get('access-control-allow-methods') ?? '', /POST/)
  assert.match(response.headers.get('access-control-allow-headers') ?? '', /Content-Type/i)
})
