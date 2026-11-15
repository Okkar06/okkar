/*
 * Runs before first paint so the cabinet never flashes the wrong theme.
 * Kept as a separate file (rather than an inline <script>) so the server's
 * Content-Security-Policy can stay on script-src 'self' with no
 * 'unsafe-inline'.
 */
(function () {
  try {
    var saved = localStorage.getItem('color-mode')
    var mode = saved === 'light' || saved === 'dark' ? saved : 'dark'
    document.documentElement.setAttribute('data-mode', mode)
  } catch {
    document.documentElement.setAttribute('data-mode', 'dark')
  }
})()
