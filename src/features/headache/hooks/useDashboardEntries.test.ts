import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useDashboardEntries } from './useDashboardEntries'
import type { HeadacheEntry } from '@/types/headache'

vi.mock('@/db/repositories/headacheRepository', () => ({
  getAllHeadacheEntries: vi.fn(),
}))

import { getAllHeadacheEntries } from '@/db/repositories/headacheRepository'
const mockGetAll = getAllHeadacheEntries as ReturnType<typeof vi.fn>

function makeEntry(id: string, timestamp: number): HeadacheEntry {
  return { id, timestamp, severity: 2, weather: null }
}

describe('useDashboardEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue([])
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useDashboardEntries())
    expect(result.current.isLoading).toBe(true)
  })

  it('resolves with entries after load', async () => {
    const entries = [makeEntry('e1', 1000), makeEntry('e2', 2000)]
    mockGetAll.mockResolvedValue(entries)

    const { result } = renderHook(() => useDashboardEntries())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.entries).toEqual(entries)
  })

  it('slices to max 5 entries', async () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry(`e${i}`, i * 1000)
    )
    mockGetAll.mockResolvedValue(entries)

    const { result } = renderHook(() => useDashboardEntries())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.entries).toHaveLength(5)
  })

  it('reload() re-fetches data', async () => {
    mockGetAll.mockResolvedValueOnce([]).mockResolvedValueOnce([makeEntry('e1', 1000)])

    const { result } = renderHook(() => useDashboardEntries())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.entries).toHaveLength(0)

    await act(async () => { await result.current.reload() })
    expect(result.current.entries).toHaveLength(1)
  })

  it('sets error when repo throws', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'))

    const { result } = renderHook(() => useDashboardEntries())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('DB error')
  })
})
