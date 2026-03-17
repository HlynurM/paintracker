// ─── Headache Service ─────────────────────────────────────────────────────────
// Pure functions — no React, no database calls, no side effects.
// The hook (useHeadacheLog) calls these and handles persistence and state.

import type { HeadacheEntry, HeadacheFormData } from '@/types/headache'
import type { WeatherData, WeatherSnapshot } from '@/types/weather'

// Build a complete HeadacheEntry from form input and the current weather reading.
// Validates severity range and trims notes. Throws on invalid severity.
export function createHeadacheEntry(
  formData: HeadacheFormData,
  currentWeather: WeatherData | null
): HeadacheEntry {
  const { severity, notes, triggers } = formData

  if (severity < 1 || severity > 5) {
    throw new RangeError(`Severity must be between 1 and 5, got ${severity}`)
  }

  const weather: WeatherSnapshot | null = currentWeather ? { ...currentWeather } : null

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    severity,
    notes: notes?.trim() || undefined,
    triggers,
    weather,
  }
}
