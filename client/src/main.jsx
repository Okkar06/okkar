import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ThemeProvider from './theme/ThemeProvider.jsx'

// The stylesheet (src/index.css) is linked from index.html, not imported here,
// so that it is render-blocking and the loader is styled on first paint.

// The loader's mascot run (2.4 s, see styles/loader.css) is a welcome, not a
// toll: it plays in full once per browser session. After that — a reload, a
// second visit in the same tab — the loader only stays as long as the app
// actually takes to boot, and it never waits for visitors who prefer reduced
// motion.
const FULL_RUN_MS = 2400
const SEEN_KEY = 'okkar-loader-seen'
const loaderStart = performance.now()

function minimumLoaderTime() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 0
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return 0
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage blocked: play the full run, as on a first visit.
  }
  return FULL_RUN_MS
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

function dismissLoader() {
  const loader = document.getElementById('app-loader')

  const announce = () => window.dispatchEvent(new CustomEvent('loader-done'))

  if (!loader) {
    announce()
    return
  }

  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    loader.remove()
    announce()
  }

  loader.classList.add('fade-out')
  loader.addEventListener('transitionend', finish, { once: true })
  // transitionend never fires if the tab is hidden or transitions are off;
  // without this the loader would sit over the page forever.
  setTimeout(finish, 700)
}

// Dismiss once React has painted, but never before the run completes.
requestAnimationFrame(() => {
  const remaining = Math.max(0, minimumLoaderTime() - (performance.now() - loaderStart))
  setTimeout(dismissLoader, remaining)
})
