'use client'

// ─── WeatherBadge ─────────────────────────────────────────────────────────────
// Compact single-row weather strip for the Record Episode page.
// Shows pressure trend, temperature, and AQI at a glance.

import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import { useWeatherStore } from '../store/weatherStore'
import { useSettingsStore } from '@/features/settings'
import { formatTemperature } from '@/lib/units'

function aqiColor(aqi: number): string {
  if (aqi <= 50)  return 'text-green-600 dark:text-green-400'
  if (aqi <= 100) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export default function WeatherBadge() {
  const { currentWeather, isLoading } = useWeatherStore()
  const { temperatureUnit } = useSettingsStore()

  const dash = <span className="text-muted-foreground">—</span>

  if (isLoading && !currentWeather) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        {dash}
        {dash}
        {dash}
      </div>
    )
  }

  if (!currentWeather) return null

  const { trend, pressure, trendDeltaHpa, temperature, airQualityIndex } = currentWeather

  const TrendIcon =
    trend === 'rising'  ? <ArrowUp   className="h-4 w-4 text-amber-500" aria-label="Rising" /> :
    trend === 'falling' ? <ArrowDown className="h-4 w-4 text-blue-500"  aria-label="Falling" /> :
                          <ArrowRight className="h-4 w-4 text-muted-foreground" aria-label="Stable" />

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="flex items-center gap-1 font-medium">
        {TrendIcon}
        {pressure.toFixed(0)} hPa
      </span>
      <span className="text-muted-foreground text-xs">
        {trendDeltaHpa >= 0 ? '+' : ''}
        {trendDeltaHpa.toFixed(1)}
      </span>
      <span className="text-muted-foreground">·</span>
      <span>{formatTemperature(temperature, temperatureUnit)}</span>
      {airQualityIndex !== undefined && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className={`flex items-center gap-0.5 ${aqiColor(airQualityIndex)}`}>
            AQI {airQualityIndex}
          </span>
        </>
      )}
    </div>
  )
}
