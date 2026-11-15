// Rate-limiter state lives in the app module, so each limiter scenario gets its
// own test file — `node --test` runs every file in a fresh process.
process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'
process.env.CONTACT_RATE_LIMIT_MAX = '2'
process.env.CONTACT_RATE_LIMIT_WINDOW_MS = '60000'
process.env.API_RATE_LIMIT_MAX = '500'

const test = require('node:test')
const assert = require('node:assert/strict')
const contactService = require('../src/services/contactService')
const { startServer, post, validPayload } = require('./helpers/server')

test('the contact endpoint returns 429 past its strict limit', async (t) => {
  t.mock.method(contactService, 'createContact', async () => ({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  }))

  const { url, close } = startServer()
  t.after(close)

  const first = await post(`${url}/api/contacts`, validPayload())
  const second = await post(`${url}/api/contacts`, validPayload())
  const third = await post(`${url}/api/contacts`, validPayload())

  assert.equal(first.status, 201)
  assert.equal(second.status, 201)
  assert.equal(third.status, 429)
  assert.equal(third.body.success, false)
  assert.equal(third.body.error.code, 'rate_limited')
  assert.ok(third.headers.get('retry-after') || third.headers.get('ratelimit'))
})
