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
      "I'm a full-stack developer who designs and ships end-to-end web apps — from polished, responsive interfaces to secure APIs and production-ready deployments. I enjoy building products with strong validation and real-world logic, like shift/pay calculations and role-based workflows.",
    nowText:
      'Finishing up my portfolio and actively looking for full-stack developer roles in Singapore.',
    photoSrc: '/profilepic.png',
    available: true,
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Supabase', 'Postgres', 'Tailwind', 'Zustand'],
    marquee: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Zustand', 'Node.js', 'Express', 'Supabase', 'Postgres', 'Render', 'REST APIs', 'Prisma'],
    projects: [
      {
        title: 'Trackify — Shift & Pay Tracker',
        description:
          'A desktop-first shift/pay tracking web app for part-time workers in Singapore. Log entries, calculate payable hours across different rates, view calendar KPIs, and export CSV/PDF. Optional roster screenshot upload extracts day-by-day shifts via AI.',
        tags: ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Node.js', 'Express', 'Supabase'],
        date: 'Apr 2026',
        primaryUrl: 'https://trackify-qqyh.onrender.com',
        secondaryUrl: 'https://github.com/Okkar06/Trackify.git',
      },
      {
        title: 'Oasis Spa — Luxury Wellness Platform',
        description:
          'A full-stack spa management system with appointment booking, member care packages, vouchers, and revenue analytics. Built for Asian wellness traditions with a dark luxury theme.',
        tags: ['React', 'TypeScript', 'Tailwind', 'Express', 'Node.js', 'PostgreSQL'],
        date: 'Jun 2026',
        primaryUrl: '',
        secondaryUrl: 'https://github.com/Okkar06/Oasis-Spa',
      },
      {
        title: 'SDC Audio Guide — QR-Driven Museum Audio Platform',
        description:
          'Replaces physical audio guide hardware at the Singapore Discovery Centre: visitors scan QR codes to stream multilingual audio with karaoke-style subtitles, while admins manage content via a dashboard with TTS generation, RBAC, audit logging, and playback analytics.',
        tags: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT', 'Google TTS'],
        date: 'Oct 2025',
        primaryUrl: '',
        secondaryUrl: 'https://github.com/SP-SOC-KH/project-2-group-2',
      },
      {
        title: 'SilverCare — Home Support Booking Portal',
        description:
          'A full-stack home care platform where customers book elderly care services, pay via Stripe, and track appointments — backed by role-based access for admins and caregivers and a Spring Boot microservice for booking data.',
        tags: ['Jakarta EE', 'Java', 'PostgreSQL', 'Stripe', 'JSP', 'Tomcat', 'BCrypt', 'REST API'],
        date: 'Feb 2026',
        primaryUrl: '',
        secondaryUrl: 'https://github.com/ShaneSWA06/j2ee-project',
      },
      {
        title: 'AR Treasure Hunt — Secure Gamified Learning Platform',
        description:
          'A full-stack gamified learning app where users scan QR codes to unlock timed quizzes, earn skill points, and adopt virtual pets — secured with JWT auth, RBAC route protection, Helmet.js headers, and parameterized SQL across every database operation.',
        tags: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'BCrypt', 'Helmet', 'REST API'],
        date: 'May 2025',
        primaryUrl: '',
        secondaryUrl: 'https://github.com/Okkar06/SecureProjectCA1',
      },
      {
        placeholder: true,
        title: 'More work on the way',
        description: 'New projects in progress — check back soon or visit my GitHub to see what I\'m building next.',
        primaryUrl: 'https://github.com/Okkar06',
      },
    ],
    contact: {
      email: 'okkarhein09@gmail.com',
      githubUrl: 'https://github.com/Okkar06',
      linkedinUrl: 'https://www.linkedin.com/in/okkar-hein',
    },
  }

  const pageVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } }

  return (
    <motion.div
      className="relative min-h-screen"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >

      <CursorDot />

      <Navbar
        name={content.name.first}
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
          ctaLabel="See my work"
          available={content.available}
        />
        <AboutSection
          bio={content.aboutBio}
          skills={content.skills}
          marqueeItems={content.marquee}
          photoSrc={content.photoSrc}
          nowText={content.nowText}
        />
        <ProjectsSection projects={content.projects} />
        <ContactSection {...content.contact} />
      </main>

      <Footer
        name={content.name.first}
        githubUrl={content.contact.githubUrl}
        linkedinUrl={content.contact.linkedinUrl}
      />
    </motion.div>
  )
}

export default App
