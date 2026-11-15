import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Give the mascot time to finish its run along the pellet line before the
// cabinet boots. Matches the 2.4 s loader animation in public/loader.css.
const loaderStart = performance.now()
const MIN_LOADER_MS = 2400

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function dismissLoader() {
  const loader = document.getElementById('app-loader')

  const announce = () => window.dispatchEvent(new CustomEvent('loader-done'))

  if (!loader) {
    announce()
    return
  }

  loader.classList.add('fade-out')
  loader.addEventListener(
    'transitionend',
    () => {
      loader.remove()
      announce()
    },
    { once: true },
  )
}

// Dismiss once React has painted, but never before the run completes.
requestAnimationFrame(() => {
  const remaining = Math.max(0, MIN_LOADER_MS - (performance.now() - loaderStart))
  setTimeout(dismissLoader, remaining)
})
