import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import QuickLogPanel from './QuickLogPanel'

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

describe('QuickLogPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogHeadache.mockResolvedValue(undefined)
    hookReturn.isSubmitting = false
    hookReturn.error = null
  })

  it('does not render content when closed', () => {
    render(
      <QuickLogPanel open={false} onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(screen.queryByText('Record Episode')).not.toBeInTheDocument()
  })

  it('renders title when open', () => {
    render(
      <QuickLogPanel open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(screen.getByText('Log Headache')).toBeInTheDocument()
  })

  it('renders the severity slider and form', () => {
    render(
      <QuickLogPanel open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /record episode/i })).toBeInTheDocument()
  })

  it('calls onSuccess and closes after successful submit', async () => {
    const onSuccess = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <QuickLogPanel open onOpenChange={onOpenChange} onSuccess={onSuccess} />
    )

    await userEvent.click(screen.getByRole('button', { name: /record episode/i }))

    await waitFor(() => {
      expect(mockLogHeadache).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('close button calls onOpenChange with false', async () => {
    const onOpenChange = vi.fn()
    render(
      <QuickLogPanel open onOpenChange={onOpenChange} onSuccess={vi.fn()} />
    )
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
