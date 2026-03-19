import { describe, it, expect } from 'vitest'
import { applyOutlierFilter } from './outlierFilter'
import type { HeadacheEntry } from '@/types/headache'

function makeEntry(
  id: string,
  severity: number,
  timestamp: number,
  trendDelta?: number
): HeadacheEntry {
  return {
    id,
    severity: severity as HeadacheEntry['severity'],
    timestamp,
    weather: trendDelta !== undefined
      ? {
          timestamp,
          pressure: 1010,
          temperature: 15,
          humidity: 60,
          windSpeed: 10,
          trend: 'falling',
          trendDeltaHpa: trendDelta,
        }
      : null,
  }
}

describe('applyOutlierFilter', () => {
  it('returns empty summary for empty input', () => {
    const result = applyOutlierFilter([])
    expect(result.cleanedEntries).toHaveLength(0)
    expect(result.flaggedCount).toBe(0)
    expect(result.outlierRate).toBe(0)
  })

  it('returns all entries when no outliers', () => {
    const THREE_HOURS = 3 * 60 * 60 * 1000
    const entries = [
      makeEntry('a', 3, 1 * THREE_HOURS),
      makeEntry('b', 3, 2 * THREE_HOURS),
      makeEntry('c', 4, 3 * THREE_HOURS),
      makeEntry('d', 3, 4 * THREE_HOURS),
    ]
    const result = applyOutlierFilter(entries)
    expect(result.cleanedEntries).toHaveLength(4)
    expect(result.flaggedCount).toBe(0)
  })

  it('flags duplicate entries within 2 hours keeping higher severity', () => {
    const ONE_HOUR = 60 * 60 * 1000
    const entries = [
      makeEntry('a', 2, 1000),
      makeEntry('b', 4, 1000 + ONE_HOUR), // within 2h of 'a', higher severity → keep b, flag a
    ]
    const result = applyOutlierFilter(entries)
    expect(result.flaggedCount).toBe(1)
    expect(result.cleanedEntries.map((e) => e.id)).toContain('b')
    expect(result.cleanedEntries.map((e) => e.id)).not.toContain('a')
  })

  it('does NOT flag entries more than 2 hours apart', () => {
    const THREE_HOURS = 3 * 60 * 60 * 1000
    const entries = [
      makeEntry('a', 3, 1000),
      makeEntry('b', 3, 1000 + THREE_HOURS),
    ]
    const result = applyOutlierFilter(entries)
    expect(result.flaggedCount).toBe(0)
    expect(result.cleanedEntries).toHaveLength(2)
  })

  it('computes outlierRate correctly', () => {
    const FOUR_HOURS = 4 * 60 * 60 * 1000
    const ONE_HOUR = 60 * 60 * 1000
    const entries = [
      makeEntry('a', 2, 1000),
      makeEntry('b', 4, 1000 + ONE_HOUR), // near-duplicate with 'a' → one gets flagged
      makeEntry('c', 3, 1000 + FOUR_HOURS),
      makeEntry('d', 3, 1000 + 2 * FOUR_HOURS),
    ]
    const result = applyOutlierFilter(entries)
    expect(result.outlierRate).toBe(result.flaggedCount / 4)
  })

  it('handles entries with weather data and extreme trendDeltaHpa', () => {
    const entries = [
      makeEntry('a', 3, 1000, -2),
      makeEntry('b', 3, 2000, -3),
      makeEntry('c', 3, 3000, -2.5),
      makeEntry('d', 3, 4000, -50), // extreme outlier
    ]
    const result = applyOutlierFilter(entries)
    expect(result.flaggedCount).toBeGreaterThan(0)
    expect(result.cleanedEntries.map((e) => e.id)).not.toContain('d')
  })
})
