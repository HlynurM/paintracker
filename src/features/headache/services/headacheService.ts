// ─── Headache Service ─────────────────────────────────────────────────────────
// Pure functions — no React, no database calls, no side effects.
// The hook (useHeadacheLog) calls these and handles persistence and state.

import { updateHeadacheEntry as repoUpdateHeadacheEntry } from '@/db/repositories/headacheRepository'
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

// Update an existing entry by id. Trims whitespace from notes.
export async function updateHeadache(
  id: string,
  patch: Partial<HeadacheFormData>
): Promise<void> {
  const cleanedPatch: Partial<HeadacheFormData> = {
    ...patch,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : undefined,
  }
  await repoUpdateHeadacheEntry(id, cleanedPatch)
}
