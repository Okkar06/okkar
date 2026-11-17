import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { measureTour, playTour } from '../lib/tour'

const FINISHED_MS = 2600

// Anything that means "I want to drive now". Mouse movement alone does not
// count, so the tour can be watched with a hand on the mouse.
const TAKEOVER_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown']

/**
 * Runs the attract-mode tour over `stops` ([{ id, label }]).
 *
 * status: 'idle' | 'playing' | 'finished'. Any key, scroll, tap or click hands
 * control straight back, as does switching tabs. `stops` must be a stable
 * array (define it outside the component).
 */
export function useAttractMode(stops) {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState({ status: 'idle', step: 0 })
  const controllerRef = useRef(null)

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState({ status: 'idle', step: 0 })
  }, [])

  const start = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    const plan = measureTour(stops)
    if (plan.length === 0) return

    setState({ status: 'playing', step: plan[0].index })

    playTour(plan, {
      signal: controller.signal,
      reduceMotion: Boolean(reduceMotion),
      onStep: (step) => setState({ status: 'playing', step }),
    })
      .then(() => {
        if (controllerRef.current !== controller) return
        controllerRef.current = null
        setState((previous) => ({ status: 'finished', step: previous.step }))
      })
      .catch(() => {
        // Aborted: whoever aborted it has already set the state.
      })
  }, [stops, reduceMotion])

  // While playing, the visitor can take over at any moment.
  useEffect(() => {
    if (state.status !== 'playing') return undefined

    const takeOver = () => stop()
    const handleVisibility = () => {
      if (document.hidden) stop()
    }

    for (const type of TAKEOVER_EVENTS) window.addEventListener(type, takeOver, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      for (const type of TAKEOVER_EVENTS) window.removeEventListener(type, takeOver)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [state.status, stop])

  // The "YOUR TURN" card shows briefly after a complete run.
  useEffect(() => {
    if (state.status !== 'finished') return undefined
    const timer = setTimeout(() => setState({ status: 'idle', step: 0 }), FINISHED_MS)
    return () => clearTimeout(timer)
  }, [state.status])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { ...state, start, stop }
}
