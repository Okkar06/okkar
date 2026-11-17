const fs = require('fs')
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

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60
const ONE_HOUR_SECONDS = 60 * 60

const app = express()

// Exactly as many proxy hops as are actually in front of the app (1 on
// Render). Needed for correct client IPs in the rate limiters, and
// deliberately not `true`, which would let any caller spoof X-Forwarded-For.
app.set('trust proxy', env.trustProxy)
app.disable('x-powered-by')

app.use(securityHeaders())
app.use(corsMiddleware())

// ── Health check ─────────────────────────────────────────────────────────────
// Registered BEFORE the rate limiter: Render polls this every few seconds
// (render.yaml -> healthCheckPath), and a limited health check would look
// like a dead service and get the app restarted. It reports that the process
// is up and serving; it deliberately does not query the database, so a brief
// database blip degrades the contact form (503) without taking the site down.
app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ success: true, data: { status: 'ok' } })
})

// ── API ──────────────────────────────────────────────────────────────────────
const api = express.Router()

api.use(apiRateLimiter())
api.use(express.json({ limit: env.jsonBodyLimit }))

api.use('/contacts', contactRateLimiter(), contactRoutes)

// Any other /api path is a 404 in JSON — never the SPA shell.
api.use(apiNotFoundHandler)

app.use('/api', api)

// ── Static client ────────────────────────────────────────────────────────────
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
const clientIndex = path.join(clientDist, 'index.html')
const hasClientBuild = env.serveClient && fs.existsSync(clientIndex)

if (env.serveClient && !hasClientBuild && !env.isTest) {
  console.warn(
    '[startup] client/dist was not found, so only the API is being served. Run "npm run build" in client/, or set SERVE_CLIENT=false to silence this.',
  )
}

if (hasClientBuild) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        // Vite fingerprints everything under assets/, so those files can be
        // cached forever; the rest (favicon, images) for an hour.
        const fingerprinted = filePath.startsWith(path.join(clientDist, 'assets') + path.sep)
        res.setHeader(
          'Cache-Control',
          fingerprinted
            ? `public, max-age=${ONE_YEAR_SECONDS}, immutable`
            : `public, max-age=${ONE_HOUR_SECONDS}`,
        )
      },
    }),
  )

  app.get('/{*path}', (req, res, next) => {
    const isHome = req.path === '/' || req.path === '/index.html'

    // A missing file (a stale asset URL after a deploy, /favicon.ico…) must
    // be a plain 404, not the HTML shell with a 200 — a browser would try to
    // run that HTML as a script.
    if (!isHome && path.extname(req.path) !== '') {
      return res.status(404).type('text/plain').send('Not found')
    }

    // The site is a single page. "/" is it; any other path gets the same
    // shell — which renders the themed 404 screen — with a real 404 status.
    res.status(isHome ? 200 : 404)
    res.set('Cache-Control', 'no-cache')
    return res.sendFile(clientIndex, (error) => {
      if (error) next(error)
    })
  })
}

// Anything left: a non-GET request outside /api, or a page request when no
// client build is being served.
app.use((_req, res) => {
  res.status(404).type('text/plain').send('Not found')
})

// ── Errors (always last) ─────────────────────────────────────────────────────
app.use(errorHandler)

module.exports = app
