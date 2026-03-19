import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePrediction } from './usePrediction'

vi.mock('@/db/repositories/headacheRepository', () => ({
  getAllHeadacheEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/db/repositories/sleepRepository', () => ({
  getSleepRecordsInRange: vi.fn().mockResolvedValue([]),
}))

const mockWeather = {
  timestamp: Date.now(),
  pressure: 1010,
  temperature: 15,
  humidity: 60,
  windSpeed: 10,
  trend: 'stable',
  trendDeltaHpa: -1,
}

vi.mock('@/features/weather/store/weatherStore', () => ({
  useWeatherStore: vi.fn((selector: (s: object) => unknown) =>
    selector({ currentWeather: mockWeather })
  ),
}))

const setPrediction = vi.fn()
const setCorrelation = vi.fn()
const setComputing = vi.fn()

const mockStoreState = {
  predictionResult: null,
  lastComputedAt: null,
  setPrediction,
  setCorrelation,
  setComputing,
}

vi.mock('../store/insightsStore', () => ({
  useInsightsStore: vi.fn((selector?: (s: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState
  ),
}))

// Mock useWeatherStore.getState used inside the hook
vi.mock('@/features/weather/store/weatherStore', () => {
  const getState = vi.fn(() => ({ currentWeather: mockWeather }))
  const useWeatherStore = vi.fn((selector: (s: object) => unknown) =>
    selector({ currentWeather: mockWeather })
  )
  ;(useWeatherStore as unknown as { getState: typeof getState }).getState = getState
  return { useWeatherStore }
})

describe('usePrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with isLoading as a boolean', () => {
    const { result } = renderHook(() => usePrediction())
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('returns prediction as null when store has no result', async () => {
    const { result } = renderHook(() => usePrediction())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.prediction).toBeNull()
  })

  it('calls setComputing during computation', async () => {
    renderHook(() => usePrediction())
    await waitFor(() => {
      expect(setComputing).toHaveBeenCalled()
    })
  })
})
