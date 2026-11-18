import { useEffect, useState } from 'react'

const pageVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden'

/**
 * Whether a decorative animation should be running: its element is on screen
 * and the tab is visible. Sections use it to pause their CSS animations (via
 * the `anim-paused` class) and to stop requestAnimationFrame loops, so
 * nothing animates where nobody can see it.
 *
 * Starts as `false`, so an animation only begins once it is first seen.
 *
 * @param {import('react').RefObject<Element>} ref
 * @param {{ rootMargin?: string }} [options]
 */
export function usePlayback(ref, { rootMargin = '0px' } = {}) {
  // Without IntersectionObserver (very old browsers) there is no way to know,
  // so it simply plays.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')
  const [visible, setVisible] = useState(pageVisible)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting)
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  useEffect(() => {
    const handleVisibility = () => setVisible(pageVisible())
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return inView && visible
}
