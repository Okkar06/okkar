import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_ENDPOINT, submitContact } from '../api'

const payload = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, friend.', website: '' }

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

const mockFetch = (implementation) => {
  const fetchMock = vi.fn(implementation)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.useRealTimers())

describe('submitContact', () => {
  it('POSTs JSON to the contact endpoint', async () => {
    const fetchMock = mockFetch(async () => json(201, { success: true, data: { received: true } }))

    expect(await submitContact(payload)).toEqual({ outcome: 'sent' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(CONTACT_ENDPOINT)
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual(payload)
  })

  it('does not report success for a 200 that is not the API envelope', async () => {
    mockFetch(async () => new Response('<!doctype html><div id="root"></div>', { status: 200 }))
    expect(await submitContact(payload)).toEqual({ outcome: 'server' })

    mockFetch(async () => json(200, { success: false }))
    expect(await submitContact(payload)).toEqual({ outcome: 'server' })
  })

  it('returns field errors for a 400, reading only known string fields', async () => {
    mockFetch(async () =>
      json(400, {
        success: false,
        error: {
          code: 'validation_error',
          fields: { email: 'Email must be a valid email address.', name: { nested: true }, __proto__: 'x', other: 'y' },
        },
      }),
    )

    expect(await submitContact(payload)).toEqual({
      outcome: 'validation',
      fields: { email: 'Email must be a valid email address.' },
    })
  })

  it('maps each failure status to an outcome', async () => {
    const cases = [
      [413, 'too_large'],
      [503, 'unavailable'],
      [500, 'server'],
      [502, 'server'],
      [404, 'server'],
    ]
    for (const [status, outcome] of cases) {
      mockFetch(async () => json(status, { success: false, error: { code: 'x', message: 'y' } }))
      expect((await submitContact(payload)).outcome, String(status)).toBe(outcome)
    }
  })

  it('reports rate limiting with the wait the server asked for', async () => {
    mockFetch(async () => json(429, { success: false }, { 'Retry-After': '120' }))
    expect(await submitContact(payload)).toEqual({ outcome: 'rate_limited', retryAfterSeconds: 120 })

    mockFetch(async () => json(429, { success: false }))
    expect(await submitContact(payload)).toEqual({ outcome: 'rate_limited', retryAfterSeconds: null })
  })

  it('copes with an error response that is not JSON', async () => {
    mockFetch(async () => new Response('Bad Gateway', { status: 502 }))
    expect(await submitContact(payload)).toEqual({ outcome: 'server' })
  })

  it('reports a network failure without throwing', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(await submitContact(payload)).toEqual({ outcome: 'network' })
  })

  it('gives up after the timeout and aborts the request', async () => {
    vi.useFakeTimers()
    let aborted = false
    mockFetch(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            aborted = true
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )

    const pending = submitContact(payload, { timeoutMs: 5000 })
    await vi.advanceTimersByTimeAsync(5000)

    expect(await pending).toEqual({ outcome: 'timeout' })
    expect(aborted).toBe(true)
  })

  it('reports a caller-side abort as aborted', async () => {
    mockFetch(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )
    const controller = new AbortController()

    const pending = submitContact(payload, { signal: controller.signal })
    controller.abort()

    expect(await pending).toEqual({ outcome: 'aborted' })
  })
})
