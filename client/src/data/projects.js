// =====================================================================
//  PROJECTS
//  One object = one project. The Workshop builds one shelf per object
//  (in a loop), and the plain view lists them in the same order.
//
//  To add a project: copy one object, paste it at the end of the
//  array, and change the values. No game code needs to change.
//
//  Fields:
//    id          unique, lowercase, no spaces (used for links like #project-trackify)
//    title       project name
//    summary     one or two sentences shown on cards
//    problem     what problem it solves
//    whatIBuilt  what you actually built (features)
//    myRole      what YOU did (very important for team projects)
//    stack       array of technologies
//    screenshots array of { src, alt } — src is relative to /public
//    liveUrl     live demo link, or 'TODO: ...'
//    githubUrl   repo link, or 'TODO: ...'
//    date        optional, shown as a small label
//    variant     optional { title, note, stack, githubUrl } for a spin-off version
//
//  Anything not known yet is written as "TODO: ..." so the structure
//  stays intact. TODO values are shown as "coming soon" on the site.
// =====================================================================

export const projects = [
  {
    id: 'cleo-spa',
    title: 'Cleo Spa Management System',
    // Summary reuses the old portfolio's Oasis Spa text (Oasis-Spa was adapted from Cleo Spa).
    // TODO: confirm it matches Cleo Spa exactly.
    summary:
      'A full-stack spa management system with appointment booking, member care packages, ' +
      'vouchers and revenue analytics.',
    problem: 'TODO: describe the problem Cleo Spa had (who used it, what was slow or manual before).',
    whatIBuilt:
      'Appointment booking, member care packages, vouchers and revenue analytics, ' +
      'deployed through an Azure CI/CD pipeline. TODO: confirm and add 2-3 key features.',
    myRole: 'TODO: describe your role (solo or team? which parts did you own?)',
    stack: ['React 19', 'TypeScript', 'PostgreSQL', 'Azure CI/CD'],
    screenshots: [
      // TODO: add screenshots, e.g. { src: 'images/projects/cleo-spa-1.png', alt: 'Booking calendar' }
    ],
    liveUrl: 'TODO: add live demo link',
    githubUrl: 'TODO: add GitHub link',
    date: '',
    variant: {
      title: 'Oasis-Spa',
      note:
        'A variant adapted from Cleo Spa: a luxury wellness platform built for Asian wellness ' +
        'traditions with a dark luxury theme.',
      stack: ['Next.js 14', 'Express.js', 'Neon PostgreSQL'],
      githubUrl: 'https://github.com/Okkar06/Oasis-Spa',
    },
  },
  {
    id: 'trackify',
    title: 'Trackify — Shift & Pay Tracker',
    summary:
      'A shift and pay tracking web app for part-time workers in Singapore: log shifts, ' +
      'calculate pay across different rates and export reports.',
    problem:
      'Part-time workers juggle shifts paid at different rates and need an easy way to see ' +
      'how many payable hours they worked and what they are owed.',
    whatIBuilt:
      'A desktop-first app to log entries, calculate payable hours across different rates, ' +
      'view calendar KPIs and export CSV/PDF. An optional roster screenshot upload extracts ' +
      'day-by-day shifts using AI. Tested with Playwright.',
    myRole: 'TODO: describe your role (e.g. solo project: design, front end, API, database, tests).',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Node.js', 'Express', 'Supabase (PostgreSQL)', 'Playwright'],
    screenshots: [
      // TODO: add screenshots
    ],
    liveUrl: 'https://trackify-qqyh.onrender.com',
    githubUrl: 'https://github.com/Okkar06/Trackify',
    date: 'Apr 2026',
  },
  {
    id: 'soc-discovery-portal',
    title: 'SoC Discovery Portal',
    summary: 'TODO: one or two sentences about the SoC Discovery Portal.',
    problem: 'TODO: describe the problem it solves and who it is for.',
    whatIBuilt: 'TODO: describe the WebXR / real-time features you built.',
    myRole: 'TODO: describe your role.',
    stack: ['React', 'Node.js', '8th Wall WebXR', 'Socket.io'],
    screenshots: [],
    liveUrl: 'TODO: add live demo link',
    githubUrl: 'TODO: add GitHub link',
    date: '',
  },
  {
    id: 'silvercare',
    title: 'SilverCare — Home Support Portal',
    summary:
      'A full-stack home care platform where customers book elderly care services, pay via ' +
      'Stripe and track appointments.',
    problem: 'Customers need one place to book home support services for the elderly, pay online and track their appointments.',
    whatIBuilt:
      'Service booking with Stripe payments and appointment tracking, role-based access for ' +
      'admins and caregivers, and a Spring Boot microservice for booking data.',
    myRole: 'TODO: describe your role (this repo is a team project; say which parts you built).',
    stack: ['Jakarta EE', 'Java', 'Spring Boot', 'PostgreSQL', 'Stripe', 'JSP', 'Tomcat'],
    screenshots: [],
    liveUrl: 'TODO: add live demo link',
    githubUrl: 'https://github.com/ShaneSWA06/j2ee-project',
    date: 'Feb 2026',
  },
  {
    id: 'sdc-audio-guide',
    title: 'Museum Audio Guide — Singapore Discovery Centre',
    summary:
      'A QR-driven museum audio platform: visitors scan QR codes to stream multilingual audio ' +
      'with karaoke-style subtitles.',
    problem: 'Replaces physical audio guide hardware at the Singapore Discovery Centre.',
    whatIBuilt:
      'Visitor flow with QR scanning, multilingual audio streaming and karaoke-style subtitles; ' +
      'an admin dashboard with a Google Text-to-Speech generation pipeline, role-based access ' +
      'control, audit logging and playback analytics.',
    myRole: 'TODO: describe your role (team project; which parts did you own?)',
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT', 'Google Text-to-Speech'],
    screenshots: [],
    liveUrl: 'TODO: add live demo link',
    githubUrl: 'https://github.com/SP-SOC-KH/project-2-group-2',
    date: 'Oct 2025',
  },

  // ---------------------------------------------------------------
  // Found in your old portfolio but not in your starter list.
  // Remove the /* and */ around it to show it in the Workshop.
  // ---------------------------------------------------------------
  /*
  {
    id: 'ar-treasure-hunt',
    title: 'AR Treasure Hunt — Secure Gamified Learning Platform',
    summary:
      'A full-stack gamified learning app where users scan QR codes to unlock timed quizzes, ' +
      'earn skill points and adopt virtual pets.',
    problem: 'TODO: describe the problem.',
    whatIBuilt:
      'QR-unlocked timed quizzes, skill points and virtual pets, secured with JWT auth, RBAC ' +
      'route protection, Helmet.js headers and parameterized SQL across every database operation.',
    myRole: 'TODO: describe your role.',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'BCrypt', 'Helmet'],
    screenshots: [],
    liveUrl: 'TODO: add live demo link',
    githubUrl: 'https://github.com/Okkar06/SecureProjectCA1',
    date: 'May 2025',
  },
  */
]
