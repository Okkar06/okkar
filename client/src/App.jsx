import { motion, useReducedMotion } from 'framer-motion'
import CursorDot from './components/CursorDot'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AboutSection from './sections/AboutSection'
import HeroSection from './sections/HeroSection'
import ProjectsSection from './sections/ProjectsSection'
import ContactSection from './sections/ContactSection'

function App() {
  const shouldReduceMotion = useReducedMotion()

  const content = {
    name: {
      first: 'Okkar',
      last: 'Hein',
    },
    tagline: 'Full-stack developer building clean UIs and reliable systems.',
    aboutBio:
      'I’m a full-stack developer who designs and ships end-to-end web apps—from polished, responsive interfaces to secure APIs and production-ready deployments. I enjoy building products with strong validation and “real-world” logic, like shift/pay calculations and role-based workflows.',
    photoSrc: '/profilepic.png',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Supabase', 'Postgres', 'Tailwind', 'Zustand'],
    marquee: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Zustand', 'Node.js', 'Express', 'Supabase', 'Postgres', 'Render', 'REST APIs', 'Auth'],
    projects: [
      {
        title: 'Trackify — Shift & Pay Tracker (AI Roster Extraction)',
        description:
          'A desktop-first shift/pay tracking web app for part-time workers in Singapore. Log entries, calculate payable hours across different rates, view calendar KPIs, and export CSV/PDF. Optional roster screenshot upload extracts day-by-day shifts into structured entries.',
        tags: ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Node.js', 'Express', 'Supabase'],
        date: 'Apr 2026',
        primaryUrl: 'https://trackify-qqyh.onrender.com',
        secondaryUrl: 'https://github.com/Okkar06/Trackify.git',
      },
      {
        title: 'Food Delivery Management System',
        description:
          'A full-stack food delivery platform with responsive UI, REST APIs, authentication, restaurant/menu management, order processing, and real-time order status updates.',
        tags: ['React', 'REST API', 'Auth', 'Backend'],
        date: 'May 2025',
        primaryUrl: '[LIVE DEMO LINK]',
        secondaryUrl: 'https://github.com/Okkar06/Food_Delivery_Management_System',
      },
      {
        title: '[Project Three Title]',
        description: '[Short description of the project and what problem it solves.]',
        tags: ['[Tech 1]', '[Tech 2]'],
        date: '[Month YYYY]',
        primaryUrl: '[LIVE DEMO LINK]',
        secondaryUrl: '[GITHUB LINK]',
      },
    ],
    contact: {
      email: 'oakkarhein.eduvalor.2023c@gmail.com',
      githubUrl: 'https://github.com/Okkar06',
      linkedinUrl: 'https://www.linkedin.com/in/okkar-hein',
    },
  }

  const pageVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } } }

  return (
    <motion.div
      className="relative min-h-screen bg-bg text-neutral-200"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,66,245,0.22),transparent_55%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />

      <CursorDot />

      <Navbar
        name={
          <>
            {/* REPLACE: Logo / name */}
            {content.name.first}
          </>
        }
        links={[
          { label: 'About', href: '#about' },
          { label: 'Projects', href: '#projects' },
          { label: 'Contact', href: '#contact' },
        ]}
      />

      <main className="relative">
        <HeroSection
          firstName={content.name.first}
          lastName={content.name.last}
          tagline={content.tagline}
          ctaLabel="See projects"
        />
        <AboutSection bio={content.aboutBio} skills={content.skills} marqueeItems={content.marquee} photoSrc={content.photoSrc} />
        <ProjectsSection projects={content.projects} />
        <ContactSection {...content.contact} />
      </main>

      <Footer name={content.name.first} githubUrl={content.contact.githubUrl} linkedinUrl={content.contact.linkedinUrl} />
    </motion.div>
  )
}

export default App
