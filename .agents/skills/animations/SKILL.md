---
name: animations
description: Use this skill when adding animations or transitions to the portfolio website. Triggers include: adding scroll animations, hover effects, page transitions, loading animations, or interactive micro-animations using Framer Motion or Tailwind CSS transitions.
---

# animations

## Stack
- Framer Motion (primary animation library)
- Tailwind CSS transitions (simple hover/focus effects)

## Installation
npm install framer-motion

## Core Patterns

### Fade In on Scroll
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

<motion.div
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {children}
</motion.div>

### Staggered Children (e.g. project cards)
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
}

<motion.div variants={container} initial="hidden" whileInView="visible">
  {projects.map(p => (
    <motion.div key={p.id} variants={fadeInUp}>{p.name}</motion.div>
  ))}
</motion.div>

### Hover Effects (Tailwind)
className="transition-transform duration-300 hover:scale-105 hover:shadow-lg"

### Button Press Effect
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  Click Me
</motion.button>

### Page Load Hero Animation
const heroVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
}

## Reduced Motion
import { useReducedMotion } from 'framer-motion'
const shouldReduce = useReducedMotion()
const transition = shouldReduce ? { duration: 0 } : { duration: 0.6 }

## Conventions
- Always use viewport={{ once: true }} for scroll animations
- Keep animations subtle — duration between 0.3s–0.8s
- Never animate layout-affecting properties (width, height) — use transform/opacity
- Always respect prefers-reduced-motion via useReducedMotion hook
- Stagger delays max 0.2s per item to avoid feeling slow

## Examples
- "Animate section on scroll" → use motion.div with fadeInUp + whileInView
- "Animate project cards" → use staggered container pattern
- "Button feels flat" → add whileHover + whileTap with scale