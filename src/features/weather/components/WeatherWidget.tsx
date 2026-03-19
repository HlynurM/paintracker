'use client'

// ─── WeatherWidget ────────────────────────────────────────────────────────────
// Container component. Reads stores, passes props to presentational WeatherCard.

import { useWeather } from '../hooks/useWeather'
import { useWeatherStore } from '../store/weatherStore'
import { useSettingsStore } from '@/features/settings'
import WeatherCard from './WeatherCard'

export default function WeatherWidget() {
  const { refresh } = useWeather()
  const { currentWeather, risk, isLoading, error, geoError } = useWeatherStore()
  const { temperatureUnit, windSpeedUnit } = useSettingsStore()

  return (
    <WeatherCard
      weather={currentWeather}
      risk={risk}
      isLoading={isLoading}
      error={error}
      geoError={geoError}
      onRetry={refresh}
      temperatureUnit={temperatureUnit}
      windSpeedUnit={windSpeedUnit}
    />
  )
}
