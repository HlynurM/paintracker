import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useDashboardInsights } from './useDashboardInsights'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherData } from '@/types/weather'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/db/repositories/headacheRepository', () => ({
  getAllHeadacheEntries: vi.fn(),
  getHeadacheEntriesInRange: vi.fn(),
}))

vi.mock('@/db/repositories/weatherRepository', () => ({
  getWeatherReadingsInRange: vi.fn(),
}))

import {
  getAllHeadacheEntries,
  getHeadacheEntriesInRange,
} from '@/db/repositories/headacheRepository'
import { getWeatherReadingsInRange } from '@/db/repositories/weatherRepository'

const mockGetAll = getAllHeadacheEntries as ReturnType<typeof vi.fn>
const mockGetRange = getHeadacheEntriesInRange as ReturnType<typeof vi.fn>
const mockGetWeather = getWeatherReadingsInRange as ReturnType<typeof vi.fn>

function makeEntry(overrides: Partial<HeadacheEntry> = {}): HeadacheEntry {
  return {
    id: 'e1',
    timestamp: Date.now(),
    severity: 3,
    weather: null,
    ...overrides,
  }
}

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    timestamp: Date.now(),
    pressure: 1013,
    temperature: 20,
    humidity: 60,
    windSpeed: 10,
    trend: 'stable',
    trendDeltaHpa: 0,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useDashboardInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockResolvedValue([])
    mockGetRange.mockResolvedValue([])
    mockGetWeather.mockResolvedValue([])
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useDashboardInsights())
    expect(result.current.isLoading).toBe(true)
  })

  it('resolves to not loading after data fetch', async () => {
    const { result } = renderHook(() => useDashboardInsights())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('returns pressure readings from repo', async () => {
    const readings = [makeWeather({ pressure: 1005 })]
    mockGetWeather.mockResolvedValue(readings)

    const { result } = renderHook(() => useDashboardInsights())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.pressureReadings).toEqual(readings)
  })

  it('returns headache events from range repo', async () => {
    const events = [makeEntry({ severity: 4 })]
    mockGetRange.mockResolvedValue(events)

    const { result } = renderHook(() => useDashboardInsights())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.headacheEvents).toEqual(events)
  })

  it('computes trigger frequency from all entries', async () => {
    mockGetAll.mockResolvedValue([
      makeEntry({ triggers: ['stress', 'poor-sleep'] }),
      makeEntry({ triggers: ['stress'] }),
    ])

    const { result } = renderHook(() => useDashboardInsights())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.triggerFrequency[0]).toEqual({ tag: 'stress', count: 2 })
  })
})
