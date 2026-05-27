import HeroSection from './sections/HeroSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'
import ContactSection from './sections/ContactSection'

function App() {
  return (
    <div className="min-h-screen bg-bg text-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-bg/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#about" className="text-lg font-bold text-white">
            Okkar
          </a>
          <div className="flex gap-4 text-sm text-gray-300 md:gap-6">
            <a href="#projects" className="hover:text-accent">Projects</a>
            <a href="#skills" className="hover:text-accent">Skills</a>
            <a href="#contact" className="hover:text-accent">Contact</a>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
    </div>
  )
}

export default App
