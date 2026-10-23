// =====================================================================
//  WEATHER SYSTEM — rain, thunderstorms, fog, petals and snow in the
//  village, using Phaser particle emitters and soft colour overlays.
//
//  The current weather lives in weatherState.js; this file only draws
//  it. Effects are scaled by effectsLevel(): half on phones / low-end
//  devices, none when the visitor prefers reduced motion (then only the
//  gentle colour tint and puddles change).
// =====================================================================

import Phaser from 'phaser'
import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'
import { bus } from '../utils/state.js'
import { effectsLevel } from '../utils/device.js'
import { weather } from './weatherState.js'
import { playThunder } from '../ui/AmbientSound.js'

// What each weather does. rain: 0-1, dim: how much darker the scene gets.
const SETTINGS = {
  clear: { rain: 0, dim: 0, fog: 0, snow: false, petals: false, lightning: false },
  rain: { rain: 0.5, dim: 0.12, fog: 0, snow: false, petals: false, lightning: false },
  storm: { rain: 1, dim: 0.24, fog: 0, snow: false, petals: false, lightning: true },
  fog: { rain: 0, dim: 0.05, fog: 1, snow: false, petals: false, lightning: false },
  petals: { rain: 0, dim: 0, fog: 0, snow: false, petals: true, lightning: false },
  snow: { rain: 0, dim: 0.06, fog: 0.3, snow: true, petals: false, lightning: false },
}

export class WeatherSystem {
  // options: { worldWidth, worldHeight, groundLayer, water, onDarkness(amount) }
  constructor(scene, options) {
    this.scene = scene
    this.options = options
    this.level = effectsLevel() // 1, 0.5 or 0
    const w = options.worldWidth
    const h = options.worldHeight
    // Particles are only created inside what the camera currently shows
    // (worldView is a rectangle Phaser keeps up to date), so none are wasted.
    const area = scene.cameras.main.worldView

    // ----- Overlays (colour washes) -----
    this.dimmer = scene.add.rectangle(0, 0, w, h, hex('storm'), 1).setOrigin(0, 0).setAlpha(0).setDepth(DEPTH.light - 0.5)
    this.fogWash = scene.add.rectangle(0, 0, w, h, hex('fog'), 1).setOrigin(0, 0).setAlpha(0).setDepth(DEPTH.weather - 1)
    this.flash = scene.add.rectangle(0, 0, w, h, hex('white'), 1).setOrigin(0, 0).setAlpha(0).setDepth(DEPTH.tint)

    // ----- Particle emitters (all start switched off) -----
    // Raindrops appear anywhere and fall a short way, so the whole map is covered evenly.
    this.rainEmitter = scene.add.particles(0, 0, 'decor', {
      frame: 'p_rain',
      emitZone: { type: 'random', source: area },
      speedY: { min: 260, max: 320 },
      speedX: { min: -60, max: -40 },
      rotate: 10,
      lifespan: { min: 220, max: 380 },
      frequency: 20,
      quantity: 1,
      alpha: { start: 0.85, end: 0.4 },
      emitting: false,
    }).setDepth(DEPTH.weather)

    this.splashEmitter = scene.add.particles(0, 0, 'decor', {
      frame: 'p_splash',
      emitZone: { type: 'random', source: area },
      lifespan: 240,
      frequency: 30,
      quantity: 1,
      scale: { start: 0.6, end: 1 },
      alpha: { start: 0.8, end: 0 },
      emitting: false,
    }).setDepth(DEPTH.groundDetail + 1)

    this.snowEmitter = scene.add.particles(0, 0, 'decor', {
      frame: 'p_snow',
      emitZone: { type: 'random', source: area },
      speedY: { min: 14, max: 28 },
      speedX: { min: -10, max: 10 },
      lifespan: { min: 3000, max: 5000 },
      frequency: 50,
      quantity: 1,
      scale: { min: 0.6, max: 1 },
      alpha: { start: 0.95, end: 0 },
      emitting: false,
    }).setDepth(DEPTH.weather)

    this.petalEmitter = scene.add.particles(0, 0, 'decor', {
      frame: ['p_petal', 'p_petal', 'p_leaf'],
      emitZone: { type: 'random', source: area },
      speedX: { min: 18, max: 36 },
      speedY: { min: 8, max: 20 },
      rotate: { start: 0, end: 360 },
      lifespan: { min: 4000, max: 6500 },
      frequency: 160,
      quantity: 1,
      alpha: { start: 1, end: 0 },
      emitting: false,
    }).setDepth(DEPTH.weather)

    // ----- Fog banks: big soft blobs drifting slowly -----
    this.fogBanks = []
    if (this.level > 0) {
      for (let i = 0; i < Math.round(6 * this.level); i++) {
        const bank = scene.add.image(Phaser.Math.Between(0, w), Phaser.Math.Between(80, h - 40), 'glow')
        bank.setScale(Phaser.Math.FloatBetween(3.5, 5.5), Phaser.Math.FloatBetween(1.6, 2.4)).setAlpha(0).setDepth(DEPTH.weather)
        scene.tweens.add({ targets: bank, x: bank.x + Phaser.Math.Between(60, 140), duration: Phaser.Math.Between(16000, 26000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        this.fogBanks.push(bank)
      }
    }

    // ----- Puddles on the paths (appear while it rains) -----
    this.puddles = []
    this.createPuddles(options.groundLayer)

    // ----- Lightning timer -----
    this.lightningTimer = null

    // Listen for changes and apply the current weather straight away.
    const self = this
    function onChange(key) { self.apply(key, false) }
    bus.on('weather:change', onChange)
    scene.events.once('shutdown', function () {
      bus.off('weather:change', onChange)
      if (self.lightningTimer) self.lightningTimer.remove()
    })
    this.apply(weather.current, true)
  }

  // Pick up to 16 spots in the middle of dirt paths for puddles.
  createPuddles(groundLayer) {
    // Kenney dirt-centre tile = index 25 (gid 26) in tiny-town.
    const spots = []
    for (let y = 0; y < groundLayer.layer.height; y++) {
      for (let x = 0; x < groundLayer.layer.width; x++) {
        const tile = groundLayer.getTileAt(x, y)
        if (tile && tile.index === 26 && (x * 17 + y * 31) % 7 === 0) spots.push({ x: x * 16 + 8, y: y * 16 + 9 })
      }
    }
    for (let i = 0; i < spots.length && i < 16; i++) {
      const frame = i % 3 === 0 ? 'puddle_b' : 'puddle_a'
      const puddle = this.scene.add.image(spots[i].x, spots[i].y, 'decor', frame).setAlpha(0).setDepth(DEPTH.groundDetail)
      this.puddles.push(puddle)
    }
  }

  apply(key, instant) {
    const s = SETTINGS[key] || SETTINGS.clear
    const scene = this.scene
    const fade = instant ? 0 : 1800
    this.key = key

    // Particles (scaled down on low-end devices, off with reduced motion)
    const on = this.level > 0
    this.rainEmitter.emitting = on && s.rain > 0
    // About 60 drops on screen in light rain, 130 in a storm (at 60 fps).
    this.rainEmitter.quantity = Math.max(1, Math.round((s.rain >= 1 ? 9 : 4) * this.level))
    this.splashEmitter.emitting = on && s.rain > 0
    this.splashEmitter.quantity = Math.max(1, Math.round((s.rain >= 1 ? 3 : 1) * this.level))
    this.snowEmitter.emitting = on && s.snow
    this.snowEmitter.quantity = Math.max(1, Math.round(2 * this.level))
    this.petalEmitter.emitting = on && s.petals

    // Colour washes and fog
    scene.tweens.add({ targets: this.dimmer, alpha: s.dim, duration: fade + 1 })
    scene.tweens.add({ targets: this.fogWash, alpha: s.fog * 0.16, duration: fade + 1 })
    for (let i = 0; i < this.fogBanks.length; i++) {
      scene.tweens.add({ targets: this.fogBanks[i], alpha: s.fog * 0.32, duration: fade * 2 + 1 })
    }

    // Puddles fill slowly in the rain and dry slowly afterwards.
    for (let i = 0; i < this.puddles.length; i++) {
      scene.tweens.add({ targets: this.puddles[i], alpha: s.rain > 0 ? 0.85 : 0, duration: instant ? 1 : 4000 + i * 250 })
    }

    // The lake ripples with the rain; lamps switch on when it gets gloomy.
    if (this.options.water) this.options.water.setRain(s.rain)
    if (this.options.onDarkness) this.options.onDarkness(s.dim * 2.5)

    // Lightning: a soft, short brightening every 7-14 s (never a strobe).
    if (this.lightningTimer) this.lightningTimer.remove()
    this.lightningTimer = null
    if (s.lightning && on) this.scheduleLightning()
  }

  scheduleLightning() {
    this.lightningTimer = this.scene.time.delayedCall(Phaser.Math.Between(7000, 14000), function () {
      this.scene.tweens.add({ targets: this.flash, alpha: { from: 0, to: 0.16 }, duration: 90, yoyo: true, hold: 60 })
      this.scene.time.delayedCall(600, playThunder)
      this.scheduleLightning()
    }, null, this)
  }
}
