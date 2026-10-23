// =====================================================================
//  PANEL — the pop-up window that shows portfolio content.
//  It is normal HTML (not drawn in the canvas), so it is readable by
//  screen readers, selectable, zoomable and easy to style.
//
//  Use:  openPanel({ title: 'About me', html: '<p>Hi</p>', footerHtml: '' })
//        closePanel()
// =====================================================================

import { state, bus } from '../utils/state.js'

const backdrop = document.getElementById('panel-backdrop')
const panel = document.getElementById('panel')
const titleElement = document.getElementById('panel-title')
const bodyElement = document.getElementById('panel-body')
const footerElement = document.getElementById('panel-footer')
const closeButton = document.getElementById('panel-close')

// Remember what had focus before the panel opened, to restore it after.
let focusBeforeOpen = null

export function openPanel(options) {
  titleElement.textContent = options.title
  bodyElement.innerHTML = options.html
  bodyElement.scrollTop = 0

  if (options.footerHtml) {
    footerElement.innerHTML = options.footerHtml
    footerElement.hidden = false
  } else {
    footerElement.innerHTML = ''
    footerElement.hidden = true
  }

  // Only remember focus the first time (panels can replace each other).
  if (!state.panelOpen) focusBeforeOpen = document.activeElement

  backdrop.hidden = false
  state.panelOpen = true
  bus.emit('panel:open')

  // Move keyboard focus into the panel (the close button).
  closeButton.focus({ preventScroll: true })
}

export function closePanel() {
  if (!state.panelOpen) return
  backdrop.hidden = true
  bodyElement.innerHTML = ''
  state.panelOpen = false
  bus.emit('panel:close')

  if (focusBeforeOpen && focusBeforeOpen.focus && document.body.contains(focusBeforeOpen)) {
    focusBeforeOpen.focus({ preventScroll: true })
  } else {
    document.activeElement.blur()
  }
}

// ---------------------------------------------------------------------
//  Ways to close: the ✕ button, the Escape key, clicking the dark backdrop.
// ---------------------------------------------------------------------
closeButton.addEventListener('click', closePanel)

backdrop.addEventListener('click', function (event) {
  if (event.target === backdrop) closePanel()
})

document.addEventListener('keydown', function (event) {
  if (!state.panelOpen) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
    return
  }

  // Keep Tab / Shift+Tab focus inside the panel (a simple "focus trap").
  if (event.key === 'Tab') {
    const focusable = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
})
