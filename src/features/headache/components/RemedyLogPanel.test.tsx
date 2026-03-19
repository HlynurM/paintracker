import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RemedyLogPanel from './RemedyLogPanel'

vi.mock('../hooks/useRemedyLog', () => ({
  useRemedyLog: () => ({
    logRemedy: vi.fn().mockResolvedValue(undefined),
    fetchRemedies: vi.fn().mockResolvedValue([]),
    isSubmitting: false,
    error: null,
  }),
}))

describe('RemedyLogPanel', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    headacheEntryId: 'h-123',
    onSuccess: vi.fn(),
  }

  it('renders the dialog title when open', () => {
    render(<RemedyLogPanel {...defaultProps} />)
    expect(screen.getByText('What helped this time?')).toBeTruthy()
  })

  it('renders remedy tag picker', () => {
    render(<RemedyLogPanel {...defaultProps} />)
    expect(screen.getByText('What helped?')).toBeTruthy()
  })

  it('renders effectiveness stars', () => {
    render(<RemedyLogPanel {...defaultProps} />)
    expect(screen.getByLabelText('1 star')).toBeTruthy()
    expect(screen.getByLabelText('5 stars')).toBeTruthy()
  })

  it('submit button is disabled when no tags selected', () => {
    render(<RemedyLogPanel {...defaultProps} />)
    const submitBtn = screen.getByRole('button', { name: 'Save' })
    expect(submitBtn).toBeDisabled()
  })

  it('does not render when closed', () => {
    render(<RemedyLogPanel {...defaultProps} open={false} />)
    expect(screen.queryByText('What helped this time?')).toBeNull()
  })

  it('has close button', () => {
    render(<RemedyLogPanel {...defaultProps} />)
    expect(screen.getByLabelText('Close')).toBeTruthy()
  })
})
