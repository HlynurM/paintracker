'use client'

import { useState, useEffect } from 'react'
import { getAllHeadacheEntries } from '@/db/repositories/headacheRepository'
import { getSleepRecordsInRange } from '@/db/repositories/sleepRepository'
import { useWeatherStore } from '@/features/weather/store/weatherStore'
import { useInsightsStore } from '../store/insightsStore'
import { applyOutlierFilter } from '../services/outlierFilter'
import { computeCorrelation } from '../services/correlationEngine'
import { computeConfidence } from '../services/confidenceModel'
import { computePrediction } from '../services/predictionEngine'
import type { PredictionResult } from '@/types/prediction'
import { format, subDays } from 'date-fns'

const RECOMPUTE_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

export function usePrediction(): { prediction: PredictionResult | null; isLoading: boolean } {
  const currentWeather = useWeatherStore((s) => s.currentWeather)
  const { predictionResult, lastComputedAt, setPrediction, setCorrelation, setComputing } =
    useInsightsStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const isStale =
      lastComputedAt === null || Date.now() - lastComputedAt > RECOMPUTE_INTERVAL_MS

    if (!isStale && predictionResult !== null) return

    let cancelled = false

    async function compute() {
      setIsLoading(true)
      setComputing(true)
      try {
        const now = Date.now()
        const fromDate = format(subDays(now, 90), 'yyyy-MM-dd')
        const toDate = format(now, 'yyyy-MM-dd')

        const [allEntries, sleepRecords] = await Promise.all([
          getAllHeadacheEntries(),
          getSleepRecordsInRange(fromDate, toDate),
        ])

        if (cancelled) return

        const weather = useWeatherStore.getState().currentWeather
        if (!weather) {
          setIsLoading(false)
          setComputing(false)
          return
        }

        const outlierSummary = applyOutlierFilter(allEntries)
        const correlation = computeCorrelation(outlierSummary.cleanedEntries)

        const latestTimestamp =
          allEntries.length > 0 ? allEntries[0].timestamp : 0
        const latestEntryAgeMs = now - latestTimestamp

        const sortedSleep = [...sleepRecords].sort((a, b) => b.date.localeCompare(a.date))
        const lastSleepRecord = sortedSleep[0] ?? null

        const confidence = computeConfidence({
          entries: outlierSummary.cleanedEntries,
          outlierRate: outlierSummary.outlierRate,
          hasSleepData: sleepRecords.length > 0,
          latestEntryAgeMs,
        })

        const prediction = computePrediction({
          correlation,
          confidence,
          currentWeather: weather,
          lastSleepRecord,
        })

        if (!cancelled) {
          setCorrelation(correlation, outlierSummary)
          setPrediction(prediction)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setComputing(false)
        }
      }
    }

    compute()
    return () => {
      cancelled = true
    }
  }, [currentWeather, lastComputedAt, predictionResult, setPrediction, setCorrelation, setComputing])

  return { prediction: predictionResult, isLoading }
}
