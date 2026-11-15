/**
 * The one error shape the API throws internally. The central error handler
 * turns it into { success: false, error: { code, message } } — anything that
 * is not an HttpError is reported as a generic 500 so internals never leak.
 */
class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.expose = true
    if (fields) this.fields = fields
  }
}

const badRequest = (message, fields) => new HttpError(400, 'validation_error', message, fields)
const notFound = (message = 'Resource not found.') => new HttpError(404, 'not_found', message)
const payloadTooLarge = (message = 'Request body is too large.') =>
  new HttpError(413, 'payload_too_large', message)

module.exports = { HttpError, badRequest, notFound, payloadTooLarge }
