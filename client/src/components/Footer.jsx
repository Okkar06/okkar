import FooterChase from './FooterChase'
import IconLink from './IconLink'
import { GitHubIcon, LinkedInIcon } from './icons'

function Footer({ name, githubUrl, linkedinUrl }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t-2 border-wall/50 bg-panel px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-5 flex justify-center">
        <div className="rounded-full bg-void px-4 py-1.5">
          <FooterChase />
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
          {githubUrl ? (
            <IconLink href={githubUrl} label="GitHub profile" size="sm">
              <GitHubIcon />
            </IconLink>
          ) : null}
          {linkedinUrl ? (
            <IconLink href={linkedinUrl} label="LinkedIn profile" size="sm">
              <LinkedInIcon />
            </IconLink>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

export default Footer
