// =====================================================================
//  CHARACTERS — the player and Pip, drawn at Stardew Valley proportions:
//  16 x 32 pixels, with a 4-frame walk cycle for each direction.
//
//  Sheet layout (each frame 16 x 32):
//    row 0: facing down   (stand, left step, stand, right step)
//    row 1: facing up
//    row 2: facing right  (the game mirrors it for left)
//  Light from the top-left, 1px ink outline (pixel-art-direction skill).
// =====================================================================

import { PixelCanvas } from '../lib/PixelCanvas.mjs'

// Two looks. Colours are palette names.
export const LOOKS = {
  // The player: Okkar (black hair, glasses, blue hoodie, grey trousers)
  player: {
    skin: 'woodHi', skinLight: 'cream', skinShade: 'woodLight',
    hair: 'navy', hairLight: 'slate',
    top: 'water', topLight: 'waterLight', topShade: 'waterDeep',
    legs: 'stoneDark', legsShade: 'slate',
    shoes: 'woodDark',
    glasses: true,
    longHair: false,
  },
  // Pip: long brown hair, purple dress
  npc: {
    skin: 'woodHi', skinLight: 'cream', skinShade: 'woodLight',
    hair: 'wood', hairLight: 'woodLight',
    top: 'purple', topLight: 'pink', topShade: 'pinkDark',
    legs: 'purple', legsShade: 'pinkDark',
    shoes: 'redDark',
    glasses: false,
    longHair: true,
    dress: true,
  },
}

// ---------------------------------------------------------------------
//  Facing down / up (front and back views share the same silhouette)
// ---------------------------------------------------------------------
function frontOrBack(look, facing, frame) {
  const c = new PixelCanvas(16, 32)
  const step = frame === 1 ? 'left' : frame === 3 ? 'right' : null
  const bob = step ? -1 : 0 // the body rises a pixel on each step
  const back = facing === 'up'

  // Legs and shoes (the stepping leg is lifted a pixel)
  const leftLift = step === 'left' ? 1 : 0
  const rightLift = step === 'right' ? 1 : 0
  // Legs are 6px long (Stardew proportions): rows 23-28, shoes 29-30.
  c.rect(5, 23 - leftLift + bob, 2, 6, look.legs)
  c.rect(9, 23 - rightLift + bob, 2, 6, look.legs)
  c.vline(10, 23 - rightLift + bob, 6, look.legsShade)
  c.rect(4, 29 - leftLift, 3, 2, look.shoes)
  c.rect(9, 29 - rightLift, 3, 2, look.shoes)

  // Torso (a hoodie or a dress), lit on the left
  c.rect(4, 15 + bob, 8, 8, look.top)
  c.vline(4, 15 + bob, 7, look.topLight)
  c.vline(11, 15 + bob, 8, look.topShade)
  c.hline(4, 22 + bob, 8, look.topShade)
  if (look.dress) {
    c.rect(4, 22 + bob, 8, 3, look.top) // the skirt flares a little
    c.hline(3, 24 + bob, 10, look.topShade)
  }
  if (!back) {
    c.rect(7, 15 + bob, 2, 2, look.dress ? look.topLight : look.skin) // neckline
    if (!look.dress) c.vline(7, 18 + bob, 4, look.topShade) // hoodie zip
  }

  // Arms swing opposite to the legs
  const leftArm = step === 'right' ? 1 : step === 'left' ? -1 : 0
  const rightArm = -leftArm
  c.rect(3, 16 + bob + leftArm, 1, 5, look.top)
  c.rect(12, 16 + bob + rightArm, 1, 5, look.topShade)
  c.rect(3, 21 + bob + leftArm, 1, 2, look.skin) // hands
  c.rect(12, 21 + bob + rightArm, 1, 2, look.skinShade)

  // Head: a big Stardew-style head
  const hy = 2 + bob
  c.rect(4, hy + 3, 8, 9, look.skin) // face block
  c.vline(4, hy + 4, 7, look.skinLight)
  c.vline(11, hy + 4, 7, look.skinShade)
  c.rect(7, hy + 12, 2, 1, look.skinShade) // neck

  // Hair
  c.rect(3, hy, 10, 4, look.hair) // top
  c.rect(4, hy - 1, 8, 1, look.hair)
  c.hline(5, hy, 4, look.hairLight) // shine, top-left
  c.set(4, hy + 1, look.hairLight)
  if (back) {
    c.rect(3, hy + 3, 10, look.longHair ? 13 : 8, look.hair) // back of the head
    c.vline(4, hy + 4, 4, look.hairLight)
  } else {
    // Fringe with a side part, sideburns
    c.rect(4, hy + 3, 8, 2, look.hair)
    c.set(8, hy + 4, look.skin)
    c.set(9, hy + 4, look.skin)
    c.rect(3, hy + 3, 1, look.longHair ? 12 : 5, look.hair)
    c.rect(12, hy + 3, 1, look.longHair ? 12 : 5, look.hair)
    if (look.longHair) {
      c.rect(2, hy + 6, 1, 8, look.hair)
      c.rect(13, hy + 6, 1, 8, look.hair)
    }
    // Eyes (and glasses)
    if (look.glasses) {
      // Half-rim glasses: a thin top rim and sides, so the eyes still show.
      c.hline(4, hy + 6, 8, 'slate')
      const rims = [4, 7, 8, 11]
      for (let i = 0; i < rims.length; i++) c.set(rims[i], hy + 7, 'slate')
      c.set(5, hy + 7, 'white') // glint on the lens
      c.set(10, hy + 7, 'white')
      c.rect(6, hy + 7, 1, 2, 'navy') // eyes
      c.rect(9, hy + 7, 1, 2, 'navy')
    } else {
      c.rect(6, hy + 7, 1, 2, 'navy')
      c.rect(9, hy + 7, 1, 2, 'navy')
      c.set(5, hy + 9, 'pink') // cheeks
      c.set(10, hy + 9, 'pink')
    }
    c.hline(7, hy + 10, 2, look.skinShade) // a small smile
  }
  return c.outline()
}

// ---------------------------------------------------------------------
//  Facing right (side view). The game mirrors it for facing left.
// ---------------------------------------------------------------------
function side(look, frame) {
  const c = new PixelCanvas(16, 32)
  const bob = frame === 1 || frame === 3 ? -1 : 0

  // Legs: apart on frame 1 (stride), crossing on frame 3, together when standing
  if (frame === 1) {
    c.rect(4, 23 + bob, 2, 6, look.legsShade) // back leg
    c.rect(9, 23 + bob, 2, 6, look.legs) // front leg
    c.rect(3, 29, 3, 2, look.shoes)
    c.rect(9, 29, 4, 2, look.shoes)
  } else if (frame === 3) {
    c.rect(7, 23 + bob, 2, 6, look.legs)
    c.rect(6, 28, 2, 2, look.shoes)
    c.rect(7, 29, 4, 2, look.shoes)
  } else {
    c.rect(6, 23, 3, 6, look.legs)
    c.vline(6, 23, 6, look.legsShade)
    c.rect(6, 29, 5, 2, look.shoes)
  }

  // Torso, narrower in profile
  c.rect(5, 15 + bob, 6, 8, look.top)
  c.vline(5, 15 + bob, 7, look.topShade) // the back is away from the light
  c.vline(10, 15 + bob, 7, look.topLight)
  c.hline(5, 22 + bob, 6, look.topShade)
  if (look.dress) {
    c.rect(4, 22 + bob, 8, 3, look.top)
    c.hline(4, 24 + bob, 8, look.topShade)
  }

  // One arm, swinging forward/back with the stride
  const armShift = frame === 1 ? 2 : frame === 3 ? -1 : 0
  c.rect(7 + armShift, 16 + bob, 2, 5, look.topShade)
  c.rect(7 + armShift, 21 + bob, 2, 1, look.skin)

  // Head in profile: face on the right, hair at the back
  const hy = 2 + bob
  c.rect(5, hy + 3, 7, 9, look.skin)
  c.vline(11, hy + 5, 4, look.skinLight) // lit nose/cheek
  c.set(12, hy + 7, look.skin) // nose
  c.rect(7, hy + 12, 2, 1, look.skinShade)
  c.rect(4, hy, 8, 4, look.hair)
  c.rect(5, hy - 1, 6, 1, look.hair)
  c.hline(6, hy, 4, look.hairLight)
  c.rect(4, hy + 3, 3, look.longHair ? 13 : 6, look.hair) // back of the head
  c.rect(7, hy + 3, 5, 2, look.hair) // fringe
  c.set(7, hy + 7, look.skinShade) // ear
  if (look.glasses) {
    c.rect(9, hy + 6, 3, 3, 'slate') // lens rim
    c.set(10, hy + 7, 'navy') // eye
    c.set(11, hy + 7, 'white') // glint
    c.hline(7, hy + 6, 2, 'slate') // the arm of the glasses
  } else {
    c.rect(10, hy + 7, 1, 2, 'navy')
    c.set(11, hy + 9, 'pink')
  }
  c.set(11, hy + 10, look.skinShade) // mouth
  return c.outline()
}

// A sprite sheet: 4 frames x 3 directions.
function sheet(look) {
  const frames = []
  const directions = ['down', 'up', 'side']
  for (let d = 0; d < directions.length; d++) {
    for (let f = 0; f < 4; f++) {
      frames.push(directions[d] === 'side' ? side(look, f) : frontOrBack(look, directions[d], f))
    }
  }
  return frames
}

// Written as public/assets/sprites/<file> by build-art.mjs
export function sheets() {
  return [
    { file: 'player.png', columns: 4, frames: sheet(LOOKS.player) },
    { file: 'npc.png', columns: 4, frames: sheet(LOOKS.npc) },
  ]
}
