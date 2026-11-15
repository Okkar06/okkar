import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * CursorDot — a pellet-sized glow that trails the pointer on fine-pointer
 * devices. The native cursor is never hidden, and the dot takes no pointer
 * events, so nothing about interaction changes.
 */
function CursorDot() {
  const shouldReduceMotion = useReducedMotion()
  const dotRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
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
    if (!enabled) return undefined

    const handleMouseMove = (event) => {
      targetRef.current.x = event.clientX
      targetRef.current.y = event.clientY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined

    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.2
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.2

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-6 w-6 rounded-full border-2 border-wall/70 bg-wall/20 shadow-glow-wall"
      style={{ marginLeft: '-12px', marginTop: '-12px' }}
    />
  )
}

export default CursorDot
