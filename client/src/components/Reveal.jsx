import { m, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// Play once, the first time the element is 15% on screen.
const IN_VIEW = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.15 } }

/**
 * With prefers-reduced-motion the wrapper renders as a plain element, so
 * nothing is ever left hidden waiting for an animation that will not run.
 */
function Animated({ as = 'div', motionProps, children, ...rest }) {
  const reduceMotion = useReducedMotion()
  const Tag = reduceMotion ? as : m[as]

  return (
    <Tag {...(reduceMotion ? null : motionProps)} {...rest}>
      {children}
    </Tag>
  )
}

/**
 * The one scroll-reveal used by every section: content rises and fades in
 * once as it enters the viewport. Opacity and transform only.
 */
export function Reveal(props) {
  return <Animated motionProps={{ variants: RISE, ...IN_VIEW }} {...props} />
}

/** Wraps a set of <RevealItem>s so they arrive one after another. */
export function RevealGroup(props) {
  return <Animated motionProps={{ variants: STAGGER, ...IN_VIEW }} {...props} />
}

/** A child of <RevealGroup>; the group drives it, not the viewport. */
export function RevealItem(props) {
  return <Animated motionProps={{ variants: RISE }} {...props} />
}
