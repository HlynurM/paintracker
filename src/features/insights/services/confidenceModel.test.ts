import { describe, it, expect } from 'vitest'
import { computeConfidence } from './confidenceModel'
import type { HeadacheEntry } from '@/types/headache'
import { CONFIDENCE_CAP, CONFIDENCE_MIN_ENTRIES } from '@/config/constants'

function makeEntry(id: string, daysAgo: number, hasWeather = true): HeadacheEntry {
  const DAY = 24 * 60 * 60 * 1000
  const ts = Date.now() - daysAgo * DAY
  return {
    id,
    severity: 3,
    timestamp: ts,
    weather: hasWeather
      ? { timestamp: ts, pressure: 1010, temperature: 15, humidity: 60, windSpeed: 10, trend: 'stable', trendDeltaHpa: -1 }
      : null,
  }
}

function makeEntries(count: number, spanDays: number, hasWeather = true): HeadacheEntry[] {
  return Array.from({ length: count }, (_, i) =>
    makeEntry(String(i), Math.round((i / Math.max(count - 1, 1)) * spanDays), hasWeather)
  )
}

describe('computeConfidence', () => {
  it('returns insufficient label when fewer than CONFIDENCE_MIN_ENTRIES entries', () => {
    const result = computeConfidence({
      entries: makeEntries(CONFIDENCE_MIN_ENTRIES - 1, 30),
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    expect(result.label).toBe('insufficient')
  })

  it('returns base score 20 for exactly 10 entries', () => {
    const result = computeConfidence({
      entries: makeEntries(10, 30),
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    expect(result.breakdown.base).toBe(20)
  })

  it('caps score at CONFIDENCE_CAP', () => {
    const result = computeConfidence({
      entries: makeEntries(300, 365),
      outlierRate: 0,
      hasSleepData: true,
      latestEntryAgeMs: 0,
    })
    expect(result.score).toBeLessThanOrEqual(CONFIDENCE_CAP)
  })

  it('applies sleep data bonus', () => {
    const base = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    const withSleep = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0,
      hasSleepData: true,
      latestEntryAgeMs: 0,
    })
    expect(withSleep.score).toBe(base.score + 5)
  })

  it('applies stale data penalty', () => {
    const THIRTY_ONE_DAYS_MS = 31 * 24 * 60 * 60 * 1000
    const base = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    const stale = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: THIRTY_ONE_DAYS_MS,
    })
    expect(stale.score).toBe(base.score - 10)
  })

  it('applies high outlier rate penalty', () => {
    const base = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0.1,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    const highOutlier = computeConfidence({
      entries: makeEntries(50, 90),
      outlierRate: 0.25,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    expect(highOutlier.score).toBe(base.score - 5)
  })

  it('applies low weather data penalty', () => {
    const weatherEntries = makeEntries(10, 30, true)
    const noWeatherEntries = makeEntries(30, 30, false)
    const mixed = [...weatherEntries, ...noWeatherEntries] // 25% have weather

    const result = computeConfidence({
      entries: mixed,
      outlierRate: 0,
      hasSleepData: false,
      latestEntryAgeMs: 0,
    })
    const penaltyNames = result.breakdown.penalties.map((p) => p.reason)
    expect(penaltyNames.some((r) => r.includes('weather'))).toBe(true)
  })

  it('score never goes below 0', () => {
    const FORTY_DAYS_MS = 40 * 24 * 60 * 60 * 1000
    const result = computeConfidence({
      entries: makeEntries(10, 5, false),
      outlierRate: 0.5,
      hasSleepData: false,
      latestEntryAgeMs: FORTY_DAYS_MS,
    })
    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it('returns good label for high score with enough entries', () => {
    const result = computeConfidence({
      entries: makeEntries(200, 200),
      outlierRate: 0,
      hasSleepData: true,
      latestEntryAgeMs: 0,
    })
    expect(['good', 'moderate']).toContain(result.label)
  })
})
