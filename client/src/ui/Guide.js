// =====================================================================
//  GUIDE FLOW — decides what Pip says and when.
//
//  - First visit (until the guide is finished or skipped once): Pip walks
//    up and gives the full welcome, then offers the quick tour or
//    exploring alone (with an arrow pointing to the Workshop).
//  - Later visits: a short "Welcome back!" with a "Replay guide" option.
//  - The HUD "?" button replays the full guide any time.
//  - Talking to Pip later gives a hint.
//  Remembered in localStorage (safely: it still works if storage is blocked).
// =====================================================================

import { bus, state } from '../utils/state.js'
import { storageGet, storageSet } from '../utils/device.js'
import { guide } from '../data/guide.js'
import { openDialogue, closeDialogue, isDialogueOpen } from './DialogueBox.js'
import { isTouchDevice } from './TouchDragControl.js'
import { startTour } from './QuickTour.js'
import { closePanel } from './Panel.js'

const DONE_KEY = 'village-guide-done'
let hintIndex = 0

function portraitUrl() {
  return import.meta.env.BASE_URL + 'assets/sprites/npc.png'
}

// Pick the desktop or phone version of each line.
function guideLines() {
  const touch = isTouchDevice()
  const lines = []
  for (let i = 0; i < guide.firstVisit.length; i++) {
    const line = guide.firstVisit[i]
    lines.push(typeof line === 'string' ? line : touch ? line.touch : line.desktop)
  }
  return lines
}

// Ask the village to walk Pip over to the player, then run `then`.
// (If we're inside a building, there's no Pip to walk: just talk.)
function withPipNearby(then) {
  let handled = false
  bus.emit('npc:approach', {
    onArrive: function () {
      if (handled) return
      handled = true
      then()
    },
  })
  // No village listening (e.g. inside the Workshop)? Talk anyway.
  setTimeout(function () {
    if (!handled) {
      handled = true
      then()
    }
  }, 2500)
}

export function playFullGuide() {
  if (isDialogueOpen()) closeDialogue(false)
  closePanel()
  withPipNearby(function () {
    openDialogue({
      name: guide.npcName,
      portrait: portraitUrl(),
      lines: guideLines(),
      choices: [
        { label: 'Take the quick tour', action: function () { startTour() } },
        {
          label: 'Explore on my own',
          action: function () { bus.emit('guide:arrow', { zone: 'workshop', seconds: 60 }) },
        },
        { label: 'Plain view', href: 'plain.html' },
      ],
      onClose: function () {
        storageSet(DONE_KEY, 'yes') // finished or skipped: don't show the full speech again
        bus.emit('npc:home')
      },
    })
  })
}

function playWelcomeBack() {
  withPipNearby(function () {
    openDialogue({
      name: guide.npcName,
      portrait: portraitUrl(),
      lines: [guide.welcomeBack],
      choices: [
        { label: 'Thanks, Pip!', action: null },
        { label: 'Replay the guide', action: playFullGuide },
      ],
      onClose: function () { bus.emit('npc:home') },
    })
  })
}

// Talking to Pip after the welcome: one hint at a time.
export function talkToPip() {
  const hint = guide.hints[hintIndex % guide.hints.length]
  hintIndex = hintIndex + 1
  openDialogue({
    name: guide.npcName,
    portrait: portraitUrl(),
    lines: [hint],
    choices: [
      { label: 'Thanks!', action: null },
      { label: 'Replay the guide', action: playFullGuide },
    ],
  })
}

// Called once when the visitor presses "Enter the village".
export function startGuideOnEnter() {
  if (state.touring) return // they picked the quick tour on the loading screen
  if (storageGet(DONE_KEY) === 'yes') playWelcomeBack()
  else playFullGuide()
}
