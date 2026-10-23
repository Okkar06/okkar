// =====================================================================
//  GAME PAGE ENTRY POINT (index.html)
//
//  Order of events:
//    1. The page shows the intro text straight away (it is plain HTML).
//    2. We download Phaser + the game in the background.
//    3. When everything is loaded, "Enter the village" becomes clickable.
// =====================================================================

import './styles/base.css'
import './styles/game.css'
import { state, bus } from './utils/state.js'

// Phones/tablets get touch-specific hints and controls.
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
if (isTouch) document.documentElement.classList.add('is-touch')

const loadingScreen = document.getElementById('loading-screen')
const loadingFill = document.getElementById('loading-fill')
const loadingStatus = document.getElementById('loading-status')
const enterButton = document.getElementById('enter-btn')
const hud = document.getElementById('hud')
const hudHint = document.getElementById('hud-hint')
const hudLocation = document.getElementById('hud-location')

// ---------------------------------------------------------------------
//  Loading progress
// ---------------------------------------------------------------------
bus.on('load:progress', function (value) {
  loadingFill.style.width = Math.round(value * 100) + '%'
})
bus.on('load:complete', function () {
  loadingFill.style.width = '100%'
  loadingStatus.textContent = 'The village is ready.'
  enterButton.disabled = false
})
bus.on('location', function (name) {
  hudLocation.textContent = name
})

// ---------------------------------------------------------------------
//  Entering the game
// ---------------------------------------------------------------------
function enterVillage() {
  if (state.started) return
  state.started = true
  loadingScreen.classList.add('is-hidden')
  hud.hidden = false
  hudHint.hidden = false
  bus.emit('game:start')
}
enterButton.addEventListener('click', enterVillage)

// ---------------------------------------------------------------------
//  Load Phaser and the game code (a separate, lazy-loaded file)
// ---------------------------------------------------------------------
import('./game.js')
  .then(function (module) {
    const game = module.startGame('game-root')
    // Handy for debugging in the browser console during development.
    if (import.meta.env.DEV) window.game = game
  })
  .catch(function (error) {
    console.error(error)
    loadingStatus.textContent = 'Sorry, the game could not load. The plain view has everything.'
  })
