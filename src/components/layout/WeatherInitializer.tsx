'use client'

// ─── WeatherInitializer ───────────────────────────────────────────────────────
// Starts the weather fetch + refresh interval for the entire (app) route group.
// Renders nothing — exists solely to call useWeather() in a client component
// while keeping the (app) layout itself a Server Component.

import { useWeather } from '@/features/weather'

export default function WeatherInitializer() {
  useWeather()
  return null
}
