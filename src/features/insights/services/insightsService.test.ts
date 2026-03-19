import { describe, it, expect } from 'vitest'
import { computeTriggerFrequency, computeMonthlyStats } from './insightsService'
import type { HeadacheEntry } from '@/types/headache'

function makeEntry(overrides: Partial<HeadacheEntry> = {}): HeadacheEntry {
  return {
    id: 'test-id',
    timestamp: Date.now(),
    severity: 3,
    weather: null,
    ...overrides,
  }
}

describe('computeTriggerFrequency', () => {
  it('returns empty array when no entries', () => {
    expect(computeTriggerFrequency([])).toEqual([])
  })

  it('returns empty array when no entries have triggers', () => {
    const entries = [makeEntry(), makeEntry()]
    expect(computeTriggerFrequency(entries)).toEqual([])
  })

  it('counts each tag across all entries', () => {
    const entries = [
      makeEntry({ triggers: ['stress', 'poor-sleep'] }),
      makeEntry({ triggers: ['stress'] }),
      makeEntry({ triggers: ['dehydration'] }),
    ]
    const result = computeTriggerFrequency(entries)
    expect(result[0]).toEqual({ tag: 'stress', count: 2 })
    expect(result).toHaveLength(3)
  })

  it('sorts descending by count', () => {
    const entries = [
      makeEntry({ triggers: ['poor-sleep'] }),
      makeEntry({ triggers: ['stress', 'poor-sleep'] }),
      makeEntry({ triggers: ['stress', 'poor-sleep', 'dehydration'] }),
    ]
    const result = computeTriggerFrequency(entries)
    expect(result[0].tag).toBe('poor-sleep')
    expect(result[0].count).toBe(3)
    expect(result[1].count).toBe(2)
  })
})

describe('computeMonthlyStats', () => {
  // Fix "now" to a known date: 2026-03-18
  const now = new Date('2026-03-18T12:00:00.000Z').getTime()

  it('returns zeros and null avg when no entries', () => {
    const stats = computeMonthlyStats([], now)
    expect(stats.thisMonthCount).toBe(0)
    expect(stats.lastMonthCount).toBe(0)
    expect(stats.avgSeverity).toBeNull()
    expect(stats.delta).toBe(0)
  })

  it('counts entries in the current month', () => {
    const entries = [
      makeEntry({ timestamp: new Date('2026-03-01T00:00:00Z').getTime(), severity: 2 }),
      makeEntry({ timestamp: new Date('2026-03-15T00:00:00Z').getTime(), severity: 4 }),
    ]
    const stats = computeMonthlyStats(entries, now)
    expect(stats.thisMonthCount).toBe(2)
    expect(stats.avgSeverity).toBe(3)
  })

  it('counts entries in the last month', () => {
    const entries = [
      makeEntry({ timestamp: new Date('2026-02-10T00:00:00Z').getTime(), severity: 3 }),
    ]
    const stats = computeMonthlyStats(entries, now)
    expect(stats.lastMonthCount).toBe(1)
    expect(stats.thisMonthCount).toBe(0)
    expect(stats.delta).toBe(-1)
  })

  it('computes positive delta correctly', () => {
    const entries = [
      makeEntry({ timestamp: new Date('2026-03-05T00:00:00Z').getTime(), severity: 5 }),
      makeEntry({ timestamp: new Date('2026-03-10T00:00:00Z').getTime(), severity: 3 }),
    ]
    const stats = computeMonthlyStats(entries, now)
    expect(stats.delta).toBe(2)
  })

  it('does not count older entries in either month', () => {
    const entries = [
      makeEntry({ timestamp: new Date('2026-01-15T00:00:00Z').getTime(), severity: 3 }),
    ]
    const stats = computeMonthlyStats(entries, now)
    expect(stats.thisMonthCount).toBe(0)
    expect(stats.lastMonthCount).toBe(0)
  })
})
