/**
 * Everything the site says. Components take this as props and contain no copy
 * of their own, so editing the portfolio means editing this file only.
 *
 * The section ids double as the in-page link targets used by the navigation.
 */
export const SECTION_IDS = ['top', 'about', 'projects', 'skills', 'contact']

// The attract-mode tour (PRESS START) visits these, in order.
export const TOUR_STOPS = [
  { id: 'top', label: 'Title screen' },
  { id: 'about', label: 'Player profile' },
  { id: 'projects', label: 'Stage select' },
  { id: 'skills', label: 'Bonus items' },
  { id: 'contact', label: 'High score entry' },
]

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Stages', href: '#projects' },
  { label: 'Items', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export const CONTENT = {
  name: { first: 'Okkar', last: 'Hein' },
  tagline: 'Full-stack developer building clean UIs and reliable systems.',
  aboutBio:
    "I'm a full-stack developer who designs and ships end-to-end web apps — from polished, responsive interfaces to secure APIs and production-ready deployments. I enjoy building products with strong validation and real-world logic, like shift/pay calculations and role-based workflows.",
  aboutHighlights: [
    'Year 3 IT student at Singapore Polytechnic, shipping production-grade side projects.',
    'Comfortable across the whole stack: React front ends, Express APIs, Postgres and Prisma.',
    'Security-minded by habit — validation, parameterised queries and hardened headers.',
  ],
  nowText:
    'Finishing up my portfolio and actively looking for full-stack developer roles in Singapore.',
// Redrawn in the browser as a figure of binary digits (BinaryPortrait.jsx).
  // A plain, evenly lit background works best: it is cut away automatically.
  photo: {
    alt: 'Portrait of Okkar Hein, drawn in glowing binary digits',
    src: '/profilepic-480.webp',
  },
  available: true,
  skillGroups: [
    {
      title: 'Front end',
      stage: 'ITEM 1',
      items: [
        { label: 'React', shape: 'chip', color: 'cyan' },
        { label: 'TypeScript', shape: 'cube', color: 'cyan' },
        { label: 'JavaScript', shape: 'bolt', color: 'mascot' },
        { label: 'Tailwind', shape: 'star', color: 'cyan' },
        { label: 'Vite', shape: 'bolt', color: 'mascot' },
        { label: 'Zustand', shape: 'layers', color: 'pink' },
      ],
    },
    {
      title: 'Back end',
      stage: 'ITEM 2',
      items: [
        { label: 'Node.js', shape: 'cube', color: 'dot' },
        { label: 'Express', shape: 'chip', color: 'dot' },
        { label: 'Prisma', shape: 'layers', color: 'pink' },
        { label: 'PostgreSQL', shape: 'layers', color: 'orange' },
        { label: 'REST APIs', shape: 'twinOrb', color: 'red' },
        { label: 'JWT / auth', shape: 'key', color: 'mascot' },
      ],
    },
    {
      title: 'Craft & ops',
      stage: 'ITEM 3',
      items: [
        { label: 'Git & GitHub', shape: 'layers', color: 'dot' },
        { label: 'Render', shape: 'cube', color: 'orange' },
        { label: 'Supabase', shape: 'chip', color: 'cyan' },
        { label: 'Accessibility', shape: 'star', color: 'mascot' },
        { label: 'App security', shape: 'shield', color: 'red' },
        { label: 'Testing', shape: 'twinOrb', color: 'pink' },
      ],
    },
  ],
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
      title: 'SDC Audio Guide — QR Museum Audio',
      description:
        'Replaces physical audio guide hardware at the Singapore Discovery Centre: visitors scan QR codes to stream multilingual audio with karaoke-style subtitles, while admins manage content via a dashboard with TTS generation, RBAC, audit logging, and playback analytics.',
      tags: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT'],
      date: 'Oct 2025',
      primaryUrl: '',
      secondaryUrl: 'https://github.com/SP-SOC-KH/project-2-group-2',
    },
    {
      title: 'SilverCare — Home Support Booking',
      description:
        'A full-stack home care platform where customers book elderly care services, pay via Stripe, and track appointments — backed by role-based access for admins and caregivers and a Spring Boot microservice for booking data.',
      tags: ['Jakarta EE', 'Java', 'PostgreSQL', 'Stripe', 'JSP', 'Tomcat', 'BCrypt'],
      date: 'Feb 2026',
      primaryUrl: '',
      secondaryUrl: 'https://github.com/ShaneSWA06/j2ee-project',
    },
    {
      title: 'AR Treasure Hunt — Gamified Learning',
      description:
        'A full-stack gamified learning app where users scan QR codes to unlock timed quizzes, earn skill points, and adopt virtual pets — secured with JWT auth, RBAC route protection, Helmet.js headers, and parameterized SQL across every database operation.',
      tags: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'BCrypt', 'Helmet'],
      date: 'May 2025',
      primaryUrl: '',
      secondaryUrl: 'https://github.com/Okkar06/SecureProjectCA1',
    },
    {
      placeholder: true,
      title: 'More work on the way',
      description:
        "New projects in progress — check back soon or visit my GitHub to see what I'm building next.",
      primaryUrl: 'https://github.com/Okkar06',
    },
  ],
  contact: {
    email: 'okkarhein09@gmail.com',
    githubUrl: 'https://github.com/Okkar06',
    linkedinUrl: 'https://www.linkedin.com/in/okkar-hein',
  },
}
