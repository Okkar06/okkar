// =====================================================================
//  TOUCH CONTROLS — an on-screen joystick for phones and tablets.
//  Drag the knob; the direction is written to state.touch (x and y
//  between -1 and 1), which the Player reads every frame.
//  (Tapping the map to walk is handled inside the game itself.)
// =====================================================================

import { state, bus } from '../utils/state.js'

const RADIUS = 46 // how far (in CSS pixels) the knob can move from the centre

export function setupTouchControls() {
  const base = document.getElementById('joystick')
  const knob = document.getElementById('joystick-knob')
  let activePointerId = null

  // Only show the joystick while playing, and never over a panel.
  function updateVisibility() {
    base.hidden = !state.started || state.panelOpen
    if (base.hidden) release()
  }
  bus.on('game:start', updateVisibility)
  bus.on('panel:open', updateVisibility)
  bus.on('panel:close', updateVisibility)

  function moveKnob(clientX, clientY) {
    const box = base.getBoundingClientRect()
    let dx = clientX - (box.left + box.width / 2)
    let dy = clientY - (box.top + box.height / 2)

    // Keep the knob inside the circle.
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > RADIUS) {
      dx = (dx / distance) * RADIUS
      dy = (dy / distance) * RADIUS
    }
    knob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'

    // A small "dead zone" in the middle so the player doesn't drift.
    if (distance < 8) {
      state.touch.x = 0
      state.touch.y = 0
    } else {
      state.touch.x = dx / RADIUS
      state.touch.y = dy / RADIUS
    }
  }

  function release() {
    activePointerId = null
    knob.style.transform = ''
    state.touch.x = 0
    state.touch.y = 0
  }

  base.addEventListener('pointerdown', function (event) {
    activePointerId = event.pointerId
    base.setPointerCapture(event.pointerId)
    moveKnob(event.clientX, event.clientY)
    event.preventDefault()
  })
  base.addEventListener('pointermove', function (event) {
    if (event.pointerId !== activePointerId) return
    moveKnob(event.clientX, event.clientY)
  })
  base.addEventListener('pointerup', release)
  base.addEventListener('pointercancel', release)
}
