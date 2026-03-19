// ─── Weather API ──────────────────────────────────────────────────────────────
// Fetches live weather from Open-Meteo (free, no API key needed).
// This is the only file that makes network requests for weather data.
//
// Open-Meteo docs: https://open-meteo.com/en/docs
//
// This function is INTENTIONALLY not a hook — it's a plain async function.
// Hooks that call it are in ../hooks/useWeather.ts.

import type { WeatherData } from '@/types/weather'
import { PRESSURE_TREND_WINDOW_MS } from '@/config/constants'
import { calculateDelta, computeTrend } from './pressureAnalysis'

// ─── Open-Meteo response shape ────────────────────────────────────────────────
// We define only the fields we use — TypeScript's structural typing handles
// the rest. The API returns much more data; we just ignore it.
interface OpenMeteoResponse {
  timezone: string
  current: {
    time: string
    surface_pressure: number   // hPa
    temperature_2m: number     // °C
    relative_humidity_2m: number
    wind_speed_10m: number     // km/h
  }
  hourly: {
    time: string[]
    surface_pressure: number[]
  }
}

// Build the Open-Meteo URL for a given latitude/longitude.
// We request current conditions + the last 24h of hourly pressure history.
function buildUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'surface_pressure,temperature_2m,relative_humidity_2m,wind_speed_10m',
    hourly: 'surface_pressure',
    past_days: '1',
    forecast_days: '1',
    timezone: 'auto',
  })
  return `https://api.open-meteo.com/v1/forecast?${params}`
}

// Parse the raw API response into our app's WeatherData type.
// The history array is used to compute the 3-hour pressure delta.
function parseResponse(json: OpenMeteoResponse): WeatherData {
  const now = Date.now()

  // Convert hourly history into WeatherData-like objects so we can find
  // the reading closest to 3 hours ago.
  const hourlyReadings: WeatherData[] = json.hourly.time.map((timeStr, i) => ({
    timestamp: new Date(timeStr).getTime(),
    pressure: json.hourly.surface_pressure[i],
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    trend: 'stable',
    trendDeltaHpa: 0,
  }))

  const currentRaw: WeatherData = {
    timestamp: now,
    pressure: json.current.surface_pressure,
    temperature: json.current.temperature_2m,
    humidity: json.current.relative_humidity_2m,
    windSpeed: json.current.wind_speed_10m,
    trend: 'stable',       // will be overwritten below
    trendDeltaHpa: 0,      // will be overwritten below
  }

  // Calculate how much pressure changed in the last 3 hours
  const delta = calculateDelta(currentRaw, hourlyReadings, PRESSURE_TREND_WINDOW_MS)

  return {
    ...currentRaw,
    trendDeltaHpa: delta,
    trend: computeTrend(delta),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Fetch current weather for a latitude/longitude pair.
// Throws if the network request fails — callers handle the error.
export async function fetchWeather(lat: number, lon: number): Promise<{ data: WeatherData; timezone: string }> {
  const response = await fetch(buildUrl(lat, lon))

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as OpenMeteoResponse
  return { data: parseResponse(json), timezone: json.timezone }
}
