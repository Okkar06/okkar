const express = require('express')
const cors = require('cors')
const env = require('./config/env')
const contactRoutes = require('./routes/contactRoutes')

const app = express()

app.use(cors({ origin: env.clientOrigin }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/contacts', contactRoutes)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'internal server error' })
})

module.exports = app
