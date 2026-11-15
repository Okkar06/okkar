import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import DarkModeToggle from './DarkModeToggle'
import Mascot from './Mascot'
import PowerDot from './PowerDot'
import { useActiveSection } from '../hooks/useActiveSection'

const SECTION_IDS = ['top', 'about', 'projects', 'skills', 'contact']

function Navbar({ links }) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const activeId = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
        aria-current={isActive ? 'true' : undefined}
        className={`maze-tile flex items-center gap-2 px-3 py-2 ${
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
        className="flex items-center justify-between border-b border-wall/25 px-4 py-1 sm:px-6"
      >
        <span className="hud-label animate-hud-flicker">1UP</span>
        <span className="hud-label hidden sm:inline">HIGH SCORE</span>
        <span className="hud-label text-mascot-ink">READY!</span>
      </div>

      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <a
            href="#top"
            className="flex items-center gap-2 font-pixel text-[0.6rem] uppercase tracking-hud text-ink"
          >
            <Mascot size={22} />
            <span className="hidden sm:inline">OKKAR</span>
          </a>

          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => renderLink(link))}
            <DarkModeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <DarkModeToggle />
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              aria-controls="arcade-mobile-nav"
              onClick={() => setIsOpen((prev) => !prev)}
              className="maze-tile grid h-9 w-9 place-items-center"
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
          <motion.div
            id="arcade-mobile-nav"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="border-t-2 border-wall/40 bg-void px-4 pb-5 pt-4 md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2.5">
              {links.map((link) => renderLink(link, { onNavigate: () => setIsOpen(false) }))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
