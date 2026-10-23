// =====================================================================
//  SECTION HTML BUILDERS
//
//  Every function here takes data (from src/data) and returns an HTML
//  string. They do NOT touch the DOM, so the same code is used in two
//  places:
//    1. In the browser, to fill the game's pop-up panels.
//    2. At build time (in vite.config.js), to write the plain view
//       straight into plain.html, so recruiters and search engines get
//       real text even without JavaScript.
//
//  `ctx` (context) is a small settings object:
//    ctx.base            the site base path, e.g. "/" or "./"
//    ctx.resumeAvailable true when public/resume.pdf exists
//    ctx.showTodos       true in dev: show TODO text so you can spot it
//    ctx.mode            "panel" (inside the game) or "page" (plain view)
// =====================================================================

// Turn special characters into safe HTML so text can never break the page.
export function escapeHtml(value) {
  const text = String(value === undefined || value === null ? '' : value)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// A value counts as "missing" if it is empty or still a TODO placeholder.
export function isMissing(value) {
  if (value === undefined || value === null) return true
  const text = String(value).trim()
  return text === '' || text.toUpperCase().startsWith('TODO')
}

// Build a URL to a file in /public, respecting the base path.
export function assetUrl(ctx, path) {
  let base = ctx.base || '/'
  if (!base.endsWith('/')) base = base + '/'
  return base + path
}

// Text that might still be a TODO.
// In dev we show the TODO (highlighted) so you can find it.
// On the live site we show a polite fallback, or nothing.
function textOrPlaceholder(ctx, value, fallback) {
  if (!isMissing(value)) return escapeHtml(value)
  if (ctx.showTodos) return '<mark class="todo">' + escapeHtml(value || 'TODO') + '</mark>'
  if (fallback) return '<span class="muted">' + escapeHtml(fallback) + '</span>'
  return ''
}

function externalLink(url, label, className) {
  return (
    '<a class="' + className + '" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' +
    escapeHtml(label) +
    '</a>'
  )
}

// A list of small "chips" (used for stacks and skills).
function chipList(items) {
  let html = '<ul class="chips">'
  for (let i = 0; i < items.length; i++) {
    html += '<li class="chip">' + escapeHtml(items[i]) + '</li>'
  }
  html += '</ul>'
  return html
}

// ---------------------------------------------------------------------
//  Open to work
// ---------------------------------------------------------------------
export function renderOpenToWork(about) {
  const job = about.openToWork
  if (!job || !job.isOpen) return ''
  let html = '<div class="open-to-work">'
  html += '<span class="open-dot" aria-hidden="true"></span>'
  html += '<span><strong>Open to work:</strong> ' + escapeHtml(job.targetRole.toLowerCase())
  html += ' roles in ' + escapeHtml(job.location) + '</span>'
  html += '</div>'
  return html
}

// ---------------------------------------------------------------------
//  Résumé button (shared by the panels, HUD and plain view)
// ---------------------------------------------------------------------
export function renderResumeButton(contact, ctx) {
  if (ctx.resumeAvailable) {
    return (
      '<a class="btn btn-primary" href="' + escapeHtml(assetUrl(ctx, contact.resumePath)) +
      '" target="_blank" rel="noopener">Download résumé (PDF)</a>'
    )
  }
  // No PDF yet: still show a "button", but with a clear message.
  return '<span class="btn btn-disabled" aria-disabled="true">Résumé coming soon</span>'
}

// ---------------------------------------------------------------------
//  About (House)
// ---------------------------------------------------------------------
export function renderAbout(about, contact, ctx) {
  const job = about.openToWork
  let html = '<div class="about">'

  html += '<img class="about-photo" src="' + escapeHtml(assetUrl(ctx, about.photo)) +
    '" alt="' + escapeHtml(about.photoAlt) + '" width="160" height="213" loading="lazy">'

  html += '<div class="about-text">'
  html += '<p class="lead">' + escapeHtml(about.headline) + '</p>'
  html += '<p>' + escapeHtml(about.pitch) + '</p>'
  for (let i = 0; i < about.summary.length; i++) {
    html += '<p>' + escapeHtml(about.summary[i]) + '</p>'
  }
  html += '</div>'
  html += '</div>'

  html += '<h3>What I\'m looking for</h3>'
  html += '<dl class="facts">'
  html += '<dt>Role</dt><dd>' + escapeHtml(job.targetRole) + '</dd>'
  html += '<dt>Type</dt><dd>' + escapeHtml(job.roleTypes) + '</dd>'
  html += '<dt>Location</dt><dd>' + escapeHtml(job.location) + '</dd>'
  html += '<dt>Available</dt><dd>' + textOrPlaceholder(ctx, job.availability, 'Ask me') + '</dd>'
  html += '<dt>Studying</dt><dd>' + escapeHtml(about.education.course) + ', ' +
    escapeHtml(about.education.school) + ' (' + escapeHtml(about.education.year) +
    ', graduating ' + escapeHtml(about.education.expectedGraduation) + ')</dd>'
  html += '</dl>'

  html += '<div class="btn-row">' + renderResumeButton(contact, ctx)
  html += '<a class="btn" href="mailto:' + escapeHtml(contact.email) + '">Email me</a></div>'
  return html
}

// ---------------------------------------------------------------------
//  Projects (Workshop)
// ---------------------------------------------------------------------

// The live demo / GitHub buttons for one project.
function projectLinks(project, ctx) {
  let html = '<div class="btn-row">'
  if (!isMissing(project.liveUrl)) {
    html += externalLink(project.liveUrl, 'Live demo', 'btn btn-primary')
  } else if (ctx.showTodos) {
    html += '<mark class="todo">' + escapeHtml(project.liveUrl) + '</mark>'
  }
  if (!isMissing(project.githubUrl)) {
    html += externalLink(project.githubUrl, 'GitHub', 'btn')
  } else if (ctx.showTodos) {
    html += '<mark class="todo">' + escapeHtml(project.githubUrl) + '</mark>'
  }
  html += '</div>'
  return html
}

// Full details for one project.
export function renderProjectDetail(project, ctx) {
  let html = ''
  if (project.date) html += '<p class="muted small">' + escapeHtml(project.date) + '</p>'
  html += '<p class="lead">' + textOrPlaceholder(ctx, project.summary, '') + '</p>'

  html += '<dl class="project-facts">'
  html += '<dt>Problem</dt><dd>' + textOrPlaceholder(ctx, project.problem, 'Details coming soon.') + '</dd>'
  html += '<dt>What I built</dt><dd>' + textOrPlaceholder(ctx, project.whatIBuilt, 'Details coming soon.') + '</dd>'
  html += '<dt>My role</dt><dd>' + textOrPlaceholder(ctx, project.myRole, 'Details coming soon.') + '</dd>'
  html += '</dl>'

  html += '<h4>Stack</h4>' + chipList(project.stack)

  // Screenshots (if any)
  if (project.screenshots && project.screenshots.length > 0) {
    html += '<div class="shots">'
    for (let i = 0; i < project.screenshots.length; i++) {
      const shot = project.screenshots[i]
      html += '<img src="' + escapeHtml(assetUrl(ctx, shot.src)) + '" alt="' +
        escapeHtml(shot.alt || project.title + ' screenshot') + '" loading="lazy">'
    }
    html += '</div>'
  } else if (ctx.showTodos) {
    html += '<p><mark class="todo">TODO: add screenshots to this project</mark></p>'
  }

  // Optional "variant" (a spin-off version of the same project)
  if (project.variant) {
    const v = project.variant
    html += '<div class="variant">'
    html += '<h4>Variant: ' + escapeHtml(v.title) + '</h4>'
    html += '<p>' + escapeHtml(v.note) + '</p>'
    html += chipList(v.stack)
    if (!isMissing(v.githubUrl)) {
      html += '<div class="btn-row">' + externalLink(v.githubUrl, v.title + ' on GitHub', 'btn') + '</div>'
    }
    html += '</div>'
  }

  html += projectLinks(project, ctx)
  return html
}

// A short list of every project (used by the Workshop ledger and the quick tour).
// In the game, each item has a button that opens the full details.
export function renderProjectList(projects, ctx) {
  let html = '<ol class="project-list">'
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]
    html += '<li class="project-item">'
    html += '<h4>' + escapeHtml(p.title) + '</h4>'
    html += '<p>' + textOrPlaceholder(ctx, p.summary, '') + '</p>'
    html += chipList(p.stack)
    html += '<div class="btn-row">'
    html += '<button type="button" class="btn btn-primary" data-open-project="' + escapeHtml(p.id) + '">Details</button>'
    if (!isMissing(p.liveUrl)) html += externalLink(p.liveUrl, 'Live demo', 'btn')
    if (!isMissing(p.githubUrl)) html += externalLink(p.githubUrl, 'GitHub', 'btn')
    html += '</div>'
    html += '</li>'
  }
  html += '</ol>'
  return html
}

// ---------------------------------------------------------------------
//  Skills (Notice board)
// ---------------------------------------------------------------------
export function renderSkills(skills) {
  let html = '<div class="skill-groups">'
  for (let i = 0; i < skills.length; i++) {
    html += '<section class="skill-group">'
    html += '<h4>' + escapeHtml(skills[i].group) + '</h4>'
    html += chipList(skills[i].items)
    html += '</section>'
  }
  html += '</div>'
  return html
}

// ---------------------------------------------------------------------
//  Education and experience (Market stall)
// ---------------------------------------------------------------------
export function renderExperience(education, work) {
  let html = '<h3>Education</h3>'
  for (let i = 0; i < education.length; i++) {
    const e = education[i]
    html += '<div class="timeline-item">'
    html += '<h4>' + escapeHtml(e.course) + '</h4>'
    html += '<p class="muted">' + escapeHtml(e.school) + ', ' + escapeHtml(e.start) + ' to ' + escapeHtml(e.end) + '</p>'
    if (e.highlights.length > 0) {
      html += '<p class="small">Relevant coursework and labs:</p><ul>'
      for (let j = 0; j < e.highlights.length; j++) {
        html += '<li>' + escapeHtml(e.highlights[j]) + '</li>'
      }
      html += '</ul>'
    }
    html += '</div>'
  }

  // Work experience is only shown once there is at least one entry.
  if (work.length > 0) {
    html += '<h3>Experience</h3>'
    for (let i = 0; i < work.length; i++) {
      const w = work[i]
      html += '<div class="timeline-item">'
      html += '<h4>' + escapeHtml(w.role) + '</h4>'
      html += '<p class="muted">' + escapeHtml(w.company) + ', ' + escapeHtml(w.start) + ' to ' + escapeHtml(w.end) + '</p>'
      html += '<ul>'
      for (let j = 0; j < w.highlights.length; j++) {
        html += '<li>' + escapeHtml(w.highlights[j]) + '</li>'
      }
      html += '</ul></div>'
    }
  }
  return html
}

// ---------------------------------------------------------------------
//  Contact (Mailbox)
// ---------------------------------------------------------------------
export function renderContact(contact, about, ctx) {
  let html = renderOpenToWork(about)
  html += '<p>' + escapeHtml(about.openToWork.roleTypes) + ' in ' + escapeHtml(about.openToWork.location) +
    '. The quickest way to reach me is email.</p>'

  html += '<ul class="contact-list">'
  html += '<li><span class="contact-label">Email</span> <a href="mailto:' + escapeHtml(contact.email) + '">' +
    escapeHtml(contact.email) + '</a></li>'
  if (!isMissing(contact.linkedinUrl)) {
    html += '<li><span class="contact-label">LinkedIn</span> ' +
      externalLink(contact.linkedinUrl, contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, ''), '') + '</li>'
  }
  if (!isMissing(contact.githubUrl)) {
    html += '<li><span class="contact-label">GitHub</span> ' +
      externalLink(contact.githubUrl, contact.githubUrl.replace(/^https?:\/\//, ''), '') + '</li>'
  }
  html += '</ul>'

  html += '<div class="btn-row">'
  html += '<a class="btn btn-primary" href="mailto:' + escapeHtml(contact.email) + '">Email me</a>'
  html += renderResumeButton(contact, ctx)
  html += '</div>'
  return html
}
