const { createContact } = require('../services/contactService')

function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false
  }

  const normalized = email.trim()
  if (normalized.length === 0 || normalized.length > 254) {
    return false
  }

  const atIndex = normalized.indexOf('@')
  const lastAtIndex = normalized.lastIndexOf('@')
  if (atIndex <= 0 || atIndex !== lastAtIndex || atIndex === normalized.length - 1) {
    return false
  }

  const domain = normalized.slice(atIndex + 1)
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.')
}

async function submitContact(req, res, next) {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid email format' })
    }

    const contact = await createContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    })

    return res.status(201).json({ id: contact.id, createdAt: contact.createdAt })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  submitContact,
}
