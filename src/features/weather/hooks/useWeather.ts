'use client'

// ─── useWeather Hook ──────────────────────────────────────────────────────────
// Fetches weather, persists it, updates the Zustand store, and sets up a
// recurring refresh interval. Components call this hook — they never call
// fetchWeather() or the repository directly.

import { useCallback, useEffect } from 'react'
import { fetchWeather } from '../services/weatherApi'
import { computeRisk } from '../services/pressureAnalysis'
import { saveWeatherReading, pruneOldWeatherReadings } from '@/db/repositories/weatherRepository'
import { useWeatherStore } from '../store/weatherStore'
import { WEATHER_FETCH_INTERVAL_MS, WEATHER_RETENTION_MS } from '@/config/constants'

// TODO: Replace with navigator.geolocation — hardcoded for MVP until F02 geolocation is wired up.
const DEFAULT_LAT = 52.52
const DEFAULT_LON = 13.41

export function useWeather() {
  const { currentWeather, risk, isLoading, error, lastFetchedAt, setCurrent, setLoading, setError } =
    useWeatherStore()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWeather(DEFAULT_LAT, DEFAULT_LON)
      const computedRisk = computeRisk(data.trendDeltaHpa)
      await saveWeatherReading(data)
      setCurrent(data, computedRisk)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }, [setCurrent, setLoading, setError])

  useEffect(() => {
    pruneOldWeatherReadings(Date.now() - WEATHER_RETENTION_MS).catch(console.error)
    refresh()
    const interval = setInterval(refresh, WEATHER_FETCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { currentWeather, risk, isLoading, error, lastFetchedAt, refresh }
}
