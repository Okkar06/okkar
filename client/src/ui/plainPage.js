// =====================================================================
//  PLAIN VIEW + LOADING SCREEN TEXT
//
//  These two functions build big HTML strings from the data files.
//  vite.config.js calls them at build time and pastes the result into
//  plain.html and index.html. That means the text is real HTML that
//  search engines, link previews and screen readers can read.
// =====================================================================

import {
  assetUrl,
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

  // ----- Header: dusk, with the survey plate (the same identity as the game) -----
  html += '<header class="plain-header on-dusk">'
  html += '<div class="plain-hero">'
  html += '<div class="plain-hero-text">'
  html += '<h1>' + escapeHtml(about.name) + '</h1>'
  html += '<p class="lead">' + escapeHtml(about.headline) + '</p>'
  html += renderOpenToWork(about)
  html += '<div class="btn-row">'
  html += '<a class="btn btn-primary" href="mailto:' + escapeHtml(contact.email) + '">Email me</a>'
  html += renderResumeButton(contact, ctx)
  if (!isMissing(contact.linkedinUrl)) {
    html += '<a class="btn btn-ghost" href="' + escapeHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
  }
  if (!isMissing(contact.githubUrl)) {
    html += '<a class="btn btn-ghost" href="' + escapeHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer">GitHub</a>'
  }
  html += '</div>'
  html += '<p class="plain-game-link"><a href="./">Walk around the village version instead</a></p>'
  html += '</div>'
  html += '<figure class="plain-plate"><img src="' + escapeHtml(assetUrl(ctx, 'images/plate-hero.webp')) +
    '" width="1248" height="960" alt="The village drawn as a survey plate at dusk: houses with lit windows, fenced plots, a square with a fountain, and a lake." loading="eager"></figure>'
  html += '</div>'
  html += '</header>'

  html += '<nav class="plain-nav" aria-label="Sections"><div class="wrap">'
  html += '<a href="#about">About</a><a href="#projects">Projects</a><a href="#skills">Skills</a>'
  html += '<a href="#education">Education</a><a href="#contact">Contact</a>'
  html += '</div></nav>'

  html += '<main class="wrap">'

  // ----- About -----
  html += '<section id="about" class="plain-section"><h2>About me</h2>'
  html += renderAbout(about, contact, ctx)
  html += '</section>'

  // ----- Projects (one article per project, generated in a loop) -----
  html += '<section id="projects" class="plain-section"><h2>Projects</h2>'
  for (let i = 0; i < data.projects.length; i++) {
    const project = data.projects[i]
    html += '<article class="project" id="project-' + escapeHtml(project.id) + '">'
    html += '<h3>' + escapeHtml(project.title) + '</h3>'
    html += renderProjectDetail(project, ctx)
    html += '</article>'
  }
  html += '</section>'

  // ----- Skills -----
  html += '<section id="skills" class="plain-section"><h2>Skills</h2>'
  html += renderSkills(data.skills)
  html += '</section>'

  // ----- Education / experience -----
  html += '<section id="education" class="plain-section"><h2>Education &amp; experience</h2>'
  html += renderExperience(data.education, data.work)
  html += '</section>'

  // ----- Contact -----
  html += '<section id="contact" class="plain-section"><h2>Contact</h2>'
  html += renderContact(contact, about, ctx)
  html += '</section>'

  html += '</main>'

  html += '<footer class="plain-footer wrap">'
  html += '<p>© ' + escapeHtml(about.name) + '. The illustration is the village map, drawn as a survey plate at dusk.</p>'
  html += '</footer>'
  return html
}

// The text shown on the game's loading screen. A recruiter who never
// presses "Enter" still sees who I am, what I want and how to reach me.
export function renderGameIntro(data, ctx) {
  const about = data.about

  let html = '<h1 class="intro-name">' + escapeHtml(about.name) + '</h1>'
  html += '<p class="intro-headline">' + escapeHtml(about.headline) + '</p>'
  html += renderOpenToWork(about)
  html += '<p class="intro-pitch">' + escapeHtml(about.pitch) + '</p>'
  return html
}

// The quieter part of the intro, shown under the buttons: project names
// (real keywords for search engines even before the game loads) and contact links.
export function renderGameIntroMore(data) {
  const contact = data.contact
  const projects = data.projects
  let html = '<p class="intro-projects"><span>Projects:</span> '
  for (let i = 0; i < projects.length; i++) {
    if (i > 0) html += i === projects.length - 1 ? ' and ' : ', '
    html += '<a href="plain.html#project-' + escapeHtml(projects[i].id) + '">' + escapeHtml(projects[i].title) + '</a>'
  }
  html += '</p>'

  html += '<ul class="intro-contact"><li><a href="mailto:' + escapeHtml(contact.email) + '">' + escapeHtml(contact.email) + '</a></li>'
  if (!isMissing(contact.linkedinUrl)) {
    html += '<li><a href="' + escapeHtml(contact.linkedinUrl) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>'
  }
  if (!isMissing(contact.githubUrl)) {
    html += '<li><a href="' + escapeHtml(contact.githubUrl) + '" target="_blank" rel="noopener noreferrer">GitHub</a></li>'
  }
  html += '</ul>'
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
