// =====================================================================
//  AMBIENT SOUND — soft wind, birds by day and crickets at night
//  (following the village clock).
//  Made with the Web Audio API, so there are no audio files to download.
//  Off by default (many visitors browse in a quiet office); the HUD
//  button turns it on/off and the choice is remembered in this browser.
// =====================================================================

import { currentPeriod } from '../systems/gameClock.js'

const STORAGE_KEY = 'village-sound'
const MASTER_VOLUME = 0.12

let audio = null // the AudioContext, created on the first click
let master = null
let birdTimer = null
let isOn = false
let rainVolume = null // gain node for the rain hiss
let rainLevel = 0 // 0 = dry, 1 = heavy rain (set by the weather)

export function setupAmbientSound(button) {
  function updateButton() {
    button.textContent = isOn ? 'Sound on' : 'Sound off'
    button.setAttribute('aria-pressed', isOn ? 'true' : 'false')
  }

  button.addEventListener('click', function () {
    if (isOn) stop()
    else start()
    try {
      localStorage.setItem(STORAGE_KEY, isOn ? 'on' : 'off')
    } catch (error) {
      // Private mode etc. — not remembering is fine.
    }
    updateButton()
  })

  // Pause while the tab is hidden, resume when it comes back.
  document.addEventListener('visibilitychange', function () {
    if (!audio || !isOn) return
    if (document.hidden) audio.suspend()
    else audio.resume()
  })

  updateButton()
}

// Did this visitor turn sound on last time? (Browsers only allow audio
// after a click, so main.js calls this from the "Enter" button.)
export function restoreSoundChoice(button) {
  let saved = null
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    saved = null
  }
  if (saved === 'on' && !isOn) button.click()
}

function start() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return // very old browser: just stay silent

  if (!audio) {
    audio = new AudioContextClass()
    master = audio.createGain()
    master.gain.value = MASTER_VOLUME
    master.connect(audio.destination)
    startWind()
    startRain()
  }
  audio.resume()
  isOn = true
  scheduleBird()
}

function stop() {
  isOn = false
  clearTimeout(birdTimer)
  if (audio) audio.suspend()
}

// ---------------------------------------------------------------------
//  Wind: looping random noise through a low-pass filter whose cutoff
//  slowly rises and falls (an LFO), so it "breathes".
// ---------------------------------------------------------------------
function startWind() {
  const seconds = 2
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.random() * 2 - 1
  }

  const noise = audio.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 350

  // The LFO wobbles the filter between about 200 and 500 Hz every ~8 s.
  const lfo = audio.createOscillator()
  lfo.frequency.value = 0.12
  const lfoDepth = audio.createGain()
  lfoDepth.gain.value = 150
  lfo.connect(lfoDepth)
  lfoDepth.connect(filter.frequency)

  const windVolume = audio.createGain()
  windVolume.gain.value = 0.5

  noise.connect(filter)
  filter.connect(windVolume)
  windVolume.connect(master)
  noise.start()
  lfo.start()
}

// ---------------------------------------------------------------------
//  Rain: higher-pitched noise whose volume follows the weather.
// ---------------------------------------------------------------------
function noiseSource(seconds) {
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const source = audio.createBufferSource()
  source.buffer = buffer
  return source
}

function startRain() {
  const noise = noiseSource(2)
  noise.loop = true
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2400
  filter.Q.value = 0.6
  rainVolume = audio.createGain()
  rainVolume.gain.value = rainLevel * 0.9
  noise.connect(filter)
  filter.connect(rainVolume)
  rainVolume.connect(master)
  noise.start()
}

// Called when the weather changes (works even while muted; you'll hear
// it as soon as sound is switched on).
export function setRainLevel(level) {
  rainLevel = level
  if (rainVolume) rainVolume.gain.setTargetAtTime(level * 0.9, audio.currentTime, 1.2)
}

// A distant rumble for thunderstorms (silent when sound is off).
export function playThunder() {
  if (!audio || !isOn) return
  const noise = noiseSource(3)
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 160
  const volume = audio.createGain()
  const now = audio.currentTime
  volume.gain.setValueAtTime(0.0001, now)
  volume.gain.exponentialRampToValueAtTime(1.4, now + 0.25)
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 2.8)
  noise.connect(filter)
  filter.connect(volume)
  volume.connect(master)
  noise.start(now)
  noise.stop(now + 3)
}

// ---------------------------------------------------------------------
//  Birds: 2-4 quick rising chirps every few seconds (daytime).
//  Crickets: a soft trill of very short high notes (night).
// ---------------------------------------------------------------------
function scheduleBird() {
  clearTimeout(birdTimer)
  const wait = 3000 + Math.random() * 6000
  birdTimer = setTimeout(function () {
    if (!isOn) return
    const period = currentPeriod()
    if (rainLevel === 0) { // birds and crickets hide in the rain
      if (period === 'day' || period === 'dawn') chirpSeries()
      else if (period === 'night') cricketSeries()
    }
    scheduleBird()
  }, wait)
}

function chirpSeries() {
  const count = 2 + Math.floor(Math.random() * 3)
  const baseFrequency = 2200 + Math.random() * 1200
  for (let i = 0; i < count; i++) {
    chirp(audio.currentTime + i * 0.13, baseFrequency)
  }
}

function cricketSeries() {
  const trills = 2 + Math.floor(Math.random() * 2)
  for (let t = 0; t < trills; t++) {
    // each trill is 4 tiny pulses at the same pitch
    for (let i = 0; i < 4; i++) cricketPulse(audio.currentTime + t * 0.45 + i * 0.045)
  }
}

function cricketPulse(startTime) {
  const oscillator = audio.createOscillator()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(4400, startTime)
  const volume = audio.createGain()
  volume.gain.setValueAtTime(0.0001, startTime)
  volume.gain.exponentialRampToValueAtTime(0.06, startTime + 0.008)
  volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03)
  oscillator.connect(volume)
  volume.connect(master)
  oscillator.start(startTime)
  oscillator.stop(startTime + 0.035)
}

function chirp(startTime, frequency) {
  const oscillator = audio.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, startTime + 0.07)

  const volume = audio.createGain()
  volume.gain.setValueAtTime(0.0001, startTime)
  volume.gain.exponentialRampToValueAtTime(0.25, startTime + 0.01)
  volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09)

  oscillator.connect(volume)
  volume.connect(master)
  oscillator.start(startTime)
  oscillator.stop(startTime + 0.1)
}
