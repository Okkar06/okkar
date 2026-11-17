import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { describePath, isHomePath } from '../../lib/route'
import { isSafeHref } from '../../lib/links'
import AboutSection from '../../sections/AboutSection'
import ProjectsSection from '../../sections/ProjectsSection'
import SkillsSection from '../../sections/SkillsSection'
import ThemeProvider from '../../theme/ThemeProvider'
import ErrorBoundary from '../ErrorBoundary'
import ProjectCard from '../ProjectCard'
import { LazyMotion, domAnimation } from 'framer-motion'

const withMotion = (ui) => <LazyMotion features={domAnimation}>{ui}</LazyMotion>
const renderApp = (pathname) =>
  render(
    <ThemeProvider>
      <App pathname={pathname} />
    </ThemeProvider>,
  )

beforeEach(() => {
  // A crashing child makes React log the error; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('ErrorBoundary', () => {
  function Bomb({ armed }) {
    if (armed.current) throw new Error('secret internal detail: db password hunter2')
    return <p>stage loaded</p>
  }

  it('shows a themed Game Over panel instead of a blank page, with no error detail', () => {
    render(
      <ErrorBoundary>
        <Bomb armed={{ current: true }} />
      </ErrorBoundary>,
    )

    const panel = screen.getByRole('alert')
    expect(panel).toHaveTextContent('GAME OVER')
    expect(panel).toHaveTextContent('THIS STAGE CRASHED')
    expect(panel).not.toHaveTextContent(/hunter2|secret|Error:/)
    expect(screen.getByRole('button', { name: 'TRY AGAIN' })).toBeInTheDocument()
  })

  it('TRY AGAIN re-mounts the section once the cause is gone', async () => {
    const user = userEvent.setup()
    const armed = { current: true }
    render(
      <ErrorBoundary>
        <Bomb armed={armed} />
      </ErrorBoundary>,
    )

    armed.current = false
    await user.click(screen.getByRole('button', { name: 'TRY AGAIN' }))

    expect(screen.getByText('stage loaded')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the panel again if the retry fails too', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary>
        <Bomb armed={{ current: true }} />
      </ErrorBoundary>,
    )

    await user.click(screen.getByRole('button', { name: 'TRY AGAIN' }))
    await user.click(screen.getByRole('button', { name: 'TRY AGAIN' }))

    expect(screen.getByRole('alert')).toHaveTextContent('GAME OVER')
  })

  it('contains a crash to its own section', () => {
    render(
      <>
        <ErrorBoundary>
          <Bomb armed={{ current: true }} />
        </ErrorBoundary>
        <ErrorBoundary>
          <p>the other section</p>
        </ErrorBoundary>
      </>,
    )

    expect(screen.getByText('the other section')).toBeInTheDocument()
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('offers a reload at page scope', () => {
    render(
      <ErrorBoundary scope="page">
        <Bomb armed={{ current: true }} />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('THE CABINET CRASHED')
    expect(screen.getByRole('button', { name: 'RELOAD' })).toBeInTheDocument()
  })
})

describe('routing', () => {
  it('knows the home path from everything else', () => {
    for (const path of ['/', '', '/index.html', '//']) expect(isHomePath(path), path).toBe(true)
    for (const path of ['/about', '/x/y', '/index.html/extra', '/admin']) expect(isHomePath(path), path).toBe(false)
  })

  it('renders the portfolio at /', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Okkar\s*Hein/i)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Theme color:/ }).length).toBeGreaterThan(0)
    for (const id of ['about', 'projects', 'skills', 'contact']) {
      expect(document.getElementById(id), id).not.toBeNull()
    }
  })

  it('renders the themed 404 for any other path, with a way home', () => {
    renderApp('/no/such/stage')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    expect(screen.getByText('Stage not found')).toBeInTheDocument()
    expect(screen.getByText('/no/such/stage')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /BACK TO START/ })).toHaveAttribute('href', '/')
    expect(document.title).toMatch(/^404/)
    expect(document.getElementById('contact')).toBeNull()
  })

  it('shows a hostile path as inert text and caps its length', () => {
    renderApp('/<img src=x onerror=alert(1)>')
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(screen.getByText('/<img src=x onerror=alert(1)>')).toBeInTheDocument()

    expect(describePath(`/${'a'.repeat(500)}`).length).toBeLessThanOrEqual(80)
    expect(describePath('/%E0%A4%A')).toBe('/%E0%A4%A')
  })
})

describe('accessibility of the page shell', () => {
  it('gives every link and button an accessible name', () => {
    renderApp('/')
    for (const element of [...screen.getAllByRole('link'), ...screen.getAllByRole('button')]) {
      expect(element, element.outerHTML.slice(0, 120)).toHaveAccessibleName()
    }
  })

  it('gives every image alt text and hides decorative art from assistive tech', () => {
    renderApp('/')
    for (const image of document.querySelectorAll('img')) expect(image).toHaveAttribute('alt')
    expect(screen.getByRole('img', { name: /Portrait of Okkar Hein/ })).toBeInTheDocument()
    for (const svg of document.querySelectorAll('svg')) expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('says when a link opens a new tab, and protects the opener', () => {
    renderApp('/')
    const external = screen.getAllByRole('link').filter((link) => link.target === '_blank')
    expect(external.length).toBeGreaterThan(0)
    for (const link of external) {
      expect(link).toHaveAccessibleName(/opens in a new tab/)
      expect(link.rel).toContain('noopener')
    }
  })

  it('has one h1, a skip link to main, and labelled sections', () => {
    renderApp('/')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(document.getElementById('main')).not.toBeNull()
    for (const section of document.querySelectorAll('main section')) {
      expect(document.getElementById(section.getAttribute('aria-labelledby'))).not.toBeNull()
    }
  })

  it('opens and closes the mobile menu from the keyboard and returns focus', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    toggle.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')
    const menu = document.getElementById(toggle.getAttribute('aria-controls'))
    expect(within(menu).getAllByRole('link')).toHaveLength(4)

    within(menu).getAllByRole('link')[0].focus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveFocus()
  })
})

describe('attract mode', () => {
  it('PRESS START plays the tour, shows the demo HUD, and any key takes over', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: /Press start/ }))

    expect(screen.getByText('DEMO')).toBeInTheDocument()
    expect(screen.getByText(/Demo playing: Title screen, stage 1 of 5/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowDown' })

    expect(screen.queryByText('DEMO')).not.toBeInTheDocument()
  })

  it('the STOP button ends it too', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: /Press start/ }))
    await user.click(screen.getByRole('button', { name: 'STOP' }))

    expect(screen.queryByText('DEMO')).not.toBeInTheDocument()
  })
})

describe('empty, broken and hostile content', () => {
  it('shows an empty state when there are no projects or skills', () => {
    render(withMotion(<ProjectsSection projects={[]} />))
    expect(screen.getByText('No stages yet')).toBeInTheDocument()

    render(withMotion(<SkillsSection groups={[]} />))
    expect(screen.getByText('No items yet')).toBeInTheDocument()
  })

  it('renders sections given no data at all', () => {
    expect(() => render(withMotion(<ProjectsSection />))).not.toThrow()
    expect(() => render(withMotion(<SkillsSection />))).not.toThrow()
    expect(() => render(withMotion(<AboutSection />))).not.toThrow()
  })

  it('swaps a broken portrait for a placeholder that keeps its description', () => {
    render(withMotion(<AboutSection bio="Bio" photo={{ src: '/missing.webp', alt: 'Portrait of Okkar Hein' }} />))

    // The photo is only a pixel source for the binary drawing.
    fireEvent.error(document.querySelector('img'))

    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Portrait of Okkar Hein' })).toBeInTheDocument()
  })

  it('renders very long text without dropping it', () => {
    const title = 'Supercalifragilisticexpialidocious'.repeat(8)
    render(<ProjectCard title={title} description={'word '.repeat(600)} tags={['A'.repeat(80)]} />)
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('never turns an unsafe URL into a link', () => {
    for (const href of ['javascript:alert(1)', 'data:text/html,<script>', ' JAVASCRIPT:x', 'vbscript:x', '', null, 42]) {
      expect(isSafeHref(href), String(href)).toBe(false)
    }
    for (const href of ['https://example.com', 'http://example.com', 'mailto:a@b.co', '#top', '/']) {
      expect(isSafeHref(href), href).toBe(true)
    }

    render(<ProjectCard title="Sketchy" description="d" primaryUrl="javascript:alert(1)" secondaryUrl="data:text/html,x" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
