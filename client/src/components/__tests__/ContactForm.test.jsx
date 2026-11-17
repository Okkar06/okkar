import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitContact } from '../../lib/api'
import ContactForm from '../ContactForm'

vi.mock('../../lib/api', () => ({ submitContact: vi.fn() }))

const EMAIL = 'me@example.com'

const nameField = () => screen.getByLabelText('ENTER YOUR NAME')
const emailField = () => screen.getByLabelText('YOUR EMAIL')
const messageField = () => screen.getByLabelText('YOUR MESSAGE')
const submitButton = () => screen.getByRole('button', { name: /SUBMIT SCORE|SENDING/ })
const alert = () => screen.getByRole('alert')

async function fillValid(user) {
  await user.type(nameField(), 'Ada Lovelace')
  await user.type(emailField(), 'ada@example.com')
  await user.type(messageField(), 'Hello, I would like to talk.')
}

/** A submitContact that stays pending until the test resolves it. */
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  submitContact.mockReturnValue(promise)
  return (result) => act(async () => resolve(result))
}

beforeEach(() => {
  submitContact.mockReset()
  submitContact.mockResolvedValue({ outcome: 'sent' })
})

describe('validation', () => {
  it('blocks an empty submit, explains each field inline and focuses the first', async () => {
    const user = userEvent.setup()
    render(<ContactForm fallbackEmail={EMAIL} />)

    await user.click(submitButton())

    expect(submitContact).not.toHaveBeenCalled()
    expect(nameField()).toHaveAccessibleDescription(/Please enter your name/)
    expect(emailField()).toHaveAccessibleDescription(/Please enter your email address/)
    expect(messageField()).toHaveAccessibleDescription(/Please write a message/)
    for (const field of [nameField(), emailField(), messageField()]) {
      expect(field).toBeInvalid()
      expect(field).toBeRequired()
    }
    expect(nameField()).toHaveFocus()
    expect(alert()).toHaveTextContent('Please check the highlighted fields')
  })

  it('checks format and length, and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(nameField(), 'Ada Lovelace')
    await user.type(emailField(), 'not-an-email')
    await user.type(messageField(), 'short')
    await user.click(submitButton())

    expect(submitContact).not.toHaveBeenCalled()
    expect(nameField()).toBeValid()
    expect(emailField()).toHaveAccessibleDescription(/valid email address/)
    expect(messageField()).toHaveAccessibleDescription(/at least 10 characters/)
    expect(emailField()).toHaveFocus()
  })

  it('validates a field on blur, but not one left empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(nameField())
    await user.tab()
    expect(nameField()).not.toHaveAttribute('aria-invalid')

    await user.type(emailField(), 'nope')
    await user.tab()
    expect(emailField()).toBeInvalid()
  })

  it('clears an error as soon as the field is fixed', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(submitButton())
    expect(nameField()).toBeInvalid()

    await user.type(nameField(), 'Ada')
    expect(nameField()).toBeValid()
  })

  it('caps input length and counts message characters', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    expect(nameField()).toHaveAttribute('maxlength', '100')
    expect(messageField()).toHaveAttribute('maxlength', '1000')

    await user.type(messageField(), 'Hello!')
    expect(screen.getByText(/6\/1000 characters/)).toBeInTheDocument()

    fireEvent.change(messageField(), { target: { value: 'x'.repeat(950) } })
    expect(screen.getByText(/950\/1000 characters — almost at the limit/)).toBeInTheDocument()
  })
})

describe('submitting', () => {
  it('sends trimmed values, then shows and focuses the confirmation', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(nameField(), '  Ada Lovelace ')
    await user.type(emailField(), 'ada@example.com')
    await user.type(messageField(), 'Hello, I would like to talk.  ')
    await user.click(submitButton())

    expect(submitContact).toHaveBeenCalledTimes(1)
    expect(submitContact.mock.calls[0][0]).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, I would like to talk.',
      website: '',
    })

    const confirmation = await screen.findByText('STAGE CLEAR!')
    expect(confirmation).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Your message is in')
  })

  it('disables the button and locks the fields while the request is pending', async () => {
    const user = userEvent.setup()
    const finish = deferred()
    render(<ContactForm />)
    await fillValid(user)

    await user.click(submitButton())

    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveAttribute('aria-busy', 'true')
    expect(submitButton()).toHaveTextContent('SENDING')
    expect(nameField()).toHaveAttribute('readonly')
    expect(messageField()).toHaveAttribute('readonly')

    await finish({ outcome: 'sent' })
    expect(await screen.findByText('STAGE CLEAR!')).toBeInTheDocument()
  })

  it('sends only once however fast the form is submitted', async () => {
    const user = userEvent.setup()
    const finish = deferred()
    render(<ContactForm />)
    await fillValid(user)
    const form = submitButton().closest('form')

    // Three submit events in the same tick, before React can re-render.
    act(() => {
      fireEvent.submit(form)
      fireEvent.submit(form)
      fireEvent.submit(form)
    })
    await user.keyboard('{Enter}')

    expect(submitContact).toHaveBeenCalledTimes(1)
    await finish({ outcome: 'sent' })
  })

  it('warns before leaving only while a request is in flight', async () => {
    const user = userEvent.setup()
    const finish = deferred()
    render(<ContactForm />)
    await fillValid(user)

    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }

    expect(leave()).toBe(false)
    await user.click(submitButton())
    expect(leave()).toBe(true)
    await finish({ outcome: 'sent' })
    await screen.findByText('STAGE CLEAR!')
    expect(leave()).toBe(false)
  })

  it('lets the visitor send another, starting clean with focus on the first field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillValid(user)
    await user.click(submitButton())

    await user.click(await screen.findByRole('button', { name: 'SEND ANOTHER' }))

    expect(nameField()).toHaveValue('')
    expect(messageField()).toHaveValue('')
    await waitFor(() => expect(nameField()).toHaveFocus())
  })

  it('passes the honeypot through and keeps it out of the tab order', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    const honeypot = screen.getByLabelText('Website')
    expect(honeypot).toHaveAttribute('tabindex', '-1')

    await fillValid(user)
    fireEvent.change(honeypot, { target: { value: 'https://spam.example' } })
    await user.click(submitButton())

    expect(submitContact.mock.calls[0][0].website).toBe('https://spam.example')
  })
})

describe('failures', () => {
  const cases = [
    ['network', {}, /Unable to reach the server/],
    ['timeout', {}, /taking too long/],
    ['rate_limited', { retryAfterSeconds: 600 }, /try again in about 10 minutes/],
    ['rate_limited', {}, /try again in a little while/],
    ['too_large', {}, /too large to send/],
    ['unavailable', {}, /can't be saved right now/],
    ['server', {}, /Something went wrong on my side/],
    ['something_unexpected', {}, /Something went wrong on my side/],
  ]

  it.each(cases)('explains a %s failure and keeps what was typed', async (outcome, extra, message) => {
    const user = userEvent.setup()
    submitContact.mockResolvedValue({ outcome, ...extra })
    render(<ContactForm fallbackEmail={EMAIL} />)
    await fillValid(user)

    await user.click(submitButton())

    await waitFor(() => expect(alert()).toHaveTextContent(message))
    expect(messageField()).toHaveValue('Hello, I would like to talk.')
    expect(submitButton()).toBeEnabled()
    expect(alert().textContent).not.toMatch(/Error|undefined|null|\bat \w+\(/)
  })

  it('offers the direct email address when the server cannot take the message', async () => {
    const user = userEvent.setup()
    submitContact.mockResolvedValue({ outcome: 'server' })
    render(<ContactForm fallbackEmail={EMAIL} />)
    await fillValid(user)

    await user.click(submitButton())

    await waitFor(() => expect(alert()).toHaveTextContent(EMAIL))
  })

  it('does not even try when the browser is offline', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    render(<ContactForm />)
    await fillValid(user)

    await user.click(submitButton())

    expect(submitContact).not.toHaveBeenCalled()
    expect(alert()).toHaveTextContent(/appear to be offline/)
  })

  it('shows field errors sent back by the server and focuses the field', async () => {
    const user = userEvent.setup()
    submitContact.mockResolvedValue({
      outcome: 'validation',
      fields: { email: 'Email must be a valid email address.' },
    })
    render(<ContactForm />)
    await fillValid(user)

    await user.click(submitButton())

    await waitFor(() => expect(emailField()).toBeInvalid())
    expect(emailField()).toHaveAccessibleDescription(/Email must be a valid email address/)
    expect(emailField()).toHaveFocus()
  })

  it('can be retried after a failure', async () => {
    const user = userEvent.setup()
    submitContact.mockResolvedValueOnce({ outcome: 'network' }).mockResolvedValueOnce({ outcome: 'sent' })
    render(<ContactForm />)
    await fillValid(user)

    await user.click(submitButton())
    await waitFor(() => expect(alert()).toHaveTextContent(/Unable to reach/))
    await user.click(submitButton())

    expect(await screen.findByText('STAGE CLEAR!')).toBeInTheDocument()
    expect(submitContact).toHaveBeenCalledTimes(2)
  })

  it('cancels the request if the form is removed mid-flight', async () => {
    const user = userEvent.setup()
    deferred()
    const { unmount } = render(<ContactForm />)
    await fillValid(user)
    await user.click(submitButton())

    const { signal } = submitContact.mock.calls[0][1]
    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })
})

describe('draft', () => {
  it('survives a page refresh and is cleared once sent', async () => {
    const user = userEvent.setup()
    const first = render(<ContactForm />)
    await fillValid(user)
    first.unmount()

    render(<ContactForm />)
    expect(nameField()).toHaveValue('Ada Lovelace')
    expect(messageField()).toHaveValue('Hello, I would like to talk.')

    await user.click(submitButton())
    await screen.findByText('STAGE CLEAR!')
    expect(sessionStorage.getItem('okkar-contact-draft')).toBeNull()
  })

  it.each([
    ['garbage', '{{{'],
    ['wrong types', JSON.stringify({ name: 42, email: ['x'], message: { a: 1 } })],
    ['an array', '[1,2]'],
  ])('ignores %s in storage', (_label, value) => {
    sessionStorage.setItem('okkar-contact-draft', value)
    render(<ContactForm />)
    expect(nameField()).toHaveValue('')
    expect(emailField()).toHaveValue('')
    expect(messageField()).toHaveValue('')
  })

  it('truncates an over-long stored draft to the field limits', () => {
    sessionStorage.setItem('okkar-contact-draft', JSON.stringify({ name: 'n'.repeat(5000), message: 'm'.repeat(5000) }))
    render(<ContactForm />)
    expect(nameField().value).toHaveLength(100)
    expect(messageField().value).toHaveLength(1000)
  })
})
