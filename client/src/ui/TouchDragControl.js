// =====================================================================
//  TOUCH DRAG CONTROL — a floating "circle and drag" control for phones.
//
//  How it works:
//    1. Put a finger down anywhere on the map: a see-through circle
//       appears centred where the finger landed.
//    2. Drag: a small thumb dot follows the finger (it stops at the edge
//       of the circle). Direction = where to walk. Distance = how fast.
//    3. Lift the finger: the circle fades out and the player stops.
//
//  The Player reads the result every frame with getMoveVector().
//  Only the first finger drives it; a second finger can still tap HUD
//  buttons (see setupSecondFingerTaps at the bottom).
//
//  Why HTML pointer events (and not Phaser's)? The HUD buttons, the
//  "Press E" prompt and the panels are HTML elements that sit ON TOP of
//  the game. By listening on the game container (#game-root) only, a
//  touch that starts on any of those never reaches this control.
// =====================================================================

import { state, bus } from '../utils/state.js'

// ----- Sizes you can tweak (CSS pixels) -----
const CIRCLE_RADIUS = 60 // the big circle
const THUMB_RADIUS = 24 // the small dot that follows your finger
const DEAD_ZONE = 10 // drag less than this from the centre = stand still

// The direction the player should walk, each value from -1 to 1.
// Its length is 0 (not moving) up to 1 (full speed).
const moveVector = { x: 0, y: 0 }

// The pointer (finger) that started the current drag, or null.
// Only this one is followed, so a second finger can still tap HUD buttons.
let activePointerId = null
let centerX = 0
let centerY = 0

let circleElement = null
let thumbElement = null

// Used by the Player every frame (alongside the keyboard).
export function getMoveVector() {
  return moveVector
}

// Is this a phone / tablet? Desktop users never see the circle.
export function isTouchDevice() {
  const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  return coarsePointer || navigator.maxTouchPoints > 0 || 'ontouchstart' in window
}

export function setupTouchDragControl() {
  if (!isTouchDevice()) return

  const gameRoot = document.getElementById('game-root')

  // ----- 1. Create the circle and the thumb (once) -----
  circleElement = document.createElement('div')
  circleElement.className = 'touch-drag'
  circleElement.setAttribute('aria-hidden', 'true')
  circleElement.style.setProperty('--circle-size', CIRCLE_RADIUS * 2 + 'px')
  circleElement.style.setProperty('--thumb-size', THUMB_RADIUS * 2 + 'px')

  thumbElement = document.createElement('div')
  thumbElement.className = 'touch-drag-thumb'
  circleElement.appendChild(thumbElement)
  document.body.appendChild(circleElement)

  // ----- 2. Finger down: start a drag -----
  gameRoot.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse') return // desktop mouse keeps click-to-move
    if (activePointerId !== null) return // already following another finger
    if (!state.started || state.panelOpen || state.dialogueOpen) return

    activePointerId = event.pointerId
    // Keep receiving this finger's moves even if it slides off the canvas.
    // (try/catch: capture can fail for unusual pointers; the drag still works.)
    try {
      gameRoot.setPointerCapture(event.pointerId)
    } catch (error) {
      // ignore
    }

    centerX = event.clientX
    centerY = event.clientY
    circleElement.style.left = centerX + 'px'
    circleElement.style.top = centerY + 'px'
    thumbElement.style.transform = 'translate(0px, 0px)'
    circleElement.classList.add('is-active')

    moveVector.x = 0
    moveVector.y = 0
    event.preventDefault()
  })

  // ----- 3. Finger moves: update the thumb and the move vector -----
  gameRoot.addEventListener('pointermove', function (event) {
    if (event.pointerId !== activePointerId) return

    let dx = event.clientX - centerX
    let dy = event.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Keep the thumb inside the big circle.
    if (distance > CIRCLE_RADIUS) {
      dx = (dx / distance) * CIRCLE_RADIUS
      dy = (dy / distance) * CIRCLE_RADIUS
    }
    thumbElement.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'

    if (distance < DEAD_ZONE) {
      // Inside the dead zone: stand still.
      moveVector.x = 0
      moveVector.y = 0
      return
    }

    // Speed grows from 0 (just outside the dead zone) to 1 (circle edge).
    const clampedDistance = Math.min(distance, CIRCLE_RADIUS)
    const speed = (clampedDistance - DEAD_ZONE) / (CIRCLE_RADIUS - DEAD_ZONE)
    moveVector.x = (dx / clampedDistance) * speed
    moveVector.y = (dy / clampedDistance) * speed
  })

  // ----- 4. Finger lifted (or the browser cancelled the touch) -----
  function onPointerEnd(event) {
    if (event.pointerId !== activePointerId) return
    release()
  }
  gameRoot.addEventListener('pointerup', onPointerEnd)
  gameRoot.addEventListener('pointercancel', onPointerEnd)
  gameRoot.addEventListener('lostpointercapture', onPointerEnd)

  // If a panel opens mid-drag (e.g. the quick tour), let go cleanly.
  bus.on('panel:open', release)
  bus.on('dialogue:open', release)

  setupSecondFingerTaps()
}

// ---------------------------------------------------------------------
//  5. A second finger tapping a HUD button while the first one drags.
//  Browsers only turn single-finger taps into "click" events, so without
//  this the Résumé / Contact / Quick tour buttons would ignore the tap.
//  We spot that case and click the button ourselves.
// ---------------------------------------------------------------------
function setupSecondFingerTaps() {
  let secondFinger = null // { pointerId, button } while a second finger is down on a button
  let ignoreRealClicksUntil = 0

  // "true" = capture phase: we see the event before anything else does.
  document.addEventListener('pointerdown', function (event) {
    if (activePointerId === null) return // no drag going on: normal taps already work
    if (event.pointerId === activePointerId || event.pointerType === 'mouse') return
    const button = event.target.closest('button, a[href]')
    secondFinger = button ? { pointerId: event.pointerId, button: button } : null
  }, true)

  document.addEventListener('pointerup', function (event) {
    if (!secondFinger || event.pointerId !== secondFinger.pointerId) return
    const button = secondFinger.button
    secondFinger = null

    // Like a normal tap: only counts if the finger lifts over the same button.
    const elementUnderFinger = document.elementFromPoint(event.clientX, event.clientY)
    if (!elementUnderFinger || !button.contains(elementUnderFinger)) return

    // Some browsers might still send their own click a moment later;
    // ignore it so the button doesn't fire twice (e.g. the Sound toggle).
    ignoreRealClicksUntil = performance.now() + 500
    button.click() // a "synthetic" click (event.isTrusted is false)
  }, true)

  document.addEventListener('click', function (event) {
    if (event.isTrusted && performance.now() < ignoreRealClicksUntil) {
      event.stopPropagation()
      event.preventDefault()
    }
  }, true)
}

// Stop moving and fade the circle out.
function release() {
  activePointerId = null
  moveVector.x = 0
  moveVector.y = 0
  if (circleElement) circleElement.classList.remove('is-active')
}
