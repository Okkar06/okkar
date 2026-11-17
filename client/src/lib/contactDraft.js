import { CONTACT_FIELDS, CONTACT_LIMITS, EMPTY_CONTACT } from './contactValidation'

/**
 * Keeps an unsent contact message across a refresh or a back/forward trip, so
 * nobody loses a paragraph to a stray F5. sessionStorage: it stays in this
 * tab, is never sent anywhere, and is gone when the tab closes. It is cleared
 * as soon as the message is sent. The honeypot is never stored.
 */
const DRAFT_KEY = 'okkar-contact-draft'

export function readDraft() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_CONTACT }

    const draft = { ...EMPTY_CONTACT }
    for (const field of CONTACT_FIELDS) {
      if (typeof parsed[field] === 'string') {
        draft[field] = parsed[field].slice(0, CONTACT_LIMITS[field].max)
      }
    }
    return draft
  } catch {
    return { ...EMPTY_CONTACT }
  }
}

export function writeDraft(values) {
  try {
    const empty = CONTACT_FIELDS.every((field) => !values[field])
    if (empty) {
      sessionStorage.removeItem(DRAFT_KEY)
      return
    }

    const draft = {}
    for (const field of CONTACT_FIELDS) draft[field] = values[field]
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Storage blocked or full: the form still works, it just won't be restored.
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing to clear.
  }
}
