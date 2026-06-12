import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Record when the page started so we can enforce a minimum loader time
const loaderStart = performance.now()
const MIN_LOADER_MS = 1500

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dismiss the loader after React has painted, but never sooner than MIN_LOADER_MS
requestAnimationFrame(() => {
  const elapsed = performance.now() - loaderStart
  const remaining = Math.max(0, MIN_LOADER_MS - elapsed)

  setTimeout(() => {
    const loader = document.getElementById('app-loader')
    if (!loader) return
    loader.classList.add('fade-out')
    loader.addEventListener('transitionend', () => loader.remove(), { once: true })
  }, remaining)
})
