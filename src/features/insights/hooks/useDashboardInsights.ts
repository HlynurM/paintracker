'use client'

// ─── useDashboardInsights ─────────────────────────────────────────────────────
// Fetches 7-day pressure readings and headache events, computes stats.
// All repo calls fire in parallel via Promise.all.

import { useState, useEffect } from 'react'
import { getAllHeadacheEntries, getHeadacheEntriesInRange } from '@/db/repositories/headacheRepository'
import { getWeatherReadingsInRange } from '@/db/repositories/weatherRepository'
import { computeTriggerFrequency, computeMonthlyStats } from '../services/insightsService'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherData } from '@/types/weather'
import type { TriggerCount, MonthlyStats } from '../services/insightsService'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface UseDashboardInsightsReturn {
  pressureReadings: WeatherData[]
  headacheEvents: HeadacheEntry[]
  triggerFrequency: TriggerCount[]
  monthlyStats: MonthlyStats
  isLoading: boolean
}

const EMPTY_STATS: MonthlyStats = {
  thisMonthCount: 0,
  lastMonthCount: 0,
  avgSeverity: null,
  delta: 0,
}

export function useDashboardInsights(): UseDashboardInsightsReturn {
  const [pressureReadings, setPressureReadings] = useState<WeatherData[]>([])
  const [headacheEvents, setHeadacheEvents] = useState<HeadacheEntry[]>([])
  const [triggerFrequency, setTriggerFrequency] = useState<TriggerCount[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>(EMPTY_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const now = Date.now()
        const from = now - SEVEN_DAYS_MS

        const [pressure, events, all] = await Promise.all([
          getWeatherReadingsInRange(from, now),
          getHeadacheEntriesInRange(from, now),
          getAllHeadacheEntries(),
        ])

        if (cancelled) return

        setPressureReadings(pressure)
        setHeadacheEvents(events)
        setTriggerFrequency(computeTriggerFrequency(all))
        setMonthlyStats(computeMonthlyStats(all, now))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { pressureReadings, headacheEvents, triggerFrequency, monthlyStats, isLoading }
}
