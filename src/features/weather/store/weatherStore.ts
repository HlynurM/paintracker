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
  lastFetchedAt: number | null

  setCurrent: (data: WeatherData, risk: PressureRisk) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: null,
  risk: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  setCurrent: (data, risk) =>
    set({ currentWeather: data, risk, lastFetchedAt: Date.now(), error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}))
