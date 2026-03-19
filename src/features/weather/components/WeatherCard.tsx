'use client'

// ─── WeatherCard ──────────────────────────────────────────────────────────────
// Fully presentational weather display card.
// All data and callbacks come from props — no store access here.

import { ArrowUp, ArrowDown, ArrowRight, Thermometer, Droplets, Wind, Leaf, CloudFog } from 'lucide-react'
import type { WeatherData, PressureRisk } from '@/types/weather'
import { formatTemperature, formatWindSpeed } from '@/lib/units'

export interface WeatherCardProps {
  weather: WeatherData | null
  risk: PressureRisk | null
  isLoading: boolean
  error: string | null
  geoError: string | null
  onRetry: () => void
  temperatureUnit: 'C' | 'F'
  windSpeedUnit: 'kmh' | 'mph'
}

const RISK_STYLES: Record<PressureRisk, { label: string; classes: string }> = {
  low:    { label: 'Low risk',    classes: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  medium: { label: 'Medium risk', classes: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  high:   { label: 'High risk',   classes: 'bg-red-500/20 text-red-700 dark:text-red-400' },
}

function TrendIcon({ trend }: { trend: WeatherData['trend'] }) {
  if (trend === 'rising')  return <ArrowUp   className="h-5 w-5 text-amber-500" aria-label="Rising" />
  if (trend === 'falling') return <ArrowDown className="h-5 w-5 text-blue-500"  aria-label="Falling" />
  return <ArrowRight className="h-5 w-5 text-muted-foreground" aria-label="Stable" />
}

function aqiColor(aqi: number): string {
  if (aqi <= 50)  return 'text-green-600 dark:text-green-400'
  if (aqi <= 100) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function minutesAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60_000)
  if (mins < 1) return 'just now'
  return `${mins}m ago`
}

export default function WeatherCard({
  weather,
  risk,
  isLoading,
  error,
  geoError,
  onRetry,
  temperatureUnit,
  windSpeedUnit,
}: WeatherCardProps) {
  if (isLoading && !weather) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      {/* Row 1: risk badge · updated · geo chip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {risk && (
          <span className={`rounded-full px-2 py-0.5 font-medium ${RISK_STYLES[risk].classes}`}>
            {RISK_STYLES[risk].label}
          </span>
        )}
        {weather && (
          <span className="text-muted-foreground">Updated {minutesAgo(weather.timestamp)}</span>
        )}
        {geoError && (
          <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
            {geoError}
          </span>
        )}
      </div>

      {/* Error banner (non-blocking — stale data still shows below) */}
      {error && (
        <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={onRetry} className="ml-3 font-medium underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {weather && (
        <>
          {/* Row 2: pressure + trend */}
          <div className="flex items-center gap-2">
            <TrendIcon trend={weather.trend} />
            <span className="text-2xl font-semibold tabular-nums">{weather.pressure.toFixed(1)} hPa</span>
            <span className="text-sm text-muted-foreground">
              {weather.trendDeltaHpa >= 0 ? '+' : ''}
              {weather.trendDeltaHpa.toFixed(1)} hPa / 3h
            </span>
          </div>

          {/* Row 3: temp · humidity · wind */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              {formatTemperature(weather.temperature, temperatureUnit)}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-muted-foreground" />
              {formatWindSpeed(weather.windSpeed, windSpeedUnit)}
            </span>
          </div>

          {/* Row 4: AQI + dust (optional) */}
          {(weather.airQualityIndex !== undefined || weather.dust !== undefined) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {weather.airQualityIndex !== undefined && (
                <span className={`flex items-center gap-1 ${aqiColor(weather.airQualityIndex)}`}>
                  <Leaf className="h-4 w-4" />
                  AQI {weather.airQualityIndex}
                </span>
              )}
              {weather.dust !== undefined && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CloudFog className="h-4 w-4" />
                  Dust {weather.dust} µg/m³
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
