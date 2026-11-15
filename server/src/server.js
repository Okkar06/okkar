require('dotenv/config')

const app = require('./app')
const env = require('./config/env')

if (env.isProduction && env.allowedOrigins.length === 0) {
  console.warn(
    '[startup] ALLOWED_ORIGINS is empty — cross-origin browser requests will be refused.',
  )
}

const server = app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} (${env.nodeEnv})`)
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
