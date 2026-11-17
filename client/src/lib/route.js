/**
 * The site is a single page: the only real route is "/" (sections are reached
 * by #hash). Anything else is a 404 — the server sends that status, and App
 * renders the themed NotFound page for it.
 */
export function isHomePath(pathname) {
  const path = String(pathname ?? '/').replace(/\/+$/, '')
  return path === '' || path === '/index.html'
}

/**
 * The path as text for the 404 message. It is shown through React (so it is
 * escaped), and capped so an absurdly long URL cannot stretch the page.
 */
export function describePath(pathname) {
  let path = String(pathname ?? '/')
  try {
    path = decodeURIComponent(path)
  } catch {
    // Malformed escapes: show the raw path instead.
  }
  return path.length > 80 ? `${path.slice(0, 77)}…` : path
}
