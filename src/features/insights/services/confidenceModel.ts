import type { HeadacheEntry } from '@/types/headache'
import type { ConfidenceScore, ConfidenceLabel, ConfidenceBreakdown } from '@/types/prediction'
import {
  CONFIDENCE_MIN_ENTRIES,
  CONFIDENCE_CAP,
  CONFIDENCE_STALE_DAYS,
} from '@/config/constants'

interface ConfidenceParams {
  entries: HeadacheEntry[]
  outlierRate: number
  hasSleepData: boolean
  latestEntryAgeMs: number
}

function computeBase(n: number): number {
  let base = 0
  if (n >= 10) base = 20
  if (n >= 25) base += 15
  if (n >= 50) base += 15
  if (n >= 100) base += 15
  if (n >= 200) base += 10
  return base
}

function computeLabel(score: number): ConfidenceLabel {
  if (score < 20) return 'insufficient'
  if (score < 40) return 'low'
  if (score < 60) return 'moderate'
  return 'good'
}

export function computeConfidence(params: ConfidenceParams): ConfidenceScore {
  const { entries, outlierRate, hasSleepData, latestEntryAgeMs } = params
  const n = entries.length

  const base = computeBase(n)
  const bonuses: ConfidenceBreakdown['bonuses'] = []
  const penalties: ConfidenceBreakdown['penalties'] = []

  // Bonuses
  if (hasSleepData) {
    bonuses.push({ reason: 'Sleep data available', value: 5 })
  }

  const timestampsSorted = [...entries.map((e) => e.timestamp)].sort((a, b) => a - b)
  const spanDays =
    timestampsSorted.length >= 2
      ? (timestampsSorted[timestampsSorted.length - 1] - timestampsSorted[0]) /
        (24 * 60 * 60 * 1000)
      : 0

  if (spanDays > 60) {
    bonuses.push({ reason: 'Data spans > 60 days', value: 5 })
  }

  const entriesWithTriggers = entries.filter(
    (e) => e.triggers && e.triggers.length > 0
  ).length
  if (n > 0 && entriesWithTriggers / n > 0.5) {
    bonuses.push({ reason: '> 50% entries have triggers', value: 5 })
  }

  // Penalties
  const staleLimitMs = CONFIDENCE_STALE_DAYS * 24 * 60 * 60 * 1000
  if (latestEntryAgeMs > staleLimitMs) {
    penalties.push({ reason: `No entries in ${CONFIDENCE_STALE_DAYS} days`, value: -10 })
  }

  if (outlierRate > 0.2) {
    penalties.push({ reason: 'High outlier rate (> 20%)', value: -5 })
  }

  const weatherEntries = entries.filter((e) => e.weather !== null).length
  if (n > 0 && weatherEntries / n < 0.3) {
    penalties.push({ reason: '< 30% entries have weather data', value: -10 })
  }

  const bonusTotal = bonuses.reduce((sum, b) => sum + b.value, 0)
  const penaltyTotal = penalties.reduce((sum, p) => sum + p.value, 0)
  const raw = base + bonusTotal + penaltyTotal
  const score = Math.max(0, Math.min(CONFIDENCE_CAP, raw))

  // If below minimum entries, force to insufficient regardless
  const label = n < CONFIDENCE_MIN_ENTRIES ? 'insufficient' : computeLabel(score)

  return {
    score,
    label,
    breakdown: { base, bonuses, penalties },
  }
}
