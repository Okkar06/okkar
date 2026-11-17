const path = require('path')
const dotenv = require('dotenv')

/**
 * Loads a local .env file, wherever the server was started from: the repo
 * root (`npm start`, as on Render) or server/ (`npm run dev`). Variables that
 * are already set — everything on Render — always win, and a missing file is
 * fine. Must be required before ./env, which reads process.env once.
 */
dotenv.config({
  path: [path.join(__dirname, '..', '..', '.env'), path.join(__dirname, '..', '..', '..', '.env')],
  quiet: true,
})
