import { describe, expect, it } from 'vitest'
import {
  CONTACT_LIMITS,
  toContactPayload,
  validateContact,
  validateField,
} from '../contactValidation'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, I would like to talk.' }

describe('validateContact', () => {
  it('accepts a valid submission', () => {
    expect(validateContact(valid)).toEqual({})
  })

  it('requires every field, with a message per field', () => {
    expect(validateContact({ name: '', email: '', message: '' })).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      message: 'Please write a message.',
    })
  })

  it('treats whitespace-only input as empty', () => {
    expect(Object.keys(validateContact({ name: '   ', email: ' \t ', message: '\n\n' }))).toEqual([
      'name',
      'email',
      'message',
    ])
  })

  it('survives missing or non-string values instead of throwing', () => {
    for (const bad of [undefined, null, {}, { name: 42, email: null, message: ['x'] }]) {
      expect(Object.keys(validateContact(bad))).toEqual(['name', 'email', 'message'])
    }
  })

  it('enforces length limits', () => {
    expect(validateField('name', 'A')).toMatch(/at least 2/)
    expect(validateField('name', 'a'.repeat(CONTACT_LIMITS.name.max))).toBeNull()
    expect(validateField('name', 'a'.repeat(CONTACT_LIMITS.name.max + 1))).toMatch(/under 100/)
    expect(validateField('message', 'too short')).toMatch(/at least 10/)
    expect(validateField('message', 'm'.repeat(CONTACT_LIMITS.message.max))).toBeNull()
    expect(validateField('message', 'm'.repeat(CONTACT_LIMITS.message.max + 1))).toMatch(/under 1000/)
    expect(validateField('email', `${'a'.repeat(250)}@example.com`)).toMatch(/valid email/)
  })

  it.each(['nope', 'a@b', 'a@.com', 'a b@c.com', '@example.com', 'a@@b.com', 'a@b.'])(
    'rejects the malformed email %s',
    (email) => {
      expect(validateField('email', email)).toMatch(/valid email/)
    },
  )

  it.each(['ada@example.com', 'first.last+tag@sub.example.co.uk', '  ada@example.com  '])(
    'accepts the email %s',
    (email) => {
      expect(validateField('email', email)).toBeNull()
    },
  )

  it('refuses line breaks in single-line fields but allows them in the message', () => {
    expect(validateField('name', 'Ada\r\nBcc: someone@example.com')).toMatch(/Line breaks/)
    expect(validateField('email', 'ada@example.com\nx')).toMatch(/Line breaks/)
    expect(validateField('message', 'Line one\nLine two\n\tindented')).toBeNull()
    expect(validateField('message', 'Has a null \u0000 byte in it')).toMatch(/not allowed/)
  })

  it('ignores unknown field names', () => {
    expect(validateField('isAdmin', 'true')).toBeNull()
  })
})

describe('toContactPayload', () => {
  it('trims fields and sends nothing but the four known keys', () => {
    const payload = toContactPayload({ ...valid, name: '  Ada  ', isAdmin: true, id: 9 }, '')
    expect(payload).toEqual({ ...valid, name: 'Ada', website: '' })
  })
})
