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

const skip = !hasBuild && 'client/dist not built'

test('the home page is served with 200 and is always revalidated', { skip }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/`)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /<div id="root">/)
  assert.equal(response.headers.get('cache-control'), 'no-cache')
})

test('an unknown page gets the shell (themed 404 screen) with a real 404 status', { skip }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  for (const route of ['/some/deep/route', '/admin', '/.env', '/about/']) {
    const response = await fetch(`${url}${route}`)
    const html = await response.text()

    assert.equal(response.status, 404, route)
    assert.match(html, /<div id="root">/)
  }
})

test('a missing file is a plain 404, never the HTML shell', { skip }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  for (const route of ['/assets/index-stale123.js', '/favicon.ico', '/missing.png', '/robots.txt']) {
    const response = await fetch(`${url}${route}`)
    const body = await response.text()

    assert.equal(response.status, 404, route)
    assert.match(response.headers.get('content-type') ?? '', /text\/plain/)
    assert.equal(body.includes('<div id="root">'), false)
  }
})

test('fingerprinted assets are cached for a year, other files briefly', { skip }, async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const assetsDir = path.join(__dirname, '..', '..', 'client', 'dist', 'assets')
  const script = fs.readdirSync(assetsDir).find((file) => file.endsWith('.js'))

  const asset = await fetch(`${url}/assets/${script}`)
  assert.equal(asset.status, 200)
  assert.match(asset.headers.get('cache-control') ?? '', /max-age=31536000, immutable/)

  const favicon = await fetch(`${url}/favicon.svg`)
  assert.equal(favicon.status, 200)
  assert.match(favicon.headers.get('cache-control') ?? '', /max-age=3600/)
  assert.doesNotMatch(favicon.headers.get('cache-control') ?? '', /immutable/)
})

test('a non-GET request outside /api is a 404, not a crash', async (t) => {
  const { url, close } = startServer()
  t.after(close)

  const response = await fetch(`${url}/`, { method: 'POST', body: 'x' })
  assert.equal(response.status, 404)
})

test('the page loads nothing from a third-party origin', { skip }, async (t) => {
  const html = fs.readFileSync(clientIndex, 'utf8')
  const external = [...html.matchAll(/(?:src|href)="(https?:)?\/\/[^"]+"/g)].map((match) => match[0])
  assert.deepEqual(external, [])
  t.diagnostic('index.html references only same-origin resources')
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
