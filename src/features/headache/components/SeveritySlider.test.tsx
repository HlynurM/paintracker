import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import SeveritySlider from './SeveritySlider'

describe('SeveritySlider', () => {
  it('renders correct label for value 3 (Significant)', () => {
    render(<SeveritySlider value={3} onChange={vi.fn()} />)
    expect(screen.getByText(/significant/i)).toBeInTheDocument()
  })

  it('value 1 shows Mild', () => {
    render(<SeveritySlider value={1} onChange={vi.fn()} />)
    expect(screen.getByText(/1 — Mild/)).toBeInTheDocument()
  })

  it('value 5 shows Debilitating', () => {
    render(<SeveritySlider value={5} onChange={vi.fn()} />)
    expect(screen.getByText(/5 — Debilitating/)).toBeInTheDocument()
  })

  it('changing slider calls onChange with an integer, not a string', () => {
    const handleChange = vi.fn()
    render(<SeveritySlider value={3} onChange={handleChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })

    expect(handleChange).toHaveBeenCalled()
    const calledWith = handleChange.mock.calls[0][0]
    expect(typeof calledWith).toBe('number')
    expect(Number.isInteger(calledWith)).toBe(true)
  })
})
