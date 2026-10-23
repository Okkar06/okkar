// =====================================================================
//  HUD — the always-visible layer on top of the game:
//  location name, "Press E" prompt and short toast messages.
//  (The HUD buttons themselves are wired up in main.js.)
// =====================================================================

import { state, bus } from '../utils/state.js'

const locationElement = document.getElementById('hud-location')
const promptButton = document.getElementById('interact-prompt')
const toastElement = document.getElementById('toast')

const isTouch = document.documentElement.classList.contains('is-touch')

export function setupHud() {
  // Location name, e.g. "Village Square"
  bus.on('location', function (name) {
    locationElement.textContent = name
  })

  // Show / hide the "Press E" prompt when the player enters / leaves a zone.
  bus.on('zone:change', updatePrompt)
  bus.on('panel:open', updatePrompt)
  bus.on('panel:close', updatePrompt)

  // Clicking / tapping the prompt does the same as pressing E.
  promptButton.addEventListener('click', function () {
    bus.emit('interact')
  })
}

function updatePrompt() {
  const zone = state.currentZone
  if (!zone || state.panelOpen || !state.started) {
    promptButton.hidden = true
    return
  }
  if (isTouch) {
    promptButton.textContent = 'Tap to open: ' + zone.label
  } else {
    promptButton.innerHTML = '<kbd>E</kbd>'
    promptButton.appendChild(document.createTextNode(zone.label))
  }
  promptButton.hidden = false
}

// A small message at the top of the screen that disappears by itself.
let toastTimer = null
export function showToast(message, milliseconds) {
  toastElement.textContent = message
  toastElement.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(function () {
    toastElement.hidden = true
  }, milliseconds || 4000)
}
