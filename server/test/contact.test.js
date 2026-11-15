process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'
// High enough that validation tests never trip the limiter — 429 behaviour has
// its own test file.
process.env.CONTACT_RATE_LIMIT_MAX = '500'
process.env.API_RATE_LIMIT_MAX = '2000'

const test = require('node:test')
const assert = require('node:assert/strict')
const contactService = require('../src/services/contactService')
const { startServer, post, validPayload } = require('./helpers/server')

/** Replaces the database write with an in-memory recorder. */
function stubService(t) {
  const calls = []

  t.mock.method(contactService, 'createContact', async (data) => {
    calls.push(data)
    return { id: calls.length, createdAt: new Date('2026-01-01T00:00:00.000Z') }
  })

  return calls
}

test('POST /api/contacts stores a valid submission and returns 201', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, validPayload())

  assert.equal(status, 201)
  assert.equal(body.success, true)
  assert.equal(body.data.received, true)
  assert.equal(calls.length, 1)
  // Email is normalised, name and message are trimmed.
  assert.equal(calls[0].email, 'okkar.hein@example.com')
  assert.equal(calls[0].name, 'Okkar Hein')
})

test('POST /api/contacts rejects missing fields with a field map', async (t) => {
  stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, {})

  assert.equal(status, 400)
  assert.equal(body.success, false)
  assert.equal(body.error.code, 'validation_error')
  assert.ok(body.error.fields.name)
  assert.ok(body.error.fields.email)
  assert.ok(body.error.fields.message)
})

test('POST /api/contacts rejects malformed email addresses', async (t) => {
  stubService(t)
  const { url, close } = startServer()
  t.after(close)

  for (const email of ['nope', 'a@b', 'a@.com', 'a b@c.com', '@example.com', 'a@@b.com']) {
    const { status, body } = await post(`${url}/api/contacts`, { ...validPayload(), email })
    assert.equal(status, 400, `expected 400 for ${email}`)
    assert.ok(body.error.fields.email)
  }
})

test('POST /api/contacts rejects unknown fields', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, {
    ...validPayload(),
    isAdmin: true,
    id: 99,
  })

  assert.equal(status, 400)
  assert.equal(body.error.code, 'validation_error')
  assert.equal(calls.length, 0)
})

test('POST /api/contacts rejects wrong types instead of coercing them', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  for (const payload of [
    { ...validPayload(), name: 12345 },
    { ...validPayload(), email: ['a@b.com'] },
    { ...validPayload(), message: { text: 'hello there friend' } },
    { ...validPayload(), name: null },
  ]) {
    const { status } = await post(`${url}/api/contacts`, payload)
    assert.equal(status, 400)
  }

  assert.equal(calls.length, 0)
})

test('POST /api/contacts enforces length limits', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const tooLong = [
    { ...validPayload(), name: 'a'.repeat(101) },
    { ...validPayload(), message: 'm'.repeat(1001) },
    { ...validPayload(), email: `${'a'.repeat(250)}@example.com` },
    { ...validPayload(), name: 'a' },
    { ...validPayload(), message: 'short' },
  ]

  for (const payload of tooLong) {
    const { status } = await post(`${url}/api/contacts`, payload)
    assert.equal(status, 400)
  }

  assert.equal(calls.length, 0)
})

test('POST /api/contacts refuses CR/LF header-injection attempts', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const injections = [
    'Okkar\r\nBcc: attacker@evil.example',
    'Okkar\nSubject: hijacked',
    'Okkar\u0000Hein',
    'Okkar\tHein\r',
  ]

  for (const name of injections) {
    const { status, body } = await post(`${url}/api/contacts`, { ...validPayload(), name })
    assert.equal(status, 400, `expected 400 for ${JSON.stringify(name)}`)
    assert.ok(body.error.fields.name)
  }

  for (const email of ['okkar@example.com\r\nBcc: attacker@evil.example', 'ok\nkar@example.com']) {
    const { status } = await post(`${url}/api/contacts`, { ...validPayload(), email })
    assert.equal(status, 400)
  }

  assert.equal(calls.length, 0)
})

test('POST /api/contacts treats SQL and script payloads as plain data', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const hostile = {
    name: "Robert'); DROP TABLE \"Contact\";--",
    email: 'sqli@example.com',
    message: '<script>alert(document.cookie)</script> OR 1=1; -- ${process.env.DATABASE_URL}',
  }

  const { status, body } = await post(`${url}/api/contacts`, hostile)

  // Accepted as data — Prisma parameterises the write, so there is nothing to
  // escape, and the response never reflects the input back.
  assert.equal(status, 201)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].name, hostile.name)
  assert.equal(calls[0].message, hostile.message)
  assert.equal(JSON.stringify(body).includes('<script>'), false)
  assert.equal(JSON.stringify(body).includes('DROP TABLE'), false)
})

test('POST /api/contacts silently drops honeypot submissions', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, {
    ...validPayload(),
    website: 'https://spam.example',
  })

  // Looks like a success to the bot, but nothing is written.
  assert.equal(status, 201)
  assert.equal(body.success, true)
  assert.equal(calls.length, 0)
})

test('POST /api/contacts accepts an empty honeypot field', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status } = await post(`${url}/api/contacts`, { ...validPayload(), website: '' })

  assert.equal(status, 201)
  assert.equal(calls.length, 1)
})

test('POST /api/contacts rejects bodies over the 10kb limit', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, {
    ...validPayload(),
    message: 'x'.repeat(40 * 1024),
  })

  assert.equal(status, 413)
  assert.equal(body.error.code, 'payload_too_large')
  assert.equal(calls.length, 0)
})

test('POST /api/contacts rejects malformed JSON without leaking internals', async (t) => {
  stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, '{"name": "a",', { raw: true })

  assert.equal(status, 400)
  assert.equal(body.error.code, 'invalid_json')
  assert.equal(JSON.stringify(body).includes('at JSON.parse'), false)
})

test('POST /api/contacts rejects a non-JSON content type', async (t) => {
  const calls = stubService(t)
  const { url, close } = startServer()
  t.after(close)

  const { status } = await post(`${url}/api/contacts`, JSON.stringify(validPayload()), {
    raw: true,
    headers: { 'Content-Type': 'text/plain' },
  })

  assert.equal(status, 400)
  assert.equal(calls.length, 0)
})

test('a database failure returns a generic 500 with no internals', async (t) => {
  t.mock.method(contactService, 'createContact', async () => {
    throw new Error('connect ECONNREFUSED 10.0.0.5:5432 — user=admin password=hunter2')
  })

  const { url, close } = startServer()
  t.after(close)

  const { status, body } = await post(`${url}/api/contacts`, validPayload())
  const serialised = JSON.stringify(body)

  assert.equal(status, 500)
  assert.equal(body.success, false)
  assert.equal(body.error.code, 'internal_error')
  assert.equal(serialised.includes('ECONNREFUSED'), false)
  assert.equal(serialised.includes('hunter2'), false)
  assert.equal(serialised.includes('stack'), false)
})
