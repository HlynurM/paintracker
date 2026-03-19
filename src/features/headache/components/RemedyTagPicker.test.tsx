import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RemedyTagPicker from './RemedyTagPicker'

describe('RemedyTagPicker', () => {
  it('renders all remedy tags', () => {
    render(<RemedyTagPicker selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Rest')).toBeTruthy()
    expect(screen.getByText('Hydration')).toBeTruthy()
    expect(screen.getByText('OTC Med')).toBeTruthy()
    expect(screen.getByText('Cold Compress')).toBeTruthy()
  })

  it('marks selected tags with aria-pressed=true', () => {
    render(<RemedyTagPicker selected={['rest']} onChange={vi.fn()} />)
    const restBtn = screen.getByText('Rest').closest('button')
    expect(restBtn?.getAttribute('aria-pressed')).toBe('true')
  })

  it('marks unselected tags with aria-pressed=false', () => {
    render(<RemedyTagPicker selected={[]} onChange={vi.fn()} />)
    const restBtn = screen.getByText('Rest').closest('button')
    expect(restBtn?.getAttribute('aria-pressed')).toBe('false')
  })

  it('adds tag to selection on click', () => {
    const onChange = vi.fn()
    render(<RemedyTagPicker selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Rest'))
    expect(onChange).toHaveBeenCalledWith(['rest'])
  })

  it('removes tag from selection when already selected', () => {
    const onChange = vi.fn()
    render(<RemedyTagPicker selected={['rest', 'hydration']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Rest'))
    expect(onChange).toHaveBeenCalledWith(['hydration'])
  })

  it('allows multiple selections without mutual exclusion', () => {
    const onChange = vi.fn()
    render(<RemedyTagPicker selected={['rest']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Hydration'))
    expect(onChange).toHaveBeenCalledWith(['rest', 'hydration'])
  })
})
