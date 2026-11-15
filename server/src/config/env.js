/**
 * Every tunable lives here. Nothing is hardcoded and nothing secret is ever
 * read on the client side — see .env.example for the full list.
 */

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function parseOriginList(...values) {
  const origins = values
    .filter((value) => typeof value === 'string' && value.length > 0)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  return [...new Set(origins)]
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

  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '10kb',

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
