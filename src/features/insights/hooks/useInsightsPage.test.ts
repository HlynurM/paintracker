import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInsightsPage } from './useInsightsPage'

vi.mock('@/db/repositories/headacheRepository', () => ({
  getHeadacheEntriesInRange: vi.fn().mockResolvedValue([]),
  getAllHeadacheEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/weatherRepository', () => ({
  getWeatherReadingsInRange: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/sleepRepository', () => ({
  getSleepRecordsInRange: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/remedyRepository', () => ({
  getAllRemedyEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/features/weather/store/weatherStore', () => ({
  useWeatherStore: vi.fn((selector: (s: object) => unknown) =>
    selector({ currentWeather: null })
  ),
}))

const mockState = {
  analysisWindow: '30d',
  predictionResult: null,
  correlationResult: null,
  outlierSummary: null,
  isComputing: false,
  lastComputedAt: null,
  setPrediction: vi.fn(),
  setCorrelation: vi.fn(),
  setWindow: vi.fn(),
  setComputing: vi.fn(),
}

vi.mock('../store/insightsStore', () => ({
  useInsightsStore: vi.fn((selector?: (s: typeof mockState) => unknown) =>
    selector ? selector(mockState) : mockState
  ),
}))

describe('useInsightsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts loading and resolves', async () => {
    const { result } = renderHook(() => useInsightsPage())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('returns empty data when no entries', async () => {
    const { result } = renderHook(() => useInsightsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.headacheEvents).toHaveLength(0)
    expect(result.current.pressureReadings).toHaveLength(0)
    expect(result.current.remedyEntries).toHaveLength(0)
    expect(result.current.triggerFrequency).toHaveLength(0)
  })

  it('uses getHeadacheEntriesInRange for windowed queries', async () => {
    const { getHeadacheEntriesInRange } = await import('@/db/repositories/headacheRepository')
    renderHook(() => useInsightsPage())
    await waitFor(() => {
      expect(vi.mocked(getHeadacheEntriesInRange)).toHaveBeenCalled()
    })
  })

  it('returns outlierSummary after loading', async () => {
    const { result } = renderHook(() => useInsightsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.outlierSummary).not.toBeNull()
    expect(result.current.outlierSummary!.flaggedCount).toBe(0)
  })
})
