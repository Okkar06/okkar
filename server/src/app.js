const path = require('path')
const express = require('express')
const env = require('./config/env')
const contactRoutes = require('./routes/contactRoutes')
const { apiNotFoundHandler, errorHandler } = require('./middleware/errorHandler')
const {
  apiRateLimiter,
  contactRateLimiter,
  corsMiddleware,
  securityHeaders,
} = require('./middleware/security')

const app = express()

// Exactly as many proxy hops as are actually in front of the app (1 on
// Render). Needed for correct client IPs in the rate limiters, and
// deliberately not `true`, which would let any caller spoof X-Forwarded-For.
app.set('trust proxy', env.trustProxy)
app.disable('x-powered-by')

app.use(securityHeaders())
app.use(corsMiddleware())

// ── API ──────────────────────────────────────────────────────────────────────
const api = express.Router()

api.use(apiRateLimiter())
api.use(express.json({ limit: env.jsonBodyLimit }))

api.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

api.use('/contacts', contactRateLimiter(), contactRoutes)

// Any other /api path is a 404 in JSON — never the SPA shell.
api.use(apiNotFoundHandler)

app.use('/api', api)

// ── Static client ────────────────────────────────────────────────────────────
if (env.serveClient) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')

  app.use(express.static(clientDist, { index: false }))
  app.get('/{*path}', (_req, res, next) => {
    res.sendFile(path.join(clientDist, 'index.html'), (error) => {
      if (error) next(error)
    })
  })
}

// ── Errors (always last) ─────────────────────────────────────────────────────
app.use(errorHandler)

module.exports = app
