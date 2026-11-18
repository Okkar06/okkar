import { useCallback, useSyncExternalStore } from 'react'

/**
 * Whether a CSS media query matches, kept in step as it changes. Read
 * synchronously on first render, so a layout picked from it never flips after
 * the page has painted. False where matchMedia doesn't exist.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
      const list = window.matchMedia(query)
      list.addEventListener?.('change', onChange)
      return () => list.removeEventListener?.('change', onChange)
    },
    [query],
  )
  const getSnapshot = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
