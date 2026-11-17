process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'
process.env.API_RATE_LIMIT_MAX = '4'
process.env.API_RATE_LIMIT_WINDOW_MS = '60000'
process.env.CONTACT_RATE_LIMIT_MAX = '500'

const test = require('node:test')
const assert = require('node:assert/strict')
const { startServer } = require('./helpers/server')

test('the general API limiter returns 429 past its window limit', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  // Any API path counts towards the limit, including ones that do not exist.
  const statuses = []
  for (let i = 0; i < 6; i += 1) {
    const response = await fetch(`${url}/api/anything`)
    statuses.push(response.status)
  }

  assert.equal(statuses.filter((status) => status === 404).length, 4)
  assert.equal(statuses.filter((status) => status === 429).length, 2)

  const limited = await fetch(`${url}/api/anything`)
  const body = await limited.json()
  assert.equal(limited.status, 429)
  assert.equal(body.success, false)
  assert.equal(body.error.code, 'rate_limited')
})

test('the health check keeps answering after the limiter has tripped', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  // The limiter above is already exhausted for this client; Render's probe
  // must still get a 200 or it would restart a healthy service.
  for (let i = 0; i < 10; i += 1) {
    const response = await fetch(`${url}/api/health`)
    assert.equal(response.status, 200)
  }
})
