'use client'

// ─── Weather Store (Zustand) ──────────────────────────────────────────────────
// Holds the current weather state in memory for the whole app.
// Components subscribe to this store and re-render when it changes.

import { create } from 'zustand'
import type { WeatherData, PressureRisk } from '@/types/weather'

interface WeatherState {
  currentWeather: WeatherData | null
  risk: PressureRisk | null
  isLoading: boolean
  error: string | null
  geoError: string | null
  lastFetchedAt: number | null
  locationName: string | null

  setCurrent: (data: WeatherData, risk: PressureRisk) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setGeoError: (geoError: string | null) => void
  setLocationName: (name: string | null) => void
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: null,
  risk: null,
  isLoading: false,
  error: null,
  geoError: null,
  lastFetchedAt: null,
  locationName: null,

  setCurrent: (data, risk) =>
    set({ currentWeather: data, risk, lastFetchedAt: Date.now(), error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setGeoError: (geoError) => set({ geoError }),

  setLocationName: (name) => set({ locationName: name }),
}))
