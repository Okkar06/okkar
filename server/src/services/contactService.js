const prisma = require('../lib/prisma')

/**
 * Writes a contact message. Prisma builds a parameterised statement, so the
 * values are bound as data — there is no raw SQL anywhere in this project.
 */
async function createContact(data) {
  return prisma.contact.create({ data })
}

module.exports = { createContact }
