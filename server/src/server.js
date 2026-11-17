require('./config/loadEnvFile')

const env = require('./config/env')

// Fail fast, and clearly, before anything else is loaded.
const { errors, warnings } = env.validateEnv()

if (errors.length > 0) {
  console.error(env.formatEnvErrors(errors))
  process.exit(1)
}

for (const warning of warnings) console.warn(`[startup] ${warning}`)

const app = require('./app')
const prisma = require('./lib/prisma')

const SHUTDOWN_GRACE_MS = 10_000

const server = app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} (${env.nodeEnv})`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Cannot start: port ${env.port} is already in use. Stop the other process or set PORT.`)
  } else {
    console.error(`Cannot start: ${error.message}`)
  }
  process.exit(1)
})

/**
 * Graceful shutdown: stop accepting connections, let in-flight requests
 * finish, release the database, then exit. Render sends SIGTERM on every
 * deploy; a hard deadline stops a stuck connection holding the process open.
 */
let shuttingDown = false

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received — shutting down.`)

  const deadline = setTimeout(() => process.exit(1), SHUTDOWN_GRACE_MS)
  deadline.unref()

  server.close(async () => {
    try {
      await prisma.$disconnect()
    } catch {
      // Nothing useful to do about a failed disconnect on the way out.
    }
    process.exit(0)
  })
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => shutdown(signal))
}
