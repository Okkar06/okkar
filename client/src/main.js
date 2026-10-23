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
import { openSection, showNpcPage } from './ui/sections.js'
import { closePanel } from './ui/Panel.js'
import { setupHud, showToast } from './ui/Hud.js'
import { startTour, goToNextStop, endTour } from './ui/QuickTour.js'
import { setupTouchDragControl } from './ui/TouchDragControl.js'
import { setupAmbientSound, restoreSoundChoice, setRainLevel } from './ui/AmbientSound.js'
import { weather, startWeather, cycleWeather, weatherLabel } from './systems/weatherState.js'
import { weatherIcon } from './ui/icons.js'
import { contact } from './data/contact.js'

// Phones/tablets get touch-specific hints and controls.
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
if (isTouch) document.documentElement.classList.add('is-touch')

const loadingScreen = document.getElementById('loading-screen')
const loadingFill = document.getElementById('loading-fill')
const loadingStatus = document.getElementById('loading-status')
const enterButton = document.getElementById('enter-btn')
const introTourButton = document.getElementById('intro-tour-btn')
const hud = document.getElementById('hud')
const hudHint = document.getElementById('hud-hint')
const soundButton = document.getElementById('sound-btn')

setupHud()
setupTouchDragControl() // phones only: drag anywhere on the map to walk
setupAmbientSound(soundButton)

// ---------------------------------------------------------------------
//  Weather button: cycles the weather; the icon shows the current one.
// ---------------------------------------------------------------------
const weatherButton = document.getElementById('weather-btn')
function showWeather(key) {
  weatherButton.innerHTML = weatherIcon(key)
  weatherButton.setAttribute('aria-label', 'Change the weather (now: ' + weatherLabel(key).toLowerCase() + ')')
  setRainLevel(key === 'storm' ? 1 : key === 'rain' ? 0.5 : 0)
}
weatherButton.addEventListener('click', function () {
  const next = cycleWeather()
  showToast('Weather: ' + weatherLabel(next), 2500)
})
bus.on('weather:change', showWeather)
startWeather()
showWeather(weather.current)

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
  introTourButton.disabled = false
})
bus.on('load:error', function (key) {
  loadingStatus.textContent = 'Some game files did not load (' + key + '). The plain view has everything.'
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
  restoreSoundChoice(soundButton) // turn sound back on if the visitor chose that last time
  bus.emit('game:start')
}
enterButton.addEventListener('click', enterVillage)

// "Quick tour" on the loading screen: enter, then start the tour.
introTourButton.addEventListener('click', function () {
  enterVillage()
  setTimeout(startTour, 450) // wait for the loading screen to fade
})

// The Résumé button: open the PDF, or explain that it is coming soon.
function openResume() {
  if (__RESUME_AVAILABLE__) {
    window.open(import.meta.env.BASE_URL + contact.resumePath, '_blank', 'noopener')
  } else {
    showToast('Résumé coming soon. Email ' + contact.email + " and I'll send you a copy.", 6000)
  }
}

// ---------------------------------------------------------------------
//  One click handler for every button with data-action / data-open-project,
//  wherever it is (HUD, panels, loading screen).
// ---------------------------------------------------------------------
document.addEventListener('click', function (event) {
  const target = event.target.closest('[data-action], [data-open-project], [data-npc-page]')
  if (!target) return

  if (target.dataset.openProject) {
    openSection('project', { projectId: target.dataset.openProject })
    return
  }
  if (target.dataset.npcPage) {
    showNpcPage(Number(target.dataset.npcPage))
    return
  }

  const action = target.dataset.action
  if (action === 'resume') openResume()
  if (action === 'tour') startTour()
  if (action === 'tour-next') goToNextStop()
  if (action === 'tour-end') endTour()
  if (action === 'contact') openSection('contact')
  if (action === 'projects') openSection('projects')
  if (action === 'go-workshop') {
    closePanel()
    bus.emit('travel', { zone: 'workshop', onArrive: null })
  }
})

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
