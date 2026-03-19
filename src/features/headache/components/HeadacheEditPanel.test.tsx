import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import HeadacheEditPanel from './HeadacheEditPanel'
import type { HeadacheEntry } from '@/types/headache'

const entry: HeadacheEntry = {
  id: 'edit-1',
  timestamp: new Date('2024-06-15T10:00:00').getTime(),
  severity: 2,
  weather: null,
  notes: 'Existing notes',
  triggers: ['stress'],
}

describe('HeadacheEditPanel', () => {
  it('renders with pre-filled severity and notes', () => {
    render(<HeadacheEditPanel entry={entry} onSave={vi.fn()} onClose={vi.fn()} />)
    // range input value is always a string in the DOM
    expect(screen.getByLabelText(/severity/i)).toHaveValue('2')
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Existing notes')
  })

  it('shows entry timestamp (read-only)', () => {
    render(<HeadacheEditPanel entry={entry} onSave={vi.fn()} onClose={vi.fn()} />)
    // date-fns will format the timestamp — just check it's not empty
    const timestampEl = document.querySelector('[id="edit-panel-desc"]')
    expect(timestampEl).toBeTruthy()
    // Check the visible timestamp text is present somewhere
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('calls onSave with updated patch when Save is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<HeadacheEditPanel entry={entry} onSave={onSave} onClose={vi.fn()} />)

    // Update notes
    const notesField = screen.getByLabelText(/notes/i)
    await userEvent.clear(notesField)
    await userEvent.type(notesField, 'Updated notes')

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Updated notes', severity: 2 })
      )
    })
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<HeadacheEditPanel entry={entry} onSave={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the close (✕) button is clicked', async () => {
    const onClose = vi.fn()
    render(<HeadacheEditPanel entry={entry} onSave={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('disables Save button while saving', async () => {
    let resolveSave: () => void
    const onSave = vi.fn(
      () => new Promise<void>((resolve) => { resolveSave = resolve })
    )
    render(<HeadacheEditPanel entry={entry} onSave={onSave} onClose={vi.fn()} />)

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    await userEvent.click(saveBtn)

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()

    resolveSave!()
  })
})
