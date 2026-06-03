const path = require('path')
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
  console.error(error?.message || 'internal server error')
  res.status(500).json({ error: 'internal server error' })
})

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))

module.exports = app
