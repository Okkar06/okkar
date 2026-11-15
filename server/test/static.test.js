process.env.NODE_ENV = 'test'
process.env.ALLOWED_ORIGINS = 'https://okkar.example'
process.env.API_RATE_LIMIT_MAX = '500'
process.env.CONTACT_RATE_LIMIT_MAX = '500'

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { startServer } = require('./helpers/server')

const clientIndex = path.join(__dirname, '..', '..', 'client', 'dist', 'index.html')
const hasBuild = fs.existsSync(clientIndex)

test('the SPA shell is served for app routes', { skip: !hasBuild && 'client/dist not built' }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/some/deep/route`)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /<div id="root">/)
})

test('security headers are applied to the HTML shell too', { skip: !hasBuild && 'client/dist not built' }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/`)

  assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('the built client bundle contains no server secrets', { skip: !hasBuild && 'client/dist not built' }, async (t) => {
  const assetsDir = path.join(__dirname, '..', '..', 'client', 'dist', 'assets')
  const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : []
  const bundle = files
    .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
    .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
    .join('\n')

  assert.ok(bundle.length > 0, 'expected a built bundle to inspect')

  for (const forbidden of ['DATABASE_URL', 'postgresql://', 'SMTP_', 'sslmode=require']) {
    assert.equal(bundle.includes(forbidden), false, `bundle must not contain ${forbidden}`)
  }
})
