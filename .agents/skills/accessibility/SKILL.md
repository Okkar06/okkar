---
name: accessibility
description: Use this skill when working on accessibility (a11y) for the portfolio website. Triggers include: adding ARIA labels, fixing keyboard navigation, improving color contrast, handling focus states, screen reader support, or running accessibility audits.
---

# accessibility

## Goal
Meet WCAG 2.1 Level AA standards.

## Core Principles (POUR)
- Perceivable — content visible/audible to all users
- Operable — fully keyboard navigable
- Understandable — clear language and predictable behavior
- Robust — works with assistive technologies

## Semantic HTML
- Use proper heading hierarchy: h1 → h2 → h3 (never skip levels)
- Use <nav>, <main>, <header>, <footer>, <section>, <article>
- Use <button> for actions, <a> for navigation (never div/span for clicks)

## ARIA Labels
# Buttons without visible text
<button aria-label="Close menu">X</button>

# Icons
<svg aria-hidden="true" focusable="false">...</svg>

# Landmark regions
<nav aria-label="Main navigation">
<section aria-labelledby="projects-heading">

## Keyboard Navigation
- All interactive elements must be focusable (Tab key)
- Focus order must follow visual/logical order
- Visible focus ring required (never outline: none without replacement)
- Escape key closes modals/menus
- Arrow keys navigate within menus

## Tailwind Focus Styles
# Always include focus-visible styles
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"

## Color Contrast
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+): minimum 3:1 contrast ratio
- Use https://webaim.org/resources/contrastchecker/ to verify
- Accent blue #3b82f6 on dark #0f0f0f: ✓ passes AA

## Images & Media
- All images must have descriptive alt text
- Decorative images: alt=""
- No information conveyed by color alone

## Forms (Contact Form)
<label htmlFor="name">Name</label>
<input id="name" aria-required="true" aria-describedby="name-error" />
<span id="name-error" role="alert">Name is required</span>

## Motion & Animations
- Respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * { animation: none; transition: none; }
}

## Auditing Tools
- axe DevTools (browser extension)
- Lighthouse accessibility audit
- NVDA / VoiceOver screen reader testing

## Examples
- "Button has no label" → add aria-label attribute
- "Low color contrast" → adjust Tailwind color classes
- "Keyboard trap in modal" → implement focus trap with useRef