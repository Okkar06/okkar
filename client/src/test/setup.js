import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no matchMedia. Default every query to "no match" (so: no fine
// pointer, motion allowed); individual tests override it when they need to.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
}

window.scrollTo = () => {}

// jsdom has no IntersectionObserver either. This one reports everything as
// on screen straight away, so scroll-reveal content is simply shown.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe(target) {
      this.callback([{ isIntersecting: true, intersectionRatio: 1, target }], this)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-mode')
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove())
  vi.unstubAllGlobals()
})
