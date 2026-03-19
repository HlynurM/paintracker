import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AnalysisWindowPicker from './AnalysisWindowPicker'

describe('AnalysisWindowPicker', () => {
  it('renders all window options', () => {
    render(<AnalysisWindowPicker window="30d" onChange={vi.fn()} />)
    expect(screen.getByText('30d')).toBeTruthy()
    expect(screen.getByText('60d')).toBeTruthy()
    expect(screen.getByText('90d')).toBeTruthy()
    expect(screen.getByText('All')).toBeTruthy()
  })

  it('marks active window with aria-pressed=true', () => {
    render(<AnalysisWindowPicker window="60d" onChange={vi.fn()} />)
    const btn60d = screen.getByText('60d')
    expect(btn60d.closest('button')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('marks inactive windows with aria-pressed=false', () => {
    render(<AnalysisWindowPicker window="60d" onChange={vi.fn()} />)
    const btn30d = screen.getByText('30d')
    expect(btn30d.closest('button')?.getAttribute('aria-pressed')).toBe('false')
  })

  it('calls onChange with clicked window', () => {
    const onChange = vi.fn()
    render(<AnalysisWindowPicker window="30d" onChange={onChange} />)
    fireEvent.click(screen.getByText('90d'))
    expect(onChange).toHaveBeenCalledWith('90d')
  })

  it('calls onChange with All', () => {
    const onChange = vi.fn()
    render(<AnalysisWindowPicker window="30d" onChange={onChange} />)
    fireEvent.click(screen.getByText('All'))
    expect(onChange).toHaveBeenCalledWith('all')
  })
})
