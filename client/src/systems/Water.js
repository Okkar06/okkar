// =====================================================================
//  WATER — brings the lake to life.
//    - water tiles swap between 2 frames (moving waves and foam)
//    - ripples spread on the surface (more when it rains: setRain)
//    - bubbles rise and pop, fish shadows glide under the surface
//    - dragonflies dart around the shore during the day
//  All of it is skipped when the visitor prefers reduced motion.
// =====================================================================

import Phaser from 'phaser'
import { DEPTH, TILE_SIZE } from '../utils/constants.js'
import { EXTRAS } from '../theme/tileIds.js'
import { hex } from '../theme/palette.js'
import { prefersReducedMotion, effectsLevel } from '../utils/device.js'

export class WaterSystem {
  // waterLayer: the Tiled "Water" layer; extrasFirstGid: firstgid of the extras tileset
  constructor(scene, waterLayer, extrasFirstGid) {
    this.scene = scene
    this.rain = 0
    this.waterCells = [] // centres of open-water tiles (not the dock)
    this.innerCells = [] // water tiles away from the shore (for fish)
    this.animate = !prefersReducedMotion()

    // ----- 1. Find the water tiles and their "other frame" -----
    // Tile names look like "water_n_0" / "water_n_1". Build gid pairs.
    const otherFrame = {}
    const names = Object.keys(EXTRAS)
    for (let i = 0; i < names.length; i++) {
      const match = names[i].match(/^water_(\w+)_0$/)
      if (!match) continue
      const frame0 = extrasFirstGid + EXTRAS[names[i]]
      const frame1 = extrasFirstGid + EXTRAS['water_' + match[1] + '_1']
      otherFrame[frame0] = frame1
      otherFrame[frame1] = frame0
      if (match[1] === 'c') this.centreGids = [frame0, frame1]
    }
    this.animatedTiles = []
    const T = TILE_SIZE
    for (let y = 0; y < waterLayer.layer.height; y++) {
      for (let x = 0; x < waterLayer.layer.width; x++) {
        const tile = waterLayer.getTileAt(x, y)
        if (!tile || otherFrame[tile.index] === undefined) continue
        this.animatedTiles.push(tile)
        this.waterCells.push({ x: x * T + T / 2, y: y * T + T / 2 })
        if (this.centreGids && this.centreGids.indexOf(tile.index) !== -1) {
          this.innerCells.push({ x: x * T + T / 2, y: y * T + T / 2 })
        }
      }
    }
    if (this.waterCells.length === 0 || !this.animate) return

    // Swap every water tile to its other frame every ~0.7 s.
    scene.time.addEvent({
      delay: 700,
      loop: true,
      callback: function () {
        for (let i = 0; i < this.animatedTiles.length; i++) {
          const tile = this.animatedTiles[i]
          tile.index = otherFrame[tile.index] // changing the index changes the picture
        }
      },
      callbackScope: this,
    })

    this.createRipples()
    this.createBubbles()
    this.createFish()
    this.createDragonflies()
  }

  randomWaterSpot(inner) {
    const list = inner && this.innerCells.length > 0 ? this.innerCells : this.waterCells
    const cell = list[Math.floor(Math.random() * list.length)]
    return { x: cell.x + Phaser.Math.Between(-6, 6), y: cell.y + Phaser.Math.Between(-5, 5) }
  }

  // ---------------------------------------------------------------------
  //  Ripples: a small pool of rings that we reuse (no garbage).
  // ---------------------------------------------------------------------
  createRipples() {
    this.ripples = []
    for (let i = 0; i < 10; i++) {
      const ring = this.scene.add.ellipse(0, 0, 8, 4)
      ring.setStrokeStyle(1, hex('waterFoam'), 0.9).setFillStyle(0, 0).setVisible(false)
      ring.setDepth(DEPTH.groundDetail)
      this.ripples.push(ring)
    }
    this.nextRipple = 0
    this.scheduleRipple()
  }

  scheduleRipple() {
    // Calm: one every ~1.5 s. Rain: up to ~8 per second.
    const delay = this.rain > 0 ? Phaser.Math.Between(80, 160) / this.rain : Phaser.Math.Between(900, 2200)
    this.scene.time.delayedCall(delay, function () {
      this.ripple()
      this.scheduleRipple()
    }, null, this)
  }

  ripple(x, y) {
    const spot = x === undefined ? this.randomWaterSpot(false) : { x: x, y: y }
    const ring = this.ripples[this.nextRipple]
    this.nextRipple = (this.nextRipple + 1) % this.ripples.length
    this.scene.tweens.killTweensOf(ring)
    ring.setPosition(spot.x, spot.y).setScale(0.4).setAlpha(1).setVisible(true)
    this.scene.tweens.add({
      targets: ring,
      scale: this.rain > 0 ? 1.4 : 2.2,
      alpha: 0,
      duration: this.rain > 0 ? 700 : 1500,
      ease: 'Sine.easeOut',
      onComplete: function () { ring.setVisible(false) },
    })
  }

  // ---------------------------------------------------------------------
  //  Bubbles that rise and pop.
  // ---------------------------------------------------------------------
  createBubbles() {
    const scene = this.scene
    if (!scene.anims.exists('bubble_pop')) {
      scene.anims.create({
        key: 'bubble_pop',
        frames: [
          { key: 'decor', frame: 'bubble_0', duration: 300 },
          { key: 'decor', frame: 'bubble_1', duration: 500 },
          { key: 'decor', frame: 'bubble_1', duration: 400 },
          { key: 'decor', frame: 'bubble_2', duration: 160 },
        ],
      })
    }
    const bubble = scene.add.sprite(0, 0, 'decor', 'bubble_0').setVisible(false).setDepth(DEPTH.groundDetail)
    scene.time.addEvent({
      delay: 2600,
      loop: true,
      callback: function () {
        const spot = this.randomWaterSpot(true)
        bubble.setPosition(spot.x, spot.y).setVisible(true).play('bubble_pop')
        bubble.once('animationcomplete', function () { bubble.setVisible(false) })
      },
      callbackScope: this,
    })
  }

  // ---------------------------------------------------------------------
  //  Fish shadows gliding under the surface.
  // ---------------------------------------------------------------------
  createFish() {
    const count = effectsLevel() >= 1 ? 3 : 2
    for (let i = 0; i < count; i++) {
      const start = this.randomWaterSpot(true)
      const fish = this.scene.add.image(start.x, start.y, 'decor', 'fish_shadow')
      fish.setAlpha(0).setDepth(DEPTH.groundDetail - 0.5)
      this.swim(fish, Phaser.Math.Between(0, 3000))
    }
  }

  swim(fish, delay) {
    const target = this.randomWaterSpot(true)
    fish.setFlipX(target.x > fish.x) // the sprite faces left; flip to face right
    const distance = Phaser.Math.Distance.Between(fish.x, fish.y, target.x, target.y)
    this.scene.tweens.add({
      targets: fish,
      x: target.x,
      y: target.y,
      alpha: { from: fish.alpha, to: Math.random() < 0.3 ? 0 : 0.45 }, // sometimes dive out of sight
      delay: delay,
      duration: 1200 + distance * 60,
      ease: 'Sine.easeInOut',
      onComplete: function () { this.swim(fish, Phaser.Math.Between(400, 2500)) },
      callbackScope: this,
    })
  }

  // ---------------------------------------------------------------------
  //  Dragonflies darting near the shore (daytime, not in the rain).
  // ---------------------------------------------------------------------
  createDragonflies() {
    const scene = this.scene
    if (!scene.anims.exists('dragonfly_buzz')) {
      scene.anims.create({ key: 'dragonfly_buzz', frames: scene.anims.generateFrameNames('decor', { prefix: 'dragonfly_', start: 0, end: 1 }), frameRate: 18, repeat: -1 })
    }
    this.dragonflies = []
    for (let i = 0; i < 2; i++) {
      const spot = this.randomWaterSpot(false)
      const fly = scene.add.sprite(spot.x, spot.y - 10, 'decor', 'dragonfly_0').play('dragonfly_buzz').setDepth(DEPTH.weather - 1)
      this.dragonflies.push(fly)
      this.dart(fly)
    }
  }

  dart(fly) {
    const spot = this.randomWaterSpot(false)
    fly.setFlipX(spot.x < fly.x)
    this.scene.tweens.add({
      targets: fly,
      x: spot.x,
      y: spot.y - Phaser.Math.Between(6, 16),
      duration: Phaser.Math.Between(250, 600), // quick dart...
      ease: 'Quad.easeOut',
      delay: Phaser.Math.Between(400, 2200), // ...then hover for a moment
      onComplete: function () { this.dart(fly) },
      callbackScope: this,
    })
  }

  // 0 = dry, 1 = heavy rain. Called by the weather system.
  setRain(level) {
    this.rain = level
    if (!this.dragonflies) return
    for (let i = 0; i < this.dragonflies.length; i++) this.dragonflies[i].setVisible(level === 0)
  }
}
