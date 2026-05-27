const test = require('node:test')
const assert = require('node:assert/strict')

const app = require('../src/app')

test('GET /api/health returns ok status', async () => {
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    const data = await response.json()

    assert.equal(response.status, 200)
    assert.equal(data.status, 'ok')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('POST /api/contacts validates required fields', async () => {
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await response.json()

    assert.equal(response.status, 400)
    assert.equal(data.error, 'name, email, and message are required')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
