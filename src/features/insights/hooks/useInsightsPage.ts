'use client'

import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { getHeadacheEntriesInRange, getAllHeadacheEntries } from '@/db/repositories/headacheRepository'
import { getWeatherReadingsInRange } from '@/db/repositories/weatherRepository'
import { getSleepRecordsInRange } from '@/db/repositories/sleepRepository'
import { getAllRemedyEntries } from '@/db/repositories/remedyRepository'
import { useWeatherStore } from '@/features/weather/store/weatherStore'
import { useInsightsStore } from '../store/insightsStore'
import { applyOutlierFilter } from '../services/outlierFilter'
import { computeCorrelation } from '../services/correlationEngine'
import { computeConfidence } from '../services/confidenceModel'
import { computeTriggerFrequency } from '../services/insightsService'
import type { HeadacheEntry } from '@/types/headache'
import type { WeatherData } from '@/types/weather'
import type { RemedyEntry } from '@/types/remedy'
import type { CorrelationResult, ConfidenceScore, OutlierSummary } from '@/types/prediction'
import type { TriggerCount } from '../services/insightsService'
import type { AnalysisWindow } from '@/config/constants'

interface UseInsightsPageReturn {
  correlation: CorrelationResult | null
  confidence: ConfidenceScore | null
  pressureReadings: WeatherData[]
  headacheEvents: HeadacheEntry[]
  triggerFrequency: TriggerCount[]
  remedyEntries: RemedyEntry[]
  outlierSummary: OutlierSummary | null
  isLoading: boolean
}

function windowToMs(window: AnalysisWindow): number | null {
  switch (window) {
    case '30d': return 30 * 24 * 60 * 60 * 1000
    case '60d': return 60 * 24 * 60 * 60 * 1000
    case '90d': return 90 * 24 * 60 * 60 * 1000
    case 'all': return null
  }
}

export function useInsightsPage(): UseInsightsPageReturn {
  const { analysisWindow } = useInsightsStore()
  const currentWeather = useWeatherStore((s) => s.currentWeather)

  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null)
  const [confidence, setConfidence] = useState<ConfidenceScore | null>(null)
  const [pressureReadings, setPressureReadings] = useState<WeatherData[]>([])
  const [headacheEvents, setHeadacheEvents] = useState<HeadacheEntry[]>([])
  const [triggerFrequency, setTriggerFrequency] = useState<TriggerCount[]>([])
  const [remedyEntries, setRemedyEntries] = useState<RemedyEntry[]>([])
  const [outlierSummary, setOutlierSummary] = useState<OutlierSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const now = Date.now()
        const windowMs = windowToMs(analysisWindow)
        const fromMs = windowMs ? now - windowMs : 0

        const fromDate = format(fromMs, 'yyyy-MM-dd')
        const toDate = format(now, 'yyyy-MM-dd')

        const [entries, pressure, sleepRecords, remedies] = await Promise.all([
          windowMs
            ? getHeadacheEntriesInRange(fromMs, now)
            : getAllHeadacheEntries(),
          getWeatherReadingsInRange(fromMs || 0, now),
          getSleepRecordsInRange(fromDate, toDate),
          getAllRemedyEntries(),
        ])

        if (cancelled) return

        const summary = applyOutlierFilter(entries)
        const corr = computeCorrelation(summary.cleanedEntries)

        const latestTimestamp = entries.length > 0 ? entries[0].timestamp : 0
        const latestEntryAgeMs = now - latestTimestamp

        const conf = computeConfidence({
          entries: summary.cleanedEntries,
          outlierRate: summary.outlierRate,
          hasSleepData: sleepRecords.length > 0,
          latestEntryAgeMs,
        })

        setOutlierSummary(summary)
        setCorrelation(corr)
        setConfidence(conf)
        setPressureReadings(pressure)
        setHeadacheEvents(entries)
        setTriggerFrequency(computeTriggerFrequency(entries))
        setRemedyEntries(remedies)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [analysisWindow, currentWeather])

  return {
    correlation,
    confidence,
    pressureReadings,
    headacheEvents,
    triggerFrequency,
    remedyEntries,
    outlierSummary,
    isLoading,
  }
}
