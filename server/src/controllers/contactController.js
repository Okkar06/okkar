const { createContact } = require('../services/contactService')

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
