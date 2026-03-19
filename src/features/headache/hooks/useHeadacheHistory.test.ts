import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useHeadacheHistory } from './useHeadacheHistory'
import type { HeadacheEntry } from '@/types/headache'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetAll = vi.fn()
const mockDelete = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/db/repositories/headacheRepository', () => ({
  getAllHeadacheEntries: (...args: unknown[]) => mockGetAll(...args),
  deleteHeadacheEntry: (...args: unknown[]) => mockDelete(...args),
}))

vi.mock('../services/headacheService', () => ({
  updateHeadache: (...args: unknown[]) => mockUpdate(...args),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const entry1: HeadacheEntry = {
  id: '1',
  timestamp: 2000,
  severity: 3,
  weather: null,
  notes: 'a',
  triggers: [],
}

const entry2: HeadacheEntry = {
  id: '2',
  timestamp: 1000,
  severity: 1,
  weather: null,
  notes: 'b',
  triggers: [],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useHeadacheHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue([entry1, entry2])
    mockDelete.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)
  })

  it('loads entries on mount', async () => {
    const { result } = renderHook(() => useHeadacheHistory())
    expect(result.current.isLoading).toBe(true)
    await act(async () => {})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.entries).toEqual([entry1, entry2])
  })

  it('filteredEntries defaults to all entries (severityFilter = 1)', async () => {
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    expect(result.current.filteredEntries).toHaveLength(2)
  })

  it('filters entries by severity threshold', async () => {
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    act(() => result.current.setSeverityFilter(2))
    expect(result.current.filteredEntries).toEqual([entry1])
  })

  it('deleteEntry calls repo and reloads', async () => {
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    await act(async () => {
      await result.current.deleteEntry('1')
    })
    expect(mockDelete).toHaveBeenCalledWith('1')
    expect(mockGetAll).toHaveBeenCalledTimes(2)
  })

  it('deleteEntry tolerates errors silently', async () => {
    mockDelete.mockRejectedValue(new Error('not found'))
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    await act(async () => {
      await result.current.deleteEntry('999')
    })
    // should not throw or set error
    expect(result.current.error).toBeNull()
  })

  it('updateEntry calls service and reloads', async () => {
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    await act(async () => {
      await result.current.updateEntry('1', { severity: 5 })
    })
    expect(mockUpdate).toHaveBeenCalledWith('1', { severity: 5 })
    expect(mockGetAll).toHaveBeenCalledTimes(2)
  })

  it('sets error on load failure', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'))
    const { result } = renderHook(() => useHeadacheHistory())
    await act(async () => {})
    expect(result.current.error).toBe('DB error')
    expect(result.current.isLoading).toBe(false)
  })
})
