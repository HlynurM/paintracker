// ─── Weather Store (Zustand) ──────────────────────────────────────────────────
// Holds the current weather state in memory for the whole app.
// Components subscribe to this store and re-render when it changes.
//
// WHY ZUSTAND (not useState or Context)?
//   - Multiple components across different pages need weather data
//   - We don't want to re-fetch every time a component mounts
//   - Zustand lets you read the store from anywhere without prop drilling
//
// Docs: https://zustand.dev/getting-started/introduction

import { create } from 'zustand'
import type { WeatherData } from '@/types/weather'

interface WeatherState {
  // The current weather reading (null = not yet loaded)
  current: WeatherData | null
  // Are we currently fetching?
  loading: boolean
  // Last error message (null = no error)
  error: string | null
  // When was the last successful fetch?
  lastFetchedAt: number | null

  // Actions — functions that update the state
  setCurrent: (data: WeatherData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// `create` returns a hook. The convention: name it `use___Store`.
// Calling `useWeatherStore(state => state.current)` subscribes a component
// to just the `current` field — it won't re-render for unrelated changes.
export const useWeatherStore = create<WeatherState>((set) => ({
  current: null,
  loading: false,
  error: null,
  lastFetchedAt: null,

  setCurrent: (data) =>
    set({ current: data, lastFetchedAt: Date.now(), error: null }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),
}))
