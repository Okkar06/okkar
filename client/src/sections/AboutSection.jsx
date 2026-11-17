import { useState } from 'react'
import ArcadeHeading from '../components/ArcadeHeading'
import Ghost from '../components/Ghost'
import Mascot from '../components/Mascot'
import MazeCard from '../components/MazeCard'
import PowerDot from '../components/PowerDot'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'

/**
 * The portrait. Two widths are offered so a phone downloads ~18 KB instead of
 * the full image, and width/height reserve the space so nothing shifts when
 * it arrives. If it fails to load, the mascot stands in instead of a broken
 * image icon.
 */
function Portrait({ photo }) {
  const [failed, setFailed] = useState(false)

  if (!photo?.src || failed) {
    return (
      <div className="absolute inset-0 grid place-items-center" role="img" aria-label={photo?.alt ?? 'Portrait unavailable'}>
        <Mascot size={72} chomping={false} />
      </div>
    )
  }

  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes="(min-width: 768px) 440px, 92vw"
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  )
}

function AboutSection({ bio, highlights = [], photo, nowText }) {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative scroll-mt-32 px-4 py-20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Ghost color="pink" size={28} drift="drift" className="absolute right-[8%] top-4 hidden lg:block" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <ArcadeHeading id="about-heading" hud="PLAYER PROFILE" title="Who's at the controls" />
        </Reveal>

        <RevealGroup className="grid gap-8 md:grid-cols-5 md:items-start">
          <RevealItem className="min-w-0 md:col-span-3">
            <MazeCard className="p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-ink-dim sm:text-base">{bio}</p>

              {highlights.length > 0 ? (
                <ul className="mt-7 space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5">
                        <PowerDot size="sm" />
                      </span>
                      <span className="min-w-0 text-sm leading-relaxed text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {nowText ? (
                <div className="mt-7 rounded-tile border-2 border-wall/40 bg-floor/60 p-4">
                  <p className="hud-label">NOW PLAYING</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">{nowText}</p>
                </div>
              ) : null}
            </MazeCard>
          </RevealItem>

          <RevealItem className="min-w-0 md:col-span-2">
            <MazeCard className="overflow-hidden p-2">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-tile bg-floor">
                <Portrait photo={photo} />
              </div>
            </MazeCard>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  )
}

export default AboutSection
