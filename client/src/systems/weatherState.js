// =====================================================================
//  WEATHER STATE — which weather it is, shared by the game and the HUD.
//  (No Phaser here, so the HUD button can use it before the game loads.)
//
//  The weather changes by itself every few minutes. Pressing the HUD
//  weather button cycles through the states and pauses the automatic
//  changes for a while. Add ?weather=rain (clear, rain, storm, fog,
//  petals, snow) to the URL to start with a specific weather.
// =====================================================================

import { bus } from '../utils/state.js'

export const WEATHERS = [
  { key: 'clear', label: 'Clear skies' },
  { key: 'rain', label: 'Light rain' },
  { key: 'storm', label: 'Thunderstorm' },
  { key: 'fog', label: 'Misty' },
  { key: 'petals', label: 'Drifting petals' },
  { key: 'snow', label: 'Snow' },
]

// How likely each weather is when it changes by itself.
const AUTO_WEIGHTS = { clear: 5, rain: 2, petals: 2, fog: 1, storm: 0.6, snow: 0.5 }

export const weather = {
  current: 'clear',
  manualUntil: 0, // automatic changes are paused until this time (ms)
  nextAutoChange: 0,
}

export function weatherLabel(key) {
  for (let i = 0; i < WEATHERS.length; i++) {
    if (WEATHERS[i].key === key) return WEATHERS[i].label
  }
  return key
}

export function setWeather(key, manual) {
  weather.current = key
  if (manual) weather.manualUntil = Date.now() + 5 * 60 * 1000 // leave the visitor's choice alone for 5 min
  bus.emit('weather:change', key)
}

// The HUD button: go to the next weather in the list.
export function cycleWeather() {
  let index = 0
  for (let i = 0; i < WEATHERS.length; i++) {
    if (WEATHERS[i].key === weather.current) index = i
  }
  const next = WEATHERS[(index + 1) % WEATHERS.length].key
  setWeather(next, true)
  return next
}

function pickRandomWeather() {
  let total = 0
  const keys = Object.keys(AUTO_WEIGHTS)
  for (let i = 0; i < keys.length; i++) total += AUTO_WEIGHTS[keys[i]]
  let roll = Math.random() * total
  for (let i = 0; i < keys.length; i++) {
    roll -= AUTO_WEIGHTS[keys[i]]
    if (roll <= 0) return keys[i]
  }
  return 'clear'
}

function scheduleNext() {
  weather.nextAutoChange = Date.now() + (120 + Math.random() * 120) * 1000 // every 2-4 minutes
}

// Start the slow automatic changes (called once from main.js).
export function startWeather() {
  const param = new URLSearchParams(window.location.search).get('weather')
  for (let i = 0; i < WEATHERS.length; i++) {
    if (WEATHERS[i].key === param) {
      weather.current = param
      weather.manualUntil = Date.now() + 10 * 60 * 1000
    }
  }
  scheduleNext()
  setInterval(function () {
    const now = Date.now()
    if (now < weather.manualUntil || now < weather.nextAutoChange) return
    let next = pickRandomWeather()
    if (next === weather.current) next = 'clear'
    setWeather(next, false)
    scheduleNext()
  }, 15000)
}
