const express = require('express')
const { submitContact } = require('../controllers/contactController')
const { methodNotAllowed } = require('../middleware/errorHandler')

const router = express.Router()

// POST is the only thing this endpoint does; anything else is told so (405
// with an Allow header) rather than being passed off as "not found".
router.route('/').post(submitContact).all(methodNotAllowed('POST'))

module.exports = router
