// =====================================================================
//  VITE CONFIG
//
//  Two pages are built:
//    index.html  -> the game (Phaser village)
//    plain.html  -> the plain, scrollable portfolio
//
//  The little "portfolioHtml" plugin below fills the HTML pages with
//  real text from src/data at build time (SEO + works without JS).
// =====================================================================

import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Base path. "./" works on Vercel, Netlify, Render AND GitHub Pages
// sub-folders (e.g. https://you.github.io/okkar/) because every link is relative.
// You can still force one, e.g.  BASE_PATH=/okkar/ npm run build
const base = process.env.BASE_PATH || './'

// Does the résumé PDF exist? (checked when Vite starts / builds)
function resumeExists() {
  return fs.existsSync(path.join(rootDir, 'public', 'resume.pdf'))
}

// Import a file fresh every time (so edits to data files show up on reload in dev).
async function freshImport(relativePath) {
  const url = pathToFileURL(path.join(rootDir, relativePath)).href + '?t=' + Date.now()
  return import(url)
}

function portfolioHtml(isDev) {
  return {
    name: 'portfolio-html',
    transformIndexHtml: {
      // 'post' = run after Vite's own HTML processing, so the injected
      // HTML (with paths into /public) is left exactly as written.
      order: 'post',
      async handler(html) {
        const aboutModule = await freshImport('src/data/about.js')
        const projectsModule = await freshImport('src/data/projects.js')
        const skillsModule = await freshImport('src/data/skills.js')
        const experienceModule = await freshImport('src/data/experience.js')
        const contactModule = await freshImport('src/data/contact.js')
        const siteModule = await freshImport('src/data/site.js')
        const pageModule = await freshImport('src/ui/plainPage.js')

        const data = {
          about: aboutModule.about,
          projects: projectsModule.projects,
          skills: skillsModule.skills,
          education: experienceModule.education,
          work: experienceModule.work,
          contact: contactModule.contact,
        }
        const ctx = { base: base, resumeAvailable: resumeExists(), showTodos: isDev, mode: 'page' }
        const site = siteModule.site
        const description = pageModule.renderMetaDescription(data.about)

        // Simple find-and-replace of the placeholders in the HTML files.
        let result = html
        result = result.split('{{SITE_TITLE}}').join(site.title)
        result = result.split('{{SITE_DESCRIPTION}}').join(description)
        result = result.split('{{SITE_URL}}').join(site.url.replace(/\/$/, ''))
        result = result.split('{{OG_IMAGE}}').join(site.url.replace(/\/$/, '') + '/' + site.ogImage)
        result = result.split('<!--PLAIN_VIEW-->').join(pageModule.renderPlainPage(data, ctx))
        result = result.split('<!--GAME_INTRO-->').join(pageModule.renderGameIntro(data, ctx))
        return result
      },
    },
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    base: base,
    plugins: [portfolioHtml(isDev)],

    // Values the browser code can read (see src/utils/env.js).
    define: {
      __RESUME_AVAILABLE__: JSON.stringify(resumeExists()),
    },

    server: {
      host: true, // needed for GitHub Codespaces / Docker port forwarding
      port: 5173,
    },
    preview: {
      host: true,
      port: 4173,
    },

    build: {
      // Phaser is one big file (~1.2 MB, ~340 KB gzipped). It is only loaded
      // on the game page, after the loading screen text is already visible.
      chunkSizeWarningLimit: 1600,
      // Bundled JS/CSS go to dist/static (public/assets keeps the game art).
      assetsDir: 'static',
      rollupOptions: {
        input: {
          main: path.join(rootDir, 'index.html'),
          plain: path.join(rootDir, 'plain.html'),
        },
      },
    },
  }
})
