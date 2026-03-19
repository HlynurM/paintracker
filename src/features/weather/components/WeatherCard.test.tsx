import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeatherCard from './WeatherCard'
import type { WeatherData, PressureRisk } from '@/types/weather'

// Example values loosely based on Reykjavik / Kópavogur, Iceland
const baseWeather: WeatherData = {
  timestamp: Date.now(),
  pressure: 1009.4,
  temperature: 5,
  humidity: 80,
  windSpeed: 22,
  trend: 'stable',
  trendDeltaHpa: 0,
}

const defaultProps = {
  weather: baseWeather,
  risk: 'low' as PressureRisk,
  isLoading: false,
  error: null,
  geoError: null,
  onRetry: vi.fn(),
  temperatureUnit: 'C' as const,
  windSpeedUnit: 'kmh' as const,
}

describe('WeatherCard', () => {
  it('shows animated skeleton when loading with no data', () => {
    const { container } = render(
      <WeatherCard {...defaultProps} weather={null} isLoading={true} />
    )
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(screen.queryByText(/hPa/)).toBeNull()
  })

  it('renders pressure, delta, and temperature in Celsius', () => {
    render(<WeatherCard {...defaultProps} />)
    expect(screen.getByText(/1009\.4 hPa/)).toBeTruthy()
    expect(screen.getByText(/0\.0 hPa \/ 3h/)).toBeTruthy()
    expect(screen.getByText(/5°C/)).toBeTruthy()
  })

  it('renders temperature in Fahrenheit', () => {
    render(<WeatherCard {...defaultProps} temperatureUnit="F" />)
    expect(screen.getByText(/41°F/)).toBeTruthy()
  })

  it('renders wind speed in km/h', () => {
    render(<WeatherCard {...defaultProps} />)
    expect(screen.getByText(/22 km\/h/)).toBeTruthy()
  })

  it('renders wind speed in mph', () => {
    render(<WeatherCard {...defaultProps} windSpeedUnit="mph" />)
    expect(screen.getByText(/mph/)).toBeTruthy()
  })

  it('renders AQI and dust when present', () => {
    const weather = { ...baseWeather, airQualityIndex: 42, dust: 8 }
    render(<WeatherCard {...defaultProps} weather={weather} />)
    expect(screen.getByText(/AQI 42/)).toBeTruthy()
    expect(screen.getByText(/Dust 8/)).toBeTruthy()
  })

  it('hides AQI row when absent', () => {
    render(<WeatherCard {...defaultProps} />)
    expect(screen.queryByText(/AQI/)).toBeNull()
    expect(screen.queryByText(/Dust/)).toBeNull()
  })

  it('applies green class for low risk', () => {
    const { container } = render(<WeatherCard {...defaultProps} risk="low" />)
    expect(container.querySelector('.text-green-700, .text-green-400')).toBeTruthy()
  })

  it('applies amber class for medium risk', () => {
    const { container } = render(<WeatherCard {...defaultProps} risk="medium" />)
    expect(container.querySelector('.text-amber-700, .text-amber-400')).toBeTruthy()
  })

  it('applies red class for high risk', () => {
    const { container } = render(<WeatherCard {...defaultProps} risk="high" />)
    expect(container.querySelector('.text-red-700, .text-red-400')).toBeTruthy()
  })

  it('shows stable arrow when trendDeltaHpa is 0', () => {
    render(<WeatherCard {...defaultProps} />)
    expect(screen.getByLabelText('Stable')).toBeTruthy()
    expect(screen.getByText(/\+0\.0 hPa \/ 3h/)).toBeTruthy()
  })

  it('shows falling arrow when trendDeltaHpa is negative', () => {
    const weather = { ...baseWeather, trend: 'falling' as const, trendDeltaHpa: -3.2 }
    render(<WeatherCard {...defaultProps} weather={weather} />)
    expect(screen.getByLabelText('Falling')).toBeTruthy()
    expect(screen.getByText(/-3\.2 hPa \/ 3h/)).toBeTruthy()
  })

  it('shows error and retry button when error set and no weather data', () => {
    render(<WeatherCard {...defaultProps} weather={null} error="Network error" />)
    expect(screen.getByText('Network error')).toBeTruthy()
    expect(screen.getByText('Retry')).toBeTruthy()
    expect(screen.queryByText(/hPa/)).toBeNull()
  })

  it('shows error banner AND stale weather values when both present', () => {
    render(<WeatherCard {...defaultProps} error="Stale" />)
    expect(screen.getByText('Stale')).toBeTruthy()
    expect(screen.getByText(/1009\.4 hPa/)).toBeTruthy()
  })

  it('shows geoError chip when set', () => {
    render(<WeatherCard {...defaultProps} geoError="Using approximate location" />)
    expect(screen.getByText('Using approximate location')).toBeTruthy()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<WeatherCard {...defaultProps} weather={null} error="err" onRetry={onRetry} />)
    await userEvent.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
