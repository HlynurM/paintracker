import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useHeadacheLog } from './useHeadacheLog'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSaveHeadacheEntry = vi.fn()
vi.mock('@/db/repositories/headacheRepository', () => ({
  saveHeadacheEntry: (...args: unknown[]) => mockSaveHeadacheEntry(...args),
}))

const mockGetState = vi.fn(() => ({ currentWeather: null }))
vi.mock('@/features/weather', () => ({
  useWeatherStore: { getState: () => mockGetState() },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseFormData = { severity: 3 as const, notes: 'test', triggers: [] }

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useHeadacheLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveHeadacheEntry.mockResolvedValue(undefined)
    mockGetState.mockReturnValue({ currentWeather: null })
  })

  it('happy path — saveHeadacheEntry called once, isSubmitting false, no error', async () => {
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await result.current.logHeadache(baseFormData)
    })

    expect(mockSaveHeadacheEntry).toHaveBeenCalledTimes(1)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('weather null — save still called, entry has weather: null', async () => {
    mockGetState.mockReturnValue({ currentWeather: null })
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await result.current.logHeadache(baseFormData)
    })

    expect(mockSaveHeadacheEntry).toHaveBeenCalledTimes(1)
    const savedEntry = mockSaveHeadacheEntry.mock.calls[0][0]
    expect(savedEntry.weather).toBeNull()
  })

  it('double-submit within 1s — saveHeadacheEntry called exactly once', async () => {
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await result.current.logHeadache(baseFormData)
    })

    // Second submit immediately (within debounce window)
    await act(async () => {
      await result.current.logHeadache(baseFormData)
    })

    expect(mockSaveHeadacheEntry).toHaveBeenCalledTimes(1)
  })

  it('save throws — error is set, promise rejects', async () => {
    mockSaveHeadacheEntry.mockRejectedValue(new Error('DB write failed'))
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await expect(result.current.logHeadache(baseFormData)).rejects.toThrow('DB write failed')
    })

    expect(result.current.error).toBe('DB write failed')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('boundary severity 1 — succeeds', async () => {
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await result.current.logHeadache({ ...baseFormData, severity: 1 })
    })

    expect(mockSaveHeadacheEntry).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBeNull()
  })

  it('boundary severity 5 — succeeds', async () => {
    const { result } = renderHook(() => useHeadacheLog())

    await act(async () => {
      await result.current.logHeadache({ ...baseFormData, severity: 5 })
    })

    expect(mockSaveHeadacheEntry).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBeNull()
  })
})
