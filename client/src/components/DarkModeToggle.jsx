import { useEffect, useState } from 'react'

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return (localStorage.getItem('color-mode') ?? 'dark') === 'dark'
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light')
    try { localStorage.setItem('color-mode', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((d) => !d)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/5 text-neutral-300 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

export default DarkModeToggle
