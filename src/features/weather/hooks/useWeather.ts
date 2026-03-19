'use client'

// ─── useWeather Hook ──────────────────────────────────────────────────────────
// Fetches weather + air quality, persists, updates the Zustand store, and sets
// up a recurring refresh interval. Uses browser geolocation with Reykjavik fallback.

import { useCallback, useEffect, useRef } from 'react'
import { fetchWeather } from '../services/weatherApi'
import { fetchAirQuality } from '../services/airQualityApi'
import { computeRisk } from '../services/pressureAnalysis'
import { saveWeatherReading, pruneOldWeatherReadings } from '@/db/repositories/weatherRepository'
import { useWeatherStore } from '../store/weatherStore'
import {
  WEATHER_FETCH_INTERVAL_MS,
  WEATHER_RETENTION_MS,
  FALLBACK_LAT,
  FALLBACK_LON,
} from '@/config/constants'

function cityFromTimezone(tz: string): string {
  return tz.split('/').pop()?.replace(/_/g, ' ') ?? ''
}

function getCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ lat: FALLBACK_LAT, lon: FALLBACK_LON })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: FALLBACK_LAT, lon: FALLBACK_LON })
    )
  })
}

export function useWeather() {
  const {
    currentWeather,
    risk,
    isLoading,
    error,
    geoError,
    lastFetchedAt,
    setCurrent,
    setLoading,
    setError,
    setGeoError,
    setLocationName,
  } = useWeatherStore()

  // Cache resolved coords so interval refreshes don't re-request geolocation
  const coordsRef = useRef<{ lat: number; lon: number } | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // Resolve coords once, then reuse
      if (!coordsRef.current) {
        const resolved = await getCoords()
        const isFallback =
          resolved.lat === FALLBACK_LAT && resolved.lon === FALLBACK_LON
        if (isFallback) {
          setGeoError('Using approximate location')
        } else {
          setGeoError(null)
        }
        coordsRef.current = resolved
      }

      const { lat, lon } = coordsRef.current

      const [weatherResult, aqResult] = await Promise.allSettled([
        fetchWeather(lat, lon),
        fetchAirQuality(lat, lon),
      ])

      if (weatherResult.status === 'rejected') {
        throw weatherResult.reason instanceof Error
          ? weatherResult.reason
          : new Error('Failed to fetch weather')
      }

      const { data, timezone } = weatherResult.value

      // Merge AQ data if available
      if (aqResult.status === 'fulfilled') {
        data.airQualityIndex = aqResult.value.airQualityIndex
        data.dust = aqResult.value.dust
      }

      setLocationName(cityFromTimezone(timezone))
      const computedRisk = computeRisk(data.trendDeltaHpa)
      await saveWeatherReading(data)
      setCurrent(data, computedRisk)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }, [setCurrent, setLoading, setError, setGeoError, setLocationName])

  useEffect(() => {
    pruneOldWeatherReadings(Date.now() - WEATHER_RETENTION_MS).catch(console.error)
    refresh()
    const interval = setInterval(refresh, WEATHER_FETCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { currentWeather, risk, isLoading, error, geoError, lastFetchedAt, refresh }
}
