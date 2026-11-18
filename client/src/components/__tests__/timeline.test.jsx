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

  it('makes the loop copies hidden and inert', () => {
    mediaMatches(WIDE)
    const { container } = renderSection()
    const slots = container.querySelectorAll('[data-slot]')
    const copies = container.querySelectorAll('[data-slot][inert]')
    expect(copies.length).toBe(slots.length - stages.length)
    for (const copy of copies) expect(copy).toHaveAttribute('aria-hidden', 'true')
  })

  it('numbers the stages in date order', () => {
    mediaMatches(WIDE)
    renderSection([
      { title: 'Newer', date: 'Jan 2026', description: 'b' },
      { title: 'Older', date: 'Mar 2024', description: 'a' },
    ])
    const timeline = screen.getByRole('group', { name: /project timeline/i })
    const older = within(timeline).getByRole('heading', { name: 'Older' }).closest('article')
    expect(older).toHaveTextContent('STAGE 1')
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
