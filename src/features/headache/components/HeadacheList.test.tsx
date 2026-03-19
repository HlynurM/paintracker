import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HeadacheList from './HeadacheList'
import type { HeadacheEntry } from '@/types/headache'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseHeadacheHistory = vi.fn()

vi.mock('../hooks/useHeadacheHistory', () => ({
  useHeadacheHistory: () => mockUseHeadacheHistory(),
}))

// HeadacheEditPanel is a Dialog — mock it to avoid portal complexity
vi.mock('./HeadacheEditPanel', () => ({
  default: ({ onClose, onSave }: { onClose: () => void; onSave: (p: unknown) => void }) => (
    <div data-testid="edit-panel">
      <button onClick={onClose}>PanelCancel</button>
      <button onClick={() => onSave({})}>PanelSave</button>
    </div>
  ),
}))

// RemedyLogPanel is a Dialog — mock it to avoid portal complexity
vi.mock('./RemedyLogPanel', () => ({
  default: () => null,
}))

// Mock remedy repository to avoid IndexedDB in tests
vi.mock('@/db/repositories/remedyRepository', () => ({
  getAllRemedyEntries: vi.fn().mockResolvedValue([]),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const entry1: HeadacheEntry = {
  id: '1',
  timestamp: 2000,
  severity: 4,
  weather: null,
  notes: 'Heavy headache',
  triggers: [],
}
const entry2: HeadacheEntry = {
  id: '2',
  timestamp: 1000,
  severity: 1,
  weather: null,
  notes: 'Light headache',
  triggers: [],
}

const baseHook = {
  entries: [entry1, entry2],
  filteredEntries: [entry1, entry2],
  isLoading: false,
  error: null,
  deleteEntry: vi.fn().mockResolvedValue(undefined),
  updateEntry: vi.fn().mockResolvedValue(undefined),
  severityFilter: 1,
  setSeverityFilter: vi.fn(),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HeadacheList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook })
  })

  it('shows empty state when filteredEntries is empty', () => {
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook, filteredEntries: [] })
    render(<HeadacheList />)
    expect(screen.getByText(/no headaches logged/i)).toBeInTheDocument()
  })

  it('renders all filtered entries', () => {
    render(<HeadacheList />)
    expect(screen.getByText('Heavy headache')).toBeInTheDocument()
    expect(screen.getByText('Light headache')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook, isLoading: true })
    const { container } = render(<HeadacheList />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error message when error is set', () => {
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook, error: 'Load failed' })
    render(<HeadacheList />)
    expect(screen.getByText(/load failed/i)).toBeInTheDocument()
  })

  it('hides entries below filter threshold', () => {
    mockUseHeadacheHistory.mockReturnValue({
      ...baseHook,
      filteredEntries: [entry1],
    })
    render(<HeadacheList />)
    expect(screen.getByText('Heavy headache')).toBeInTheDocument()
    expect(screen.queryByText('Light headache')).not.toBeInTheDocument()
  })

  it('calls setSeverityFilter when a filter button is clicked', async () => {
    const setSeverityFilter = vi.fn()
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook, setSeverityFilter })
    render(<HeadacheList />)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(setSeverityFilter).toHaveBeenCalledWith(3)
  })

  it('shows delete confirmation when Delete is clicked, then calls deleteEntry on confirm', async () => {
    const deleteEntry = vi.fn().mockResolvedValue(undefined)
    mockUseHeadacheHistory.mockReturnValue({ ...baseHook, deleteEntry })
    render(<HeadacheList />)

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Confirmation dialog should appear
    const dialog = screen.getByRole('dialog', { name: /confirm deletion/i })
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument()

    // Confirm deletion — scope to dialog to avoid ambiguity with list item buttons
    const confirmBtn = within(dialog).getByRole('button', { name: /^delete$/i })
    await userEvent.click(confirmBtn)

    expect(deleteEntry).toHaveBeenCalledWith(entry1.id)
  })

  it('opens edit panel when Edit is clicked', async () => {
    render(<HeadacheList />)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await userEvent.click(editButtons[0])
    expect(screen.getByTestId('edit-panel')).toBeInTheDocument()
  })
})
