// =====================================================================
//  SHARED STATE + A TINY EVENT BUS
//
//  The game (Phaser) and the HTML user interface (panels, HUD, buttons)
//  are separate worlds. They talk to each other through:
//    - `state`: plain values both sides can read
//    - `bus`:   simple events, e.g. bus.emit('interact')
// =====================================================================

export const state = {
  started: false,       // has the visitor pressed "Enter the village"?
  panelOpen: false,     // is an HTML panel covering the game?
  dialogueOpen: false,  // is Pip talking (dialogue box open)?
  touring: false,       // is the quick tour moving the player?
  currentZone: null,    // the interactable the player is standing in (or null)
  promptOverride: null, // custom prompt text (e.g. 'Reel it in!' while fishing)
}

// Can the player move right now?
export function canPlayerMove() {
  return state.started && !state.panelOpen && !state.dialogueOpen && !state.touring
}

// ---------------------------------------------------------------------
//  Event bus: bus.on('name', fn) to listen, bus.emit('name', data) to send.
// ---------------------------------------------------------------------
const listeners = {}

export const bus = {
  on(name, fn) {
    if (!listeners[name]) listeners[name] = []
    listeners[name].push(fn)
  },
  off(name, fn) {
    const list = listeners[name]
    if (!list) return
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === fn) list.splice(i, 1)
    }
  },
  emit(name, data) {
    const list = listeners[name]
    if (!list) return
    // Copy first, so a listener can safely remove itself while we loop.
    const copy = list.slice()
    for (let i = 0; i < copy.length; i++) copy[i](data)
  },
}
