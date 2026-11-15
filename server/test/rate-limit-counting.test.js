process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'
process.env.CONTACT_RATE_LIMIT_MAX = '2'
process.env.CONTACT_RATE_LIMIT_WINDOW_MS = '60000'
process.env.API_RATE_LIMIT_MAX = '500'

const test = require('node:test')
const assert = require('node:assert/strict')
const { startServer, post, validPayload } = require('./helpers/server')

test('rejected submissions still consume the contact quota', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  // Two invalid attempts use up the window...
  assert.equal((await post(`${url}/api/contacts`, {})).status, 400)
  assert.equal((await post(`${url}/api/contacts`, {})).status, 400)

  // ...so a third request is refused before any validation runs.
  const third = await post(`${url}/api/contacts`, validPayload())
  assert.equal(third.status, 429)
  assert.equal(third.body.error.code, 'rate_limited')
})
