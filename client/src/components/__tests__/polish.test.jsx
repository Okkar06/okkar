import { act, render, screen, within } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTENT } from '../../data/content'
import { INK, SPRITES } from '../../lib/pixelSprites'
import AboutSection from '../../sections/AboutSection'
import ContactSection from '../../sections/ContactSection'
import FooterChase from '../FooterChase'
import HeroArcade from '../HeroArcade'
import PixelSprite from '../PixelSprite'

const withMotion = (ui) => render(<LazyMotion features={domAnimation}>{ui}</LazyMotion>)

/** An IntersectionObserver the test drives by hand. */
function controllableObserver() {
  const observers = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback
        observers.push(this)
      }
      observe(target) {
        this.target = target
      }
      disconnect() {}
      unobserve() {}
    },
  )
  return (isIntersecting) =>
    act(() => {
      for (const observer of observers) observer.callback([{ isIntersecting, target: observer.target }])
    })
}

afterEach(() => vi.restoreAllMocks())

describe('pixel sprites', () => {
  it.each(Object.entries(SPRITES))('%s is a clean rectangle of known colours', (_name, rows) => {
    const width = rows[0].length
    for (const row of rows) {
      expect(row).toHaveLength(width)
      for (const char of row) expect(char === '.' || char in INK, `unknown pixel "${char}"`).toBe(true)
    }
  })

  it('has a glyph for every POWER-UP in the content file', () => {
    for (const item of CONTENT.powerUps) expect(SPRITES, item.label).toHaveProperty(item.icon)
  })

  it('is hidden from assistive tech, never takes a click, and only uses theme tokens', () => {
    const { container } = render(<PixelSprite name="strawberry" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('pointer-events-none')
    for (const rect of svg.querySelectorAll('rect')) {
      expect(rect.getAttribute('class')).toMatch(/^fill-[a-z-]+$/)
      expect(rect).not.toHaveAttribute('fill')
    }
  })

  it('renders nothing for an unknown name', () => {
    const { container } = render(<PixelSprite name="nope" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('decorative scenes', () => {
  it('the hero crowd is hidden from assistive tech and never blocks clicks', () => {
    render(<HeroArcade />)
    const scene = screen.getByTestId('hero-arcade')
    expect(scene).toHaveAttribute('aria-hidden', 'true')
    expect(scene).toHaveClass('pointer-events-none')
    expect(scene.querySelectorAll('[data-sprite]').length).toBeGreaterThan(8)
  })

  it('the footer chase waits until it is on screen, and pauses offscreen', () => {
    const setInView = controllableObserver()
    render(<FooterChase />)
    const chase = screen.getByTestId('footer-chase')
    expect(chase).toHaveAttribute('aria-hidden', 'true')

    expect(chase).toHaveClass('anim-paused')
    setInView(true)
    expect(chase).not.toHaveClass('anim-paused')
    setInView(false)
    expect(chase).toHaveClass('anim-paused')
  })

  it('the footer chase pauses while the tab is hidden', () => {
    const setInView = controllableObserver()
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    render(<FooterChase />)
    setInView(true)
    const chase = screen.getByTestId('footer-chase')
    expect(chase).not.toHaveClass('anim-paused')

    visibility.mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(chase).toHaveClass('anim-paused')

    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(chase).not.toHaveClass('anim-paused')
  })
})

describe('contact: EXTRA LIFE card', () => {
  it('offers the resume as a download and lists the roles', () => {
    withMotion(<ContactSection {...CONTENT.contact} available />)

    const resume = screen.getByRole('link', { name: /download resume/i })
    expect(resume).toHaveAttribute('href', '/resume.pdf')
    expect(resume).toHaveAttribute('download')

    const roles = within(screen.getByRole('list', { name: "Roles I'm looking for" })).getAllByRole('listitem')
    expect(roles.map((role) => role.textContent)).toEqual(CONTENT.contact.roles)
  })

  it('leaves the button out when there is no resume', () => {
    withMotion(<ContactSection {...CONTENT.contact} resumeUrl={undefined} available />)
    expect(screen.queryByRole('link', { name: /download resume/i })).not.toBeInTheDocument()
  })
})

describe('about: POWER-UPS and PLAYER STATS', () => {
  it('renders the stack and the stats from the content file', () => {
    withMotion(
      <AboutSection
        bio={CONTENT.aboutBio}
        photo={CONTENT.photo}
        powerUps={CONTENT.powerUps}
        playerStats={CONTENT.playerStats}
      />,
    )

    const chips = within(screen.getByRole('list', { name: 'Tech stack' })).getAllByRole('listitem')
    expect(chips.map((chip) => chip.textContent)).toEqual(CONTENT.powerUps.map((item) => item.label))
    expect(screen.getByRole('heading', { name: 'PLAYER STATS' })).toBeInTheDocument()
    for (const stat of CONTENT.playerStats) {
      expect(screen.getByText(stat.label).nextElementSibling).toHaveTextContent(stat.value)
    }
  })
})
