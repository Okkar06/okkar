const env = require('../config/env')
const { HttpError } = require('../utils/httpError')

/**
 * Every API response body uses one of these two shapes:
 *   { success: true,  data:  { ... } }
 *   { success: false, error: { code, message, fields? } }
 */
function sendError(res, status, code, message, fields) {
  const error = { code, message }
  if (fields) error.fields = fields
  return res.status(status).json({ success: false, error })
}

/** 404 for anything under /api that no route claimed. */
function apiNotFoundHandler(req, res) {
  return sendError(res, 404, 'not_found', 'Endpoint not found.')
}

/**
 * Central error handler. Known HttpErrors keep their code and message;
 * everything else is logged server-side and reported as a bare 500 — no stack
 * traces, no Prisma messages, no internals of any kind reach the client.
 */
function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return undefined

  if (error instanceof HttpError) {
    return sendError(res, error.status, error.code, error.message, error.fields)
  }

  // body-parser failures: oversized body and malformed JSON.
  if (error?.type === 'entity.too.large') {
    return sendError(res, 413, 'payload_too_large', 'Request body is too large.')
  }

  if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    return sendError(res, 400, 'invalid_json', 'Request body must be valid JSON.')
  }

  if (!env.isTest) {
    // Server-side only. Message, not stack, and never echoed to the client.
    console.error('[error]', error?.message || 'unknown error')
  }

  return sendError(res, 500, 'internal_error', 'Something went wrong. Please try again later.')
}

module.exports = { apiNotFoundHandler, errorHandler, sendError }
