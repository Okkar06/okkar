import { LazyMotion, domAnimation } from 'framer-motion'
import CursorDot from './components/CursorDot'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import NotFound from './components/NotFound'
import ScrollRail from './components/ScrollRail'
import { CONTENT, NAV_LINKS, SECTION_IDS } from './data/content'
import { describePath, isHomePath } from './lib/route'
import AboutSection from './sections/AboutSection'
import ContactSection from './sections/ContactSection'
import HeroSection from './sections/HeroSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'

const skipLink =
  'sr-only rounded-tile border-2 border-wall bg-void px-4 py-2 font-pixel text-pixel-sm uppercase tracking-hud text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80]'

/** Backdrop and scanlines shared by every screen, including the 404. */
function Cabinet({ children }) {
  return (
    <div className="relative isolate min-h-screen">
      {/* Theme-coloured glows + pellet grid behind the whole page. */}
      <div aria-hidden="true" className="cabinet-backdrop pointer-events-none fixed inset-0 -z-10" />
      {/* Faux-CRT scanlines over the whole cabinet — decoration only. */}
      <div aria-hidden="true" className="crt-overlay pointer-events-none fixed inset-0 z-[70]" />
      {children}
    </div>
  )
}

function Home() {
  return (
    <>
      <a href="#main" className={skipLink}>
        Skip to content
      </a>

      <CursorDot />
      <ScrollRail />
      <Navbar links={NAV_LINKS} sectionIds={SECTION_IDS} />

      {/* Each section has its own boundary: if one crashes, the others and
          the navigation keep working. */}
      <main id="main" className="relative">
        <ErrorBoundary>
          <HeroSection
            firstName={CONTENT.name.first}
            lastName={CONTENT.name.last}
            tagline={CONTENT.tagline}
            available={CONTENT.available}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <AboutSection
            bio={CONTENT.aboutBio}
            highlights={CONTENT.aboutHighlights}
            photo={CONTENT.photo}
            nowText={CONTENT.nowText}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <ProjectsSection projects={CONTENT.projects} />
        </ErrorBoundary>

        <ErrorBoundary>
          <SkillsSection groups={CONTENT.skillGroups} />
        </ErrorBoundary>

        <ErrorBoundary>
          <ContactSection {...CONTENT.contact} available={CONTENT.available} />
        </ErrorBoundary>
      </main>

      <Footer
        name={CONTENT.name.first}
        githubUrl={CONTENT.contact.githubUrl}
        linkedinUrl={CONTENT.contact.linkedinUrl}
      />
    </>
  )
}

/**
 * The site is one page; any path other than "/" is a 404 (the server sends
 * that status too). The path is a prop only so tests can render either screen.
 *
 * Framer Motion is loaded lean: LazyMotion with the `m` components and the
 * domAnimation feature set, instead of the full `motion` import. `strict`
 * makes a stray `motion.div` (which would pull the rest back in) fail loudly.
 * The features are bundled, not fetched on demand, on purpose: reveals start
 * hidden, so a failed chunk on a bad connection would leave content invisible.
 */
function App({ pathname = window.location.pathname }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <ErrorBoundary scope="page">
        <Cabinet>{isHomePath(pathname) ? <Home /> : <NotFound path={describePath(pathname)} />}</Cabinet>
      </ErrorBoundary>
    </LazyMotion>
  )
}

export default App
