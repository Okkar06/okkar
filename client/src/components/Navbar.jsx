import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import Mascot from './Mascot'
import ModeToggle from './ModeToggle'
import PowerDot from './PowerDot'
import { useActiveSection } from '../hooks/useActiveSection'

const MOBILE_NAV_ID = 'arcade-mobile-nav'
// Tailwind's `md` breakpoint: above it the links sit in the bar itself.
const DESKTOP_QUERY = '(min-width: 768px)'

function Navbar({ links, sectionIds }) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const activeId = useActiveSection(sectionIds)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const close = () => setIsOpen(false)

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      close()
      // The menu is about to unmount; put focus back on what opened it.
      menuButtonRef.current?.focus()
    }

    // Close on anything that makes the open menu stale: growing past the
    // mobile breakpoint, or the URL hash changing (link, back, forward).
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const handleBreakpoint = (event) => {
      if (event.matches) close()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('hashchange', close)
    desktop.addEventListener('change', handleBreakpoint)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('hashchange', close)
      desktop.removeEventListener('change', handleBreakpoint)
    }
  }, [isOpen])

  const menuVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -8 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      }

  const renderLink = (link, { onNavigate } = {}) => {
    const isActive = activeId === link.href.replace('#', '')
    return (
      <a
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={isActive ? 'location' : undefined}
        className={`maze-tile chomp flex items-center gap-2 px-3 py-2.5 ${
          isActive ? 'border-wall text-hud shadow-glow-wall' : 'hover:text-hud'
        }`}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {isActive ? <Mascot size={16} chomping={false} /> : <PowerDot size="sm" />}
        </span>
        {link.label}
      </a>
    )
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-wall/50 bg-void/[0.92] backdrop-blur-md">
      {/* Decorative arcade HUD strip — display text only, no real score. */}
      <div
        aria-hidden="true"
        className="flex items-center justify-between border-b border-wall/25 px-4 py-1.5 sm:px-6"
      >
        <span className="hud-label motion-safe:animate-hud-flicker">1UP</span>
        <span className="hud-label hidden sm:inline">HIGH SCORE</span>
        <span className="hud-label text-mascot-ink">READY!</span>
      </div>

      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <a
            href="#top"
            aria-label="Okkar — back to top"
            className="flex items-center gap-2 font-pixel text-pixel-sm uppercase tracking-hud text-ink"
          >
            <Mascot size={22} />
            <span className="hidden sm:inline">OKKAR</span>
          </a>

          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => renderLink(link))}
            <ColorPicker />
            <ModeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ColorPicker />
            <ModeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls={MOBILE_NAV_ID}
              onClick={() => setIsOpen((prev) => !prev)}
              className="maze-tile chomp grid h-9 w-9 place-items-center"
            >
              <span aria-hidden="true" className="relative block h-3.5 w-4">
                <span className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-transform duration-200 ${isOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-[6px] h-0.5 w-full bg-current transition-opacity duration-200 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 top-[12px] h-0.5 w-full bg-current transition-transform duration-200 ${isOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <m.div
            id={MOBILE_NAV_ID}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="max-h-[calc(100vh-6rem)] overflow-y-auto border-t-2 border-wall/40 bg-void px-4 pb-5 pt-4 md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2.5">
              {links.map((link) => renderLink(link, { onNavigate: () => setIsOpen(false) }))}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
