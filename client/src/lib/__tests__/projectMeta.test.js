import { describe, expect, it } from 'vitest'
import { fittedChipCount, stageLabel } from '../projectMeta'

describe('fittedChipCount', () => {
  it('shows every chip when they fit, up to the maximum', () => {
    expect(fittedChipCount(['A', 'B'], 4, 250)).toBe(2)
    expect(fittedChipCount(['A', 'B', 'C', 'D', 'E', 'F'], 4, 250)).toBe(4)
  })

  it('drops chips until they and the "+N" fit on one row, keeping at least one', () => {
    const tags = ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Node.js']
    // 50 + 90 + 74 + "+2" (26) + 3 gaps of 4 = 252 > 250, so two plus "+3".
    expect(fittedChipCount(tags, 4, 250)).toBe(2)
    expect(fittedChipCount(tags, 4, 252)).toBe(3)
    expect(fittedChipCount(['A'.repeat(80), 'B'], 4, 250)).toBe(1)
    expect(fittedChipCount([], 4, 250)).toBe(0)
  })
})

describe('stageLabel', () => {
  it('puts the stage number and date on one line', () => {
    expect(stageLabel({ stage: 3, date: 'Apr 2026' })).toBe('STAGE 3 · Apr 2026')
    expect(stageLabel({ index: 1 })).toBe('STAGE 2')
    expect(stageLabel({ placeholder: true })).toBe('BONUS STAGE')
  })
})
