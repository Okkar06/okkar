import PixelSprite from './PixelSprite'

/**
 * PowerUps — the tech stack as pixel chips, each with a small pixel glyph
 * and a soft glow on hover. Data comes from CONTENT.powerUps.
 */
export function PowerUps({ items = [] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="hud-label">POWER-UPS</h3>
      <ul aria-label="Tech stack" className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="inline-flex items-center gap-2 rounded-tile border-2 border-wall/40 bg-floor/60 px-2.5 py-1.5 font-pixel text-pixel-xs uppercase leading-none tracking-hud text-ink transition-[border-color,box-shadow] duration-200 hover:border-wall hover:shadow-glow-wall"
          >
            <PixelSprite name={item.icon} size={12} className="drop-shadow-glow-neon" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * PlayerStats — a row of small arcade stat boxes (CONTENT.playerStats).
 */
export function PlayerStats({ items = [] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="hud-label">PLAYER STATS</h3>
      <dl className="mt-4 grid grid-cols-3 gap-2.5">
        {items.map((stat) => (
          <div key={stat.label} className="min-w-0 rounded-tile border-2 border-wall/40 bg-floor/60 px-2 py-3 text-center">
            <dt className="font-pixel text-pixel-xs uppercase leading-none tracking-hud text-ink-dim">{stat.label}</dt>
            <dd className="mt-2.5 font-pixel text-pixel-sm uppercase leading-none text-neon drop-shadow-glow-neon">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
