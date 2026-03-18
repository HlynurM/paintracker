import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HeadacheForm from './HeadacheForm'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockLogHeadache = vi.fn()
const hookReturn = {
  logHeadache: mockLogHeadache,
  isSubmitting: false,
  error: null as string | null,
}

vi.mock('../hooks/useHeadacheLog', () => ({
  useHeadacheLog: () => hookReturn,
}))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HeadacheForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogHeadache.mockResolvedValue(undefined)
    hookReturn.isSubmitting = false
    hookReturn.error = null
  })

  it('slider defaults to 3, label shows Significant', () => {
    render(<HeadacheForm />)
    expect(screen.getByRole('slider')).toHaveValue('3')
    expect(screen.getByText(/significant/i)).toBeInTheDocument()
  })

  it('submit fires logHeadache with correct severity value', async () => {
    render(<HeadacheForm />)
    await userEvent.click(screen.getByRole('button', { name: /log headache/i }))

    await waitFor(() => {
      expect(mockLogHeadache).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 3 })
      )
    })
  })

  it('after successful submit — severity resets to 3, notes cleared', async () => {
    render(<HeadacheForm />)
    const notesField = screen.getByPlaceholderText(/optional notes/i)
    await userEvent.type(notesField, 'bad day')
    await userEvent.click(screen.getByRole('button', { name: /log headache/i }))

    await waitFor(() => {
      expect(notesField).toHaveValue('')
      expect(screen.getByRole('slider')).toHaveValue('3')
    })
  })

  it('submit button is disabled when isSubmitting is true', () => {
    hookReturn.isSubmitting = true
    render(<HeadacheForm />)
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('error renders in role="alert" when error is set', () => {
    hookReturn.error = 'Something went wrong'
    render(<HeadacheForm />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('form NOT reset when logHeadache rejects — notes value preserved', async () => {
    mockLogHeadache.mockRejectedValue(new Error('DB error'))
    render(<HeadacheForm />)

    const notesField = screen.getByPlaceholderText(/optional notes/i)
    await userEvent.type(notesField, 'preserve me')
    await userEvent.click(screen.getByRole('button', { name: /log headache/i }))

    await waitFor(() => {
      expect(mockLogHeadache).toHaveBeenCalled()
    })
    expect(notesField).toHaveValue('preserve me')
  })
})
