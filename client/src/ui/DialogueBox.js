// =====================================================================
//  DIALOGUE BOX — Pip's speech bubble at the bottom of the screen.
//
//    openDialogue({ lines: ['Hi!', 'Bye!'], choices: [...], onClose })
//    choices: [{ label: 'Take the quick tour', action: function }]
//
//  - Text types itself out (instant with reduced motion).
//  - Next button, E / Space / Enter to advance; Skip button always visible
//    (Esc does the same). Focus moves into the box and back afterwards.
//  - Screen readers get each full line once (a polite live region),
//    not letter by letter.
// =====================================================================

import { state, bus } from '../utils/state.js'
import { prefersReducedMotion } from '../utils/device.js'

const box = document.getElementById('dialogue')
const textElement = document.getElementById('dialogue-text')
const liveElement = document.getElementById('dialogue-live')
const actions = document.getElementById('dialogue-actions')
const skipButton = document.getElementById('dialogue-skip')
const nameElement = document.getElementById('dialogue-name')
const portrait = document.getElementById('dialogue-portrait')

const TYPE_SPEED = 24 // milliseconds per letter

let current = null // { lines, index, choices, onClose, onSkip }
let typingTimer = null
let typedLength = 0
let focusBefore = null

export function isDialogueOpen() {
  return current !== null
}

export function openDialogue(options) {
  if (!state.dialogueOpen) focusBefore = document.activeElement
  current = {
    lines: options.lines,
    index: 0,
    choices: options.choices || [],
    onClose: options.onClose || null,
    onSkip: options.onSkip || null,
  }
  nameElement.textContent = options.name || 'Pip'
  if (options.portrait) portrait.style.backgroundImage = 'url("' + options.portrait + '")'
  box.hidden = false
  state.dialogueOpen = true
  bus.emit('dialogue:open')
  showLine()
}

export function closeDialogue(skipped) {
  if (!current) return
  const finished = current
  current = null
  clearInterval(typingTimer)
  box.hidden = true
  state.dialogueOpen = false
  bus.emit('dialogue:close')
  if (focusBefore && focusBefore.focus && document.body.contains(focusBefore)) focusBefore.focus({ preventScroll: true })
  if (skipped && finished.onSkip) finished.onSkip()
  if (finished.onClose) finished.onClose(Boolean(skipped))
}

function isLastLine() {
  return current.index >= current.lines.length - 1
}

function showLine() {
  const line = current.lines[current.index]
  liveElement.textContent = line // screen readers hear the whole line once
  clearInterval(typingTimer)
  actions.innerHTML = ''

  if (prefersReducedMotion()) {
    textElement.textContent = line
    showButtons()
    return
  }
  // Typewriter: add one letter at a time.
  typedLength = 0
  textElement.textContent = ''
  typingTimer = setInterval(function () {
    typedLength = typedLength + 1
    textElement.textContent = line.slice(0, typedLength)
    if (typedLength >= line.length) {
      clearInterval(typingTimer)
      typingTimer = null
      showButtons()
    }
  }, TYPE_SPEED)
  showButtons() // buttons are usable while typing too (Next finishes the line)
}

function isTyping() {
  return typingTimer !== null
}

function showButtons() {
  if (!current) return
  actions.innerHTML = ''
  if (!isLastLine()) {
    const next = document.createElement('button')
    next.type = 'button'
    next.className = 'btn btn-primary'
    next.textContent = 'Next'
    next.addEventListener('click', advance)
    actions.appendChild(next)
    if (!box.contains(document.activeElement)) next.focus({ preventScroll: true })
    return
  }
  // Last line: the choices (or a simple close button).
  const choices = current.choices.length > 0 ? current.choices : [{ label: 'Close', action: null }]
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]
    const button = document.createElement(choice.href ? 'a' : 'button')
    if (choice.href) button.href = choice.href
    else button.type = 'button'
    button.className = 'btn' + (i === 0 ? ' btn-primary' : '')
    button.textContent = choice.label
    button.addEventListener('click', function () {
      closeDialogue(false)
      if (choice.action) choice.action()
    })
    actions.appendChild(button)
    if (i === 0) button.focus({ preventScroll: true })
  }
}

// Next: finish the current line first, then go to the next one.
function advance() {
  if (!current) return
  if (isTyping()) {
    clearInterval(typingTimer)
    typingTimer = null
    textElement.textContent = current.lines[current.index]
    showButtons()
    return
  }
  if (isLastLine()) return // the choices are showing
  current.index = current.index + 1
  showLine()
}

skipButton.addEventListener('click', function () { closeDialogue(true) })

document.addEventListener('keydown', function (event) {
  if (!current) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialogue(true)
    return
  }
  // E / Space / Enter advance, unless a button or link has focus
  // (then Space/Enter simply press that button).
  const onControl = event.target && (event.target.tagName === 'BUTTON' || event.target.tagName === 'A')
  const isAdvanceKey = event.key === 'e' || event.key === 'E' || ((event.key === ' ' || event.key === 'Enter') && !onControl)
  if (isAdvanceKey) {
    event.preventDefault()
    if (isTyping() || !isLastLine()) advance()
  }
})
