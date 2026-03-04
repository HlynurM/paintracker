// ─── Weather Repository ───────────────────────────────────────────────────────
// Data access for weather readings. Same rules as headacheRepository:
// only reads/writes, no logic, no React.

import { db } from '@/db/db'
import type { WeatherData } from '@/types/weather'
import { WEATHER_RETENTION_DAYS } from '@/config/constants'

export async function saveWeatherReading(reading: WeatherData): Promise<void> {
  await db.weatherReadings.put(reading)
}

// Get the single most recent reading — used to display current conditions.
export async function getLatestWeatherReading(): Promise<WeatherData | undefined> {
  return db.weatherReadings.orderBy('timestamp').last()
}

// Get readings in a time window — used to calculate pressure trend.
export async function getWeatherReadingsInRange(
  fromMs: number,
  toMs: number
): Promise<WeatherData[]> {
  return db.weatherReadings
    .where('timestamp')
    .between(fromMs, toMs)
    .toArray()
}

// Delete readings older than WEATHER_RETENTION_DAYS to keep DB lean.
// Call this periodically (e.g. on app start).
export async function pruneOldWeatherReadings(): Promise<void> {
  const cutoff = Date.now() - WEATHER_RETENTION_DAYS * 24 * 60 * 60 * 1000
  await db.weatherReadings.where('timestamp').below(cutoff).delete()
}
