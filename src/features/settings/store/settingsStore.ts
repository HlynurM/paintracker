'use client'

// ─── Settings Store (Zustand) ─────────────────────────────────────────────────
// User preferences persisted to localStorage.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_TEMPERATURE_UNIT, DEFAULT_WIND_SPEED_UNIT } from '@/config/constants'

interface SettingsState {
  temperatureUnit: 'C' | 'F'
  windSpeedUnit: 'kmh' | 'mph'
  notificationsEnabled: boolean
  alertThreshold: 'medium' | 'high'
  minConfidenceToAlert: number
  themeMode: 'light' | 'dark' | 'system'
  setTemperatureUnit: (unit: 'C' | 'F') => void
  setWindSpeedUnit: (unit: 'kmh' | 'mph') => void
  setNotificationsEnabled: (enabled: boolean) => void
  setAlertThreshold: (threshold: 'medium' | 'high') => void
  setMinConfidenceToAlert: (value: number) => void
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      temperatureUnit: DEFAULT_TEMPERATURE_UNIT,
      windSpeedUnit: DEFAULT_WIND_SPEED_UNIT,
      notificationsEnabled: false,
      alertThreshold: 'high',
      minConfidenceToAlert: 40,
      themeMode: 'dark',
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setWindSpeedUnit: (unit) => set({ windSpeedUnit: unit }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setAlertThreshold: (threshold) => set({ alertThreshold: threshold }),
      setMinConfidenceToAlert: (value) => set({ minConfidenceToAlert: value }),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'paintracker-settings',
    }
  )
)
