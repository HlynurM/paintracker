import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../store/weatherStore', () => ({
  useWeatherStore: vi.fn(),
}))

vi.mock('@/features/settings', () => ({
  useSettingsStore: () => ({
    temperatureUnit: 'C',
  }),
}))

import { useWeatherStore } from '../store/weatherStore'
import WeatherBadge from './WeatherBadge'

const baseWeather = {
  timestamp: Date.now(),
  pressure: 1009,
  temperature: 5,
  humidity: 80,
  windSpeed: 20,
  trend: 'stable' as const,
  trendDeltaHpa: -0.5,
}

describe('WeatherBadge', () => {
  it('renders pressure and temperature in Celsius', () => {
    vi.mocked(useWeatherStore).mockReturnValue({ currentWeather: baseWeather, isLoading: false } as ReturnType<typeof useWeatherStore>)
    render(<WeatherBadge />)
    expect(screen.getByText(/1009 hPa/)).toBeTruthy()
    expect(screen.getByText(/5°C/)).toBeTruthy()
  })

  it('renders AQI when present', () => {
    vi.mocked(useWeatherStore).mockReturnValue({
      currentWeather: { ...baseWeather, airQualityIndex: 33 },
      isLoading: false,
    } as ReturnType<typeof useWeatherStore>)
    render(<WeatherBadge />)
    expect(screen.getByText(/AQI 33/)).toBeTruthy()
  })

  it('hides AQI section when absent', () => {
    vi.mocked(useWeatherStore).mockReturnValue({ currentWeather: baseWeather, isLoading: false } as ReturnType<typeof useWeatherStore>)
    render(<WeatherBadge />)
    expect(screen.queryByText(/AQI/)).toBeNull()
  })

  it('shows dashes when loading', () => {
    vi.mocked(useWeatherStore).mockReturnValue({ currentWeather: null, isLoading: true } as ReturnType<typeof useWeatherStore>)
    const { container } = render(<WeatherBadge />)
    expect(container.querySelectorAll('.text-muted-foreground').length).toBeGreaterThan(0)
  })
})
