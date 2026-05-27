const prisma = require('../lib/prisma')

async function createContact(data) {
  return prisma.contact.create({ data })
}

module.exports = {
  createContact,
}
