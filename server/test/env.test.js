process.env.NODE_ENV = 'test'

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { validateEnv, formatEnvErrors, KNOWN_VARIABLES } = require('../src/config/env')

const repoRoot = path.join(__dirname, '..', '..')
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8')

const valid = () => ({
  NODE_ENV: 'production',
  PORT: '4000',
  DATABASE_URL: 'postgresql://user:pass@host:5432/db?sslmode=require',
  ALLOWED_ORIGINS: 'https://okkar.example',
  TRUST_PROXY: '1',
})

test('a complete environment passes with no errors or warnings', () => {
  assert.deepEqual(validateEnv(valid()), { errors: [], warnings: [] })
})

test('a missing DATABASE_URL is reported by name', () => {
  for (const DATABASE_URL of [undefined, '', '   ']) {
    const { errors } = validateEnv({ ...valid(), DATABASE_URL })
    assert.equal(errors.length, 1)
    assert.match(errors[0], /DATABASE_URL is missing/)
  }
})

test('a DATABASE_URL that is not a Postgres URL is rejected without echoing it', () => {
  const { errors } = validateEnv({ ...valid(), DATABASE_URL: 'mysql://root:hunter2@host/db' })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /DATABASE_URL must start with postgresql:\/\//)
  assert.equal(formatEnvErrors(errors).includes('hunter2'), false)
})

test('malformed values are each reported', () => {
  const cases = [
    [{ PORT: 'abc' }, /PORT must be/],
    [{ PORT: '70000' }, /PORT must be/],
    [{ TRUST_PROXY: 'true' }, /TRUST_PROXY must be the number of proxies/],
    [{ TRUST_PROXY: '-1' }, /TRUST_PROXY/],
    [{ API_RATE_LIMIT_MAX: 'lots' }, /API_RATE_LIMIT_MAX must be a positive number/],
    [{ CONTACT_RATE_LIMIT_WINDOW_MS: '0' }, /CONTACT_RATE_LIMIT_WINDOW_MS/],
    [{ JSON_BODY_LIMIT: 'huge' }, /JSON_BODY_LIMIT must look like/],
    [{ SERVE_CLIENT: 'yes' }, /SERVE_CLIENT must be/],
    [{ ALLOWED_ORIGINS: '*' }, /"\*" is not allowed/],
    [{ ALLOWED_ORIGINS: 'okkar.example' }, /is not an origin/],
    [{ ALLOWED_ORIGINS: 'https://okkar.example/path' }, /is not an origin/],
  ]

  for (const [override, pattern] of cases) {
    const { errors } = validateEnv({ ...valid(), ...override })
    assert.equal(errors.length, 1, JSON.stringify(override))
    assert.match(errors[0], pattern)
  }
})

test('several problems are all listed at once', () => {
  const { errors } = validateEnv({ NODE_ENV: 'production', PORT: 'x', TRUST_PROXY: 'true' })
  assert.equal(errors.length, 3)
})

test('production without ALLOWED_ORIGINS is a warning, not a failure', () => {
  const { errors, warnings } = validateEnv({ ...valid(), ALLOWED_ORIGINS: '' })
  assert.deepEqual(errors, [])
  assert.equal(warnings.length, 1)
})

test('the test environment may run without a database', () => {
  assert.deepEqual(validateEnv({ NODE_ENV: 'test' }).errors, [])
})

test('the startup message points at .env.example', () => {
  const message = formatEnvErrors(['DATABASE_URL is missing.'])
  assert.match(message, /Cannot start/)
  assert.match(message, /DATABASE_URL is missing/)
  assert.match(message, /\.env\.example/)
})

test('.env.example documents exactly the variables the server reads', () => {
  const documented = [...read('.env.example').matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1])
  const backend = documented.filter((name) => !name.startsWith('VITE_'))

  assert.deepEqual([...backend].sort(), [...KNOWN_VARIABLES].sort())
})

test('render.yaml only sets known variables and uses the health check', () => {
  const yaml = read('render.yaml')
  const keys = [...yaml.matchAll(/- key: ([A-Z0-9_]+)/g)].map((match) => match[1])

  assert.ok(keys.length > 0)
  for (const key of keys) assert.ok(KNOWN_VARIABLES.includes(key), `${key} is not read by the server`)
  assert.ok(keys.includes('DATABASE_URL'))
  assert.match(yaml, /healthCheckPath: \/api\/health/)
})

test('.gitignore keeps .env files out of the repository', () => {
  const ignore = read('.gitignore')
  assert.match(ignore, /^\.env$/m)
  assert.match(ignore, /^\.env\.\*$/m)
  assert.match(ignore, /^!\.env\.example$/m)
})

test('the server refuses to boot without DATABASE_URL and says why', () => {
  // An empty value counts as "already set", so a developer's own .env file
  // cannot fill it in and mask the failure. The cwd is an empty directory.
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'okkar-env-'))
  const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    cwd,
    env: { ...process.env, NODE_ENV: 'production', DATABASE_URL: '', PORT: '0' },
    encoding: 'utf8',
    timeout: 20_000,
  })
  fs.rmSync(cwd, { recursive: true, force: true })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Cannot start/)
  assert.match(result.stderr, /DATABASE_URL is missing/)
  assert.match(result.stderr, /\.env\.example/)
  assert.equal(result.stderr.includes('    at '), false, 'no stack trace in the startup message')
})
