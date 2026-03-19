import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRemedyLog } from './useRemedyLog'
import type { RemedyFormData } from '@/types/remedy'

vi.mock('@/db/repositories/remedyRepository', () => ({
  saveRemedyEntry: vi.fn().mockResolvedValue(undefined),
  getRemediesForEntry: vi.fn().mockResolvedValue([]),
}))

vi.mock('../services/remedyService', () => ({
  createRemedyEntry: vi.fn((headacheEntryId: string, data: RemedyFormData) => ({
    id: 'test-uuid',
    headacheEntryId,
    timestamp: 1000,
    ...data,
  })),
}))

const formData: RemedyFormData = {
  tags: ['rest'],
  effectivenessRating: 4,
}

describe('useRemedyLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with isSubmitting false and no error', () => {
    const { result } = renderHook(() => useRemedyLog())
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('calls saveRemedyEntry on logRemedy', async () => {
    const { saveRemedyEntry } = await import('@/db/repositories/remedyRepository')
    const { result } = renderHook(() => useRemedyLog())

    await act(async () => {
      await result.current.logRemedy('h-1', formData)
    })

    expect(vi.mocked(saveRemedyEntry)).toHaveBeenCalledOnce()
  })

  it('sets isSubmitting true during submission', async () => {
    const { saveRemedyEntry } = await import('@/db/repositories/remedyRepository')
    let resolve: () => void
    vi.mocked(saveRemedyEntry).mockReturnValueOnce(
      new Promise((r) => { resolve = r })
    )

    const { result } = renderHook(() => useRemedyLog())
    act(() => { result.current.logRemedy('h-1', formData) })
    expect(result.current.isSubmitting).toBe(true)
    await act(async () => { resolve!() })
    expect(result.current.isSubmitting).toBe(false)
  })

  it('sets error on failure', async () => {
    const { saveRemedyEntry } = await import('@/db/repositories/remedyRepository')
    vi.mocked(saveRemedyEntry).mockRejectedValueOnce(new Error('DB error'))

    const { result } = renderHook(() => useRemedyLog())
    await act(async () => {
      await result.current.logRemedy('h-1', formData)
    })

    expect(result.current.error).toBe('DB error')
  })

  it('fetchRemedies calls getRemediesForEntry', async () => {
    const { getRemediesForEntry } = await import('@/db/repositories/remedyRepository')
    const { result } = renderHook(() => useRemedyLog())

    await act(async () => {
      await result.current.fetchRemedies('h-1')
    })

    expect(vi.mocked(getRemediesForEntry)).toHaveBeenCalledWith('h-1')
  })
})
