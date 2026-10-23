// =====================================================================
//  PLAYER
//  Moves with WASD / arrow keys, the on-screen joystick (phones), or by
//  tapping/clicking a spot on the map ("tap to move").
// =====================================================================

import Phaser from 'phaser'
import { PLAYER_SPEED } from '../utils/constants.js'
import { state, canPlayerMove } from '../utils/state.js'

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player', 0)

    // Add the sprite to the scene and give it a physics body.
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Only the feet collide, so the head can overlap things "behind" it.
    this.body.setSize(10, 6)
    this.body.setOffset(3, 10)
    this.setCollideWorldBounds(true)

    // Keyboard keys: arrows and WASD.
    this.keys = scene.input.keyboard.addKeys({
      up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
      w: 'W', a: 'A', s: 'S', d: 'D',
    })

    // Tap-to-move target (null when not walking to a tapped spot).
    this.target = null
    this.stuckFrames = 0
    // If the player tapped a building, remember it so it opens on arrival.
    this.pendingZone = null
  }

  // Walk towards a point in the world (used by tap-to-move).
  walkTo(x, y, zone) {
    this.target = { x: x, y: y }
    this.pendingZone = zone || null
    this.stuckFrames = 0
  }

  // Called every frame by the scene.
  update() {
    // During the quick tour a tween moves the player, so do nothing here.
    if (state.touring) {
      this.setDepth(10 + this.y + 8)
      return
    }

    let dx = 0
    let dy = 0

    if (canPlayerMove()) {
      // 1. Keyboard
      if (this.keys.left.isDown || this.keys.a.isDown) dx = -1
      if (this.keys.right.isDown || this.keys.d.isDown) dx = 1
      if (this.keys.up.isDown || this.keys.w.isDown) dy = -1
      if (this.keys.down.isDown || this.keys.s.isDown) dy = 1

      // 2. Joystick (only if the keyboard isn't being used)
      if (dx === 0 && dy === 0) {
        dx = state.touch.x
        dy = state.touch.y
      }

      // Any manual input cancels tap-to-move.
      if (dx !== 0 || dy !== 0) {
        this.target = null
      } else if (this.target) {
        // 3. Tap-to-move: head straight for the target.
        const distX = this.target.x - this.x
        const distY = this.target.y - (this.y + 5) // aim with the feet
        const distance = Math.sqrt(distX * distX + distY * distY)
        if (distance < 3) {
          this.target = null
        } else {
          dx = distX / distance
          dy = distY / distance
          // If we bump into something for a while, give up.
          if (this.body.blocked.left || this.body.blocked.right || this.body.blocked.up || this.body.blocked.down) {
            this.stuckFrames = this.stuckFrames + 1
            if (this.stuckFrames > 20) this.target = null
          }
        }
      }
    } else {
      this.target = null
    }
    if (!this.target) this.pendingZone = null

    // Diagonal movement shouldn't be faster than straight movement.
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length > 1) {
      dx = dx / length
      dy = dy / length
    }
    this.setVelocity(dx * PLAYER_SPEED, dy * PLAYER_SPEED)

    // Animation: a small two-frame "step" while moving.
    if (length > 0.1) {
      this.anims.play('player-walk', true)
      if (dx < -0.1) this.setFlipX(true)
      if (dx > 0.1) this.setFlipX(false)
    } else {
      this.anims.stop()
      this.setFrame(0)
    }

    // Things lower on the screen are drawn in front.
    this.setDepth(10 + this.y + 8)
  }
}
