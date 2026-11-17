const { PrismaClient } = require('@prisma/client')

/**
 * Lazily created singleton. Building the client on first use (instead of at
 * require time) keeps the app importable — and testable — on a machine with no
 * generated client or no database, which is how the test suite runs.
 */
let client = null

function getClient() {
  if (!client) client = new PrismaClient()
  return client
}

module.exports = new Proxy(
  {},
  {
    get(_target, property) {
      // Disconnecting must not be the thing that creates the client.
      if (property === '$disconnect' && !client) return async () => {}

      const value = getClient()[property]
      return typeof value === 'function' ? value.bind(getClient()) : value
    },
  },
)
