import ArcadeHeading from '../components/ArcadeHeading'
import ContactForm from '../components/ContactForm'
import ErrorBoundary from '../components/ErrorBoundary'
import Ghost from '../components/Ghost'
import IconLink from '../components/IconLink'
import { GitHubIcon, LinkedInIcon, MailIcon } from '../components/icons'
import MazeCard from '../components/MazeCard'
import PowerDot from '../components/PowerDot'
import { Reveal } from '../components/Reveal'
import { useLocalTime } from '../hooks/useLocalTime'

/** Its own component so the ticking clock re-renders one line, not the form. */
function LocalTime({ timezone }) {
  const time = useLocalTime(timezone)
  return <>{time}</>
}

function StatusRow({ label, children, tone = 'text-ink' }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-dim">{label}</dt>
      <dd className={`text-right font-semibold ${tone}`}>{children}</dd>
    </div>
  )
}

function ContactSection({ email, githubUrl, linkedinUrl, available = true }) {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative scroll-mt-32 px-4 py-20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="red" size={28} className="absolute right-[12%] top-4 hidden lg:block" />
        <Ghost color="pink" size={26} drift="drift" delay={0.9} className="absolute bottom-5 right-[26%] hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <ArcadeHeading
            id="contact-heading"
            hud="ENTER YOUR NAME"
            title="Get in touch"
            subtitle="Open to full-time roles and freelance work. I reply within 24 hours."
          />
        </Reveal>

        <Reveal className="grid gap-7 lg:grid-cols-5 lg:items-start">
          {/* The cabinet: name-entry screen */}
          <MazeCard className="min-w-0 p-6 sm:p-8 lg:col-span-3" stage="HIGH SCORE ENTRY">
            <div aria-hidden="true" className="mb-6 flex items-center gap-2">
              <PowerDot size="sm" />
              <PowerDot size="sm" />
              <PowerDot power />
              <span className="hud-label ml-1 motion-safe:animate-hud-flicker">RANK 1ST</span>
            </div>
            {/* If the form itself ever crashes, the direct links beside it
                still work — so the boundary sits around the form only. */}
            <ErrorBoundary>
              <ContactForm fallbackEmail={email} />
            </ErrorBoundary>
          </MazeCard>

          {/* Side panel: direct routes + status */}
          <div className="min-w-0 space-y-5 lg:col-span-2">
            <MazeCard className="p-6">
              <p className="hud-label">DIRECT LINE</p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="mt-4 inline-block break-all text-sm font-semibold text-ink underline decoration-wall decoration-2 underline-offset-4 transition-colors duration-200 hover:text-hud"
                >
                  {email}
                </a>
              ) : null}

              <div className="mt-6 flex items-center gap-3">
                {githubUrl ? (
                  <IconLink href={githubUrl} label="GitHub profile">
                    <GitHubIcon className="h-5 w-5" />
                  </IconLink>
                ) : null}
                {linkedinUrl ? (
                  <IconLink href={linkedinUrl} label="LinkedIn profile">
                    <LinkedInIcon className="h-5 w-5" />
                  </IconLink>
                ) : null}
                {email ? (
                  <IconLink href={`mailto:${email}`} label="Send an email">
                    <MailIcon className="h-5 w-5" />
                  </IconLink>
                ) : null}
              </div>
            </MazeCard>

            <MazeCard className="p-6">
              <p className="hud-label">CABINET STATUS</p>
              <dl className="mt-4 space-y-3 text-sm">
                <StatusRow label="Location">Singapore</StatusRow>
                <StatusRow label="Local time">
                  GMT+8 · <LocalTime timezone="Asia/Singapore" />
                </StatusRow>
                <StatusRow label="Availability" tone={available ? 'text-success' : 'text-ink'}>
                  {available ? 'Open to work' : 'Not looking right now'}
                </StatusRow>
                <StatusRow label="Reply time">Within 24 h</StatusRow>
              </dl>
            </MazeCard>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ContactSection
