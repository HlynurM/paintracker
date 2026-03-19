import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RemedyFrequencyBars from './RemedyFrequencyBars'
import type { RemedyEntry } from '@/types/remedy'

function makeRemedy(id: string, tags: RemedyEntry['tags'], rating: RemedyEntry['effectivenessRating']): RemedyEntry {
  return {
    id,
    headacheEntryId: 'h-1',
    timestamp: Date.now(),
    tags,
    effectivenessRating: rating,
  }
}

describe('RemedyFrequencyBars', () => {
  it('shows empty state when no remedies', () => {
    render(<RemedyFrequencyBars remedies={[]} />)
    expect(screen.getByText('No remedies logged yet.')).toBeTruthy()
  })

  it('renders tag labels for logged remedies', () => {
    const remedies = [makeRemedy('r1', ['rest', 'hydration'], 4)]
    render(<RemedyFrequencyBars remedies={remedies} />)
    expect(screen.getByText('Rest')).toBeTruthy()
    expect(screen.getByText('Hydration')).toBeTruthy()
  })

  it('counts tag occurrences across multiple entries', () => {
    const remedies = [
      makeRemedy('r1', ['rest'], 4),
      makeRemedy('r2', ['rest'], 3),
      makeRemedy('r3', ['hydration'], 5),
    ]
    render(<RemedyFrequencyBars remedies={remedies} />)
    // Rest appears twice, hydration once
    const counts = screen.getAllByText(/^\d+$/)
    const countValues = counts.map((el) => parseInt(el.textContent ?? '0', 10))
    expect(countValues).toContain(2) // rest
    expect(countValues).toContain(1) // hydration
  })

  it('sorts tags by descending count', () => {
    const remedies = [
      makeRemedy('r1', ['hydration'], 4),
      makeRemedy('r2', ['rest'], 3),
      makeRemedy('r3', ['rest'], 5),
    ]
    render(<RemedyFrequencyBars remedies={remedies} />)
    const tagLabels = screen.getAllByText(/Rest|Hydration/)
    // Rest (count 2) should come before Hydration (count 1)
    expect(tagLabels[0].textContent).toBe('Rest')
    expect(tagLabels[1].textContent).toBe('Hydration')
  })

  it('shows star effectiveness display', () => {
    const remedies = [makeRemedy('r1', ['rest'], 4)]
    render(<RemedyFrequencyBars remedies={remedies} />)
    expect(screen.getByLabelText('4 stars average')).toBeTruthy()
  })

  it('does not render when stats are empty after filtering', () => {
    const remedies = [makeRemedy('r1', [], 3)] // no tags
    const { container } = render(<RemedyFrequencyBars remedies={remedies} />)
    // Should render nothing or empty state
    expect(container.querySelector('.space-y-2')).toBeNull()
  })
})
