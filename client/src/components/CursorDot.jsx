import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

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
      const dx = targetRef.current.x - currentRef.current.x
      const dy = targetRef.current.y - currentRef.current.y

      currentRef.current.x += dx * 0.18
      currentRef.current.y += dy * 0.18

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
      className="pointer-events-none fixed left-0 top-0 z-[60] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
      aria-hidden="true"
      style={{
        background: 'rgb(var(--accent) / 0.25)',
        border: '1.5px solid rgb(var(--accent) / 0.7)',
        boxShadow: '0 0 18px rgb(var(--accent) / 0.5), 0 0 40px rgb(var(--accent) / 0.2)',
      }}
    />
  )
}

export default CursorDot
