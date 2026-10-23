// =====================================================================
//  PLAYER
//  Moves with WASD / arrow keys, the floating drag control on phones
//  (src/ui/TouchDragControl.js), or by clicking a spot on the map.
// =====================================================================

import Phaser from 'phaser'
import { PLAYER_SPEED, DEPTH } from '../utils/constants.js'
import { state, canPlayerMove } from '../utils/state.js'
import { getMoveVector } from '../ui/TouchDragControl.js'

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player', 0)

    // Add the sprite to the scene and give it a physics body.
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // The sprite is 16 x 32. Its anchor sits 3/4 of the way down (the hips), so
    // the feet are 8px below the player's y, as with the old 16px sprite.
    this.setOrigin(0.5, 0.75)
    // Only the feet collide, so the head and body can overlap things "behind" it.
    this.body.setSize(10, 6)
    this.body.setOffset(3, 26)
    this.facing = 'down' // 'down', 'up' or 'side' (side + flipX = left)
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

    // A soft shadow that follows the player's feet.
    this.shadow = scene.add.image(x, y, 'decor', 'shadow').setDepth(DEPTH.groundDetail)
    this.updateDepth()
  }

  // Lower on screen = drawn in front (y-sorting), and keep the shadow under the feet.
  updateDepth() {
    this.setDepth(DEPTH.world + this.y + 8)
    this.shadow.setPosition(this.x + 1, this.y + 7)
  }

  destroy(fromScene) {
    if (this.shadow) this.shadow.destroy()
    super.destroy(fromScene)
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
      this.updateDepth()
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

      // 2. Touch drag control (only if the keyboard isn't being used).
      //    Its length is 0..1, so a short drag walks slowly.
      if (dx === 0 && dy === 0) {
        const touchMove = getMoveVector()
        dx = touchMove.x
        dy = touchMove.y
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

    // Animation: the walk cycle for the direction we're moving in.
    if (length > 0.1) {
      this.walkToward(dx, dy)
    } else {
      this.stand()
    }

    this.updateDepth()
  }

  // Pick the facing from a movement direction and play that walk cycle.
  walkToward(dx, dy) {
    this.faceToward(dx, dy)
    this.anims.play('player-walk-' + this.facing, true)
  }

  // Turn to face a direction without walking (e.g. towards the water).
  faceToward(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = 'side'
      this.setFlipX(dx < 0) // the side frames face right
    } else if (dy !== 0) {
      this.facing = dy < 0 ? 'up' : 'down'
    }
  }

  // Standing still: the first frame of the current direction's row.
  stand() {
    this.anims.stop()
    const rows = { down: 0, up: 4, side: 8 }
    this.setFrame(rows[this.facing])
  }
}
