import type { HeadacheEntry } from '@/types/headache'
import type { OutlierSummary } from '@/types/prediction'
import { IQR_MULTIPLIER, DUPLICATE_GUARD_MS } from '@/config/constants'

function computeIQR(values: number[]): { q1: number; q3: number; iqr: number } {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const lower = sorted.slice(0, mid)
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1)

  const q1 = lower[Math.floor(lower.length / 2)] ?? 0
  const q3 = upper[Math.floor(upper.length / 2)] ?? 0
  return { q1, q3, iqr: q3 - q1 }
}

export function applyOutlierFilter(entries: HeadacheEntry[]): OutlierSummary {
  if (entries.length === 0) {
    return { cleanedEntries: [], flaggedCount: 0, outlierRate: 0 }
  }

  const flaggedIds = new Set<string>()

  // IQR on severity
  if (entries.length >= 4) {
    const severities = entries.map((e) => e.severity)
    const { q1, q3, iqr } = computeIQR(severities)
    const lowerBound = q1 - IQR_MULTIPLIER * iqr
    const upperBound = q3 + IQR_MULTIPLIER * iqr
    for (const entry of entries) {
      if (entry.severity < lowerBound || entry.severity > upperBound) {
        flaggedIds.add(entry.id)
      }
    }
  }

  // IQR on |weather.trendDeltaHpa| for entries with weather
  const weatherEntries = entries.filter((e) => e.weather !== null)
  if (weatherEntries.length >= 4) {
    const deltas = weatherEntries.map((e) => Math.abs(e.weather!.trendDeltaHpa))
    const { q1, q3, iqr } = computeIQR(deltas)
    const lowerBound = q1 - IQR_MULTIPLIER * iqr
    const upperBound = q3 + IQR_MULTIPLIER * iqr
    for (const entry of weatherEntries) {
      const delta = Math.abs(entry.weather!.trendDeltaHpa)
      if (delta < lowerBound || delta > upperBound) {
        flaggedIds.add(entry.id)
      }
    }
  }

  // Duplicate detection: sort by timestamp, flag lower-severity near-duplicates
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp)
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (b.timestamp - a.timestamp < DUPLICATE_GUARD_MS) {
      // Keep higher severity, flag lower
      if (a.severity >= b.severity) {
        flaggedIds.add(b.id)
      } else {
        flaggedIds.add(a.id)
      }
    }
  }

  const cleanedEntries = entries.filter((e) => !flaggedIds.has(e.id))
  const flaggedCount = flaggedIds.size

  return {
    cleanedEntries,
    flaggedCount,
    outlierRate: flaggedCount / entries.length,
  }
}
