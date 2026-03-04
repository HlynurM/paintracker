// ─── Pressure Analysis ────────────────────────────────────────────────────────
// Pure functions — NO React, NO database, NO side effects.
// Input goes in, output comes out. That's it.
//
// WHY PURE FUNCTIONS?
//   They are trivial to test (no mocks needed) and trivial to read.
//   This is where your core domain logic lives.

import type { PressureRisk, PressureTrend, WeatherData } from '@/types/weather'
import { PRESSURE_THRESHOLDS } from '@/config/constants'

// Determine trend direction from the hPa delta over the last 3 hours.
// A positive delta means pressure is rising; negative means falling.
export function computeTrend(deltaHpa: number): PressureTrend {
  if (deltaHpa > PRESSURE_THRESHOLDS.STABLE_MAX_DELTA) return 'rising'
  if (deltaHpa < -PRESSURE_THRESHOLDS.STABLE_MAX_DELTA) return 'falling'
  return 'stable'
}

// Translate the absolute delta into a human risk level.
// "High" risk doesn't mean you WILL get a headache — it means the condition
// is associated with headaches based on the thresholds in constants.ts.
export function computeRisk(deltaHpa: number): PressureRisk {
  const abs = Math.abs(deltaHpa)
  if (abs >= PRESSURE_THRESHOLDS.MEDIUM_DELTA) return 'high'
  if (abs >= PRESSURE_THRESHOLDS.STABLE_MAX_DELTA) return 'medium'
  return 'low'
}

// Given an array of weather readings ordered by time, find the reading
// closest to `targetMs` milliseconds ago. Returns undefined if no readings exist.
export function findReadingNearTime(
  readings: WeatherData[],
  targetMs: number
): WeatherData | undefined {
  if (readings.length === 0) return undefined

  return readings.reduce((closest, current) => {
    const currentDiff = Math.abs(current.timestamp - targetMs)
    const closestDiff = Math.abs(closest.timestamp - targetMs)
    return currentDiff < closestDiff ? current : closest
  })
}

// Calculate the pressure delta: current pressure minus the pressure ~3h ago.
// Returns 0 if we don't have enough history yet.
export function calculateDelta(
  current: WeatherData,
  readings: WeatherData[],
  windowMs: number
): number {
  const threeHoursAgoMs = current.timestamp - windowMs
  const pastReading = findReadingNearTime(readings, threeHoursAgoMs)

  if (!pastReading) return 0
  return parseFloat((current.pressure - pastReading.pressure).toFixed(1))
}
