// ─── Headache Service ─────────────────────────────────────────────────────────
// YOUR TASK: Complete this file.
//
// This service creates a HeadacheEntry from form data.
// It is a pure function — no React, no database calls.
// The hook (useHeadacheLog.ts) calls this and then saves the result.
//
// WHAT IT NEEDS TO DO:
//   1. Take HeadacheFormData (from the form) + the current WeatherData
//   2. Generate an id (use crypto.randomUUID())
//   3. Set the timestamp (Date.now())
//   4. Freeze the weather as a WeatherSnapshot (Object.freeze works, or just spread)
//   5. Return a complete HeadacheEntry
//
// GUIDE:
//   - crypto.randomUUID() is built into modern browsers — no library needed
//   - WeatherSnapshot is `Readonly<WeatherData>` — just pass the WeatherData as-is
//   - Look at the HeadacheEntry type in src/types/headache.ts to see all fields

import type { HeadacheEntry, HeadacheFormData } from '@/types/headache'
import type { WeatherData, WeatherSnapshot } from '@/types/weather'

export function createHeadacheEntry(
  formData: HeadacheFormData,
  currentWeather: WeatherData
): HeadacheEntry {
  const snapshot: WeatherSnapshot = { ...currentWeather }

  // TODO: Fill this in.
  // Return a HeadacheEntry with:
  //   id: crypto.randomUUID()
  //   timestamp: Date.now()
  //   severity: formData.severity
  //   notes: formData.notes
  //   triggers: formData.triggers
  //   weather: snapshot
  throw new Error('headacheService.createHeadacheEntry not yet implemented')
}
