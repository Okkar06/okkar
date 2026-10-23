// =====================================================================
//  HUD — the always-visible layer on top of the game:
//  location name, "Press E" prompt and short toast messages.
//  (The HUD buttons themselves are wired up in main.js.)
// =====================================================================

import { state, bus } from '../utils/state.js'
import { isTouchDevice } from './TouchDragControl.js'
import { villageMinutes, currentPeriod, formatVillageTime } from '../systems/gameClock.js'
import { sunIcon, moonIcon, horizonIcon } from './icons.js'

const locationElement = document.getElementById('hud-location')
const promptButton = document.getElementById('interact-prompt')
const toastElement = document.getElementById('toast')
const clockElement = document.getElementById('hud-clock')


export function setupHud() {
  // Location name, e.g. "Village Square"
  bus.on('location', function (name) {
    locationElement.textContent = name
  })

  // Show / hide the "Press E" prompt when the player enters / leaves a zone.
  bus.on('zone:change', updatePrompt)
  bus.on('panel:open', updatePrompt)
  bus.on('panel:close', updatePrompt)
  bus.on('prompt:refresh', updatePrompt)
  bus.on('dialogue:open', updatePrompt)
  bus.on('dialogue:close', updatePrompt)

  // Clicking / tapping the prompt does the same as pressing E.
  promptButton.addEventListener('click', function () {
    bus.emit('interact')
  })

  // The village clock (it keeps running inside houses too).
  updateClock()
  setInterval(updateClock, 1000)
}

const PERIOD_ICONS = { dawn: horizonIcon, day: sunIcon, dusk: horizonIcon, night: moonIcon }
let shownTime = ''

function updateClock() {
  const text = formatVillageTime(villageMinutes())
  if (text === shownTime) return // only touch the page when the time changes
  shownTime = text
  const period = currentPeriod()
  // "7:40" + " pm" (the am/pm hides on the narrowest phones)
  const parts = text.split(' ')
  clockElement.innerHTML = PERIOD_ICONS[period]() + '<span>' + parts[0] + '<span class="clock-ampm"> ' + parts[1] + '</span></span>'
  clockElement.dataset.period = period
}

function updatePrompt() {
  const zone = state.currentZone
  if (!zone || state.panelOpen || state.dialogueOpen || !state.started) {
    promptButton.hidden = true
    return
  }
  // Phones have no E key, so the prompt itself is the button to tap.
  // A system (like fishing) can temporarily replace the text.
  const label = state.promptOverride || zone.label
  if (isTouchDevice()) {
    promptButton.textContent = state.promptOverride ? 'Tap: ' + label : 'Tap to ' + label.charAt(0).toLowerCase() + label.slice(1)
  } else {
    promptButton.innerHTML = '<kbd>E</kbd>'
    promptButton.appendChild(document.createTextNode(label))
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
