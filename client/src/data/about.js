// =====================================================================
//  ABOUT ME
//  This file feeds: the House panel in the game, the loading screen,
//  the plain view (plain.html) and the <meta> description tags.
//
//  PRIVACY RULE: never put a home address, phone number or other
//  private details in this file. Everything here is public.
// =====================================================================

export const about = {
  // Full name comes from the old portfolio (it used "Okkar Hein").
  name: 'Okkar Hein',
  // Short name used in friendly places like "Okkar's Village".
  shortName: 'Okkar',

  // One-line headline (reused from the old portfolio tagline).
  headline: 'Full-stack developer building clean UIs and reliable systems.',

  location: 'Singapore',

  // Path is relative to the /public folder. Swap the file to change the photo.
  photo: 'images/profile.jpg',
  photoAlt: 'Portrait of Okkar Hein',

  // DRAFT pitch written from the facts below.
  // TODO: rewrite these 1-2 sentences in your own words.
  pitch:
    'I build production-style web apps end to end: React front ends, Node.js APIs, ' +
    'PostgreSQL databases and automated cloud deployments. I am looking for a web ' +
    'development or software engineering role in Singapore where I can ship real features from day one.',

  // Longer summary. The second paragraph is reused from the old portfolio.
  summary: [
    'Self-directed full-stack developer who builds production-style web apps. ' +
      'I started with Java, then moved into full-stack JavaScript (React, Node.js) and cloud deployment.',
    'I design and ship end-to-end web apps, from polished, responsive interfaces to secure APIs ' +
      'and production-ready deployments. I enjoy building products with strong validation and ' +
      'real-world logic, like shift/pay calculations and role-based workflows.',
  ],

  education: {
    school: 'Singapore Polytechnic',
    course: 'Diploma in Information Technology',
    year: 'Year 3',
    expectedGraduation: 'April 2027',
  },

  // What I'm looking for. Shown in the "Open to work" banner everywhere.
  openToWork: {
    isOpen: true,
    targetRole: 'Web development / software engineer',
    roleTypes: 'Internship or junior / graduate role',
    location: 'Singapore',
    availability: 'TODO: add availability date',
  },
}
