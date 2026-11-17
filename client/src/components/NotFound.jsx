import { useEffect } from 'react'
import ArcadeButton from './ArcadeButton'
import Ghost from './Ghost'
import PowerDot from './PowerDot'

const TITLE = '404 — Stage not found · Okkar Hein'

/**
 * NotFound — the themed 404. The server answers unknown URLs with a real 404
 * status and this page, so a mistyped or stale link is never mistaken for the
 * portfolio itself (by a visitor or by a search engine).
 */
function NotFound({ path }) {
  useEffect(() => {
    const previous = document.title
    document.title = TITLE
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="maze-wall w-full max-w-xl p-8 text-center motion-safe:animate-pop sm:p-10">
        <div aria-hidden="true" className="flex items-end justify-center gap-4">
          <Ghost color="pink" size={34} delay={0.4} />
          <Ghost color="cyan" size={48} />
          <Ghost color="orange" size={34} delay={0.8} />
        </div>

        <p className="hud-label mt-7">GAME OVER</p>

        <h1 className="mt-4 font-pixel text-4xl uppercase leading-normal text-ink drop-shadow-glow-wall sm:text-5xl sm:leading-normal">
          404
        </h1>
        <p className="mt-2 font-pixel text-pixel-md uppercase text-mascot-ink">Stage not found</p>

        <p className="mt-5 text-sm leading-relaxed text-ink-dim">
          There is no page at{' '}
          <span className="break-all font-semibold text-ink">{path}</span>. The link may be old, or
          the address mistyped.
        </p>

        <div aria-hidden="true" className="mt-6 flex items-center justify-center gap-2">
          <PowerDot size="sm" />
          <PowerDot size="sm" />
          <PowerDot power />
          <PowerDot size="sm" />
          <PowerDot size="sm" />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <ArcadeButton href="/" variant="primary">
            <span aria-hidden="true">▶</span>
            BACK TO START
          </ArcadeButton>
          <ArcadeButton href="/#contact">CONTACT ME</ArcadeButton>
        </div>
      </div>
    </main>
  )
}

export default NotFound
