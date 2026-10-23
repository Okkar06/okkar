// =====================================================================
//  SECTIONS — what opens when you interact with something.
//
//  openSection('about')                      -> House
//  openSection('projects')                   -> list of all projects
//  openSection('project', { projectId })     -> one project (Workshop shelf)
//  openSection('skills')                     -> Notice board
//  openSection('experience')                 -> Market stall
//  openSection('contact')                    -> Mailbox
//
//  `options.footerHtml` lets the quick tour add its own buttons.
// =====================================================================

import { about } from '../data/about.js'
import { projects } from '../data/projects.js'
import { skills } from '../data/skills.js'
import { education, work } from '../data/experience.js'
import { contact } from '../data/contact.js'
import {
  escapeHtml,
  renderAbout,
  renderProjectDetail,
  renderProjectList,
  renderSkills,
  renderExperience,
  renderContact,
} from './sectionsHtml.js'
import { openPanel } from './Panel.js'

// Settings for the HTML builders (see sectionsHtml.js).
export const htmlContext = {
  base: import.meta.env.BASE_URL,
  resumeAvailable: __RESUME_AVAILABLE__, // set in vite.config.js
  showTodos: import.meta.env.DEV, // TODOs are highlighted only while developing
  mode: 'panel',
}

export function openSection(section, options) {
  const opts = options || {}
  const footer = opts.footerHtml || ''

  if (section === 'about') {
    openPanel({ title: "Okkar's House — About me", html: renderAbout(about, contact, htmlContext), footerHtml: footer })
    return
  }

  if (section === 'projects') {
    let intro = '<p class="muted">Each project also has its own shelf inside the Workshop.</p>'
    openPanel({
      title: 'Workshop — ' + projects.length + (projects.length === 1 ? ' project' : ' projects'),
      html: intro + renderProjectList(projects, htmlContext),
      footerHtml: footer,
    })
    return
  }

  if (section === 'project') {
    openProject(opts.projectId, footer)
    return
  }

  if (section === 'skills') {
    openPanel({ title: 'Notice board — Skills', html: renderSkills(skills), footerHtml: footer })
    return
  }

  if (section === 'experience') {
    openPanel({ title: 'Market stall — Education', html: renderExperience(education, work), footerHtml: footer })
    return
  }

  if (section === 'contact') {
    openPanel({ title: 'Mailbox — Contact me', html: renderContact(contact, about, htmlContext), footerHtml: footer })
    return
  }

  console.warn('Unknown section: ' + section)
}

// ---------------------------------------------------------------------
//  One project, with "All projects" and previous / next buttons.
// ---------------------------------------------------------------------
function openProject(projectId, tourFooter) {
  let index = -1
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].id === projectId) index = i
  }
  if (index === -1) {
    openSection('projects')
    return
  }
  const project = projects[index]

  let footer = tourFooter
  if (!footer) {
    footer = '<button type="button" class="btn" data-action="projects">← All projects</button>'
    footer += '<span class="btn-row" style="margin:0">'
    if (index > 0) {
      footer += '<button type="button" class="btn" data-open-project="' + escapeHtml(projects[index - 1].id) + '">Previous</button>'
    }
    if (index < projects.length - 1) {
      footer += '<button type="button" class="btn" data-open-project="' + escapeHtml(projects[index + 1].id) + '">Next</button>'
    }
    footer += '</span>'
  }

  openPanel({
    title: project.title,
    html: renderProjectDetail(project, htmlContext),
    footerHtml: footer,
  })
}
