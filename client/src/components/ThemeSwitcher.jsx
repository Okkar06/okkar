import { useEffect, useState } from 'react'

const THEMES = [
  { name: 'violet',  rgb: '91 66 245',   hex: '#5b42f5' },
  { name: 'blue',    rgb: '59 130 246',  hex: '#3b82f6' },
  { name: 'cyan',    rgb: '6 182 212',   hex: '#06b6d4' },
  { name: 'emerald', rgb: '16 185 129',  hex: '#10b981' },
  { name: 'rose',    rgb: '244 63 94',   hex: '#f43f5e' },
  { name: 'amber',   rgb: '245 158 11',  hex: '#f59e0b' },
]

function ThemeSwitcher() {
  const [active, setActive] = useState(() => {
    try { return localStorage.getItem('accent-theme') || 'violet' } catch { return 'violet' }
  })

  useEffect(() => {
    const theme = THEMES.find((t) => t.name === active) ?? THEMES[0]
    document.documentElement.style.setProperty('--accent', theme.rgb)
    try { localStorage.setItem('accent-theme', active) } catch { /* ignore */ }
  }, [active])

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Accent colour">
      {THEMES.map((theme) => {
        const isActive = active === theme.name
        return (
          <button
            key={theme.name}
            type="button"
            onClick={() => setActive(theme.name)}
            aria-label={`${theme.name} accent`}
            aria-pressed={isActive}
            title={theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
            style={{ backgroundColor: theme.hex }}
            className={[
              'h-3.5 w-3.5 rounded-full transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
              isActive
                ? 'scale-125 ring-2 ring-white/40 ring-offset-1 ring-offset-bg opacity-100'
                : 'opacity-50 hover:opacity-90 hover:scale-110',
            ].join(' ')}
          />
        )
      })}
    </div>
  )
}

export default ThemeSwitcher
