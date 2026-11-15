const cors = require('cors')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const env = require('../config/env')
const { sendError } = require('./errorHandler')

/**
 * Security headers.
 *
 * The CSP is written for the Vite production build plus Google Fonts:
 *  - script-src stays 'self' because the client has no inline scripts (the
 *    theme bootstrap lives in public/theme-init.js on purpose).
 *  - style-src needs 'unsafe-inline': React and Framer Motion set style
 *    attributes on elements, which style-src governs. Fonts come from
 *    fonts.googleapis.com (CSS) and fonts.gstatic.com (font files).
 *  - frame-ancestors 'none' plus X-Frame-Options: DENY stop framing.
 */
function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'script-src': ["'self'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'manifest-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        ...(env.isProduction ? { 'upgrade-insecure-requests': [] } : {}),
      },
    },
    // HSTS only has meaning over HTTPS; Render terminates TLS for us.
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    noSniff: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    // Not useful here and historically harmful in old browsers.
    xXssProtection: false,
  })
}

/**
 * CORS restricted to an explicit allowlist. A disallowed browser origin simply
 * gets no Access-Control-Allow-Origin header, so the browser blocks the read.
 * Requests with no Origin at all (same-origin navigation, curl, health checks)
 * are untouched.
 */
function corsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const normalized = origin.replace(/\/+$/, '')
      return callback(null, env.allowedOrigins.includes(normalized))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
    maxAge: 600,
  })
}

function limitHandler(_req, res) {
  return sendError(res, 429, 'rate_limited', 'Too many requests. Please try again later.')
}

/** Broad limiter for the whole API surface. */
function apiRateLimiter() {
  return rateLimit({
    windowMs: env.apiRateLimit.windowMs,
    limit: env.apiRateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: limitHandler,
  })
}

/** Strict limiter for the one endpoint that writes to the database. */
function contactRateLimiter() {
  return rateLimit({
    windowMs: env.contactRateLimit.windowMs,
    limit: env.contactRateLimit.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Successful and rejected submissions both count, so validation errors
    // cannot be used to hammer the endpoint for free.
    handler: limitHandler,
  })
}

module.exports = {
  securityHeaders,
  corsMiddleware,
  apiRateLimiter,
  contactRateLimiter,
}
