// =====================================================================
//  FISHING — an optional mini-game anywhere on the harbour.
//
//    E / tap   cast: you swing the rod and the bobber arcs out onto the
//              nearest open water (down, left, right or up from you)
//    wait      the line hangs slack; the bobber bobs and may nibble
//    "!"       a bite! the bobber is pulled under: E / tap within 1.5 s
//    reel in   the line goes taut, the fish leaps out and into your hands,
//              and a card shows a fun fact or a skill tag
//
//  Under 10 seconds. Walking away (or moving) reels the line back in.
// =====================================================================

import Phaser from 'phaser'
import { DEPTH } from '../utils/constants.js'
import { hex } from '../theme/palette.js'
import { state, bus } from '../utils/state.js'
import { prefersReducedMotion } from '../utils/device.js'
import { fishTypes, funFacts } from '../data/funFacts.js'
import { skills } from '../data/skills.js'
import { isMissing } from '../ui/sectionsHtml.js'
import { showCatch } from '../ui/CatchCard.js'
import { showToast } from '../ui/Hud.js'

const BITE_WINDOW = 1500 // ms you have to react to the "!"
const DIRECTIONS = [
  { x: 0, y: 1 }, // down (preferred: you face the camera)
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
]

export class Fishing {
  // water: the WaterSystem (ripples + "is this open water?")
  constructor(scene, player, water) {
    this.scene = scene
    this.player = player
    this.water = water
    this.mode = 'idle' // idle -> casting -> waiting -> bite -> reeling
    this.timers = []
    this.calm = prefersReducedMotion()

    this.bobber = scene.add.image(0, 0, 'decor', 'bobber').setVisible(false).setDepth(DEPTH.groundDetail + 1)
    this.bang = scene.add.image(0, 0, 'decor', 'bubble_bang').setVisible(false).setDepth(DEPTH.worldUi)
    this.caught = scene.add.image(0, 0, 'decor', 'fish_orange').setVisible(false).setDepth(DEPTH.worldUi)
    this.rod = scene.add.graphics().setDepth(DEPTH.worldUi - 1)

    // Rod and line state, drawn every frame in update()
    this.direction = DIRECTIONS[0]
    this.rodSwing = 1 // 0 = rod held back (wind-up), 1 = pointing at the water
    this.slack = 8 // how much the line sags (pixels)
    this.tipDip = 0 // the rod tip bends towards the water on a bite

    scene.events.once('shutdown', function () { this.reset() }, this)
  }

  // Called when the player presses E / taps the prompt on the harbour.
  action() {
    if (this.mode === 'idle') this.cast()
    else if (this.mode === 'bite') this.reel()
    else if (this.mode === 'waiting') this.tooEarly()
  }

  setPrompt(text) {
    state.promptOverride = text
    bus.emit('prompt:refresh')
  }

  later(ms, fn) {
    this.timers.push(this.scene.time.delayedCall(ms, fn, null, this))
  }

  // Where the rod is held and where its tip is (depends on the swing).
  hand() {
    return { x: this.player.x + this.direction.x * 3 + (this.direction.x === 0 ? 4 : 0), y: this.player.y + 1 }
  }

  rodTip() {
    const hand = this.hand()
    const d = this.direction
    // Wind-up: tip behind and high. Cast: tip out over the water.
    const back = { x: hand.x - d.x * 6, y: hand.y - 13 - d.y * 4 }
    const forward = { x: hand.x + d.x * 11, y: hand.y - 7 + d.y * 7 + this.tipDip }
    return {
      x: back.x + (forward.x - back.x) * this.rodSwing,
      y: back.y + (forward.y - back.y) * this.rodSwing,
    }
  }

  // Find the closest open water in one of four directions.
  findCastSpot() {
    let best = null
    for (let i = 0; i < DIRECTIONS.length; i++) {
      const d = DIRECTIONS[i]
      for (let distance = 22; distance <= 52; distance += 4) {
        const x = this.player.x + d.x * distance
        const y = this.player.y + 6 + d.y * distance
        if (this.water.isOpenWater(x, y)) {
          if (!best || distance < best.distance) best = { direction: d, x: x, y: y, distance: distance }
          break
        }
      }
    }
    return best
  }

  cast() {
    const spot = this.findCastSpot()
    if (!spot) {
      showToast('Walk to the edge of the harbour to cast.')
      return
    }
    this.mode = 'casting'
    this.direction = spot.direction
    this.target = { x: spot.x + Phaser.Math.Between(-4, 4), y: spot.y + Phaser.Math.Between(-3, 3) }
    if (spot.direction.x !== 0) this.player.setFlipX(spot.direction.x < 0) // face the water
    // Look out over the water, so the bobber isn't hidden behind the prompt.
    this.scene.cameras.main.setFollowOffset(-spot.direction.x * 34, -spot.direction.y * 34)
    this.setPrompt('Casting…')
    this.slack = 4
    this.tipDip = 0

    // 1. Wind up (rod swings back), 2. swing forward and let the bobber fly.
    this.rodSwing = 1
    const scene = this.scene
    scene.tweens.add({
      targets: this,
      rodSwing: 0,
      duration: this.calm ? 1 : 180,
      ease: 'Sine.easeOut',
      onComplete: function () {
        scene.tweens.add({ targets: this, rodSwing: 1, duration: this.calm ? 1 : 160, ease: 'Back.easeOut' })
        this.launchBobber()
      },
      callbackScope: this,
    })
  }

  launchBobber() {
    const tip = this.rodTip()
    const start = { x: tip.x, y: tip.y }
    const target = this.target
    this.bobber.setPosition(start.x, start.y).setVisible(true).setAlpha(1).setScale(1)
    // Fly in an arc: a "progress" value from 0 to 1 drives x, y and height.
    const flight = { t: 0 }
    this.scene.tweens.add({
      targets: flight,
      t: 1,
      duration: this.calm ? 1 : 520,
      ease: 'Sine.easeInOut',
      onUpdate: function () {
        const height = Math.sin(flight.t * Math.PI) * 22
        this.bobber.setPosition(start.x + (target.x - start.x) * flight.t, start.y + (target.y - start.y) * flight.t - height)
      },
      onUpdateScope: this,
      onComplete: function () {
        this.water.ripple(target.x, target.y + 2)
        this.water.ripple(target.x + 2, target.y + 1)
        this.waitForBite()
      },
      callbackScope: this,
    })
  }

  waitForBite() {
    this.mode = 'waiting'
    this.slack = 9 // the line hangs loose
    this.setPrompt('Waiting for a bite…')
    if (!this.calm) {
      this.bobTween = this.scene.tweens.add({ targets: this.bobber, y: this.target.y + 1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    // One or two nibbles first (reacting to these is "too early"), then the bite.
    const biteAt = Phaser.Math.Between(1600, 3200)
    const nibbles = Phaser.Math.Between(1, 2)
    for (let i = 0; i < nibbles; i++) {
      this.later(biteAt * ((i + 1) / (nibbles + 1)), this.nibble)
    }
    this.later(biteAt, this.bite)
  }

  nibble() {
    if (this.mode !== 'waiting') return
    this.water.ripple(this.target.x, this.target.y + 2)
    if (this.calm) return
    this.scene.tweens.add({ targets: this.bobber, scaleY: 0.75, duration: 90, yoyo: true })
  }

  bite() {
    if (this.mode !== 'waiting') return
    this.mode = 'bite'
    this.setPrompt('Reel it in!')
    if (this.bobTween) this.bobTween.stop()
    // Pulled under: the bobber sinks, the line goes taut, the rod tip bends.
    this.bobber.setY(this.target.y + 3).setAlpha(0.55)
    this.slack = 1
    this.tipDip = 3
    this.water.ripple(this.target.x, this.target.y + 2)
    this.later(120, function () { this.water.ripple(this.target.x - 2, this.target.y + 3) })
    this.bang.setPosition(this.player.x, this.player.y - 15).setVisible(true).setScale(0.5)
    this.scene.tweens.add({ targets: this.bang, scale: 1, duration: 140, ease: 'Back.easeOut' })
    this.later(BITE_WINDOW, function () {
      if (this.mode !== 'bite') return
      this.finish()
      showToast('It got away! Press E or tap to cast again.')
    })
  }

  tooEarly() {
    this.finish()
    showToast('Too early: that was just a nibble. Wait for the "!"')
  }

  reel() {
    this.mode = 'reeling'
    this.clearTimers()
    this.bang.setVisible(false)
    this.setPrompt('Reeling in…')
    this.slack = 0
    this.tipDip = 2
    const catchInfo = this.pickCatch()
    const from = { x: this.bobber.x, y: this.bobber.y }

    // The fish leaps out of the water in an arc and lands in your hands.
    this.water.ripple(from.x, from.y + 1)
    this.bobber.setVisible(false)
    this.caught.setFrame(catchInfo.fish.sprite).setPosition(from.x, from.y).setVisible(true).setAngle(0)
    const leap = { t: 0 }
    const to = { x: this.player.x, y: this.player.y - 15 }
    this.scene.tweens.add({
      targets: leap,
      t: 1,
      duration: this.calm ? 1 : 620,
      ease: 'Sine.easeOut',
      onUpdate: function () {
        const height = Math.sin(leap.t * Math.PI) * 26
        this.caught.setPosition(from.x + (to.x - from.x) * leap.t, from.y + (to.y - from.y) * leap.t - height)
        this.caught.setAngle(Math.sin(leap.t * Math.PI * 3) * 20) // wriggle
      },
      onUpdateScope: this,
      onComplete: function () {
        this.caught.setAngle(0)
        this.scene.tweens.add({ targets: this.caught, y: to.y - 3, duration: 260, yoyo: true, hold: 500 })
        this.later(1400, function () { this.caught.setVisible(false) })
        showCatch({
          title: 'You caught a ' + catchInfo.fish.name + '!',
          text: catchInfo.text,
          imageUrl: this.scene.textures.getBase64('decor', catchInfo.fish.sprite),
        })
        this.mode = 'idle'
        this.rod.clear()
        this.setPrompt(null)
        this.scene.cameras.main.setFollowOffset(0, 0)
      },
      callbackScope: this,
    })
  }

  // A fun fact (if you've written any) or a skill from skills.js.
  pickCatch() {
    const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)]
    const facts = []
    for (let i = 0; i < funFacts.length; i++) {
      // On the live site, unfinished TODO facts are skipped.
      if (!isMissing(funFacts[i]) || import.meta.env.DEV) facts.push(funFacts[i])
    }
    if (facts.length > 0 && Math.random() < 0.5) {
      return { fish: fish, text: 'Fun fact: ' + facts[Math.floor(Math.random() * facts.length)] }
    }
    const group = skills[Math.floor(Math.random() * skills.length)]
    const skill = group.items[Math.floor(Math.random() * group.items.length)]
    return { fish: fish, text: 'It was holding a skill tag: Okkar works with ' + skill + ' (' + group.group + ').' }
  }

  clearTimers() {
    for (let i = 0; i < this.timers.length; i++) this.timers[i].remove()
    this.timers = []
  }

  // Back to idle: reel the line in and put the rod away.
  finish() {
    this.clearTimers()
    if (this.bobTween) this.bobTween.stop()
    this.scene.tweens.killTweensOf(this)
    this.mode = 'idle'
    this.bobber.setVisible(false)
    this.bang.setVisible(false)
    this.rod.clear()
    this.setPrompt(null)
    this.scene.cameras.main.setFollowOffset(0, 0)
  }

  reset() {
    if (this.mode !== 'idle') this.finish()
    state.promptOverride = null
  }

  // Every frame: draw the rod and the line; stop if the player walks off.
  update() {
    if (this.mode === 'idle') return
    const onHarbour = state.currentZone && state.currentZone.section === 'fishing'
    const moving = this.player.body.velocity.lengthSq() > 4
    if (!onHarbour || (moving && this.mode !== 'reeling')) {
      this.finish()
      return
    }

    const hand = this.hand()
    const tip = this.rodTip()
    this.rod.clear()
    // The rod: a short wooden pole from the hand to the tip.
    this.rod.lineStyle(2, hex('woodDark'), 1)
    this.rod.lineBetween(hand.x, hand.y, tip.x, tip.y)
    this.rod.lineStyle(1, hex('wood'), 1)
    this.rod.lineBetween(hand.x, hand.y - 1, (hand.x + tip.x) / 2, (hand.y + tip.y) / 2 - 1)

    // The line: a curve from the rod tip to the bobber that sags when slack.
    if (!this.bobber.visible) return
    const end = { x: this.bobber.x, y: this.bobber.y - 2 }
    const control = { x: (tip.x + end.x) / 2, y: (tip.y + end.y) / 2 + this.slack }
    this.rod.lineStyle(1, hex('paper'), 0.85)
    this.rod.beginPath()
    this.rod.moveTo(tip.x, tip.y)
    const steps = 12
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const x = (1 - t) * (1 - t) * tip.x + 2 * (1 - t) * t * control.x + t * t * end.x
      const y = (1 - t) * (1 - t) * tip.y + 2 * (1 - t) * t * control.y + t * t * end.y
      this.rod.lineTo(x, y)
    }
    this.rod.strokePath()
  }
}
