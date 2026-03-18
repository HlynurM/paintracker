'use client'

// ─── useHeadacheLog Hook ──────────────────────────────────────────────────────
// Central integration point for logging a headache entry.
// Owns: debounce guard, weather read at submit time, repository write,
// isSubmitting state, and error state.

import { useState, useRef, useCallback } from 'react'
import { createHeadacheEntry } from '../services/headacheService'
import { saveHeadacheEntry } from '@/db/repositories/headacheRepository'
import { useWeatherStore } from '@/features/weather'
import { DEBOUNCE_GUARD_MS } from '@/config/constants'
import type { HeadacheFormData } from '@/types/headache'

interface UseHeadacheLogReturn {
  logHeadache: (data: HeadacheFormData) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function useHeadacheLog(): UseHeadacheLogReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSavedAt = useRef<number | null>(null)

  const logHeadache = useCallback(async (data: HeadacheFormData) => {
    // Debounce guard — silently ignore rapid re-submissions
    if (lastSavedAt.current !== null && Date.now() - lastSavedAt.current < DEBOUNCE_GUARD_MS) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Read weather at action time only — no subscription needed
      const { currentWeather } = useWeatherStore.getState()
      const entry = createHeadacheEntry(data, currentWeather)
      await saveHeadacheEntry(entry)
      lastSavedAt.current = Date.now()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save headache entry'
      setError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { logHeadache, isSubmitting, error }
}
