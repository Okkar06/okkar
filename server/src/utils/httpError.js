/**
 * The one error shape the API throws internally. The central error handler
 * turns it into { success: false, error: { code, message } } — anything that
 * is not an HttpError is reported generically so internals never leak.
 */
class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    if (fields) this.fields = fields
  }
}

const badRequest = (message, fields) => new HttpError(400, 'validation_error', message, fields)

module.exports = { HttpError, badRequest }
