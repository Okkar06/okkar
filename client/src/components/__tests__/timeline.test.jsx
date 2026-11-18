import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTENT } from '../../data/content'
import { orderStages } from '../../lib/timeline'
import ProjectsSection from '../../sections/ProjectsSection'

/** Answers media queries from a fixed list of the ones that match. */
function mediaMatches(...matching) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }))
}

const WIDE = '(min-width: 768px)'
const REDUCED = '(prefers-reduced-motion: reduce)'

const renderSection = (projects = CONTENT.projects) =>
  render(
    <LazyMotion features={domAnimation}>
      <ProjectsSection projects={projects} />
    </LazyMotion>,
  )

const stages = orderStages(CONTENT.projects)

afterEach(() => vi.restoreAllMocks())

describe('projects timeline (tablet and up)', () => {
  it('shows each project to assistive tech exactly once, oldest first', () => {
    mediaMatches(WIDE)
    renderSection()

    const timeline = screen.getByRole('group', { name: /project timeline/i })
    const titles = within(timeline)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(titles).toEqual(stages.map((stage) => stage.title))
    expect(stages.at(-1).placeholder).toBe(true)
  })

  it('hides the loop copies and takes them out of the Tab order, but keeps them clickable', () => {
    mediaMatches(WIDE)
    const { container } = renderSection()
    const slots = container.querySelectorAll('[data-slot]')
    const copies = container.querySelectorAll('[data-slot][aria-hidden="true"]')
    expect(copies.length).toBe(slots.length - stages.length)
    expect(container.querySelector('[inert]')).toBeNull()
    for (const copy of copies) {
      for (const control of copy.querySelectorAll('a, button')) expect(control).toHaveAttribute('tabindex', '-1')
    }

    // A copy's DETAILS still opens the popup on a click.
    const copyDetails = copies[0].querySelector('button')
    fireEvent.click(copyDetails)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('marks where the run starts over, and labels no node NEXT', () => {
    mediaMatches(WIDE)
    const { container } = renderSection()
    const markers = container.querySelectorAll('[data-marker]')
    expect(markers.length).toBeGreaterThan(0)
    expect(markers[0]).toHaveTextContent('CONTINUE?')
    expect(markers[0]).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('timeline-viewport')).not.toHaveTextContent('NEXT')
  })

  it('numbers the stages in date order', () => {
    mediaMatches(WIDE)
    renderSection([
      { title: 'Newer', date: 'Jan 2026', description: 'b' },
      { title: 'Older', date: 'Mar 2024', description: 'a' },
    ])
    const timeline = screen.getByRole('group', { name: /project timeline/i })
    const older = within(timeline).getByRole('heading', { name: 'Older' }).closest('article')
    expect(older).toHaveTextContent('STAGE 1 · Mar 2024')
  })

  it('has a pause button that says what it will do, and arrows', () => {
    mediaMatches(WIDE)
    renderSection()
    const pause = screen.getByRole('button', { name: 'Pause timeline' })
    fireEvent.click(pause)
    expect(screen.getByRole('button', { name: 'Play timeline' })).toBeInTheDocument()
    expect(screen.getByTestId('timeline-viewport')).toHaveAttribute('data-autoplay', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Play timeline' }))
    expect(screen.getByTestId('timeline-viewport')).toHaveAttribute('data-autoplay', 'true')
    expect(screen.getByRole('button', { name: 'Previous stage' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeInTheDocument()
  })

  it('holds the slideshow while hovered or while a card has focus', () => {
    mediaMatches(WIDE)
    renderSection()
    const viewport = screen.getByTestId('timeline-viewport')
    expect(viewport).toHaveAttribute('data-autoplay', 'true')

    fireEvent.pointerEnter(viewport, { pointerType: 'mouse' })
    expect(viewport).toHaveAttribute('data-autoplay', 'false')
    fireEvent.pointerLeave(viewport, { pointerType: 'mouse' })
    expect(viewport).toHaveAttribute('data-autoplay', 'true')

    act(() => within(viewport).getAllByRole('link')[0].focus())
    expect(viewport).toHaveAttribute('data-autoplay', 'false')
  })

  it('does not move on its own under reduced motion, and has no pause button', () => {
    mediaMatches(WIDE, REDUCED)
    renderSection()
    expect(screen.getByTestId('timeline-viewport')).toHaveAttribute('data-autoplay', 'false')
    expect(screen.queryByRole('button', { name: /pause timeline/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeInTheDocument()
  })
})

describe('project preview cards', () => {
  const trackify = CONTENT.projects.find((project) => project.title.startsWith('Trackify'))

  it('show at most four chips, then how many more', () => {
    mediaMatches(WIDE)
    renderSection()
    const card = within(screen.getByRole('group', { name: /project timeline/i }))
      .getByRole('heading', { name: trackify.title })
      .closest('article')
    const chips = within(within(card).getByRole('list', { name: 'Built with' })).getAllByRole('listitem')
    const shown = chips.length - 1
    expect(shown).toBeGreaterThan(0)
    expect(shown).toBeLessThanOrEqual(4)
    chips.slice(0, shown).forEach((chip, i) => expect(chip).toHaveTextContent(trackify.tags[i]))
    expect(chips.at(-1)).toHaveTextContent(`+${trackify.tags.length - shown}`)
    // Source lives in the popup now; the demo stays on the card.
    expect(within(card).queryByRole('link', { name: /source code/i })).not.toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /play demo/i })).toBeInTheDocument()
  })
})

describe('project details popup', () => {
  const trackify = CONTENT.projects.find((project) => project.title.startsWith('Trackify'))
  const openTrackify = () => {
    const details = screen.getByRole('button', { name: `Details: ${trackify.title}` })
    fireEvent.click(details)
    return details
  }

  it('shows everything, holds the slideshow, and closes on Esc with focus handed back', () => {
    mediaMatches(WIDE)
    renderSection()
    const details = openTrackify()

    const dialog = screen.getByRole('dialog', { name: trackify.title })
    expect(dialog).toHaveTextContent(trackify.description)
    for (const tag of trackify.tags) expect(within(dialog).getByText(tag)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /source code/i })).toHaveAttribute('href', trackify.secondaryUrl)
    expect(within(dialog).getByRole('link', { name: /play demo/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Close details' })).toHaveFocus()
    expect(screen.getByTestId('timeline-viewport')).toHaveAttribute('data-autoplay', 'false')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(details).toHaveFocus()
    // Keyboard focus on the card still holds it; once focus moves on, it plays.
    act(() => details.blur())
    expect(screen.getByTestId('timeline-viewport')).toHaveAttribute('data-autoplay', 'true')
  })

  it('closes on the close button or a click outside, not a click inside', () => {
    mediaMatches(WIDE)
    renderSection()
    openTrackify()
    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('details-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    openTrackify()
    fireEvent.click(screen.getByRole('button', { name: 'Close details' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps Tab inside the popup', () => {
    mediaMatches(WIDE)
    renderSection()
    openTrackify()
    const dialog = screen.getByRole('dialog')
    const close = within(dialog).getByRole('button', { name: 'Close details' })
    const source = within(dialog).getByRole('link', { name: /source code/i })

    act(() => source.focus())
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(source).toHaveFocus()
  })

  it('opens from a click on the card itself, and on phones too', () => {
    mediaMatches()
    renderSection()
    const list = screen.getByRole('list', { name: /newest first/i })
    fireEvent.click(within(list).getByRole('heading', { name: trackify.title }))
    expect(screen.getByRole('dialog', { name: trackify.title })).toBeInTheDocument()
  })
})

describe('projects timeline (phones)', () => {
  it('is a still vertical list, newest first, with the bonus stage leading', () => {
    mediaMatches()
    renderSection()
    const list = screen.getByRole('list', { name: /newest first/i })
    const titles = within(list)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(titles).toEqual([...stages].reverse().map((stage) => stage.title))
    expect(screen.queryByTestId('timeline-viewport')).not.toBeInTheDocument()
  })
})
