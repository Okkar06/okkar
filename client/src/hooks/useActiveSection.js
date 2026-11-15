import { useEffect, useState } from 'react'

/**
 * Tracks which section id is currently the most prominent in the viewport, so
 * the navigation can mark it. Read-only observer — it never moves the page.
 */
export function useActiveSection(ids, { rootMargin = '-45% 0px -50% 0px' } = {}) {
  const [active, setActive] = useState(ids[0] ?? null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null)

    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 1] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids, rootMargin])

  return active
}
