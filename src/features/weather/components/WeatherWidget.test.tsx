import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock hooks so WeatherWidget renders without real network/DB
vi.mock('../hooks/useWeather', () => ({
  useWeather: () => ({ refresh: vi.fn() }),
}))

vi.mock('../store/weatherStore', () => ({
  useWeatherStore: () => ({
    currentWeather: {
      timestamp: Date.now(),
      pressure: 1015.0,
      temperature: 8,
      humidity: 75,
      windSpeed: 15,
      trend: 'rising',
      trendDeltaHpa: 2.1,
    },
    risk: 'low',
    isLoading: false,
    error: null,
    geoError: null,
  }),
}))

vi.mock('@/features/settings', () => ({
  useSettingsStore: () => ({
    temperatureUnit: 'C',
    windSpeedUnit: 'kmh',
  }),
}))

import WeatherWidget from './WeatherWidget'

describe('WeatherWidget', () => {
  it('renders WeatherCard with data from stores', () => {
    render(<WeatherWidget />)
    expect(screen.getByText(/1015\.0 hPa/)).toBeTruthy()
    expect(screen.getByText(/8°C/)).toBeTruthy()
    expect(screen.getByText(/15 km\/h/)).toBeTruthy()
  })
})
