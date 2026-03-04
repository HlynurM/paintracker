// ─── useWeather Hook ──────────────────────────────────────────────────────────
// The glue between the weather service, the repository, and the store.
// Components call this hook — they never call fetchWeather() or the repo directly.
//
// This is a "data fetching hook". It:
//   1. Fetches weather from the API
//   2. Saves it to the local database (Dexie)
//   3. Updates the Zustand store (so all components see fresh data)
//   4. Sets up a recurring fetch interval
//
// WHY SEPARATE HOOK FROM SERVICE?
//   The service (weatherApi.ts) is pure async logic — no React.
//   The hook is the React layer: it uses `useEffect` and `useCallback`
//   which are React-specific. Keeping them separate makes both testable.

'use client' // This directive marks it as a Client Component feature

import { useCallback, useEffect } from 'react'
import { fetchWeather } from '../services/weatherApi'
import { saveWeatherReading, pruneOldWeatherReadings } from '@/db/repositories/weatherRepository'
import { useWeatherStore } from '../store/weatherStore'
import { WEATHER_FETCH_INTERVAL_MS } from '@/config/constants'

// TODO: Move lat/lon to user settings (stored in Dexie or Zustand).
// Hardcoded for MVP — replace with real coordinates or geolocation API.
const DEFAULT_LAT = 52.52  // Berlin as a placeholder
const DEFAULT_LON = 13.41

export function useWeather() {
  const { current, loading, error, lastFetchedAt, setCurrent, setLoading, setError } =
    useWeatherStore()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWeather(DEFAULT_LAT, DEFAULT_LON)
      await saveWeatherReading(data)    // persist to IndexedDB
      setCurrent(data)                  // update in-memory store
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }, [setCurrent, setLoading, setError])

  useEffect(() => {
    // Prune old readings on startup (fire and forget — we don't await)
    pruneOldWeatherReadings().catch(console.error)

    // Fetch immediately on mount
    refresh()

    // Then refresh on an interval
    const interval = setInterval(refresh, WEATHER_FETCH_INTERVAL_MS)
    return () => clearInterval(interval) // cleanup when component unmounts
  }, [refresh])

  return { current, loading, error, lastFetchedAt, refresh }
}
