// =====================================================================
//  PLAIN VIEW + LOADING SCREEN TEXT
//
//  These two functions build big HTML strings from the data files.
//  vite.config.js calls them at build time and pastes the result into
//  plain.html and index.html. That means the text is real HTML that
//  search engines, link previews and screen readers can read.
// =====================================================================

import {
  escapeHtml,
  isMissing,
  renderOpenToWork,
  renderAbout,
  renderProjectDetail,
  renderSkills,
  renderExperience,
  renderContact,
  renderResumeButton,
} from './sectionsHtml.js'

// `data` = { about, projects, skills, education, work, contact }
export function renderPlainPage(data, ctx) {
  const about = data.about
  const contact = data.contact
  let html = ''

  // ----- Header -----
  html += '<header class="plain-header">'
  html += '<div class="wrap">'
  html += '<p class="eyebrow">Portfolio · ' + escapeHtml(about.location) + '</p>'
  html += '<h1>' + escapeHtml(about.name) + '</h1>'
  html += '<p class="lead">' + escapeHtml(about.headline) + '</p>'
  html += renderOpenToWork(about)
  html += '<div class="btn-row">'
  html += '<a class="btn btn-primary" href="mailto:' + escapeHtml(contact.email) + '">Email me</a>'
  html += renderResumeButton(contact, ctx)
  if (!isMissing(contact.linkedinUrl)) {
    html += '<a class="btn" href="' + escapeHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
  }
  if (!isMissing(contact.githubUrl)) {
    html += '<a class="btn" href="' + escapeHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer">GitHub</a>'
  }
  html += '<a class="btn btn-game" href="./">Play the village version</a>'
  html += '</div>'
  html += '<nav class="plain-nav" aria-label="Sections">'
  html += '<a href="#about">About</a><a href="#projects">Projects</a><a href="#skills">Skills</a>'
  html += '<a href="#education">Education</a><a href="#contact">Contact</a>'
  html += '</nav>'
  html += '</div>'
  html += '</header>'

  html += '<main class="wrap">'

  // ----- About -----
  html += '<section id="about" class="card"><h2>About me</h2>'
  html += renderAbout(about, contact, ctx)
  html += '</section>'

  // ----- Projects (one article per project, generated in a loop) -----
  html += '<section id="projects"><h2>Projects</h2>'
  for (let i = 0; i < data.projects.length; i++) {
    const project = data.projects[i]
    html += '<article class="card project" id="project-' + escapeHtml(project.id) + '">'
    html += '<h3>' + escapeHtml(project.title) + '</h3>'
    html += renderProjectDetail(project, ctx)
    html += '</article>'
  }
  html += '</section>'

  // ----- Skills -----
  html += '<section id="skills" class="card"><h2>Skills</h2>'
  html += renderSkills(data.skills)
  html += '</section>'

  // ----- Education / experience -----
  html += '<section id="education" class="card"><h2>Education &amp; experience</h2>'
  html += renderExperience(data.education, data.work)
  html += '</section>'

  // ----- Contact -----
  html += '<section id="contact" class="card"><h2>Contact</h2>'
  html += renderContact(contact, about, ctx)
  html += '</section>'

  html += '</main>'

  html += '<footer class="plain-footer wrap">'
  html += '<p>© ' + escapeHtml(about.name) + ' · <a href="./">Village version</a></p>'
  html += '</footer>'
  return html
}

// The text shown on the game's loading screen. A recruiter who never
// presses "Enter" still sees who I am, what I want and how to reach me.
export function renderGameIntro(data, ctx) {
  const about = data.about
  const contact = data.contact
  const projects = data.projects

  let html = '<h1 class="intro-name">' + escapeHtml(about.name) + '</h1>'
  html += '<p class="intro-headline">' + escapeHtml(about.headline) + '</p>'
  html += renderOpenToWork(about)
  html += '<p class="intro-pitch">' + escapeHtml(about.pitch) + '</p>'

  // A few project names so the page has real keywords even before the game loads.
  html += '<p class="intro-projects"><span>Projects:</span> '
  for (let i = 0; i < projects.length; i++) {
    if (i > 0) html += ' · '
    html += '<a href="plain.html#project-' + escapeHtml(projects[i].id) + '">' + escapeHtml(projects[i].title) + '</a>'
  }
  html += '</p>'

  html += '<p class="intro-contact"><a href="mailto:' + escapeHtml(contact.email) + '">' + escapeHtml(contact.email) + '</a>'
  if (!isMissing(contact.linkedinUrl)) {
    html += ' · <a href="' + escapeHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
  }
  if (!isMissing(contact.githubUrl)) {
    html += ' · <a href="' + escapeHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer">GitHub</a>'
  }
  html += '</p>'
  return html
}

// One-sentence description for <meta name="description"> and link previews.
export function renderMetaDescription(about) {
  return (
    about.name + ', ' + about.location + '-based full-stack developer (' +
    about.education.course + ', ' + about.education.school + '). Open to ' +
    about.openToWork.targetRole.toLowerCase() + ' roles. React, Node.js, PostgreSQL and cloud deployment.'
  )
}
