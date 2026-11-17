/**
 * Every tunable lives here. Nothing is hardcoded and nothing secret is ever
 * read on the client side — see .env.example for the full list.
 *
 * validateEnv() is what the server runs at startup: a missing or malformed
 * variable stops the boot with a message naming it, instead of surfacing
 * later as a confusing 500 on the first request.
 */

/** Every variable the server reads. A test keeps this in step with .env.example. */
const KNOWN_VARIABLES = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'ALLOWED_ORIGINS',
  'CLIENT_ORIGIN',
  'TRUST_PROXY',
  'JSON_BODY_LIMIT',
  'API_RATE_LIMIT_WINDOW_MS',
  'API_RATE_LIMIT_MAX',
  'CONTACT_RATE_LIMIT_WINDOW_MS',
  'CONTACT_RATE_LIMIT_MAX',
  'SERVE_CLIENT',
]

const NUMERIC_VARIABLES = [
  'API_RATE_LIMIT_WINDOW_MS',
  'API_RATE_LIMIT_MAX',
  'CONTACT_RATE_LIMIT_WINDOW_MS',
  'CONTACT_RATE_LIMIT_MAX',
]

const isSet = (value) => typeof value === 'string' && value.trim().length > 0

function toNumber(value, fallback) {
  if (!isSet(value)) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function splitOrigins(...values) {
  return values
    .filter(isSet)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

function parseOriginList(...values) {
  return [...new Set(splitOrigins(...values))]
}

/** True for exactly "scheme://host[:port]" over http(s) — no path, no wildcard. */
function isOrigin(value) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === value
  } catch {
    return false
  }
}

/**
 * Checks the environment without touching it.
 * `errors` must stop the server; `warnings` are worth a log line.
 */
function validateEnv(source = process.env) {
  const errors = []
  const warnings = []
  const nodeEnv = source.NODE_ENV || 'development'

  // The database is the one thing with no usable default. Tests stub the
  // service layer, so they are the only context allowed to run without it.
  if (nodeEnv !== 'test') {
    if (!isSet(source.DATABASE_URL)) {
      errors.push('DATABASE_URL is missing. Set it to your Postgres connection string.')
    } else if (!/^postgres(ql)?:\/\//.test(source.DATABASE_URL.trim())) {
      errors.push('DATABASE_URL must start with postgresql:// (or postgres://).')
    }
  }

  if (isSet(source.PORT)) {
    const port = Number(source.PORT)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push(`PORT must be a whole number between 1 and 65535 (got "${source.PORT}").`)
    }
  }

  if (isSet(source.TRUST_PROXY)) {
    const hops = Number(source.TRUST_PROXY)
    if (!Number.isInteger(hops) || hops < 0) {
      errors.push(
        `TRUST_PROXY must be the number of proxies in front of the app, e.g. 1 on Render (got "${source.TRUST_PROXY}"). "true" is refused on purpose: it would let any caller spoof their IP and dodge the rate limits.`,
      )
    }
  }

  for (const name of NUMERIC_VARIABLES) {
    if (!isSet(source[name])) continue
    const value = Number(source[name])
    if (!Number.isFinite(value) || value <= 0) {
      errors.push(`${name} must be a positive number (got "${source[name]}").`)
    }
  }

  if (isSet(source.JSON_BODY_LIMIT) && !/^\d+(b|kb|mb)$/i.test(source.JSON_BODY_LIMIT.trim())) {
    errors.push(`JSON_BODY_LIMIT must look like 10kb or 1mb (got "${source.JSON_BODY_LIMIT}").`)
  }

  if (isSet(source.SERVE_CLIENT) && !['true', 'false'].includes(source.SERVE_CLIENT.trim())) {
    errors.push(`SERVE_CLIENT must be "true" or "false" (got "${source.SERVE_CLIENT}").`)
  }

  for (const origin of splitOrigins(source.ALLOWED_ORIGINS, source.CLIENT_ORIGIN)) {
    if (origin === '*') {
      errors.push('ALLOWED_ORIGINS must list real origins. "*" is not allowed.')
    } else if (!isOrigin(origin)) {
      errors.push(
        `ALLOWED_ORIGINS contains "${origin}", which is not an origin. Use the form https://example.com (scheme and host, no path).`,
      )
    }
  }

  if (nodeEnv === 'production' && splitOrigins(source.ALLOWED_ORIGINS, source.CLIENT_ORIGIN).length === 0) {
    warnings.push(
      'ALLOWED_ORIGINS is empty — the site itself still works (same origin), but any other origin calling the API from a browser will be refused.',
    )
  }

  return { errors, warnings }
}

/** The startup message for a failed validation. Never includes a value that could be a secret. */
function formatEnvErrors(errors) {
  return [
    'Cannot start: the environment is not configured correctly.',
    '',
    ...errors.map((error) => `  - ${error}`),
    '',
    'Every variable is documented, with an example value, in .env.example.',
    'Locally: copy .env.example to .env and fill it in. On Render: set them in the dashboard.',
  ].join('\n')
}

const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'
const isTest = nodeEnv === 'test'

// ALLOWED_ORIGINS is the real setting; CLIENT_ORIGIN is kept for backwards
// compatibility with the existing Render configuration. Never "*".
const configuredOrigins = parseOriginList(process.env.ALLOWED_ORIGINS, process.env.CLIENT_ORIGIN)

const defaultDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173']

const env = {
  nodeEnv,
  isProduction,
  isTest,

  port: toNumber(process.env.PORT, 4000),

  // Render terminates TLS one hop in front of the app, so exactly one proxy is
  // trusted by default in production. A wide-open `true` would let anyone spoof
  // X-Forwarded-For and defeat the rate limiters.
  trustProxy: toNumber(process.env.TRUST_PROXY, isProduction ? 1 : 0),

  allowedOrigins: configuredOrigins.length > 0 ? configuredOrigins : isProduction ? [] : defaultDevOrigins,

  jsonBodyLimit: isSet(process.env.JSON_BODY_LIMIT) ? process.env.JSON_BODY_LIMIT.trim() : '10kb',

  apiRateLimit: {
    windowMs: toNumber(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(process.env.API_RATE_LIMIT_MAX, 300),
  },

  contactRateLimit: {
    windowMs: toNumber(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
    max: toNumber(process.env.CONTACT_RATE_LIMIT_MAX, 5),
  },

  // The API also serves the built client in the single-service Render setup.
  serveClient: process.env.SERVE_CLIENT !== 'false',
}

module.exports = env
module.exports.validateEnv = validateEnv
module.exports.formatEnvErrors = formatEnvErrors
module.exports.KNOWN_VARIABLES = KNOWN_VARIABLES
