// ─── Weather Repository ───────────────────────────────────────────────────────
// Data access for weather readings. No business logic — only reads and writes.

import { db } from '@/db/db'
import type { WeatherData } from '@/types/weather'

export async function saveWeatherReading(reading: WeatherData): Promise<void> {
  await db.weatherReadings.put(reading)
}

// Most recent reading — used to display current conditions.
export async function getLatestWeatherReading(): Promise<WeatherData | undefined> {
  return db.weatherReadings.orderBy('timestamp').last()
}

// Readings within a time window — used to compute the pressure trend delta.
export async function getWeatherReadingsInRange(
  fromMs: number,
  toMs: number
): Promise<WeatherData[]> {
  return db.weatherReadings.where('timestamp').between(fromMs, toMs).toArray()
}

// Delete all readings with a timestamp older than `beforeMs`.
// Callers are responsible for computing the cutoff (e.g. Date.now() - WEATHER_RETENTION_MS).
export async function pruneOldWeatherReadings(beforeMs: number): Promise<void> {
  await db.weatherReadings.where('timestamp').below(beforeMs).delete()
}
