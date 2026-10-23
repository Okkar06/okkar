// =====================================================================
//  DEVICE CHECKS — so heavy effects can be toned down automatically.
// =====================================================================

// The visitor asked their system for less motion (accessibility setting).
export function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

// A rough guess at "this device might struggle": phones/tablets, or
// computers with few CPU cores / little memory. Used to halve particles.
export function isLowEndDevice() {
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4 // in GB (Chrome only)
  const coarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  return coarse || cores <= 4 || memory <= 2
}

// Particle counts are multiplied by this (1 = full, 0.5 = half, 0 = none).
export function effectsLevel() {
  if (prefersReducedMotion()) return 0
  if (isLowEndDevice()) return 0.5
  return 1
}

// localStorage that never crashes (it can throw in private mode or when blocked).
export function storageGet(key) {
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

export function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // Storage blocked: the game still works, it just won't remember.
  }
}
