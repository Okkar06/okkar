import { useEffect, useRef, useState } from 'react'

const THEMES = [
  { name: 'Violet',   rgb: '91 66 245',   hex: '#5b42f5' },
  { name: 'Sky',      rgb: '14 165 233',  hex: '#0ea5e9' },
  { name: 'Cyan',     rgb: '6 182 212',   hex: '#06b6d4' },
  { name: 'Emerald',  rgb: '16 185 129',  hex: '#10b981' },
  { name: 'Rose',     rgb: '244 63 94',   hex: '#f43f5e' },
  { name: 'Amber',    rgb: '245 158 11',  hex: '#f59e0b' },
]

const INTERVAL_MS = 60000

function ThemeSwitcher() {
  const [index, setIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('accent-theme')
      const i = THEMES.findIndex((t) => t.name.toLowerCase() === saved)
      return i >= 0 ? i : 0
    } catch {
      return 0
    }
  })

  const timerRef = useRef(null)

  const active = THEMES[index]

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', active.rgb)
    try { localStorage.setItem('accent-theme', active.name.toLowerCase()) } catch {}
  }, [active])

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % THEMES.length)
    }, INTERVAL_MS)
  }

  // Auto-cycle on mount
  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [])

  // Manual click resets the timer so it doesn't immediately jump after a click
  const handleClick = () => {
    setIndex((i) => (i + 1) % THEMES.length)
    startTimer()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Theme: ${active.name}. Click to advance.`}
      title={`Auto-cycling theme — ${active.name}`}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <span
        className="h-3 w-3 rounded-full transition-all duration-500"
        style={{ backgroundColor: active.hex, boxShadow: `0 0 6px ${active.hex}99` }}
      />
      <span className="w-14 text-left tracking-wide transition-all duration-300">{active.name}</span>
      <span className="opacity-50">›</span>
    </button>
  )
}

export default ThemeSwitcher
