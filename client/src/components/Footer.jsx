import DotTrail from './DotTrail'
import Ghost from './Ghost'
import Mascot from './Mascot'

function Footer({ name, githubUrl, linkedinUrl }) {
  const year = new Date().getFullYear()

  const iconLink =
    'grid h-9 w-9 place-items-center rounded-tile border-2 border-wall/50 text-ink-dim transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-wall hover:text-hud'

  return (
    <footer className="relative border-t-2 border-wall/50 bg-panel px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-5 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-void px-4 py-1.5">
          <Mascot size={22} />
          <DotTrail count={6} dotClass="h-1.5 w-1.5" />
          <Ghost color="cyan" size={18} drift="none" />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="hud-label">GAME OVER — INSERT COIN</p>
          <p className="mt-3 text-xs text-ink-dim">
            © {year} {name} · Built with React &amp; Tailwind
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a href={githubUrl} target="_blank" rel="noreferrer noopener" className={iconLink} aria-label="GitHub profile">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true" focusable="false">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.07 1.53 1.07.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.27 2.75 1.05a9.2 9.2 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.56 1.43.21 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.33.68.97.68 1.95 0 1.41-.01 2.55-.01 2.9 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer noopener" className={iconLink} aria-label="LinkedIn profile">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true" focusable="false">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.32V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.72C24 .77 23.21 0 22.23 0z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
