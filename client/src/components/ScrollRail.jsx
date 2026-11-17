import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'
import DotTrail from './DotTrail'
import Mascot from './Mascot'

const RAIL_HEIGHT = 300
const DOTS = 15

/**
 * ScrollRail — reading-progress indicator along the right page edge: a pellet
 * trail the mascot icon eats as the page scrolls. Visual only; it is
 * aria-hidden, takes no pointer events and controls nothing.
 */
function ScrollRail() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const [eaten, setEaten] = useState(0)

  const y = useTransform(scrollYProgress, [0, 1], [0, RAIL_HEIGHT])

  // Rounds to a whole pellet, so React only re-renders 15 times per page.
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setEaten(Math.round(value * DOTS))
  })

  if (shouldReduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative h-[300px]">
        <DotTrail
          count={DOTS}
          eaten={eaten}
          orientation="vertical"
          gap="gap-0"
          dotClass="h-1.5 w-1.5"
          className="h-full justify-between"
        />
        <m.div className="absolute -left-2.5 -top-3" style={{ y }}>
          <Mascot size={26} className="rotate-90" />
        </m.div>
      </div>
    </div>
  )
}

export default ScrollRail
