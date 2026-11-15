const contactService = require('../services/contactService')
const { contactSchema, toFieldErrors } = require('../validation/contactSchema')
const { badRequest } = require('../utils/httpError')

/**
 * POST /api/contacts
 *
 * Validates with zod (unknown fields rejected, lengths capped, control
 * characters refused), then writes through Prisma — which parameterises the
 * query, so the stored values are only ever data, never SQL.
 */
async function submitContact(req, res, next) {
  try {
    const parsed = contactSchema.safeParse(req.body)

    if (!parsed.success) {
      throw badRequest('Please check the submitted fields.', toFieldErrors(parsed.error))
    }

    const { name, email, message, website } = parsed.data

    // Honeypot hit: answer exactly like a success so the bot learns nothing,
    // but store nothing.
    if (typeof website === 'string' && website.length > 0) {
      return res.status(201).json({ success: true, data: { received: true } })
    }

    const contact = await contactService.createContact({ name, email, message })

    return res.status(201).json({
      success: true,
      data: { id: contact.id, createdAt: contact.createdAt, received: true },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { submitContact }
