import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConfidenceBar from './ConfidenceBar'

describe('ConfidenceBar', () => {
  it('renders score percentage', () => {
    render(<ConfidenceBar score={47} label="low" />)
    expect(screen.getByText('47%')).toBeTruthy()
  })

  it('sets progressbar aria-valuenow to score', () => {
    render(<ConfidenceBar score={47} label="low" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('47')
  })

  it('sets bar width to score percent', () => {
    render(<ConfidenceBar score={47} label="low" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('style')).toContain('47%')
  })

  it('shows insufficient label text', () => {
    render(<ConfidenceBar score={0} label="insufficient" />)
    expect(screen.getByText('Insufficient data')).toBeTruthy()
  })

  it('shows good label text', () => {
    render(<ConfidenceBar score={85} label="good" />)
    expect(screen.getByText('Good confidence')).toBeTruthy()
  })

  it('shows moderate label text', () => {
    render(<ConfidenceBar score={50} label="moderate" />)
    expect(screen.getByText('Moderate confidence')).toBeTruthy()
  })

  it('applies green class for good label', () => {
    render(<ConfidenceBar score={85} label="good" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.className).toContain('green')
  })

  it('applies amber class for low label', () => {
    render(<ConfidenceBar score={25} label="low" />)
    const bar = screen.getByRole('progressbar')
    expect(bar.className).toContain('amber')
  })
})
