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
function apiNotFoundHandler(_req, res) {
  return sendError(res, 404, 'not_found', 'Endpoint not found.')
}

/** 405 for a real endpoint called with a method it does not support. */
function methodNotAllowed(...allowed) {
  return (_req, res) => {
    res.set('Allow', allowed.join(', '))
    return sendError(res, 405, 'method_not_allowed', `Use ${allowed.join(' or ')} for this endpoint.`)
  }
}

/**
 * Client errors raised by Express and its body parser (malformed URL
 * encoding, unsupported charset, aborted upload…). They arrive with a 4xx
 * `status`; each gets a fixed code and message — the library's own message is
 * never forwarded.
 */
const CLIENT_ERRORS = {
  400: ['bad_request', 'The request could not be understood.'],
  404: ['not_found', 'Not found.'],
  405: ['method_not_allowed', 'Method not allowed.'],
  406: ['not_acceptable', 'The requested format is not available.'],
  408: ['request_timeout', 'The request took too long to arrive.'],
  413: ['payload_too_large', 'Request body is too large.'],
  415: ['unsupported_media_type', 'Request body must be JSON encoded as UTF-8.'],
}

/**
 * True when the failure is "the database cannot be reached right now" rather
 * than a bug: Prisma's connection-level errors (P1xxx), a pool timeout
 * (P2024), or the client failing to initialise.
 */
function isDatabaseUnavailable(error) {
  const code = String(error?.code ?? error?.errorCode ?? '')
  return (
    error?.name === 'PrismaClientInitializationError' ||
    error?.name === 'PrismaClientRustPanicError' ||
    /^P1\d{3}$/.test(code) ||
    code === 'P2024'
  )
}

function logServerSide(error) {
  if (env.isTest) return
  // Server-side only. Message, not stack, and never echoed to the client.
  console.error('[error]', error?.message || 'unknown error')
}

/**
 * Central error handler. Known HttpErrors keep their code and message;
 * everything else is logged server-side and reported generically — no stack
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

  const status = Number(error?.status ?? error?.statusCode)
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    const [code, message] = CLIENT_ERRORS[status] ?? CLIENT_ERRORS[400]
    return sendError(res, status, code, message)
  }

  logServerSide(error)

  if (isDatabaseUnavailable(error)) {
    res.set('Retry-After', '30')
    return sendError(
      res,
      503,
      'service_unavailable',
      'The service is temporarily unavailable. Please try again shortly.',
    )
  }

  return sendError(res, 500, 'internal_error', 'Something went wrong. Please try again later.')
}

module.exports = { apiNotFoundHandler, errorHandler, methodNotAllowed, sendError }
