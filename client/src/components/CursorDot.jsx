import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const EASING = 0.2
// Closer than this to the pointer counts as "arrived".
const REST_DISTANCE = 0.1

/**
 * CursorDot — a pellet-sized glow that trails the pointer on fine-pointer
 * devices. The native cursor is never hidden, and the dot takes no pointer
 * events, so nothing about interaction changes.
 *
 * The animation loop only runs while the dot is still catching up: once it
 * reaches the pointer it stops, and the next mouse move restarts it. A page
 * left open with an idle mouse does no work.
 */
function CursorDot() {
  const shouldReduceMotion = useReducedMotion()
  const dotRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) return undefined

    const media = window.matchMedia('(pointer: fine)')
    const updateEnabled = () => setEnabled(media.matches)

    updateEnabled()
    media.addEventListener('change', updateEnabled)
    return () => media.removeEventListener('change', updateEnabled)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (!enabled || shouldReduceMotion) return undefined

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = null
    let placed = false

    const tick = () => {
      current.x += (target.x - current.x) * EASING
      current.y += (target.y - current.y) * EASING

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      }

      const settled =
        Math.abs(target.x - current.x) < REST_DISTANCE &&
        Math.abs(target.y - current.y) < REST_DISTANCE

      frame = settled ? null : window.requestAnimationFrame(tick)
    }

    const handleMouseMove = (event) => {
      target.x = event.clientX
      target.y = event.clientY

      if (!placed) {
        // First sighting: appear under the pointer instead of flying in
        // from the corner of the screen.
        placed = true
        current.x = target.x
        current.y = target.y
        dotRef.current?.classList.remove('opacity-0')
      }

      if (frame === null) frame = window.requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [enabled, shouldReduceMotion])

  if (!enabled || shouldReduceMotion) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] -ml-3 -mt-3 h-6 w-6 rounded-full border-2 border-wall/70 bg-wall/20 opacity-0 shadow-glow-wall transition-opacity duration-200"
    />
  )
}

export default CursorDot
